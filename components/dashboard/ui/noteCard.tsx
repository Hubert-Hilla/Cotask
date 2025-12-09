// components/dashboard/ui/NoteCard.tsx
'use client';

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
  const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
  
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-xl">📝</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{title}</h3>
              {isPinned && (
                <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{preview}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Edited: {new Date(lastEdited).toLocaleDateString()}</span>
              <span>Created: {new Date(createdDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Action buttons for list view */}
          <div className="flex items-center gap-2">
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
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
      onClick={onClick}
    >
      {/* Header with icon and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <span className="text-xl">📝</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isPinned && (
            <div className="p-1">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
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
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
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