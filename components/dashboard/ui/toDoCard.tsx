// components/dashboard/ui/TodoListCard.tsx - WITH UPDATED DATE FORMAT
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

interface TodoListCardProps {
  id: string;
  title: string;
  icon: string;
  color: string;
  taskCount: number;
  completedCount: number;
  createdDate: string;
  updatedDate?: string;
  is_pinned: boolean;
  is_shared?: boolean;
  shared_users?: SharedUser[];
  viewMode: 'grid' | 'list';
  onClick?: () => void;
  onPin?: () => void;
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
  updatedDate,
  is_pinned,
  is_shared = false,
  shared_users = [],
  viewMode,
  onClick,
  onPin,
  onEdit,
  onDelete,
}: TodoListCardProps) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  
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
    if (onClick) {
      onClick();
    } else {
      router.push(`/dashboard/lists/${id}`);
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`bg-white rounded-lg p-4 border hover:shadow-md transition-shadow cursor-pointer ${
          is_shared ? 'border-blue-200' : 'border-gray-200'
        }`}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg ${colorClass.bg} flex items-center justify-center`}>
            <span className="text-white text-xl">{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{title}</h3>
              {is_shared && (
                <span className="text-blue-500 text-sm bg-blue-100 px-2 py-1 rounded" title="Shared with you">
                  Shared
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
              <span>{taskCount} tasks</span>
              <span>{completedCount} completed</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div 
                className={`h-2 rounded-full ${colorClass.progress}`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">
                {Math.round(completionPercentage)}% complete
              </span>
              <div className="flex items-center gap-4 text-sm">
                {updatedDate && (
                  <span className="text-gray-500">
                    Edited: {new Date(updatedDate).toLocaleDateString()}
                  </span>
                )}
                <span className="text-gray-500">
                  Created: {new Date(createdDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {/* Shared users avatars */}
            {shared_users && shared_users.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <UserAvatars users={shared_users} size="sm" />
              </div>
            )}
          </div>
          
          {/* Action buttons for list view */}
          {(showActions || is_pinned) && (onPin || onEdit || onDelete) && !is_shared && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {onPin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    is_pinned 
                      ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={is_pinned ? 'Unpin' : 'Pin'}
                >
                  {is_pinned ? '📍' : '📌'}
                </button>
              )}
              
              {(onEdit || onDelete) && (
                <div className="relative group">
                  <button
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="More actions"
                  >
                    <span className="text-sm">⋯</span>
                  </button>
                  
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
  
  // Grid view - with Edited/Created dates like NoteCard
  return (
    <div 
      className={`bg-white rounded-lg p-4 border hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-64 ${
        is_shared ? 'border-blue-200' : 'border-gray-200'
      }`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header with icon, actions, and user avatars */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${colorClass.bg} flex items-center justify-center`}>
          <span className="text-white text-lg">{icon}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {shared_users && shared_users.length > 0 && (
            <UserAvatars users={shared_users} size="sm" />
          )}
          
          {onPin && !is_shared && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className={`p-1.5 rounded transition-colors ${
                showActions || is_pinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } ${
                is_pinned 
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={is_pinned ? 'Unpin' : 'Pin'}
            >
              {is_pinned ? '📍' : '📌'}
            </button>
          )}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="font-medium mb-2 truncate">
        {title}
        {is_shared && (
          <span className="ml-2 text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
            Shared
          </span>
        )}
      </h3>
      
      {/* Stats and progress bar - fixed layout */}
      <div className="space-y-2 flex-1">
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
        
        <div className="text-xs text-gray-500">
          {Math.round(completionPercentage)}% complete
        </div>
      </div>
      
      {/* Metadata - Same format as NoteCard */}
      <div className="flex items-center justify-between text-xs px-0 py-2 border-t border-gray-100 mt-auto">
        {updatedDate && (
          <span className="text-gray-500">
            Edited {new Date(updatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        <span className="text-gray-400">
          Created {new Date(createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      
      {/* Action buttons at bottom - only show on hover and for non-shared items */}
      {showActions && (onEdit || onDelete) && !is_shared && (
        <div 
          className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100" 
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
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