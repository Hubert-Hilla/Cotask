// components/dashboard/ui/TodoListCard.tsx
'use client';

import { useRouter } from 'next/navigation';

interface TodoListCardProps {
  id: string;
  title: string;
  icon: string;
  color: string;
  taskCount: number;
  completedCount: number;
  createdDate: string;
  is_pinned: boolean;
  is_archived: boolean;
  viewMode: 'grid' | 'list';
  onClick?: () => void; // For bulk select mode
  onPin?: () => void;
  onArchive?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TodoListCard({
  id,
  title,
  icon,
  color,
  taskCount,
  completedCount,
  createdDate,
  is_pinned,
  is_archived,
  viewMode,
  onClick, // This is ONLY passed in bulk select mode
  onPin,
  onArchive,
  onEdit,
  onDelete,
}: TodoListCardProps) {
  const router = useRouter();
  const completionPercentage = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;
  
  const colorMap: Record<string, { bg: string; bgLight: string; text: string; progress: string }> = {
    'indigo': { bg: 'bg-indigo-600', bgLight: 'bg-indigo-100', text: 'text-indigo-600', progress: 'bg-indigo-600' },
    'emerald': { bg: 'bg-emerald-600', bgLight: 'bg-emerald-100', text: 'text-emerald-600', progress: 'bg-emerald-600' },
    'amber': { bg: 'bg-amber-500', bgLight: 'bg-amber-100', text: 'text-amber-600', progress: 'bg-amber-500' },
    'rose': { bg: 'bg-rose-500', bgLight: 'bg-rose-100', text: 'text-rose-600', progress: 'bg-rose-500' },
    'purple': { bg: 'bg-purple-600', bgLight: 'bg-purple-100', text: 'text-purple-600', progress: 'bg-purple-600' },
    'blue': { bg: 'bg-blue-600', bgLight: 'bg-blue-100', text: 'text-blue-600', progress: 'bg-blue-600' },
  };

  const colorClass = colorMap[color] || colorMap.indigo;

  const handleClick = (e: React.MouseEvent) => {
    // If onClick prop is provided (for bulk select mode), use it
    if (onClick) {
      onClick();
    } else {
      // Otherwise, navigate to list detail page
      router.push(`/dashboard/lists/${id}`);
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${is_archived ? 'opacity-60' : ''}`}
        onClick={handleClick}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg ${colorClass.bg} flex items-center justify-center`}>
            <span className="text-white text-xl">{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{title}</h3>
              {is_pinned && (
                <span className="text-amber-500 flex-shrink-0" title="Pinned">
                  📍
                </span>
              )}
              {is_archived && (
                <span className="text-gray-400 text-sm flex-shrink-0" title="Archived">
                  📦
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
              <span>{taskCount} tasks</span>
              <span>{completedCount} completed</span>
              <span>{new Date(createdDate).toLocaleDateString()}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${colorClass.progress}`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(completionPercentage)}% complete
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
                className={`p-2 rounded-lg ${is_pinned ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title={is_pinned ? 'Unpin' : 'Pin'}
              >
                {is_pinned ? '📍' : '📌'}
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
                    {is_archived ? '📤 Unarchive' : '📦 Archive'}
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
      className={`bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group ${is_archived ? 'opacity-60' : ''}`}
      onClick={handleClick}
    >
      {/* Header with icon and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${colorClass.bg} flex items-center justify-center`}>
          <span className="text-white text-lg">{icon}</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {is_pinned && (
            <div className="p-1">
              <span className="text-amber-500" title="Pinned">📍</span>
            </div>
          )}
          {is_archived && (
            <div className="p-1">
              <span className="text-gray-400" title="Archived">📦</span>
            </div>
          )}
          
          {onPin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className={`p-1 rounded ${is_pinned ? 'bg-amber-100 text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
              title={is_pinned ? 'Unpin' : 'Pin'}
            >
              {is_pinned ? '📍' : '📌'}
            </button>
          )}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="font-medium mb-2 truncate">{title}</h3>
      
      {/* Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Tasks</span>
          <span className={`font-medium ${colorClass.text}`}>
            {completedCount}/{taskCount}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${colorClass.progress}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {Math.round(completionPercentage)}% complete
          </span>
          <span className="text-gray-400">
            {new Date(createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
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
            {is_archived ? 'Unarchive' : 'Archive'}
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