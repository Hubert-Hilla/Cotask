// components/dashboard/DashboardPage.tsx - WITH REAL-TIME UPDATES
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardHeader from "./header";
import WelcomeSection from "./welcome";
import StatsSection from "./stats";
import ControlsSection from "./controls";
import ContentSection from './contentsection';
import CreateItemModal from './createItemModal';
import type { Tables } from "@lib/supabase/types";
import { Button } from '../ui/button';

// Define types for shared users
interface SharedUser {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  initials: string;
  permission: 'view' | 'edit' | null;
}

interface SharedByUser {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  initials: string;
}

type ListWithShares = Tables<'lists'> & {
  tasks?: Tables<'tasks'>[];
  is_shared?: boolean;
  shared_by?: SharedByUser;
  shared_users: SharedUser[];
};

type NoteWithShares = Tables<'notes'> & {
  is_shared?: boolean;
  shared_by?: SharedByUser;
  shared_users: SharedUser[];
};

interface DashboardPageProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    username: string;
    id: string;
    initials: string;
  };
  allLists: ListWithShares[];
  allNotes: NoteWithShares[];
}

export default function DashboardPage({
  user,
  allLists: initialAllLists,
  allNotes: initialAllNotes,
}: DashboardPageProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lists' | 'notes'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'modified' | 'name' | 'completion'>('created');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [statsFilter, setStatsFilter] = useState<string | null>(null);
  
  // State for actual data that can be updated
  const [allLists, setAllLists] = useState<ListWithShares[]>(initialAllLists);
  const [allNotes, setAllNotes] = useState<NoteWithShares[]>(initialAllNotes);

  // Memoize pinned sets for performance
  const pinnedLists = useMemo(() => 
    new Set(allLists.filter(l => l.is_pinned).map(l => l.id)),
    [allLists]
  );

  const pinnedNotes = useMemo(() => 
    new Set(allNotes.filter(n => n.is_pinned).map(n => n.id)),
    [allNotes]
  );

  // Calculate stats from database structure (only for user's own lists) - Memoized
  const stats = useMemo(() => {
    const myLists = allLists.filter(list => !list.is_shared);
    return myLists.reduce((acc, list) => {
      const tasks = list.tasks || [];
      const taskCount = tasks.length;
      const completedCount = tasks.filter(task => task.is_completed).length;
      
      return {
        totalTasks: acc.totalTasks + taskCount,
        completedTasks: acc.completedTasks + completedCount,
        tasksLeft: acc.tasksLeft + (taskCount - completedCount),
      };
    }, { totalTasks: 0, completedTasks: 0, tasksLeft: 0 });
  }, [allLists]);

  const totalTasks = stats.totalTasks;
  const completedTasks = stats.completedTasks;
  const tasksLeft = stats.tasksLeft;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleCreateList = async (listData: { 
    title: string; 
    icon: string; 
    color: string;  
  }) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      const { data: newList, error } = await supabase
        .from('lists')
        .insert({
          title: listData.title,
          icon: listData.icon,
          color: listData.color,
          created_by: currentUser.id,
        })
        .select('*, tasks(*)')
        .single();

      if (error) throw error;

      setAllLists(prev => [{
        ...newList,
        shared_users: [],
        is_shared: false
      }, ...prev]);
      
      setIsCreateModalOpen(false);
      
      console.log('List created successfully:', newList);
      
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list. Please try again.');
    }
  };

  const handleCreateNote = async (noteData: { 
    title: string; 
  }) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      const { data: newNote, error } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          content: '',
          created_by: currentUser.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAllNotes(prev => [{
        ...newNote,
        shared_users: [],
        is_shared: false
      }, ...prev]);
      
      setIsCreateModalOpen(false);
      
      console.log('Note created successfully:', newNote);
      
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please try again.');
    }
  };

  // Optimized data fetching functions
  const fetchList = useCallback(async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*, tasks(*)')
        .eq('id', listId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching list:', error);
      return null;
    }
  }, [supabase]);

  const fetchNote = useCallback(async (noteId: string) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching note:', error);
      return null;
    }
  }, [supabase]);

  // Real-time subscriptions
  useEffect(() => {
    console.log('Setting up real-time subscriptions...');

    // Subscribe to lists owned by user
    const listsChannel = supabase
      .channel('user-lists')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lists',
          filter: `created_by=eq.${user.id}`
        },
        async (payload) => {
          console.log('List inserted:', payload);
          const newList = await fetchList(payload.new.id);
          if (newList) {
            setAllLists(prev => {
              // Check if list already exists
              if (prev.some(l => l.id === newList.id)) return prev;
              return [{...newList, shared_users: [], is_shared: false}, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lists',
          filter: `created_by=eq.${user.id}`
        },
        async (payload) => {
          console.log('List updated:', payload);
          const updatedList = await fetchList(payload.new.id);
          if (updatedList) {
            setAllLists(prev => prev.map(l => 
              l.id === updatedList.id ? {...l, ...updatedList} : l
            ));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'lists',
          filter: `created_by=eq.${user.id}`
        },
        (payload) => {
          console.log('List deleted:', payload);
          setAllLists(prev => prev.filter(l => l.id !== payload.old.id));
        }
      )
      .subscribe();

    // Subscribe to notes owned by user
    const notesChannel = supabase
      .channel('user-notes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `created_by=eq.${user.id}`
        },
        async (payload) => {
          console.log('Note inserted:', payload);
          const newNote = await fetchNote(payload.new.id);
          if (newNote) {
            setAllNotes(prev => {
              // Check if note already exists
              if (prev.some(n => n.id === newNote.id)) return prev;
              return [{...newNote, shared_users: [], is_shared: false}, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `created_by=eq.${user.id}`
        },
        async (payload) => {
          console.log('Note updated:', payload);
          const updatedNote = await fetchNote(payload.new.id);
          if (updatedNote) {
            setAllNotes(prev => prev.map(n => 
              n.id === updatedNote.id ? {...n, ...updatedNote} : n
            ));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notes',
          filter: `created_by=eq.${user.id}`
        },
        (payload) => {
          console.log('Note deleted:', payload);
          setAllNotes(prev => prev.filter(n => n.id !== payload.old.id));
        }
      )
      .subscribe();

    // Subscribe to tasks for all user's lists
    const tasksChannel = supabase
      .channel('user-tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        async (payload) => {
          console.log('Task changed:', payload);
          // Find which list this task belongs to
          const taskData = payload.new || payload.old;
          const listId = taskData ? (taskData as any).list_id : null;
          
          if (listId) {
            // Check if this list belongs to the user
            const userList = allLists.find(l => l.id === listId);
            if (userList) {
              const updatedList = await fetchList(listId);
              if (updatedList) {
                setAllLists(prev => prev.map(l => 
                  l.id === listId ? {...l, tasks: updatedList.tasks} : l
                ));
              }
            }
          }
        }
      )
      .subscribe();

    // Subscribe to list shares where user is the recipient
    const listSharesChannel = supabase
      .channel('user-list-shares')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'list_shares',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('List shared with user:', payload);
          const sharedList = await fetchList(payload.new.list_id);
          if (sharedList) {
            // Get share details to set permission
            const { data: shareData } = await supabase
              .from('list_shares')
              .select('permission, shared_by, profiles!list_shares_shared_by_fkey(id, name, username)')
              .eq('id', payload.new.id)
              .single();
            
            setAllLists(prev => {
              // Check if list already exists
              if (prev.some(l => l.id === sharedList.id)) return prev;
              return [{
                ...sharedList, 
                is_shared: true, 
                shared_users: [],
                shared_by: shareData?.profiles ? {
                  id: shareData.profiles.id,
                  name: shareData.profiles.name,
                  username: shareData.profiles.username,
                  avatar_url: null,
                  initials: shareData.profiles.name?.split(' ').map(n => n[0]).join('') || 'U'
                } : undefined
              }, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'list_shares',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('List share removed:', payload);
          // Remove the shared list from view
          setAllLists(prev => prev.filter(l => 
            !(l.id === payload.old.list_id && l.is_shared)
          ));
        }
      )
      .subscribe();

    // Subscribe to note shares where user is the recipient
    const noteSharesChannel = supabase
      .channel('user-note-shares')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'note_shares',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Note shared with user:', payload);
          const sharedNote = await fetchNote(payload.new.note_id);
          if (sharedNote) {
            // Get share details to set permission
            const { data: shareData } = await supabase
              .from('note_shares')
              .select('permission, shared_by, profiles!note_shares_shared_by_fkey(id, name, username)')
              .eq('id', payload.new.id)
              .single();
            
            setAllNotes(prev => {
              // Check if note already exists
              if (prev.some(n => n.id === sharedNote.id)) return prev;
              return [{
                ...sharedNote, 
                is_shared: true, 
                shared_users: [],
                shared_by: shareData?.profiles ? {
                  id: shareData.profiles.id,
                  name: shareData.profiles.name,
                  username: shareData.profiles.username,
                  avatar_url: null,
                  initials: shareData.profiles.name?.split(' ').map(n => n[0]).join('') || 'U'
                } : undefined
              }, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'note_shares',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Note share removed:', payload);
          // Remove the shared note from view
          setAllNotes(prev => prev.filter(n => 
            !(n.id === payload.old.note_id && n.is_shared)
          ));
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(listsChannel);
      supabase.removeChannel(notesChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(listSharesChannel);
      supabase.removeChannel(noteSharesChannel);
    };
  }, [user.id, supabase, fetchList, fetchNote]);

  // Handle pin actions
  const handlePinList = async (listId: string) => {
    try {
      const list = allLists.find(l => l.id === listId);
      if (!list) return;
      
      if (list.is_shared) {
        alert('You cannot pin lists shared with you');
        return;
      }
      
      const newPinnedState = !list.is_pinned;
      
      // Optimistic update
      setAllLists(prev => prev.map(l => 
        l.id === listId ? { ...l, is_pinned: newPinnedState } : l
      ));
      
      const { error } = await supabase
        .from('lists')
        .update({ 
          is_pinned: newPinnedState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listId);

      if (error) throw error;

    } catch (error) {
      console.error('Error pinning list:', error);
      // Revert on error
      const list = allLists.find(l => l.id === listId);
      if (list) {
        setAllLists(prev => prev.map(l => 
          l.id === listId ? { ...l, is_pinned: !l.is_pinned } : l
        ));
      }
    }
  };

  const handlePinNote = async (noteId: string) => {
    try {
      const note = allNotes.find(n => n.id === noteId);
      if (!note) return;
      
      if (note.is_shared) {
        alert('You cannot pin notes shared with you');
        return;
      }
      
      const newPinnedState = !note.is_pinned;
      
      // Optimistic update
      setAllNotes(prev => prev.map(n => 
        n.id === noteId ? { ...n, is_pinned: newPinnedState } : n
      ));
      
      const { error } = await supabase
        .from('notes')
        .update({ 
          is_pinned: newPinnedState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) throw error;

    } catch (error) {
      console.error('Error pinning note:', error);
      // Revert on error
      const note = allNotes.find(n => n.id === noteId);
      if (note) {
        setAllNotes(prev => prev.map(n => 
          n.id === noteId ? { ...n, is_pinned: !n.is_pinned } : n
        ));
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) {
      return;
    }

    try {
      for (const itemId of selectedItems) {
        const list = allLists.find(l => l.id === itemId);
        const note = allNotes.find(n => n.id === itemId);
        
        if (list && !list.is_shared) {
          await supabase
            .from('lists')
            .delete()
            .eq('id', itemId);
        } else if (note && !note.is_shared) {
          await supabase
            .from('notes')
            .delete()
            .eq('id', itemId);
        }
      }
      
      setSelectedItems(new Set());
      setBulkSelectMode(false);
      
      console.log('Bulk delete completed');
    } catch (error) {
      console.error('Error in bulk delete:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        <WelcomeSection userName={user.name} />
        
        <StatsSection
          tasksLeft={tasksLeft}
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          dueToday={3}
          listsCount={allLists.filter(list => !list.is_shared).length}
          notesCount={allNotes.filter(note => !note.is_shared).length}
          statsFilter={statsFilter}
          onStatsFilter={setStatsFilter}
        />
        
        <ControlsSection
          onCreateClick={() => setIsCreateModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}                                   
          onFilterChange={setFilterType}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          bulkSelectMode={bulkSelectMode}
          onBulkSelectToggle={() => setBulkSelectMode(!bulkSelectMode)}
          selectedItems={selectedItems}
          onBulkDelete={handleBulkDelete}
        />

        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create New Item 
        </Button>
        
        <ContentSection
          allLists={allLists as any}
          allNotes={allNotes as any}
          searchQuery={searchQuery}
          filterType={filterType}
          sortBy={sortBy}
          viewMode={viewMode}
          bulkSelectMode={bulkSelectMode}
          selectedItems={selectedItems}
          pinnedLists={pinnedLists}
          pinnedNotes={pinnedNotes}
          onItemSelect={(id) => {
            const newSelected = new Set(selectedItems);
            if (newSelected.has(id)) {
              newSelected.delete(id);
            } else {
              newSelected.add(id);
            }
            setSelectedItems(newSelected);
          }}
          onPinList={handlePinList}
          onPinNote={handlePinNote}
        />
      </main>

      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateList={handleCreateList}
        onCreateNote={handleCreateNote}
      />
    </div>
  );
}