// components/dashboard/sections/ContentSection.tsx - UPDATED (archive functionality removed)
import { useState } from 'react';
import TodoListCard from "@components/dashboard/ui/toDoCard";
import EmptyState from "@components/dashboard/ui/emptyState";
import NoteCard from "@components/dashboard/ui/noteCard";
import type { Tables } from "@lib/supabase/types";

// Define types (these should match what's in DashboardPage)
interface SharedUser {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  initials: string;
  permission: 'view' | 'edit';
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
  shared_users?: SharedUser[];
};

type NoteWithShares = Tables<'notes'> & {
  is_shared?: boolean;
  shared_by?: SharedByUser;
  shared_users?: SharedUser[];
};

interface ContentSectionProps {
  allLists: ListWithShares[];
  allNotes: NoteWithShares[];
  searchQuery: string;
  filterType: 'all' | 'lists' | 'notes';
  sortBy: 'created' | 'modified' | 'name' | 'completion';
  viewMode: 'grid' | 'list';
  bulkSelectMode: boolean;
  selectedItems: Set<string>;
  pinnedLists: Set<string>;
  pinnedNotes: Set<string>;
  onItemSelect: (id: string) => void;
  onPinList: (id: string) => void;
  onPinNote: (id: string) => void;
  onCreateClick?: () => void;
}

