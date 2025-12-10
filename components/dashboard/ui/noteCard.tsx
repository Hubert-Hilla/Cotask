// components/dashboard/ui/NoteCard.tsx - UPDATED
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

// Helper function to safely strip HTML tags for preview
const stripHtml = (html: string): string => {
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  // Fallback for server-side: remove HTML tags with regex (not perfect but works for preview)
  return html.replace(/<[^>]*>/g, '');
};

// Helper to create preview text
const createPreview = (content: string, maxLength: number = 100): string => {
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
  
  const preview = createPreview(content);
  
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
        className={`bg-white rounded-lg p-4 border hover:shadow-md transition-shadow cursor-pointer ${
          isArchived ? 'border-gray-300 bg-gray-50 opacity-75' : 'border-gray-200'
        }`}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isArchived ? 'bg-gray-200' : 'bg-gray-100'
          }`}>
            <span className="text-xl">{isArchived ? '📦' : '📝'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-medium truncate ${isArchived ? 'text-gray-500' : ''}`}>
                {title}
              </h3>
              {isPinned && !isArchived && (
                <span className="text-amber-500 flex-shrink-0" title="Pinned">
                  📍
                </span>
              )}
              {isArchived && (
                <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded" title="Archived">
                  Archived
                </span>
              )}
              {isShared && (
                <span className="text-blue-500 text-sm bg-blue-100 px-2 py-1 rounded" title="Shared with you">
                  Shared
                </span>
              )}
            </div>
            
            <p className={`text-sm mb-2 line-clamp-2 ${
              isArchived ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {preview}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="space-x-4">
                <span className={isArchived ? 'text-gray-400' : 'text-gray-500'}>
                  Edited: {new Date(lastEdited).toLocaleDateString()}
                </span>
                <span className={isArchived ? 'text-gray-400' : 'text-gray-500'}>
                  Created: {new Date(createdDate).toLocaleDateString()}
                </span>
              </div>
              
              {/* Shared users avatars */}
              {sharedUsers && sharedUsers.length > 0 && (
                <UserAvatars users={sharedUsers} size="sm" />
              )}
            </div>
          </div>
          
          {/* Action buttons for list view */}
          {(showActions || isPinned) && (onPin || onArchive || onEdit || onDelete) && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {onPin && !isArchived && !isShared && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isPinned 
                      ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isPinned ? 'Unpin' : 'Pin'}
                >
                  {isPinned ? '📍' : '📌'}
                </button>
              )}
              
              {onArchive && !isShared && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isArchived
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isArchived ? 'Unarchive' : 'Archive'}
                >
                  {isArchived ? '📤' : '📦'}
                </button>
              )}
              
              {(onEdit || onDelete) && !isShared && (
                <div className="relative group">
                  <button
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="More actions"
                  >
                    <span className="text-sm">⋯</span>
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit();
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
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
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
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
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 last:rounded-b-lg"
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
  
  // Grid view
  return (
    <div 
      className={`bg-white rounded-lg p-4 border hover:shadow-md transition-shadow cursor-pointer group ${
        isArchived ? 'border-gray-300 bg-gray-50 opacity-75' : 'border-gray-200'
      }`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header with icon, actions, and user avatars */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isArchived ? 'bg-gray-200' : 'bg-gray-100'
        }`}>
          <span className="text-xl">{isArchived ? '📦' : '📝'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Shared users avatars */}
          {sharedUsers && sharedUsers.length > 0 && (
            <UserAvatars users={sharedUsers} size="sm" />
          )}
          
          <div className={`flex items-center gap-1 transition-opacity ${
            showActions || isPinned ? 'opacity-100' : 'opacity-0'
          }`}>
            {isPinned && !isArchived && !isShared && (
              <div className="p-1">
                <span className="text-amber-500" title="Pinned">📍</span>
              </div>
            )}
            
            {onPin && !isArchived && !isShared && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPin();
                }}
                className={`p-1 rounded transition-colors ${
                  isPinned 
                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={isPinned ? 'Unpin' : 'Pin'}
              >
                {isPinned ? '📍' : '📌'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Title */}
      <h3 className={`font-medium mb-2 truncate ${isArchived ? 'text-gray-500' : ''}`}>
        {title}
        {isArchived && (
          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Archived
          </span>
        )}
        {isShared && (
          <span className="ml-2 text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
            Shared
          </span>
        )}
      </h3>
      
      {/* Preview content */}
      <p className={`text-sm mb-3 line-clamp-3 ${isArchived ? 'text-gray-500' : 'text-gray-600'}`}>
        {preview}
      </p>
      
      {/* Metadata */}
      <div className="flex items-center justify-between text-xs">
        <span className={isArchived ? 'text-gray-400' : 'text-gray-500'}>
          Edited {new Date(lastEdited).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className={isArchived ? 'text-gray-400' : 'text-gray-400'}>
          Created {new Date(createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      
      {/* Action buttons */}
      {(showActions || isPinned) && (onPin || onArchive || onEdit || onDelete) && !isShared && (
        <div 
          className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100" 
          onClick={(e) => e.stopPropagation()}
        >
          {onPin && !isArchived && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              {isPinned ? 'Unpin' : 'Pin'}
            </button>
          )}
          {onArchive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
              className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              {isArchived ? 'Unarchive' : 'Archive'}
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}