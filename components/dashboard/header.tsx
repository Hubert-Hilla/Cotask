// components/dashboard/layout/DashboardHeader.tsx
interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    username: string;
  };
  pendingRequestsCount: number;
  onLogout: () => void;
}

export default function DashboardHeader({ user, pendingRequestsCount, onLogout }: DashboardHeaderProps) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-2xl font-semibold">Cotask</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => console.log('Navigate to contacts')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197a4 4 0 00-5.197-5.197" />
              </svg>
              Contacts
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white rounded-full text-xs flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-right hidden md:block">
                  <div>{user.name}</div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                  ) : (
                    initials
                  )}
                </div>
              </button>
              
              {/* Simple dropdown - you can enhance this */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50">
                  Profile
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50">
                  Settings
                </button>
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}