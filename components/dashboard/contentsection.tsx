// components/dashboard/sections/ContentSection.tsx 
import { useState } from 'react';
import TodoListCard from "@components/dashboard/ui/toDoCard";
import EmptyState from "@components/dashboard/ui/emptyState";
import NoteCard from "@components/dashboard/ui/noteCard";
import type { Tables } from "@lib/supabase/types";

// Define types based on actual database structure
type ListWithTasks = Tables<'lists'> & {
  tasks?: Tables<'tasks'>[];
};

type NoteFromDB = Tables<'notes'>;

interface ContentSectionProps {
  lists: ListWithTasks[];
  notes: NoteFromDB[];
  sharedLists: ListWithTasks[];
  sharedNotes: NoteFromDB[];
  searchQuery: string;
  filterType: 'all' | 'lists' | 'notes';
  sortBy: 'created' | 'modified' | 'name' | 'completion';
  viewMode: 'grid' | 'list';
  bulkSelectMode: boolean;
  selectedItems: Set<string>;
  pinnedLists: Set<string>;
  pinnedNotes: Set<string>;
  archivedLists: Set<string>;
  archivedNotes: Set<string>;
  onItemSelect: (id: string) => void;
  onPinList: (id: string) => void;
  onPinNote: (id: string) => void;
  onArchiveList: (id: string) => void;
  onArchiveNote: (id: string) => void;
  onCreateClick?: () => void;
}

