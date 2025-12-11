// components/dashboard/layout/DashboardHeader.tsx - WITH DARK MODE
'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    username: string;
    id: string;
  };
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  // Fetch pending requests count
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        const { count, error } = await supabase
          .from('user_relationships')
          .select('*', { count: 'exact', head: true })
          .eq('related_user_id', currentUser.id)
          .eq('relationship_type', 'pending');

        if (error) throw error;
        setPendingRequestsCount(count || 0);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    fetchPendingRequests();

    // Set up real-time subscription for relationship updates
    const channel = supabase
      .channel('relationships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_relationships',
          filter: `related_user_id=eq.${user.id}`
        },
        () => {
          fetchPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleContactsClick = () => {
    router.push('/dashboard/contacts');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">Cotask</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleContactsClick}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative text-gray-700 dark:text-gray-200"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197a4 4 0 00-5.197-5.197" />
              </svg>
              Contacts
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 dark:bg-yellow-600 text-white rounded-full text-xs flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden md:block">
                  <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-medium">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
              </button>
              
              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <button 
                    onClick={() => {
                      router.push('/dashboard/profile');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 last:rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}