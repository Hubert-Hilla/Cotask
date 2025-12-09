// components/dashboard/ui/NoteCard.tsx - UPDATED FOR NAVIGATION
'use client';

import { useRouter } from 'next/navigation';

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  createdDate: string;
  isPinned: boolean;
  viewMode: 'grid' | 'list';
  onClick?: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function NoteCard({
  id,
  title,
  content,
  lastEdited,
  createdDate,
  isPinned,
  viewMode,
  onClick,
  onPin,
  onArchive,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const router = useRouter();
  const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
  
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
        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-xl">📝</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{title}</h3>
              {isPinned && (
                <span className="text-amber-500 flex-shrink-0" title="Pinned">
                  📍
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{preview}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Edited: {new Date(lastEdited).toLocaleDateString()}</span>
              <span>Created: {new Date(createdDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Action buttons for list view */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {onPin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPin();
                }}
                className={`p-2 rounded-lg ${isPinned ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title={isPinned ? 'Unpin' : 'Pin'}
              >
                {isPinned ? '📍' : '📌'}
              </button>
            )}
            
            <div className="relative group">
              <button
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                    📦 Archive
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
          </div>
        </div>
      </div>
    );
  }
  
  // Grid view
  return (
    <div 
      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleClick}
    >
      {/* Header with icon and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <span className="text-xl">📝</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isPinned && (
            <div className="p-1">
              <span className="text-amber-500" title="Pinned">📍</span>
            </div>
          )}
          
          {onPin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className={`p-1 rounded ${isPinned ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              {isPinned ? '📍' : '📌'}
            </button>
          )}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="font-medium mb-2 truncate">{title}</h3>
      
      {/* Preview content */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{preview}</p>
      
      {/* Metadata */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          Edited {new Date(lastEdited).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className="text-gray-400">
          Created {new Date(createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      
      {/* Action buttons (hidden until hover) */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
          >
            Edit
          </button>
        )}
        {onArchive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
          >
            Archive
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}