export default function ContentSection({
  lists,
  notes,
  sharedLists,
  sharedNotes,
  searchQuery,
  filterType,
  sortBy,
  viewMode,
  bulkSelectMode,
  selectedItems,
  pinnedLists,
  pinnedNotes,
  archivedLists,
  archivedNotes,
  onItemSelect,
  onPinList,
  onPinNote,
  onArchiveList,
  onArchiveNote,
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
  const sortItems = <T extends ListWithTasks | NoteFromDB>(items: T[]): T[] => {
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
            const aList = a as ListWithTasks;
            const bList = b as ListWithTasks;
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

  // Process lists
  const getProcessedLists = (listArray: ListWithTasks[]) => {
    if (filterType === 'notes') return [];
    
    // Filter out archived
    let filtered = listArray.filter(list => !archivedLists.has(list.id));
    
    // Apply search
    filtered = filterItems(filtered);
    
    // Separate pinned and unpinned
    const pinned = filtered.filter(list => pinnedLists.has(list.id));
    const unpinned = filtered.filter(list => !pinnedLists.has(list.id));
    
    // Sort each group
    return [...sortItems(pinned), ...sortItems(unpinned)];
  };

  // Process notes
  const getProcessedNotes = (noteArray: NoteFromDB[]) => {
    if (filterType === 'lists') return [];
    
    // Filter out archived
    let filtered = noteArray.filter(note => !archivedNotes.has(note.id));
    
    // Apply search (include content for notes)
    filtered = filterItems(filtered, true);
    
    // Separate pinned and unpinned
    const pinned = filtered.filter(note => pinnedNotes.has(note.id));
    const unpinned = filtered.filter(note => !pinnedNotes.has(note.id));
    
    // Sort each group
    return [...sortItems(pinned), ...sortItems(unpinned)];
  };

  const filteredMyLists = getProcessedLists(lists);
  const filteredMyNotes = getProcessedNotes(notes);
  const filteredSharedLists = getProcessedLists(sharedLists);
  const filteredSharedNotes = getProcessedNotes(sharedNotes);

  // Check if no results
  const hasNoResults = 
    filteredMyLists.length === 0 && 
    filteredMyNotes.length === 0 && 
    filteredSharedLists.length === 0 && 
    filteredSharedNotes.length === 0 &&
    (lists.length > 0 || notes.length > 0 || sharedLists.length > 0 || sharedNotes.length > 0);

  // Grid classes based on view mode
  const gridClasses = viewMode === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : 'flex flex-col gap-3';

  const renderContent = () => {
    switch (activeTab) {
      case 'my-items':
        return (
          <>
            {filteredMyLists.length > 0 && (
              <Section title="My Lists" icon="📋">
                <div className={gridClasses}>
                  {filteredMyLists.map((list) => {
                    const tasks = list.tasks || [];
                    const taskCount = tasks.length;
                    const completedCount = tasks.filter(task => task.is_completed).length;
                    
                    return (
                      <div key={list.id} className={viewMode === 'list' ? 'flex items-center gap-3' : ''}>
                        {bulkSelectMode && (
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
                            is_archived={archivedLists.has(list.id)}
                            viewMode={viewMode}
                            // Only pass onClick in bulk select mode
                            onClick={bulkSelectMode ? () => onItemSelect(list.id) : undefined}
                            onPin={() => onPinList(list.id)}
                            onArchive={() => onArchiveList(list.id)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {filteredMyNotes.length > 0 && (
              <Section title="My Notes" icon="📝">
                <div className={gridClasses}>
                  {filteredMyNotes.map((note) => (
                    <div key={note.id} className={viewMode === 'list' ? 'flex items-center gap-3' : ''}>
                      {bulkSelectMode && (
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
                          viewMode={viewMode}
                          // Only pass onClick in bulk select mode
                          onClick={bulkSelectMode ? () => onItemSelect(note.id) : undefined}
                          onPin={() => onPinNote(note.id)}
                          onArchive={() => onArchiveNote(note.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        );

      case 'all-items':
      default:
        return (
          <>
            {filteredMyLists.length > 0 && (
              <Section title="My Lists" icon="📋">
                <div className={gridClasses}>
                  {filteredMyLists.map((list) => {
                    const tasks = list.tasks || [];
                    const taskCount = tasks.length;
                    const completedCount = tasks.filter(task => task.is_completed).length;
                    
                    return (
                      <div key={list.id} className={viewMode === 'list' ? 'flex items-center gap-3' : ''}>
                        {bulkSelectMode && (
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
                            is_archived={archivedLists.has(list.id)}
                            viewMode={viewMode}
                            // Only pass onClick in bulk select mode
                            onClick={bulkSelectMode ? () => onItemSelect(list.id) : undefined}
                            onPin={() => onPinList(list.id)}
                            onArchive={() => onArchiveList(list.id)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {filteredMyNotes.length > 0 && (
              <Section title="My Notes" icon="📝">
                <div className={gridClasses}>
                  {filteredMyNotes.map((note) => (
                    <div key={note.id} className={viewMode === 'list' ? 'flex items-center gap-3' : ''}>
                      {bulkSelectMode && (
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
                          viewMode={viewMode}
                          // Only pass onClick in bulk select mode
                          onClick={bulkSelectMode ? () => onItemSelect(note.id) : undefined}
                          onPin={() => onPinNote(note.id)}
                          onArchive={() => onArchiveNote(note.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {filteredSharedLists.length > 0 && (
              <Section title="Shared Lists" icon="👥">
                <div className={gridClasses}>
                  {filteredSharedLists.map((list) => {
                    const tasks = list.tasks || [];
                    const taskCount = tasks.length;
                    const completedCount = tasks.filter(task => task.is_completed).length;
                    
                    return (
                      <TodoListCard
                        key={list.id}
                        id={list.id}
                        title={list.title}
                        icon={list.icon || '📋'}
                        color={list.color || 'indigo'}
                        taskCount={taskCount}
                        completedCount={completedCount}
                        createdDate={safeParseDate(list.created_at)}
                        is_pinned={false}
                        is_archived={false}
                        viewMode={viewMode}
                        // Shared lists don't need onClick since they should navigate
                      />
                    );
                  })}
                </div>
              </Section>
            )}

            {filteredSharedNotes.length > 0 && (
              <Section title="Shared Notes" icon="📄">
                <div className={gridClasses}>
                  {filteredSharedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      id={note.id}
                      title={note.title}
                      content={note.content || ''}
                      lastEdited={safeParseDate(note.updated_at || note.created_at)}
                      createdDate={safeParseDate(note.created_at)}
                      isPinned={false}
                      viewMode={viewMode}
                      // Shared notes don't need onClick since they should navigate
                    />
                  ))}
                </div>
              </Section>
            )}
          </>
        );
    }
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
    lists.length === 0 && 
    notes.length === 0 && 
    sharedLists.length === 0 && 
    sharedNotes.length === 0;

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