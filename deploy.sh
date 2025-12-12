#!/bin/bash

# ===================================
# Cotask Deployment Script (Non-interactive)
# ===================================
# This script sets up your Cotask Next.js app on a VPS with:
# - Docker & Docker Compose
# - Nginx reverse proxy
# - SSL/HTTPS via Let's Encrypt
# - Automatic SSL renewal
# ===================================

# Configuration Variables
DOMAIN_NAME="cotask.org"                    # Your domain
EMAIL="huberthilla0420@gmail.com"           # Your email for SSL certificates
APP_DIR=~/cotask                            # Where to install the app
SWAP_SIZE="1G"                              # Swap size (recommended for small VPS)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Cotask Deployment Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Update system
echo -e "${GREEN}[1/9] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Add Swap Space
echo -e "${GREEN}[2/9] Adding swap space...${NC}"
if [ ! -f /swapfile ]; then
    sudo fallocate -l $SWAP_SIZE /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap space added successfully."
else
    echo "Swap space already exists."
fi

# Install Docker
echo -e "${GREEN}[3/9] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y
    sudo apt update
    sudo apt install docker-ce -y
    sudo systemctl enable docker
    sudo systemctl start docker
    echo "Docker installed successfully."
else
    echo "Docker already installed."
fi

# Install Docker Compose
echo -e "${GREEN}[4/9] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    if docker-compose --version; then
        echo "Docker Compose installed successfully."
    else
        echo -e "${RED}Docker Compose installation failed. Exiting.${NC}"
        exit 1
    fi
else
    echo "Docker Compose already installed."
fi

# Clone or update repository
echo -e "${GREEN}[5/9] Setting up application directory...${NC}"
if [ -d "$APP_DIR" ]; then
    echo "Directory $APP_DIR already exists."
    read -p "Do you want to pull latest changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd $APP_DIR && git pull
    fi
else
    echo "Please upload your Cotask application to $APP_DIR"
    echo "You can use: scp -r /path/to/cotask user@server:~/cotask"
    echo ""
    read -p "Press enter once you've uploaded the application..."
    
    if [ ! -d "$APP_DIR" ]; then
        echo -e "${RED}Application directory not found. Please upload your app first.${NC}"
        exit 1
    fi
fi

cd $APP_DIR

# Use existing .env.local
echo -e "${GREEN}[6/9] Using existing .env.local file...${NC}"
if [ ! -f "$APP_DIR/.env.local" ]; then
    echo -e "${RED}.env.local not found in $APP_DIR. Please make sure it exists.${NC}"
    exit 1
fi

# Install Nginx
echo -e "${GREEN}[7/9] Installing and configuring Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
fi

# Stop Nginx for SSL certificate generation
sudo systemctl stop nginx

# Obtain SSL certificate
echo -e "${GREEN}[8/9] Obtaining SSL certificate...${NC}"
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot -y
fi

if [ -d "/etc/letsencrypt/live/$DOMAIN_NAME" ]; then
    echo "SSL certificate already exists for $DOMAIN_NAME"
else
    sudo certbot certonly --standalone -d $DOMAIN_NAME --non-interactive --agree-tos -m $EMAIL
    if [ $? -ne 0 ]; then
        echo -e "${RED}SSL certificate generation failed.${NC}"
        echo "Make sure your domain points to this server's IP address."
        exit 1
    fi
fi

# Ensure SSL configuration files exist
if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then
    sudo wget https://raw.githubusercontent.com/certbot/certbot/refs/heads/main/certbot-nginx/src/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/
fi

if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then
    sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# Create Nginx configuration
echo -e "${GREEN}[9/9] Configuring Nginx reverse proxy...${NC}"

sudo cat > /etc/nginx/sites-available/cotask <<EOL
# Rate limiting configuration
limit_req_zone \$binary_remote_addr zone=cotasklimit:10m rate=10r/s;

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Redirect all HTTP requests to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req zone=cotasklimit burst=20 nodelay;

    # Client max body size
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    access_log /var/log/nginx/cotask_access.log;
    error_log /var/log/nginx/cotask_error.log;
}
EOL

# Enable site
sudo rm -f /etc/nginx/sites-enabled/cotask
sudo ln -s /etc/nginx/sites-available/cotask /etc/nginx/sites-enabled/cotask

# Test Nginx configuration
if sudo nginx -t; then
    sudo systemctl restart nginx
    echo "Nginx configured and restarted successfully."
else
    echo -e "${RED}Nginx configuration test failed. Please check the configuration.${NC}"
    exit 1
fi

# Build and run Docker containers
echo ""
echo -e "${GREEN}Building and starting Docker containers...${NC}"
cd $APP_DIR

# Stop existing containers if running
sudo docker-compose down 2>/dev/null

# Build and start
sudo docker-compose up --build -d

# Check if containers started successfully
sleep 5
if sudo docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}Docker containers started successfully.${NC}"
else
    echo -e "${RED}Docker containers failed to start. Check logs with: sudo docker-compose logs${NC}"
    exit 1
fi

# Setup automatic SSL certificate renewal
echo ""
echo -e "${GREEN}Setting up automatic SSL renewal...${NC}"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 */12 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

# Output final message
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "Your Cotask application is now running at:"
echo -e "${GREEN}https://$DOMAIN_NAME${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:        sudo docker-compose logs -f"
echo "  Restart app:      sudo docker-compose restart"
echo "  Stop app:         sudo docker-compose down"
echo "  Rebuild app:      sudo docker-compose up --build -d"
echo "  Check status:     sudo docker-compose ps"
echo ""
echo "SSL certificate will auto-renew every 12 hours."
echo ""
