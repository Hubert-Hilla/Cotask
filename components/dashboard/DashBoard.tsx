// components/dashboard/DashboardPage.tsx - FULLY CORRECTED
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

// Define types based on your actual database queries
type ListWithTasks = Tables<'lists'> & {
  tasks?: Tables<'tasks'>[];
};

type NoteFromDB = Tables<'notes'>;

interface DashboardPageProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    username: string;
    id: string;
  };
  lists: ListWithTasks[];
  notes: NoteFromDB[];
  sharedLists: ListWithTasks[]; 
  sharedNotes: NoteFromDB[]; 
}

export default function DashboardPage({
  user,
  lists: initialLists,
  notes: initialNotes,
  sharedLists: initialSharedLists,
  sharedNotes: initialSharedNotes,
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
  const [lists, setLists] = useState<ListWithTasks[]>(initialLists);
  const [notes, setNotes] = useState<NoteFromDB[]>(initialNotes);
  
  // Helper function to safely extract shared lists from any structure
  const extractSharedLists = (sharedData: any[]): ListWithTasks[] => {
    if (!sharedData || !Array.isArray(sharedData)) return [];
    
    const result: ListWithTasks[] = [];
    
    for (const item of sharedData) {
      if (!item || !item.lists) continue;
      
      const lists = item.lists;
      
      // If it's an array of lists
      if (Array.isArray(lists)) {
        for (const list of lists) {
          if (list && typeof list === 'object' && list.id && list.title) {
            result.push(list);
          }
        }
      }
      // If it's a single list object
      else if (lists && typeof lists === 'object' && lists.id && lists.title) {
        result.push(lists);
      }
    }
    
    return result;
  };

  // Helper function to safely extract shared notes from any structure
  const extractSharedNotes = (sharedData: any[]): NoteFromDB[] => {
    if (!sharedData || !Array.isArray(sharedData)) return [];
    
    const result: NoteFromDB[] = [];
    
    for (const item of sharedData) {
      if (!item || !item.notes) continue;
      
      const notes = item.notes;
      
      // If it's an array of notes
      if (Array.isArray(notes)) {
        for (const note of notes) {
          if (note && typeof note === 'object' && note.id && note.title) {
            result.push(note);
          }
        }
      }
      // If it's a single note object
      else if (notes && typeof notes === 'object' && notes.id && notes.title) {
        result.push(notes);
      }
    }
    
    return result;
  };

  const [sharedLists, setSharedLists] = useState<ListWithTasks[]>(
    extractSharedLists(initialSharedLists)
  );

  const [sharedNotes, setSharedNotes] = useState<NoteFromDB[]>(
    extractSharedNotes(initialSharedNotes)
  );

  // Calculate stats from database structure
  const calculateListStats = (listArray: ListWithTasks[]) => {
    return listArray.reduce((acc, list) => {
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

  const stats = calculateListStats(lists);
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
      setLists(prev => [newList, ...prev]);
      
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
      setNotes(prev => [newNote, ...prev]);
      
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Fetch updated lists
      const { data: updatedLists } = await supabase
        .from("lists")
        .select('*, tasks(*)')
        .eq("created_by", currentUser.id);
      
      if (updatedLists) setLists(updatedLists);

      // Fetch updated notes
      const { data: updatedNotes } = await supabase
        .from("notes")
        .select('*')
        .eq('created_by', currentUser.id);
      
      if (updatedNotes) setNotes(updatedNotes);

      // Fetch updated shared lists
      const { data: updatedSharedListsResponse } = await supabase
        .from("list_shares")
        .select('lists(*)')
        .eq('user_id', currentUser.id);
      
      if (updatedSharedListsResponse) {
        const extractedLists = extractSharedLists(updatedSharedListsResponse);
        setSharedLists(extractedLists);
      }

      // Fetch updated shared notes
      const { data: updatedSharedNotesResponse } = await supabase
        .from("note_shares")
        .select("notes(*)")
        .eq("user_id", currentUser.id);
      
      if (updatedSharedNotesResponse) {
        const extractedNotes = extractSharedNotes(updatedSharedNotesResponse);
        setSharedNotes(extractedNotes);
      }

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

  // Handle pin/archive actions with real database updates
  const handlePinList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('lists')
        .update({ is_pinned: !pinnedLists.has(listId) })
        .eq('id', listId);

      if (error) throw error;

      if (pinnedLists.has(listId)) {
        setPinnedLists(prev => {
          const newSet = new Set(prev);
          newSet.delete(listId);
          return newSet;
        });
      } else {
        setPinnedLists(prev => new Set(prev).add(listId));
      }

      await refreshData();
    } catch (error) {
      console.error('Error pinning list:', error);
    }
  };

  const handleArchiveList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('lists')
        .update({ is_archived: !archivedLists.has(listId) })
        .eq('id', listId);

      if (error) throw error;

      if (archivedLists.has(listId)) {
        setArchivedLists(prev => {
          const newSet = new Set(prev);
          newSet.delete(listId);
          return newSet;
        });
      } else {
        setArchivedLists(prev => new Set(prev).add(listId));
      }

      await refreshData();
    } catch (error) {
      console.error('Error archiving list:', error);
    }
  };

  const handlePinNote = async (noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (note && 'is_pinned' in note) {
        const { error } = await supabase
          .from('notes')
          .update({ is_pinned: !pinnedNotes.has(noteId) })
          .eq('id', noteId);

        if (error) throw error;
      }

      if (pinnedNotes.has(noteId)) {
        setPinnedNotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(noteId);
          return newSet;
        });
      } else {
        setPinnedNotes(prev => new Set(prev).add(noteId));
      }

      await refreshData();
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const handleArchiveNote = async (noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (note && 'is_archived' in note) {
        const { error } = await supabase
          .from('notes')
          .update({ is_archived: !archivedNotes.has(noteId) })
          .eq('id', noteId);

        if (error) throw error;
      }

      if (archivedNotes.has(noteId)) {
        setArchivedNotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(noteId);
          return newSet;
        });
      } else {
        setArchivedNotes(prev => new Set(prev).add(noteId));
      }

      await refreshData();
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  const handleBulkArchive = async () => {
    try {
      for (const listId of selectedItems) {
        await supabase
          .from('lists')
          .update({ is_archived: true })
          .eq('id', listId);
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
        const isList = lists.some(list => list.id === itemId) || 
                       sharedLists.some(list => list.id === itemId);
        
        if (isList) {
          await supabase
            .from('lists')
            .delete()
            .eq('id', itemId);
        } else {
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
          listsCount={lists.length}
          notesCount={notes.length}
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
          lists={lists}
          notes={notes}
          sharedLists={sharedLists}
          sharedNotes={sharedNotes}
          searchQuery={searchQuery}
          filterType={filterType}
          sortBy={sortBy}
          viewMode={viewMode}
          bulkSelectMode={bulkSelectMode}
          selectedItems={selectedItems}
          pinnedLists={pinnedLists}
          pinnedNotes={pinnedNotes}
          archivedLists={archivedLists}
          archivedNotes={archivedNotes}
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
          onArchiveList={handleArchiveList}
          onArchiveNote={handleArchiveNote}
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