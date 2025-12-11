// components/lists/ListDetailView.tsx - WITH DARK MODE
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [listTitle, setListTitle] = useState(list.title);
  const [listDescription, setListDescription] = useState(list.description);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUsername, setShareUsername] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [sharedUsers, setSharedUsers] = useState<ListShare[]>([]);
  const [isPinned, setIsPinned] = useState(list.is_pinned);
  const [userPermission, setUserPermission] = useState<'owner' | 'edit' | 'view' | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // Modal states
  const [deleteTaskModal, setDeleteTaskModal] = useState<{ show: boolean; taskId: string | null }>({ show: false, taskId: null });
  const [editTaskModal, setEditTaskModal] = useState<{ show: boolean; task: Task | null }>({ show: false, task: null });
  const [deleteListModal, setDeleteListModal] = useState(false);
  const [leaveListModal, setLeaveListModal] = useState(false);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [shareError, setShareError] = useState('');

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
      const { data: share, error } = await supabase
        .from('list_shares')
        .select('permission')
        .eq('list_id', list.id)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking user permission:', error);
        setUserPermission('view');
        return;
      }

      if (share) {
        setUserPermission(share.permission as 'edit' | 'view');
      } else {
        setUserPermission('view');
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

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`list-${list.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lists',
          filter: `id=eq.${list.id}`,
        },
        (payload) => {
          const newList = payload.new as any;
          setListTitle(newList.title);
          setListDescription(newList.description);
          setIsPinned(newList.is_pinned || false);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'lists',
          filter: `id=eq.${list.id}`,
        },
        () => {
          router.push('/dashboard');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [list.id]);

  useEffect(() => {
    const channel = supabase
      .channel(`tasks-${list.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
          filter: `list_id=eq.${list.id}`,
        },
        (payload) => {
          setTasks(prev => [...prev, payload.new as Task]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `list_id=eq.${list.id}`,
        },
        (payload) => {
          setTasks(prev => 
            prev.map(t => t.id === payload.new.id ? payload.new as Task : t)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tasks',
          filter: `list_id=eq.${list.id}`,
        },
        (payload) => {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [list.id]);

  useEffect(() => {
    if (!isOwner) return;

    const channel = supabase
      .channel(`list-shares-${list.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_shares',
          filter: `list_id=eq.${list.id}`,
        },
        () => {
          loadSharedUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [list.id, isOwner]);

  const canEdit = () => {
    return userPermission === 'owner' || userPermission === 'edit';
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    if (!canEdit()) return;

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

      // Don't update state here - let real-time subscription handle it
      // This prevents duplicate tasks
      setNewTaskTitle('');
      setSelectedPriority('medium');
      setShowNewTaskInput(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !canEdit()) return;

    try {
      const newIsCompleted = !task.is_completed;
      
      const updateData: any = {
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
    if (!canEdit()) return;

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
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
      setDeleteTaskModal({ show: false, taskId: null });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateList = async (updates: { title?: string; description?: string }) => {
    if (!isOwner) return;

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
      
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const handleTogglePin = async () => {
    if (!isOwner) return;

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
    try {
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('list_id', list.id);

      if (tasksError) throw tasksError;

      const { error: sharesError } = await supabase
        .from('list_shares')
        .delete()
        .eq('list_id', list.id);

      if (sharesError) throw sharesError;

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

  const handleRemoveSelf = async () => {
    try {
      const { error } = await supabase
        .from('list_shares')
        .delete()
        .eq('list_id', list.id)
        .eq('user_id', userId);

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error leaving list:', error);
    }
  };

  const handleShareList = async () => {
    if (!shareUsername.trim()) {
      setShareError('Please enter a username');
      return;
    }

    try {
      setShareError('');
      
      const { data: userToShare, error: findError } = await supabase
        .from('profiles')
        .select('id, username, name')
        .eq('username', shareUsername.trim())
        .single();

      if (findError) {
        setShareError('User not found');
        return;
      }

      if (userToShare.id === userId) {
        setShareError('Cannot share with yourself');
        return;
      }

      const { data: existingShare } = await supabase
        .from('list_shares')
        .select('*')
        .eq('list_id', list.id)
        .eq('user_id', userToShare.id)
        .maybeSingle();

      if (existingShare) {
        setShareError('List already shared with this user');
        return;
      }

      const { error } = await supabase
        .from('list_shares')
        .insert({
          list_id: list.id,
          user_id: userToShare.id,
          permission: sharePermission,
          shared_by: userId,
          shared_at: new Date().toISOString(),
        });

      if (error) throw error;

      await loadSharedUsers();
      setShareUsername('');
      setSharePermission('view');
      setShareError('');
    } catch (error) {
      console.error('Error sharing list:', error);
      setShareError('Failed to share list. Please try again.');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.is_completed;
    if (filter === 'completed') return task.is_completed;
    return true;
  });

  const activeTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);
  const completedCount = completedTasks.length;
  const totalCount = tasks.length;

  const renderPermissionBadge = () => {
    if (userPermission === 'owner') return null;
    
    return (
      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
        userPermission === 'edit' 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
      }`}>
        {userPermission === 'edit' ? 'Can Edit' : 'View Only'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
              >
                ← Back
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{list.icon}</span>
                  <input
                    type="text"
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    onBlur={() => {
                      if (listTitle !== list.title) {
                        handleUpdateList({ title: listTitle });
                      }
                    }}
                    placeholder="List title..."
                    className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white"
                    readOnly={!isOwner}
                  />
                  {renderPermissionBadge()}
                  {isPinned && <span className="text-amber-500 dark:text-amber-400" title="Pinned">📍</span>}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span>Created by {list.owner.name} • {activeTasks.length} active, {completedCount} completed</span>
                  {lastSaved && isOwner && <span>Last saved: {lastSaved}</span>}
                </div>
                {isOwner && (
                  <input
                    type="text"
                    value={listDescription}
                    onChange={(e) => setListDescription(e.target.value)}
                    onBlur={() => {
                      if (listDescription !== list.description) {
                        handleUpdateList({ description: listDescription });
                      }
                    }}
                    placeholder="Add description..."
                    className="text-sm text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none w-full mt-1"
                  />
                )}
                {!isOwner && listDescription && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{listDescription}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <button
                    onClick={handleTogglePin}
                    className={`p-2 rounded-lg ${
                      isPinned 
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title={isPinned ? 'Unpin' : 'Pin'}
                  >
                    {isPinned ? '📍' : '📌'}
                  </button>
                  
                  <button
                    onClick={() => setIsSharing(true)}
                    className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center gap-2"
                  >
                    <span>🔗</span>
                    Share
                  </button>
                </>
              )}
              
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
                  ⋯
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {!isOwner && (
                    <button
                      onClick={() => setLeaveListModal(true)}
                      className="w-full px-4 py-2 text-left text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-t-lg"
                    >
                      🚪 Leave List
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => setDeleteListModal(true)}
                      className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      🗑️ Delete List
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Delete Task Modal */}
      {deleteTaskModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Task</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTaskModal({ show: false, taskId: null })}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTaskModal.taskId && handleDeleteTask(deleteTaskModal.taskId)}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editTaskModal.show && editTaskModal.task && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Task</h3>
            <input
              type="text"
              value={editTaskTitle}
              onChange={(e) => setEditTaskTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              placeholder="Task title..."
              autoFocus
            />
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setEditTaskModal({ show: false, task: null });
                  setEditTaskTitle('');
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editTaskTitle.trim() && editTaskModal.task) {
                    handleUpdateTask(editTaskModal.task.id, { title: editTaskTitle.trim() });
                    setEditTaskModal({ show: false, task: null });
                    setEditTaskTitle('');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete List Modal */}
      {deleteListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete List</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this list? All tasks will be permanently deleted. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteListModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteList}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600"
              >
                Delete List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave List Modal */}
      {leaveListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Leave List</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to leave this list? You will lose access and need to be re-invited to view it again.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setLeaveListModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveSelf}
                className="px-4 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600"
              >
                Leave List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal - I'll continue with this in the next part due to length... */}
      {isSharing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share "{listTitle}"</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Invite contacts to collaborate on this list
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSharing(false);
                  setShareUsername('');
                  setSharePermission('view');
                  setShareError('');
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Invite by Username
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        @
                      </span>
                      <input
                        type="text"
                        value={shareUsername}
                        onChange={(e) => setShareUsername(e.target.value)}
                        placeholder="username"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:border-[#4F46E5] dark:focus:border-indigo-400 focus:ring-2 focus:ring-[#4F46E5]/20 dark:focus:ring-indigo-400/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleShareList();
                        }}
                      />
                    </div>
                    
                    <div className="relative">
                      <select
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value as 'view' | 'edit')}
                        className="appearance-none px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:border-[#4F46E5] dark:focus:border-indigo-400 focus:ring-2 focus:ring-[#4F46E5]/20 dark:focus:ring-indigo-400/20 transition-all pr-10 cursor-pointer"
                      >
                        <option value="edit">Can edit</option>
                        <option value="view">Can view</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleShareList}
                      className="px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-medium rounded-xl hover:from-[#4338CA] hover:to-[#6D28D9] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <span>+</span>
                      Invite
                    </button>
                  </div>
                  {shareError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{shareError}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You can only share with users who have a CoTask account
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    People with access ({sharedUsers.length + 1})
                  </label>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {list.owner.name?.split(' ').map(n => n[0]).join('') || 'O'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {list.owner.name} (You)
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{list.owner.username}
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                        Owner
                      </span>
                    </div>

                    {sharedUsers.map((share) => (
                      <div 
                        key={share.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {share.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {share.user?.name || share.user?.username || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              @{share.user?.username || 'unknown'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <select
                              value={share.permission}
                              onChange={(e) => handleUpdateSharePermission(share.id, e.target.value as 'view' | 'edit')}
                              className="appearance-none px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:border-[#4F46E5] dark:focus:border-indigo-400 focus:ring-1 focus:ring-[#4F46E5]/20 dark:focus:ring-indigo-400/20 transition-all pr-8 cursor-pointer"
                            >
                              <option value="view">Can view</option>
                              <option value="edit">Can edit</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveShare(share.id)}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
                        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197a4 4 0 00-5.197-5.197" />
                          </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">No collaborators yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Invite someone to collaborate</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsSharing(false);
                    setShareUsername('');
                    setSharePermission('view');
                    setShareError('');
                  }}
                  className="px-6 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' 
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'active' 
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Active ({activeTasks.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'completed' 
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Add Task Section */}
        {canEdit() && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            {!showNewTaskInput ? (
              <button
                onClick={() => setShowNewTaskInput(true)}
                className="w-full text-left text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-2"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                  autoFocus
                />
                
                <div className="flex items-center gap-3">
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>

                  <div className="flex-1" />

                  <button
                    onClick={() => setShowNewTaskInput(false)}
                    className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600"
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
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No tasks yet</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {canEdit() ? 'Add your first task to get started' : 'No tasks in this list'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    disabled={!canEdit()}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 ${
                      task.is_completed
                        ? 'bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600'
                        : 'border-gray-300 dark:border-gray-600'
                    } ${!canEdit() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {task.is_completed && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${
                        task.is_completed 
                          ? 'line-through text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'high' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        task.priority === 'medium' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
                          setEditTaskModal({ show: true, task });
                          setEditTaskTitle(task.title);
                        }}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                        title="Edit task"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteTaskModal({ show: true, taskId: task.id })}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
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