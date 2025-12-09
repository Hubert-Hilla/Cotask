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

  useEffect(() => {
    fetchUserAndContacts();
  }, []);

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

      // Fetch user profiles for these IDs - only select existing columns
      if (userIds.size > 0) {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, username, name')
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
            // email: userProfile?.email || '', // Not available in profiles table
            // avatar: userProfile?.avatar_url, // Not available in profiles table
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
        alert('User not found');
        return;
      }

      if (userToAdd.id === currentUser.id) {
        alert('You cannot add yourself!');
        return;
      }

      // Check if relationship already exists
      const { data: existingRelationship } = await supabase
        .from('user_relationships')
        .select('*')
        .or(`and(user_id.eq.${currentUser.id},related_user_id.eq.${userToAdd.id}),and(user_id.eq.${userToAdd.id},related_user_id.eq.${currentUser.id})`)
        .maybeSingle();

      if (existingRelationship) {
        alert('Relationship already exists!');
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

      alert('Friend request sent!');
      fetchUserAndContacts(); // Refresh the list
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to send friend request');
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

      alert('Friend request accepted!');
      fetchUserAndContacts(); // Refresh the list
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (contactId: string) => {
    try {
      const relationship = contacts.find(c => c.id === contactId && c.status === 'pending-received');
      if (!relationship) return;

      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('id', relationship.relationship_id);

      if (error) throw error;

      alert('Friend request rejected');
      fetchUserAndContacts(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject friend request');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    try {
      if (!confirm('Are you sure you want to remove this contact?')) return;

      const relationship = contacts.find(c => c.id === contactId);
      if (!relationship) return;

      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('id', relationship.relationship_id);

      if (error) throw error;

      alert('Contact removed');
      fetchUserAndContacts(); // Refresh the list
    } catch (error) {
      console.error('Error removing contact:', error);
      alert('Failed to remove contact');
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <ContactsPageComponent
      user={currentUser}
      contacts={contacts as any}
      onBack={handleBack}
      onAddContact={handleAddContact}
      onAcceptRequest={handleAcceptRequest}
      onRejectRequest={handleRejectRequest}
      onRemoveContact={handleRemoveContact}
    />
  );
}