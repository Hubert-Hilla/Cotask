// components/dashboard/DashboardPage.tsx - COMPLETE WORKING VERSION
'use client';

import { useState, useEffect } from 'react';
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

// Define types based on your actual database queries
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
  const [pinnedLists, setPinnedLists] = useState<Set<string>>(new Set());
  const [pinnedNotes, setPinnedNotes] = useState<Set<string>>(new Set());
  const [archivedLists, setArchivedLists] = useState<Set<string>>(new Set());
  const [archivedNotes, setArchivedNotes] = useState<Set<string>>(new Set());
  const [statsFilter, setStatsFilter] = useState<string | null>(null);
  
  // State for actual data that can be updated
  const [allLists, setAllLists] = useState<ListWithShares[]>(initialAllLists);
  const [allNotes, setAllNotes] = useState<NoteWithShares[]>(initialAllNotes);

  // Initialize pinned/archived sets from actual data
  useEffect(() => {
    const pinnedListsSet = new Set<string>();
    const pinnedNotesSet = new Set<string>();
    const archivedListsSet = new Set<string>();
    const archivedNotesSet = new Set<string>();
    
    initialAllLists.forEach(list => {
      if (list.is_pinned) pinnedListsSet.add(list.id);
      if (list.is_archived) archivedListsSet.add(list.id);
    });
    
    initialAllNotes.forEach(note => {
      if (note.is_pinned) pinnedNotesSet.add(note.id);
      if (note.is_archived) archivedNotesSet.add(note.id);
    });
    
    setPinnedLists(pinnedListsSet);
    setPinnedNotes(pinnedNotesSet);
    setArchivedLists(archivedListsSet);
    setArchivedNotes(archivedNotesSet);
  }, [initialAllLists, initialAllNotes]);

  // Calculate stats from database structure (only for user's own lists)
  const calculateListStats = (lists: ListWithShares[]) => {
    const myLists = lists.filter(list => !list.is_shared);
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
  };

  const stats = calculateListStats(allLists);
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
    isPrivate: boolean 
  }) => {
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Create the list in Supabase
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

      // Update local state
      setAllLists(prev => [{
        ...newList,
        shared_users: [],
        is_shared: false
      }, ...prev]);
      
      // Close modal
      setIsCreateModalOpen(false);
      
      console.log('List created successfully:', newList);
      
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list. Please try again.');
    }
  };

  const handleCreateNote = async (noteData: { 
    title: string; 
    isPrivate: boolean 
  }) => {
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Create the note in Supabase
      const { data: newNote, error } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          content: '', // Empty content initially
          created_by: currentUser.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAllNotes(prev => [{
        ...newNote,
        shared_users: [],
        is_shared: false
      }, ...prev]);
      
      // Close modal
      setIsCreateModalOpen(false);
      
      console.log('Note created successfully:', newNote);
      
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please try again.');
    }
  };

  // Function to refresh all data
  const refreshData = async () => {
    try {
      // In a real app, you would refetch all data from the server
      // For now, we'll just reload the page
      router.refresh();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Real-time subscription for updates
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      return currentUser?.id;
    };

    const setupSubscriptions = async () => {
      const userId = await getCurrentUser();
      if (!userId) return;

      const channel = supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'lists',
            filter: `created_by=eq.${userId}`
          },
          () => refreshData()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notes',
            filter: `created_by=eq.${userId}`
          },
          () => refreshData()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscriptions();
  }, []);

  // Handle pin/archive actions
  const handlePinList = async (listId: string) => {
    try {
      const list = allLists.find(l => l.id === listId);
      if (!list) return;
      
      // Don't allow pinning shared lists
      if (list.is_shared) {
        alert('You cannot pin lists shared with you');
        return;
      }
      
      const newPinnedState = !list.is_pinned;
      
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
      
      setPinnedLists(prev => {
        const newSet = new Set(prev);
        if (newPinnedState) {
          newSet.add(listId);
        } else {
          newSet.delete(listId);
        }
        return newSet;
      });

    } catch (error) {
      console.error('Error pinning list:', error);
      await refreshData();
    }
  };

  const handleArchiveList = async (listId: string) => {
    try {
      const list = allLists.find(l => l.id === listId);
      if (!list) return;
      
      // Don't allow archiving shared lists
      if (list.is_shared) {
        alert('You cannot archive lists shared with you');
        return;
      }
      
      const newArchivedState = !list.is_archived;
      
      setAllLists(prev => prev.map(l => 
        l.id === listId ? { ...l, is_archived: newArchivedState } : l
      ));
      
      const { error } = await supabase
        .from('lists')
        .update({ 
          is_archived: newArchivedState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listId);

      if (error) throw error;
      
      setArchivedLists(prev => {
        const newSet = new Set(prev);
        if (newArchivedState) {
          newSet.add(listId);
        } else {
          newSet.delete(listId);
        }
        return newSet;
      });

    } catch (error) {
      console.error('Error archiving list:', error);
      await refreshData();
    }
  };

  const handlePinNote = async (noteId: string) => {
    try {
      const note = allNotes.find(n => n.id === noteId);
      if (!note) return;
      
      // Don't allow pinning shared notes
      if (note.is_shared) {
        alert('You cannot pin notes shared with you');
        return;
      }
      
      const newPinnedState = !note.is_pinned;
      
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
      
      setPinnedNotes(prev => {
        const newSet = new Set(prev);
        if (newPinnedState) {
          newSet.add(noteId);
        } else {
          newSet.delete(noteId);
        }
        return newSet;
      });

    } catch (error) {
      console.error('Error pinning note:', error);
      await refreshData();
    }
  };

  const handleArchiveNote = async (noteId: string) => {
    try {
      const note = allNotes.find(n => n.id === noteId);
      if (!note) return;
      
      // Don't allow archiving shared notes
      if (note.is_shared) {
        alert('You cannot archive notes shared with you');
        return;
      }
      
      const newArchivedState = !note.is_archived;
      
      setAllNotes(prev => prev.map(n => 
        n.id === noteId ? { ...n, is_archived: newArchivedState } : n
      ));
      
      const { error } = await supabase
        .from('notes')
        .update({ 
          is_archived: newArchivedState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) throw error;
      
      setArchivedNotes(prev => {
        const newSet = new Set(prev);
        if (newArchivedState) {
          newSet.add(noteId);
        } else {
          newSet.delete(noteId);
        }
        return newSet;
      });

    } catch (error) {
      console.error('Error archiving note:', error);
      await refreshData();
    }
  };

  const handleBulkArchive = async () => {
    try {
      for (const itemId of selectedItems) {
        const list = allLists.find(l => l.id === itemId);
        const note = allNotes.find(n => n.id === itemId);
        
        if (list && !list.is_shared) {
          await supabase
            .from('lists')
            .update({ 
              is_archived: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', itemId);
        } else if (note && !note.is_shared) {
          await supabase
            .from('notes')
            .update({ 
              is_archived: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', itemId);
        }
      }

      await refreshData();
      
      setSelectedItems(new Set());
      setBulkSelectMode(false);
      
      console.log('Bulk archive completed');
    } catch (error) {
      console.error('Error in bulk archive:', error);
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

      await refreshData();
      
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
          onBulkArchive={handleBulkArchive}
          onBulkDelete={handleBulkDelete}
        />

        {/* Button for creating a new item, opens modal */}
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