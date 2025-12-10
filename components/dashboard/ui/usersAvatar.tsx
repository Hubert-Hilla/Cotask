// components/shared/UserAvatars.tsx
'use client';

interface SharedUser {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  initials: string;
  permission?: 'view' | 'edit';
}

interface UserAvatarsProps {
  users: SharedUser[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export default function UserAvatars({ 
  users, 
  maxDisplay = 3, 
  size = 'sm',
  showCount = true 
}: UserAvatarsProps) {
  if (!users || users.length === 0) return null;

  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <div
            key={user.id}
            className={`relative ${sizeClasses[size]} rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden`}
            style={{ zIndex: displayUsers.length - index }}
            title={`${user.name} (${user.permission || 'view'})`}
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-medium text-gray-600">
                {user.initials}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {showCount && remainingCount > 0 && (
        <div className="ml-2 text-xs text-gray-500 font-medium">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}