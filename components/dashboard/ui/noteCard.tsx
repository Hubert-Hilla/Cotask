// components/dashboard/ui/NoteCard.tsx - WITH DARK MODE
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import UserAvatars from '@/components/dashboard/ui/usersAvatar';

interface SharedUser {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  initials: string;
  permission: 'view' | 'edit';
}

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  createdDate: string;
  isPinned: boolean;
  isArchived?: boolean;
  isShared?: boolean;
  sharedUsers?: SharedUser[];
  viewMode: 'grid' | 'list';
  onClick?: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Helper function to safely strip HTML tags for plain text preview
const stripHtml = (html: string): string => {
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  return html.replace(/<[^>]*>/g, '');
};

// Helper to create plain text preview
const createPlainPreview = (content: string, maxLength: number = 150): string => {
  const plainText = stripHtml(content);
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...' 
    : plainText;
};

export default function NoteCard({
  id,
  title,
  content,
  lastEdited,
  createdDate,
  isPinned,
  isArchived = false,
  isShared = false,
  sharedUsers = [],
  viewMode,
  onClick,
  onPin,
  onArchive,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  
  const plainPreview = createPlainPreview(content);
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/dashboard/notes/${id}`);
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg p-4 border hover:shadow-md transition-shadow cursor-pointer ${
          isArchived 
            ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 opacity-75' 
            : 'border-gray-200 dark:border-gray-700'
        }`}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isArchived ? 'bg-gray-200 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <span className="text-xl">{isArchived ? '📦' : '📝'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-medium truncate ${
                isArchived ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
              }`}>
                {title}
              </h3>
              {isArchived && (
                <span className="text-gray-500 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded" title="Archived">
                  Archived
                </span>
              )}
              {isShared && (
                <span className="text-blue-500 dark:text-blue-400 text-sm bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded" title="Shared with you">
                  Shared
                </span>
              )}
            </div>
            
            <p className={`text-sm mb-2 line-clamp-2 ${
              isArchived ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {plainPreview}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="space-x-4">
                <span className={isArchived ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}>
                  Edited: {new Date(lastEdited).toLocaleDateString()}
                </span>
                <span className={isArchived ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}>
                  Created: {new Date(createdDate).toLocaleDateString()}
                </span>
              </div>
              
              {sharedUsers && sharedUsers.length > 0 && (
                <UserAvatars users={sharedUsers} size="sm" />
              )}
            </div>
          </div>
          
          {(showActions || isPinned) && (onPin || onArchive || onEdit || onDelete) && !isShared && !isArchived && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {onPin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isPinned 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={isPinned ? 'Unpin' : 'Pin'}
                >
                  {isPinned ? '📍' : '📌'}
                </button>
              )}
              
              {(onArchive || onEdit || onDelete) && (
                <div className="relative group">
                  <button
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="More actions"
                  >
                    <span className="text-sm">⋯</span>
                  </button>
                  
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit();
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {onArchive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive();
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {isArchived ? '📤 Unarchive' : '📦 Archive'}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                        }}
                        className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 last:rounded-b-lg"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Grid view - WITH HTML PREVIEW AND DARK MODE
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-64 overflow-hidden ${
        isArchived 
          ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 opacity-75' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header with icon, actions, and user avatars */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isArchived ? 'bg-gray-200 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          <span className="text-xl">{isArchived ? '📦' : '📝'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {sharedUsers && sharedUsers.length > 0 && (
            <UserAvatars users={sharedUsers} size="sm" />
          )}
          
          {onPin && !isShared && !isArchived && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className={`p-1.5 rounded transition-colors ${
                showActions || isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } ${
                isPinned 
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              {isPinned ? '📍' : '📌'}
            </button>
          )}
        </div>
      </div>
      
      {/* Title */}
      <div className="px-4 pb-2">
        <h3 className={`font-medium truncate ${
          isArchived ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
        }`}>
          {title}
          {isArchived && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              Archived
            </span>
          )}
          {isShared && (
            <span className="ml-2 text-xs text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
              Shared
            </span>
          )}
        </h3>
      </div>
      
      {/* HTML Preview - Mini screenshot style */}
      <div className="flex-1 px-4 overflow-hidden relative">
        {/* Render actual HTML content with scaled-down styling */}
        <div 
          className={`text-xs leading-relaxed overflow-hidden ${
            isArchived ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
          }
          [&>h1]:text-sm [&>h1]:font-semibold [&>h1]:mt-2 [&>h1]:mb-1 dark:[&>h1]:text-gray-200
          [&>h2]:text-xs [&>h2]:font-semibold [&>h2]:mt-1.5 [&>h2]:mb-1 dark:[&>h2]:text-gray-300
          [&>p]:my-1 [&>p]:leading-snug
          [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:my-1
          [&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:my-1
          [&>li]:my-0.5
          [&>strong]:font-semibold dark:[&>strong]:text-gray-200
          [&>em]:italic
          [&_div[data-todo]]:flex [&_div[data-todo]]:items-center [&_div[data-todo]]:gap-1 [&_div[data-todo]]:my-1 [&_div[data-todo]]:text-xs
          `}
          dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 dark:text-gray-500">Empty note...</p>' }}
        />
        
        {/* Fade out gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
      </div>
      
      {/* Metadata */}
      <div className="flex items-center justify-between text-xs px-4 py-2 border-t border-gray-100 dark:border-gray-700 mt-auto bg-white dark:bg-gray-800">
        <span className={isArchived ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}>
          Edited {new Date(lastEdited).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className={isArchived ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}>
          Created {new Date(createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      
      {/* Action buttons - show on hover */}
      {showActions && (onArchive || onEdit || onDelete) && !isShared && !isArchived && (
        <div 
          className="flex items-center gap-2 px-4 pb-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700" 
          onClick={(e) => e.stopPropagation()}
        >
          {onArchive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
              className="flex-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Archive
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}