export default function ContentSection({
  allLists,
  allNotes,
  searchQuery,
  filterType,
  sortBy,
  viewMode,
  bulkSelectMode,
  selectedItems,
  pinnedLists,
  pinnedNotes,
  onItemSelect,
  onPinList,
  onPinNote,
  onCreateClick,
}: ContentSectionProps) {
  const [activeTab, setActiveTab] = useState<'all-items' | 'my-items'>('all-items');

  // Helper to safely parse dates
  const safeParseDate = (dateString: string | null | undefined): string => {
    if (!dateString) return new Date().toISOString();
    return dateString;
  };

  // Filter items based on search query
  const filterItems = <T extends { title: string; content?: string | null }>(items: T[], includeContent = false) => {
    if (!searchQuery.trim()) return items;
    
    const searchLower = searchQuery.toLowerCase();
    return items.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(searchLower);
      const contentMatch = includeContent && item.content ? item.content.toLowerCase().includes(searchLower) : false;
      return titleMatch || contentMatch;
    });
  };

  // Sort items
  const sortItems = <T extends ListWithShares | NoteWithShares>(items: T[]): T[] => {
    const sorted = [...items];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'created':
        return sorted.sort((a, b) => {
          const aDate = new Date(safeParseDate(a.created_at)).getTime();
          const bDate = new Date(safeParseDate(b.created_at)).getTime();
          return bDate - aDate;
        });
      case 'modified':
        return sorted.sort((a, b) => {
          const aDate = new Date(safeParseDate(a.updated_at || a.created_at)).getTime();
          const bDate = new Date(safeParseDate(b.updated_at || b.created_at)).getTime();
          return bDate - aDate;
        });
      case 'completion':
        return sorted.sort((a, b) => {
          if ('tasks' in a && 'tasks' in b) {
            const aList = a as ListWithShares;
            const bList = b as ListWithShares;
            const aTasks = aList.tasks || [];
            const bTasks = bList.tasks || [];
            const aPercent = aTasks.length > 0 ? aTasks.filter(t => t.is_completed).length / aTasks.length : 0;
            const bPercent = bTasks.length > 0 ? bTasks.filter(t => t.is_completed).length / bTasks.length : 0;
            return bPercent - aPercent;
          }
          return 0;
        });
      default:
        return sorted;
    }
  };

  // Filter based on active tab
  const getFilteredLists = () => {
    let filtered = allLists;
    
    // Apply search
    filtered = filterItems(filtered);
    
    // Filter by tab
    if (activeTab === 'my-items') {
      filtered = filtered.filter(list => !list.is_shared);
    }
    
    // Separate pinned and unpinned
    const pinned = filtered.filter(list => pinnedLists.has(list.id));
    const unpinned = filtered.filter(list => !pinnedLists.has(list.id));
    
    // Sort each group
    return [...sortItems(pinned), ...sortItems(unpinned)];
  };

  const getFilteredNotes = () => {
    let filtered = allNotes;
    
    // Apply search (include content for notes)
    filtered = filterItems(filtered, true);
    
    // Filter by tab
    if (activeTab === 'my-items') {
      filtered = filtered.filter(note => !note.is_shared);
    }
    
    // Separate pinned and unpinned
    const pinned = filtered.filter(note => pinnedNotes.has(note.id));
    const unpinned = filtered.filter(note => !pinnedNotes.has(note.id));
    
    // Sort each group
    return [...sortItems(pinned), ...sortItems(unpinned)];
  };

  const filteredLists = getFilteredLists();
  const filteredNotes = getFilteredNotes();

  // Check if no results
  const hasNoResults = 
    (filterType !== 'notes' && filteredLists.length === 0) && 
    (filterType !== 'lists' && filteredNotes.length === 0) &&
    (allLists.length > 0 || allNotes.length > 0);

  // Grid classes based on view mode
  const gridClasses = viewMode === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : 'flex flex-col gap-3';

  const renderContent = () => {
    // If filter is set to only lists or notes, respect that
    const showLists = filterType !== 'notes';
    const showNotes = filterType !== 'lists';

    return (
      <>
        {showLists && filteredLists.length > 0 && (
          <Section title="Lists" icon="📋">
            <div className={gridClasses}>
              {filteredLists.map((list) => {
                const tasks = list.tasks || [];
                const taskCount = tasks.length;
                const completedCount = tasks.filter(task => task.is_completed).length;
                
                return (
                  <div key={list.id} className={viewMode === 'list' ? 'flex items-center gap-3' : ''}>
                    {bulkSelectMode && !list.is_shared && (
                      <input
                        type="checkbox"
                        checked={selectedItems.has(list.id)}
                        onChange={() => onItemSelect(list.id)}
                        className="flex-shrink-0 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    )}
                    <div className="flex-1">
                      <TodoListCard
                        id={list.id}
                        title={list.title}
                        icon={list.icon || '📋'}
                        color={list.color || 'indigo'}
                        taskCount={taskCount}
                        completedCount={completedCount}
                        createdDate={safeParseDate(list.created_at)}
                        is_pinned={pinnedLists.has(list.id)}
                        is_shared={list.is_shared}
                        shared_users={list.shared_users}
                        viewMode={viewMode}
                        // Only pass onClick in bulk select mode and for non-shared items
                        onClick={bulkSelectMode && !list.is_shared ? () => onItemSelect(list.id) : undefined}
                        onPin={!list.is_shared ? () => onPinList(list.id) : undefined}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {showNotes && filteredNotes.length > 0 && (
          <Section title="Notes" icon="📝">
            <div className={gridClasses}>
              {filteredNotes.map((note) => (
                <div key={note.id} className={viewMode === 'list' ? 'flex items-center gap-3' : ''}>
                  {bulkSelectMode && !note.is_shared && (
                    <input
                      type="checkbox"
                      checked={selectedItems.has(note.id)}
                      onChange={() => onItemSelect(note.id)}
                      className="flex-shrink-0 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  )}
                  <div className="flex-1">
                    <NoteCard
                      id={note.id}
                      title={note.title}
                      content={note.content || ''}
                      lastEdited={safeParseDate(note.updated_at || note.created_at)}
                      createdDate={safeParseDate(note.created_at)}
                      isPinned={pinnedNotes.has(note.id)}
                      isShared={note.is_shared}
                      sharedUsers={note.shared_users}
                      viewMode={viewMode}
                      // Only pass onClick in bulk select mode and for non-shared items
                      onClick={bulkSelectMode && !note.is_shared ? () => onItemSelect(note.id) : undefined}
                      onPin={!note.is_shared ? () => onPinNote(note.id) : undefined}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </>
    );
  };

  if (hasNoResults) {
    return (
      <EmptyState
        type="no-results"
        title="No results found"
        message="Try adjusting your search or filters"
        actionLabel="Clear all filters"
        onAction={() => {
          // Clear all filters
          console.log('Clear filters');
        }}
      />
    );
  }

  const isEmptyState = 
    allLists.length === 0 && 
    allNotes.length === 0;

  if (isEmptyState) {
    return (
      <EmptyState
        type="empty"
        title="Nothing here yet"
        message="Create your first list or note to get started"
        actionLabel="Create Your First Item"
        onAction={onCreateClick || (() => console.log('Open create modal'))}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all-items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all-items'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setActiveTab('my-items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-items'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Items
          </button>
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

// Helper Section Component
interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span>{icon}</span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}