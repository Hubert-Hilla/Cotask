// components/privacy/PrivacyPolicy.tsx
export default function PrivacyPolicy() {
  return (
    <section id="privacy" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <div className="w-20 h-1 bg-indigo-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A privacy-focused task and note management application
            </p>
          </div>

          {/* Last Updated */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-lg">
              <span className="font-semibold text-gray-900">Last Updated: </span>
              <span className="text-indigo-600">December 11, 2025</span>
            </p>
            <p className="text-gray-600 mt-2">
              Cotask is a student project developed in Norway. We take your privacy seriously and comply with Norwegian privacy laws and GDPR.
            </p>
          </div>

          {/* Core Principles */}
          <div className="mb-12 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Core Principles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Your data is yours. We never sell or share it with third parties.",
                "We collect only what's necessary to provide the service.",
                "You have full control over your data at all times.",
                "We're transparent about our data practices.",
                "Your content remains private by default.",
                "We implement appropriate security measures for a student project."
              ].map((principle, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">{principle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-10">
            {/* 1. Data Controller */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Data Controller</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  The data controller for Cotask is a student developer based in Norway. For all privacy-related matters, you can reach us at:
                </p>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900">Contact Email:</p>
                  <a href="mailto:huberthilla0420@gmail.com" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    huberthilla0420@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Information We Collect */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Information We Collect</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Account Information</h4>
                  <p>When you create an account, we collect:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Email address (for account creation and login)</li>
                    <li>Username (chosen by you)</li>
                    <li>Name (optional, for display purposes)</li>
                    <li>Password (stored encrypted, we cannot see your actual password)</li>
                    <li>Profile picture (optional, if you upload one)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Content Data</h4>
                  <p>We store the content you create:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Task lists and individual tasks</li>
                    <li>Notes and their content</li>
                    <li>Sharing permissions you set</li>
                    <li>Timestamps (when items were created or modified)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Technical Data</h4>
                  <p>Minimal technical information:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>IP address (logged by our hosting provider for security)</li>
                    <li>Browser type and version (for compatibility)</li>
                    <li>Device information (for responsive design)</li>
                  </ul>
                </div>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-4">
                  <p className="font-semibold text-gray-900 mb-1">What We DON'T Collect</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>We don't use tracking pixels or analytics cookies</li>
                    <li>We don't collect browsing history or behavior outside Cotask</li>
                    <li>We don't use advertising cookies or third-party analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Legal Basis for Processing */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Legal Basis for Processing (GDPR Article 6)</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Under GDPR, we process your data based on:</p>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">Contract Performance (Article 6(1)(b))</p>
                    <p className="text-sm mt-1">Processing your account and content data is necessary to provide the Cotask service you signed up for.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">Legitimate Interests (Article 6(1)(f))</p>
                    <p className="text-sm mt-1">We process technical data to ensure security, prevent abuse, and improve the service.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">Consent (Article 6(1)(a))</p>
                    <p className="text-sm mt-1">For optional features like profile pictures, we obtain your explicit consent.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. How We Use Your Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <h3 className="text-2xl font-bold text-gray-900">How We Use Your Information</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We use your information exclusively to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain the Cotask service</li>
                  <li>Enable collaboration features like sharing lists and notes</li>
                  <li>Sync your data across your devices in real-time</li>
                  <li>Send you essential service communications (e.g., password resets)</li>
                  <li>Identify and fix technical issues</li>
                  <li>Ensure the security of your account and prevent abuse</li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <p className="font-semibold text-gray-900 mb-1">What We DON'T Do</p>
                  <p>Cotask does NOT:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Sell or share your data with third parties for any purpose</li>
                    <li>Use your data for advertising or marketing</li>
                    <li>Analyze your content for commercial purposes</li>
                    <li>Send promotional emails (we only send essential service emails)</li>
                    <li>Share your data with advertisers or data brokers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 5. Data Sharing and Third Parties */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Data Sharing and Third Parties</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">User-Initiated Sharing Only</h4>
                  <p>When you choose to share a list or note with another Cotask user, they will be able to see:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>The shared content (list or note)</li>
                    <li>Your username and name</li>
                    <li>Your profile picture (if you've uploaded one)</li>
                  </ul>
                  <p className="mt-2">You control exactly what is shared and can revoke access at any time.</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Service Providers</h4>
                  <p className="mb-2">We use the following third-party services:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Supabase:</strong> Backend database and authentication service. Your data is stored on Supabase's servers. Supabase is GDPR-compliant and their data centers are located in various regions (you can check their documentation for specific locations).
                    </li>
                    <li>
                      <strong>VPS Hosting Provider:</strong> The Cotask application is hosted on a Virtual Private Server. Only encrypted connections (HTTPS) are used.
                    </li>
                  </ul>
                  <p className="mt-3 text-sm">These service providers have access to your data only to perform services on our behalf and are obligated not to disclose or use it for any other purpose.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Requirements</h4>
                  <p>We may disclose your information if:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Required by Norwegian law or valid legal process</li>
                    <li>Necessary to protect the rights, property, or safety of users</li>
                    <li>Needed to prevent or investigate potential fraud or security issues</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <p className="font-semibold">No Selling or Commercial Sharing</p>
                  <p className="text-sm mt-1">We will NEVER sell your personal data to third parties or share it for commercial purposes. This is a student project focused on providing a useful service, not monetizing user data.</p>
                </div>
              </div>
            </div>

            {/* 6. Data Security */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Data Security</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We implement security measures appropriate for a student project:</p>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {[
                    { title: "HTTPS Encryption", desc: "All data transmitted between your device and our servers is encrypted" },
                    { title: "Password Hashing", desc: "Passwords are hashed using bcrypt - we never see your actual password" },
                    { title: "Database Security", desc: "Row-level security policies protect your data in the database" },
                    { title: "Secure Authentication", desc: "JWT tokens with expiration for session management" },
                    { title: "Regular Updates", desc: "We keep software dependencies updated for security patches" },
                    { title: "Access Control", desc: "Only you and users you explicitly share with can access your content" }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mt-4">
                  <p className="font-semibold text-gray-900 mb-2">Important Security Notice</p>
                  <p>
                    While we implement appropriate security measures for a student project, Cotask is not designed for storing highly sensitive, confidential, or critical information. Please do not store:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li>Financial information (credit cards, bank accounts)</li>
                    <li>Medical records or health information</li>
                    <li>Government ID numbers or social security numbers</li>
                    <li>Passwords or security credentials</li>
                    <li>Confidential business information</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 7. Your Rights Under GDPR */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  7
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Your Rights Under GDPR</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Under the General Data Protection Regulation (GDPR), you have the following rights:</p>
                <div className="space-y-3">
                  {[
                    { 
                      right: "Right to Access (Article 15)", 
                      desc: "You can view all your data within the application at any time. For a complete data export, contact us.",
                      how: "Available in-app or email us"
                    },
                    { 
                      right: "Right to Rectification (Article 16)", 
                      desc: "You can correct any inaccurate personal data through your profile settings.",
                      how: "Edit in Profile page"
                    },
                    { 
                      right: "Right to Erasure / 'Right to be Forgotten' (Article 17)", 
                      desc: "You can delete your account and all associated data at any time.",
                      how: "Delete Account button in Profile settings"
                    },
                    { 
                      right: "Right to Restrict Processing (Article 18)", 
                      desc: "You can request we limit how we use your data.",
                      how: "Email huberthilla0420@gmail.com"
                    },
                    { 
                      right: "Right to Data Portability (Article 20)", 
                      desc: "You can request a copy of your data in a machine-readable format.",
                      how: "Email us for manual export"
                    },
                    { 
                      right: "Right to Object (Article 21)", 
                      desc: "You can object to our processing of your data for legitimate interests.",
                      how: "Email huberthilla0420@gmail.com"
                    },
                    {
                      right: "Right to Withdraw Consent",
                      desc: "For consent-based processing (like profile pictures), you can withdraw consent anytime.",
                      how: "Remove in Profile settings or email us"
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.right}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                          <p className="text-xs text-indigo-600 mt-2 font-medium">How to exercise: {item.how}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mt-4">
                  <p className="font-semibold text-gray-900 mb-2">Exercising Your Rights</p>
                  <p className="text-sm">
                    Most rights can be exercised directly in the app. For requests requiring manual processing (like data export), email us at{" "}
                    <a href="mailto:huberthilla0420@gmail.com" className="text-indigo-600 hover:text-indigo-800 font-medium">
                      huberthilla0420@gmail.com
                    </a>
                    . We will respond within 30 days as required by GDPR, though we typically respond much faster.
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">Right to Complain</p>
                  <p className="text-sm">
                    If you believe we are not handling your data appropriately, you have the right to file a complaint with the Norwegian Data Protection Authority (Datatilsynet) at{" "}
                    <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                      www.datatilsynet.no
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Data Retention */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  8
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Data Retention</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">📂</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Active Accounts</h4>
                      <p className="text-sm">We retain your data for as long as your account is active.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🗑️</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Account Deletion</h4>
                      <p className="text-sm">When you delete your account, we immediately delete your personal information and content from our active database.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">💾</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Backups</h4>
                      <p className="text-sm">Database backups are retained for up to 30 days for disaster recovery. After this period, your data is permanently deleted from backups as well.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">👥</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Shared Content</h4>
                      <p className="text-sm">If you've shared content with other users, they will retain access to that content until they delete it, even if you delete your account.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">⏱️</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Inactive Accounts</h4>
                      <p className="text-sm">Accounts inactive for more than 2 years may be deleted after email notification.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <p className="font-semibold text-gray-900 mb-2">Project Timeline Notice</p>
                  <p className="text-sm">
                    Cotask is a student project with an expected active development period until approximately June 2025. After the project conclusion:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li>You will be notified via email at least 60 days in advance</li>
                    <li>You will have time to export your data</li>
                    <li>All user data will be permanently deleted from our systems</li>
                    <li>We may continue running the service if there's sufficient interest, but make no guarantees</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 9. Cookies and Similar Technologies */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  9
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Cookies and Similar Technologies</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>Cotask uses minimal cookies necessary for the service to function. We use "strictly necessary" cookies that are exempt from consent requirements under GDPR.</p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Cookies We Use:</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">Authentication Cookie (Session)</p>
                      <ul className="text-sm mt-1 space-y-1">
                        <li><strong>Purpose:</strong> Keeps you logged in and authenticates your requests</li>
                        <li><strong>Duration:</strong> Until you log out or token expires (typically 7 days)</li>
                        <li><strong>Type:</strong> Strictly necessary - cannot be disabled</li>
                        <li><strong>Data stored:</strong> Encrypted authentication token (JWT)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Theme Preference (Local Storage)</p>
                      <ul className="text-sm mt-1 space-y-1">
                        <li><strong>Purpose:</strong> Remembers your dark/light mode preference</li>
                        <li><strong>Duration:</strong> Permanent until cleared</li>
                        <li><strong>Type:</strong> Functionality - enhances user experience</li>
                        <li><strong>Data stored:</strong> Theme preference ("dark" or "light")</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <p className="font-semibold text-gray-900 mb-1">What We DON'T Use:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Third-party tracking cookies</li>
                    <li>Advertising cookies</li>
                    <li>Analytics cookies (like Google Analytics)</li>
                    <li>Social media cookies</li>
                    <li>Marketing cookies</li>
                  </ul>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Managing Cookies</h4>
                  <p className="text-sm">
                    You can control and delete cookies through your browser settings. However, disabling the authentication cookie will prevent you from logging into Cotask. Most browsers allow you to:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                    <li>View what cookies are stored</li>
                    <li>Delete individual cookies</li>
                    <li>Block third-party cookies</li>
                    <li>Clear all cookies</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 10. International Data Transfers */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  10
                </div>
                <h3 className="text-2xl font-bold text-gray-900">International Data Transfers</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Cotask is developed and operated from Norway, which is part of the European Economic Area (EEA) and subject to GDPR.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Data Storage Location</h4>
                  <p className="text-sm">
                    Your data is stored with Supabase. Supabase offers multiple regions for data storage. While we cannot guarantee the specific region your data resides in without checking our Supabase configuration, Supabase is GDPR-compliant and offers EU hosting options.
                  </p>
                  <p className="text-sm mt-2">
                    If data is transferred outside the EEA, Supabase uses Standard Contractual Clauses (SCCs) approved by the European Commission to ensure adequate protection.
                  </p>
                </div>
                <p className="text-sm">
                  For the most current information about Supabase's data locations and GDPR compliance, visit:{" "}
                  <a href="https://supabase.com/docs/guides/platform/going-into-prod#compliance" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                    Supabase GDPR Documentation
                  </a>
                </p>
              </div>
            </div>

            {/* 11. Children's Privacy */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  11
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Children's Privacy</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Cotask is not intended for children under the age of 16 (the minimum age for processing personal data under GDPR without parental consent). We do not knowingly collect personal information from children under 16.
                </p>
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                  <p className="font-semibold text-gray-900 mb-1">If you are under 16:</p>
                  <p className="text-sm">Please do not use this service or provide any personal information. If you are a parent or guardian and believe your child under 16 has provided us with personal information, please contact us immediately at huberthilla0420@gmail.com and we will delete it.</p>
                </div>
              </div>
            </div>

            {/* 12. Changes to This Policy */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  12
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Changes to This Privacy Policy</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>We may update this Privacy Policy as the project evolves. When we make changes, we will:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Update the "Last Updated" date at the top of this page</li>
                  <li>For significant changes: Display a prominent notice in the Cotask application</li>
                  <li>For significant changes: Send an email notification to your registered email address</li>
                </ul>
                <div className="bg-gray-100 p-4 rounded-lg mt-4">
                  <p className="font-semibold text-gray-900 mb-1">What Constitutes a Significant Change?</p>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    <li>Changes to what data we collect</li>
                    <li>Changes to how we use your data</li>
                    <li>Changes to who we share data with</li>
                    <li>Changes to your rights</li>
                    <li>Changes to data retention periods</li>
                  </ul>
                </div>
                <p>
                  <strong>Your Continued Use:</strong> Continued use of Cotask after changes constitutes your acceptance of the updated policy. If you do not agree with changes, you should stop using the service and delete your account.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border-2 border-indigo-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Us About Privacy</h3>
              <div className="space-y-6">
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy, wish to exercise your GDPR rights, or have concerns about how your data is being handled, please contact:
                </p>
                
                <div className="bg-white p-6 rounded-lg border border-indigo-200 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Email (Primary Contact)</p>
                        <a href="mailto:huberthilla0420@gmail.com" className="text-indigo-600 hover:text-indigo-800 font-medium text-lg">
                          huberthilla0420@gmail.com
                        </a>
                        <p className="text-sm text-gray-600 mt-1">Use this email for all privacy-related inquiries, GDPR requests, and general questions.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Response Time</p>
                        <p className="text-gray-700">We aim to respond to all privacy inquiries within <strong>7 days</strong>, though GDPR allows up to 30 days. Response times may be longer during exam periods.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Supervisory Authority</p>
                        <p className="text-gray-700 text-sm">
                          Norwegian Data Protection Authority (Datatilsynet)<br />
                          Website: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">www.datatilsynet.no</a><br />
                          <span className="text-gray-600">You have the right to file a complaint with them if you believe we're not handling your data properly.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border-l-4 border-indigo-600 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Student Project Disclaimer:</strong> Cotask is developed by a student as part of an academic project. While we are committed to handling your data responsibly and in compliance with GDPR, please be aware of the limitations inherent in a student project. We appreciate your understanding and patience.
                  </p>
                </div>
                
                <div className="text-center pt-6 border-t-2 border-indigo-200">
                  <p className="text-gray-600 italic text-sm">
                    Thank you for using Cotask. We take your privacy seriously and are committed to protecting your personal data in accordance with Norwegian and EU law.
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Last reviewed and updated: December 11, 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}