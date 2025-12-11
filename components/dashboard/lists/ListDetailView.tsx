// components/lists/ListDetailView.tsx - UPDATED VERSION
'use client';

import { useState, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
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

      redirect('/dashboard');
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Share "{listTitle}"</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Invite contacts to collaborate on this list
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSharing(false);
                  setShareUsername('');
                  setSharePermission('view');
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Invite by Username */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Invite by Username
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        @
                      </span>
                      <input
                        type="text"
                        value={shareUsername}
                        onChange={(e) => setShareUsername(e.target.value)}
                        placeholder="username"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleShareList();
                        }}
                      />
                    </div>
                    
                    {/* Permission Select */}
                    <div className="relative">
                      <select
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value as 'view' | 'edit')}
                        className="appearance-none px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all pr-10 cursor-pointer"
                      >
                        <option value="edit">Can edit</option>
                        <option value="view">Can view</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleShareList}
                      className="px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-medium rounded-xl hover:from-[#4338CA] hover:to-[#6D28D9] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Invite
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    You can only share with users who have a CoTask account
                  </p>
                </div>

                {/* Current Collaborators */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    People with access ({sharedUsers.length + 1}) {/* +1 for owner */}
                  </label>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {/* Owner (You) */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {list.owner.name?.split(' ').map(n => n[0]).join('') || 'O'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {list.owner.name} (You)
                          </div>
                          <div className="text-sm text-gray-500">
                            @{list.owner.username}
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-full">
                        Owner
                      </span>
                    </div>

                    {/* Shared Users */}
                    {sharedUsers.map((share) => (
                      <div 
                        key={share.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {share.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {share.user?.name || share.user?.username || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{share.user?.username || 'unknown'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <select
                              value={share.permission}
                              onChange={(e) => handleUpdateSharePermission(share.id, e.target.value as 'view' | 'edit')}
                              className="appearance-none px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-all pr-8 cursor-pointer"
                            >
                              <option value="view">Can view</option>
                              <option value="edit">Can edit</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveShare(share.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {sharedUsers.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197a4 4 0 00-5.197-5.197" />
                          </svg>
                        </div>
                        <p className="text-gray-500">No collaborators yet</p>
                        <p className="text-sm text-gray-400 mt-1">Invite someone to collaborate</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsSharing(false);
                    setShareUsername('');
                    setSharePermission('view');
                  }}
                  className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
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
        {canEdit() && (
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

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-gray-500">
                {canEdit() ? 'Add your first task to get started' : 'No tasks in this list'}
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
                    disabled={!canEdit()}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 ${
                      task.is_completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    } ${!canEdit() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
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
                  
                  {canEdit() && (
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