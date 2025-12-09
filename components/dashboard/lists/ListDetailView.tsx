// components/lists/ListDetailView.tsx - UPDATED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Task {
  id: string;
  list_id: string;
  title: string;
  description: string;
  is_completed: boolean;
  due_date: string | null;
  priority: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  created_by: string;
  completed_by: string | null;
}

interface SharedUser {
  id: string;
  name: string;
  username: string;
}

interface ListShare {
  id: string;
  list_id: string;
  user_id: string;
  permission: 'view' | 'edit';
  shared_by: string;
  shared_at: string;
  user: SharedUser;
}

interface ListDetailViewProps {
  list: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    is_pinned: boolean;
    is_archived: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    owner: {
      id: string;
      name: string;
      username: string;
    };
    tasks: Task[];
  };
  userId: string;
  isOwner: boolean;
  initialCompletedCount: number;
  initialTotalTasks: number;
}

export default function ListDetailView({ 
  list, 
  userId, 
  isOwner,
  initialCompletedCount,
  initialTotalTasks 
}: ListDetailViewProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [tasks, setTasks] = useState<Task[]>(list.tasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskInput, setShowNewTaskInput] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [listDescription, setListDescription] = useState(list.description);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUsername, setShareUsername] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [sharedUsers, setSharedUsers] = useState<ListShare[]>([]);
  const [isArchived, setIsArchived] = useState(list.is_archived);
  const [isPinned, setIsPinned] = useState(list.is_pinned);
  const [userPermission, setUserPermission] = useState<'owner' | 'edit' | 'view' | null>(null);

  useEffect(() => {
    if (isOwner) {
      loadSharedUsers();
      setUserPermission('owner');
    } else {
      checkUserPermission();
    }
  }, [list.id, isOwner, userId]);

  const checkUserPermission = async () => {
    try {
      // Check if user has a share record for this list
      const { data: share, error } = await supabase
        .from('list_shares')
        .select('permission')
        .eq('list_id', list.id)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking user permission:', error);
        setUserPermission('view'); // Default to view if no share found
        return;
      }

      if (share) {
        setUserPermission(share.permission as 'edit' | 'view');
      } else {
        setUserPermission('view'); // Default to view
      }
    } catch (error) {
      console.error('Failed to check user permission:', error);
      setUserPermission('view');
    }
  };

  const loadSharedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('list_shares')
        .select(`
          *,
          user:profiles!list_shares_user_id_fkey(id, name, username)
        `)
        .eq('list_id', list.id);

      if (error) {
        console.error('Error loading shared users:', error);
        throw error;
      }

      if (data) {
        setSharedUsers(data as any);
      }
    } catch (error) {
      console.error('Failed to load shared users:', error);
    }
  };

  const canEdit = () => {
    return userPermission === 'owner' || userPermission === 'edit';
  };

  const canView = () => {
    return userPermission === 'owner' || userPermission === 'edit' || userPermission === 'view';
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    // Check permission
    if (!canEdit()) {
      alert('You do not have permission to add tasks');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          list_id: list.id,
          title: newTaskTitle.trim(),
          priority: selectedPriority,
          is_completed: false,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data as any]);
      setNewTaskTitle('');
      setSelectedPriority('medium');
      setShowNewTaskInput(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check permission
    if (!canEdit()) {
      alert('You do not have permission to edit tasks');
      return;
    }

    try {
      const newIsCompleted = !task.is_completed;
      
      const updateData: {
        is_completed: boolean;
        updated_at: string;
        completed_at?: string | null;
        completed_by?: string | null;
      } = {
        is_completed: newIsCompleted,
        updated_at: new Date().toISOString(),
      };

      if (newIsCompleted) {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = userId;
      } else {
        updateData.completed_at = null;
        updateData.completed_by = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => 
        prev.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                is_completed: newIsCompleted,
                completed_at: newIsCompleted ? new Date().toISOString() : null,
                completed_by: newIsCompleted ? userId : null,
                updated_at: new Date().toISOString(),
              } 
            : t
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    // Check permission
    if (!canEdit()) {
      alert('You do not have permission to edit tasks');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => 
        prev.map(t => 
          t.id === taskId 
            ? { ...t, ...updates, updated_at: new Date().toISOString() }
            : t
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Check permission
    if (!canEdit()) {
      alert('You do not have permission to delete tasks');
      return;
    }

    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateList = async (updates: { title?: string; description?: string }) => {
    // Only owner can update list details
    if (!isOwner) {
      alert('Only the list owner can update list details');
      return;
    }

    try {
      const { error } = await supabase
        .from('lists')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', list.id);

      if (error) throw error;

      if (updates.title) setListTitle(updates.title);
      if (updates.description !== undefined) setListDescription(updates.description);
      
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const handleTogglePin = async () => {
    // Only owner can pin/unpin
    if (!isOwner) {
      alert('Only the list owner can pin/unpin the list');
      return;
    }

    try {
      const { error } = await supabase
        .from('lists')
        .update({
          is_pinned: !isPinned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', list.id);

      if (error) throw error;

      setIsPinned(!isPinned);
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleToggleArchive = async () => {
    // Only owner can archive/unarchive
    if (!isOwner) {
      alert('Only the list owner can archive/unarchive the list');
      return;
    }

    try {
      const { error } = await supabase
        .from('lists')
        .update({
          is_archived: !isArchived,
          updated_at: new Date().toISOString(),
        })
        .eq('id', list.id);

      if (error) throw error;

      setIsArchived(!isArchived);
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const handleDeleteList = async () => {
    // Only owner can delete list
    if (!isOwner) {
      alert('Only the list owner can delete the list');
      return;
    }

    if (!confirm('Are you sure you want to delete this list? All tasks will be deleted.')) {
      return;
    }

    try {
      // First delete all tasks (if cascade delete isn't set up)
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('list_id', list.id);

      if (tasksError) throw tasksError;

      // Delete all list shares
      const { error: sharesError } = await supabase
        .from('list_shares')
        .delete()
        .eq('list_id', list.id);

      if (sharesError) throw sharesError;

      // Then delete the list
      const { error: listError } = await supabase
        .from('lists')
        .delete()
        .eq('id', list.id);

      if (listError) throw listError;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleShareList = async () => {
    // Only owner can share
    if (!isOwner) {
      alert('Only the list owner can share the list');
      return;
    }

    if (!shareUsername.trim()) {
      alert('Please enter a username');
      return;
    }

    try {
      // Find user by username
      const { data: userToShare, error: findError } = await supabase
        .from('profiles')
        .select('id, username, name')
        .eq('username', shareUsername.trim())
        .single();

      if (findError) {
        console.error('Find user error:', findError);
        alert('User not found');
        return;
      }

      if (userToShare.id === userId) {
        alert('Cannot share with yourself');
        return;
      }

      // Check if already shared
      const { data: existingShare } = await supabase
        .from('list_shares')
        .select('*')
        .eq('list_id', list.id)
        .eq('user_id', userToShare.id)
        .maybeSingle();

      if (existingShare) {
        alert('List already shared with this user');
        return;
      }

      // Create share - use 'permission' not 'permission_type'
      const { error } = await supabase
        .from('list_shares')
        .insert({
          list_id: list.id,
          user_id: userToShare.id,
          permission: sharePermission,
          shared_by: userId,
          shared_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Insert error details:', error);
        throw error;
      }

      // Refresh the shared users list
      await loadSharedUsers();
      setShareUsername('');
      setSharePermission('view');
      setIsSharing(false);
      alert(`List shared with ${userToShare.name || userToShare.username}!`);
    } catch (error) {
      console.error('Error sharing list:', error);
      alert('Failed to share list. Please try again.');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    // Only owner can remove shares
    if (!isOwner) {
      alert('Only the list owner can remove shares');
      return;
    }

    try {
      const { error } = await supabase
        .from('list_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      setSharedUsers(prev => prev.filter(share => share.id !== shareId));
    } catch (error) {
      console.error('Error removing share:', error);
    }
  };

  const handleUpdateSharePermission = async (shareId: string, newPermission: 'view' | 'edit') => {
    // Only owner can update share permissions
    if (!isOwner) {
      alert('Only the list owner can update share permissions');
      return;
    }

    try {
      const { error } = await supabase
        .from('list_shares')
        .update({
          permission: newPermission,
        })
        .eq('id', shareId);

      if (error) throw error;

      setSharedUsers(prev => 
        prev.map(share => 
          share.id === shareId 
            ? { ...share, permission: newPermission }
            : share
        )
      );
    } catch (error) {
      console.error('Error updating share permission:', error);
    }
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.is_completed;
    if (filter === 'completed') return task.is_completed;
    return true;
  });

  const activeTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);
  const completedCount = completedTasks.length;
  const totalCount = tasks.length;

  // Show permission badge
  const renderPermissionBadge = () => {
    if (userPermission === 'owner') return null; // Don't show badge for owner
    
    return (
      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
        userPermission === 'edit' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {userPermission === 'edit' ? 'Can Edit' : 'View Only'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                ← Back
              </button>
              
              <div>
                {isEditingTitle ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={listTitle}
                      onChange={(e) => setListTitle(e.target.value)}
                      className="text-xl font-semibold px-2 py-1 border rounded"
                      autoFocus
                    />
                    <textarea
                      value={listDescription}
                      onChange={(e) => setListDescription(e.target.value)}
                      placeholder="Add description..."
                      className="text-sm text-gray-600 px-2 py-1 border rounded"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateList({ title: listTitle, description: listDescription })}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingTitle(false);
                          setListTitle(list.title);
                          setListDescription(list.description);
                        }}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-xl font-semibold flex items-center gap-2">
                      <span>{list.icon}</span>
                      {listTitle}
                      {renderPermissionBadge()}
                      {isPinned && <span className="text-amber-500" title="Pinned">📍</span>}
                      {isArchived && <span className="text-gray-400" title="Archived">📦</span>}
                    </h1>
                    <p className="text-sm text-gray-500">
                      Created by {list.owner.name} • {activeTasks.length} active, {completedCount} completed
                    </p>
                    {listDescription && (
                      <p className="text-sm text-gray-600 mt-1">{listDescription}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePin}
                  className={`p-2 rounded-lg ${isPinned ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title={isPinned ? 'Unpin' : 'Pin'}
                >
                  {isPinned ? '📍' : '📌'}
                </button>
                
                <button
                  onClick={handleToggleArchive}
                  className={`p-2 rounded-lg ${isArchived ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title={isArchived ? 'Unarchive' : 'Archive'}
                >
                  {isArchived ? '📤' : '📦'}
                </button>
                
                <button
                  onClick={() => setIsSharing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <span>🔗</span>
                  Share
                </button>
                
                <div className="relative group">
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    ⋯
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                    >
                      ✏️ Edit List
                    </button>
                    <button
                      onClick={handleDeleteList}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 last:rounded-b-lg"
                    >
                      🗑️ Delete List
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Share Modal */}
      {isSharing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Share List</h2>
              <button
                onClick={() => {
                  setIsSharing(false);
                  setShareUsername('');
                  setSharePermission('view');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share with username
              </label>
              <input
                type="text"
                value={shareUsername}
                onChange={(e) => setShareUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleShareList();
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permission Level
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSharePermission('view')}
                  className={`flex-1 px-4 py-2 rounded-md border ${
                    sharePermission === 'view' 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  View Only
                </button>
                <button
                  onClick={() => setSharePermission('edit')}
                  className={`flex-1 px-4 py-2 rounded-md border ${
                    sharePermission === 'edit' 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Can Edit
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsSharing(false);
                  setShareUsername('');
                  setSharePermission('view');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleShareList}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Share
              </button>
            </div>

            {sharedUsers.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Shared with</h3>
                <div className="space-y-3">
                  {sharedUsers.map((share) => (
                    <div key={share.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {share.user?.name || share.user?.username || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          @{share.user?.username}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={share.permission}
                          onChange={(e) => handleUpdateSharePermission(share.id, e.target.value as 'view' | 'edit')}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="view">View</option>
                          <option value="edit">Edit</option>
                        </select>
                        <button
                          onClick={() => handleRemoveShare(share.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg ${filter === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Active ({activeTasks.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Add Task Section */}
        {canEdit() && !isArchived && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
            {!showNewTaskInput ? (
              <button
                onClick={() => setShowNewTaskInput(true)}
                className="w-full text-left text-gray-500 hover:text-gray-700 flex items-center gap-2"
              >
                <span>+</span>
                Add a new task...
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask();
                    if (e.key === 'Escape') setShowNewTaskInput(false);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  autoFocus
                />
                
                <div className="flex items-center gap-3">
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>

                  <div className="flex-1" />

                  <button
                    onClick={() => setShowNewTaskInput(false)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Archived Notice */}
        {isArchived && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span>📦</span>
              <p className="text-yellow-700">
                This list is archived. You can view tasks but cannot add new ones.
              </p>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-gray-500">
                {canEdit() && !isArchived ? 'Add your first task to get started' : 'No tasks in this list'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    disabled={!canEdit() || isArchived}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 ${
                      task.is_completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    } ${(!canEdit() || isArchived) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {task.is_completed && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Created {new Date(task.created_at).toLocaleDateString()}
                      {task.completed_at && (
                        <span> • Completed {new Date(task.completed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  {canEdit() && !isArchived && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const newTitle = prompt('Edit task title:', task.title);
                          if (newTitle && newTitle.trim() !== task.title) {
                            handleUpdateTask(task.id, { title: newTitle.trim() });
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500"
                        title="Edit task"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                        title="Delete task"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}