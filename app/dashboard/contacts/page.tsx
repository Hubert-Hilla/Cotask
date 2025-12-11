// app/dashboard/contacts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ContactsPageComponent from '@/components/dashboard/contacts/ContactsPage';

// types/contacts.ts
export interface Contact {
  id: string;
  name: string;
  username: string;
  email?: string;  // Optional since profiles table doesn't have email
  avatar?: string; // Optional since profiles table doesn't have avatar_url
  relationship_id: string;
  status: 'friend' | 'pending-sent' | 'pending-received' | 'blocked';
}

export default function ContactsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentUser, setCurrentUser] = useState<{ username: string; id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    fetchUserAndContacts();
  }, []);

  const showNotification = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    onConfirm?: () => void,
    confirmText: string = 'OK',
    cancelText?: string
  ) => {
    setModalConfig({
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText
    });
    setShowModal(true);
  };

  const fetchUserAndContacts = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        console.log("User not found")
        router.push('/login');
        return;
      }

      // Get user profile - only select columns that exist
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, name")
        .eq('id', authUser.id)
        .single();

      if (!profile) {
        router.push('/login');
        return;
      }

      setCurrentUser({
        username: profile.username,
        id: profile.id,
        name: profile.name || profile.username
      });

      // Fetch all relationships
      const { data: relationships, error: relationshipsError } = await supabase
        .from('user_relationships')
        .select('*')
        .or(`user_id.eq.${profile.id},related_user_id.eq.${profile.id}`);

      if (relationshipsError) throw relationshipsError;

      // Get unique user IDs from relationships
      const userIds = new Set<string>();
      relationships?.forEach(rel => {
        if (rel.user_id !== profile.id) userIds.add(rel.user_id);
        if (rel.related_user_id !== profile.id) userIds.add(rel.related_user_id);
      });

      // Fetch user profiles for these IDs - include avatar_url
      if (userIds.size > 0) {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, username, name, avatar_url')
          .in('id', Array.from(userIds));

        if (usersError) throw usersError;

        // Map relationships to contacts
        const contactsData: Contact[] = relationships.map(rel => {
          const otherUserId = rel.user_id === profile.id ? rel.related_user_id : rel.user_id;
          const userProfile = users?.find(u => u.id === otherUserId);
          
          let status: Contact['status'];
          if (rel.relationship_type === 'friend') {
            status = 'friend';
          } else if (rel.relationship_type === 'pending') {
            status = rel.user_id === profile.id ? 'pending-sent' : 'pending-received';
          } else {
            status = 'blocked';
          }

          return {
            id: otherUserId,
            name: userProfile?.name || userProfile?.username || 'Unknown User',
            username: userProfile?.username || 'unknown',
            avatar: userProfile?.avatar_url || undefined,
            relationship_id: rel.id,
            status
          };
        });

        setContacts(contactsData);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async (username: string) => {
    try {
      if (!currentUser) return;

      // Find user by username
      const { data: userToAdd, error: findError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username)
        .single();

      if (findError) {
        showNotification('User Not Found', `No user found with username "${username}"`, 'error');
        return;
      }

      if (userToAdd.id === currentUser.id) {
        showNotification('Cannot Add Yourself', 'You cannot send a friend request to yourself!', 'warning');
        return;
      }

      // Check if relationship already exists
      const { data: existingRelationship } = await supabase
        .from('user_relationships')
        .select('*')
        .or(`and(user_id.eq.${currentUser.id},related_user_id.eq.${userToAdd.id}),and(user_id.eq.${userToAdd.id},related_user_id.eq.${currentUser.id})`)
        .maybeSingle();

      if (existingRelationship) {
        showNotification('Already Connected', 'A relationship already exists with this user!', 'info');
        return;
      }

      // Create new relationship
      const { error: insertError } = await supabase
        .from('user_relationships')
        .insert({
          user_id: currentUser.id,
          related_user_id: userToAdd.id,
          relationship_type: 'pending'
        });

      if (insertError) throw insertError;

      showNotification('Request Sent!', `Friend request sent to @${username}`, 'success');
      fetchUserAndContacts(); // Refresh the list
    } catch (error) {
      console.error('Error adding contact:', error);
      showNotification('Failed', 'Failed to send friend request. Please try again.', 'error');
    }
  };

  const handleAcceptRequest = async (contactId: string) => {
    try {
      const relationship = contacts.find(c => c.id === contactId && c.status === 'pending-received');
      if (!relationship) return;

      const { error } = await supabase
        .from('user_relationships')
        .update({ relationship_type: 'friend' })
        .eq('id', relationship.relationship_id);

      if (error) throw error;

      showNotification('Friend Added!', `You are now friends with ${relationship.name}`, 'success');
      fetchUserAndContacts(); // Refresh the list
    } catch (error) {
      console.error('Error accepting request:', error);
      showNotification('Failed', 'Failed to accept friend request. Please try again.', 'error');
    }
  };

  const handleRejectRequest = async (contactId: string) => {
    try {
      const relationship = contacts.find(c => c.id === contactId && c.status === 'pending-received');
      if (!relationship) return;

      showNotification(
        'Reject Friend Request',
        `Are you sure you want to reject the friend request from ${relationship.name}?`,
        'warning',
        async () => {
          const { error } = await supabase
            .from('user_relationships')
            .delete()
            .eq('id', relationship.relationship_id);

          if (error) throw error;

          showNotification('Request Rejected', 'Friend request has been rejected', 'info');
          fetchUserAndContacts(); // Refresh the list
        },
        'Reject',
        'Cancel'
      );
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification('Failed', 'Failed to reject friend request. Please try again.', 'error');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    try {
      const relationship = contacts.find(c => c.id === contactId);
      if (!relationship) return;

      showNotification(
        'Remove Contact',
        `Are you sure you want to remove ${relationship.name} from your contacts? This action cannot be undone.`,
        'warning',
        async () => {
          const { error } = await supabase
            .from('user_relationships')
            .delete()
            .eq('id', relationship.relationship_id);

          if (error) throw error;

          showNotification('Contact Removed', `${relationship.name} has been removed from your contacts`, 'info');
          fetchUserAndContacts(); // Refresh the list
        },
        'Remove',
        'Cancel'
      );
    } catch (error) {
      console.error('Error removing contact:', error);
      showNotification('Failed', 'Failed to remove contact. Please try again.', 'error');
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <ContactsPageComponent
        user={currentUser}
        contacts={contacts as any}
        onBack={handleBack}
        onAddContact={handleAddContact}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onRemoveContact={handleRemoveContact}
      />
      
      {/* Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  modalConfig.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                  modalConfig.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                  modalConfig.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <span className="text-2xl">
                    {modalConfig.type === 'success' ? '✓' :
                     modalConfig.type === 'error' ? '✕' :
                     modalConfig.type === 'warning' ? '⚠' :
                     'ℹ'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {modalConfig.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {modalConfig.message}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 pb-6 flex gap-3 justify-end">
              {modalConfig.cancelText && (
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {modalConfig.cancelText}
                </button>
              )}
              <button
                onClick={() => {
                  if (modalConfig.onConfirm) {
                    modalConfig.onConfirm();
                  }
                  setShowModal(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  modalConfig.type === 'error' || modalConfig.type === 'warning'
                    ? 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600'
                    : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600'
                }`}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}