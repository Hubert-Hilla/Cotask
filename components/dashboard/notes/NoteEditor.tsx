// components/dashboard/notes/NoteEditor.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { redirect, useRouter } from 'next/navigation';

interface SharedUser {
  id: string;
  name: string;
  username: string;
}

interface NoteShare {
  id: string;
  note_id: string;
  user_id: string;
  permission: 'view' | 'edit';
  shared_by: string;
  shared_at: string;
  user: SharedUser;
}

interface NoteEditorProps {
  noteId: string;
  initialTitle?: string;
  initialContent?: string;
  isOwner: boolean;
  userPermission: 'owner' | 'edit' | 'view';
}

export default function NoteEditor({ 
  noteId, 
  initialTitle = '', 
  initialContent = '', 
  isOwner,
  userPermission: initialUserPermission
}: NoteEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  
  // NEW: Separate state tracking for MS Word-like behavior
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [blockFormat, setBlockFormat] = useState<string>('paragraph');
  
  const [isSharing, setIsSharing] = useState(false);
  const [shareUsername, setShareUsername] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [sharedUsers, setSharedUsers] = useState<NoteShare[]>([]);
  const [userPermission, setUserPermission] = useState<'owner' | 'edit' | 'view'>(initialUserPermission);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load shared users if owner
  useEffect(() => {
    if (isOwner) {
      loadSharedUsers();
    }
  }, [noteId, isOwner]);

  const loadSharedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('note_shares')
        .select(`
          *,
          user:profiles!note_shares_user_id_fkey(id, name, username)
        `)
        .eq('note_id', noteId);

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

  // NEW: Check current formatting at cursor/selection for MS Word-like behavior
  const updateFormatState = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Check inline formats (bold, italic)
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    
    // Check block format
    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;
    
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement!;
    }
    
    let currentBlock = 'paragraph';
    let el = container as HTMLElement;
    
    while (el && el !== editorRef.current) {
      const tag = el.tagName;
      if (tag === 'H1') {
        currentBlock = 'heading1';
        break;
      } else if (tag === 'H2') {
        currentBlock = 'heading2';
        break;
      } else if (tag === 'UL') {
        currentBlock = 'bulletList';
        break;
      } else if (tag === 'OL') {
        currentBlock = 'orderedList';
        break;
      }
      el = el.parentElement!;
    }
    
    setBlockFormat(currentBlock);
  };

  // NEW: Toggle bold with MS Word-like behavior
  const toggleBold = () => {
    if (!canEdit()) return;
    document.execCommand('bold', false);
    updateFormatState();
    handleEditorChange();
    editorRef.current?.focus();
  };

  // NEW: Toggle italic with MS Word-like behavior
  const toggleItalic = () => {
    if (!canEdit()) return;
    document.execCommand('italic', false);
    updateFormatState();
    handleEditorChange();
    editorRef.current?.focus();
  };

  // NEW: Apply block format with MS Word-like behavior
  const applyBlockFormat = (format: string) => {
    if (!canEdit() || !editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // For headings, require text selection
    if ((format === 'heading1' || format === 'heading2') && selection.isCollapsed) {
      // No text selected, do nothing or show a message
      return;
    }
    
    // If clicking same format, convert to paragraph
    if (blockFormat === format) {
      if (format === 'heading1' || format === 'heading2') {
        // For headings, convert back to paragraph (only works when text is selected)
        document.execCommand('formatBlock', false, '<p>');
      }
      setTimeout(() => {
        updateFormatState();
        handleEditorChange();
      }, 10);
      editorRef.current.focus();
      return;
    }
    
    // Apply new format
    switch (format) {
      case 'heading1':
        document.execCommand('formatBlock', false, '<h1>');
        break;
      case 'heading2':
        document.execCommand('formatBlock', false, '<h2>');
        break;
      case 'paragraph':
        document.execCommand('formatBlock', false, '<p>');
        break;
    }
    
    setTimeout(() => {
      updateFormatState();
      handleEditorChange();
    }, 10);
    editorRef.current.focus();
  };

  // Simple bullet point insertion
  const insertBulletPoint = () => {
    if (!canEdit() || !editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    // Insert bullet point character
    document.execCommand('insertText', false, '• ');
    
    handleEditorChange();
    editorRef.current.focus();
  };

  const insertTodo = () => {
    if (!editorRef.current || !canEdit()) {
      alert('You do not have permission to edit this note');
      return;
    }
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const todoId = `todo-${Date.now()}`;
    
    const todoWrapper = document.createElement('div');
    todoWrapper.className = 'flex items-center gap-2 my-2 p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600';
    todoWrapper.setAttribute('data-todo-id', todoId);
    todoWrapper.setAttribute('data-todo', 'true');
    todoWrapper.contentEditable = 'false';

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'w-4 h-4 rounded border-gray-300 dark:border-gray-600 cursor-pointer';
    checkbox.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const textInput = todoWrapper.querySelector('input[type="text"]') as HTMLInputElement;
      if (textInput) {
        textInput.classList.toggle('line-through', target.checked);
        textInput.classList.toggle('text-gray-500', target.checked);
        textInput.classList.toggle('dark:text-gray-400', target.checked);
      }
      handleEditorChange();
    };

    // Text input
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Task description...';
    textInput.className = 'flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500';
    
    textInput.oninput = () => {
      handleEditorChange();
    };
    
    textInput.onblur = () => {
      handleEditorChange();
    };
    
    textInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        todoWrapper.after(p);
        
        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.collapse(true);
        
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(newRange);
        
        handleEditorChange();
        editorRef.current?.focus();
      }
    };
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.innerHTML = '×';
    deleteBtn.className = 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-bold text-xl px-2';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      todoWrapper.remove();
      handleEditorChange();
      editorRef.current?.focus();
    };

    todoWrapper.appendChild(checkbox);
    todoWrapper.appendChild(textInput);
    todoWrapper.appendChild(deleteBtn);

    // Insert at cursor
    if (!range.collapsed) {
      range.deleteContents();
    }
    
    range.insertNode(todoWrapper);
    
    // Add paragraph after
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    todoWrapper.after(p);
    
    handleEditorChange();
    
    setTimeout(() => {
      textInput.focus();
    }, 50);
  };

  // Handle editor content changes
  const handleEditorChange = () => {
    if (!editorRef.current || !canEdit()) return;
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
  };

  // Handle editor events
  const handleEditorInput = () => {
    handleEditorChange();
    updateFormatState();
  };

  const handleEditorClick = () => {
    // Check if we're clicking on a todo element
    const target = window.event?.target as HTMLElement;
    if (target?.closest('[data-todo]')) {
      return;
    }
    
    setTimeout(() => {
      updateFormatState();
    }, 0);
  };

  const handleEditorKeyUp = () => {
    updateFormatState();
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (!canEdit()) {
      e.preventDefault();
      return;
    }

    // Check if we're in a todo input
    const activeElement = document.activeElement;
    if (activeElement?.tagName === 'INPUT' && activeElement.closest('[data-todo]')) {
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer as HTMLElement;
        const listItem = container.closest('li');
        
        if (listItem && e.shiftKey) {
          document.execCommand('outdent', false);
        } else if (listItem) {
          document.execCommand('indent', false);
        } else {
          document.execCommand('insertText', false, '\t');
        }
        
        handleEditorChange();
        updateFormatState();
      }
    }
  };

  // Save note with debouncing
  const saveNote = async () => {
    if (!canEdit()) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) throw error;

      setLastSaved(new Date().toLocaleTimeString());
      console.log('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  // Auto-save on changes
  useEffect(() => {
    if (!canEdit()) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (title !== initialTitle || content !== initialContent) {
        saveNote();
      }
    }, 500); // Faster auto-save: 500ms

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, canEdit]);

  // Real-time subscription for note changes
  useEffect(() => {
    const channel = supabase
      .channel(`note-${noteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${noteId}`,
        },
        (payload) => {
          console.log('Note updated:', payload);
          const newNote = payload.new as any;
          
          // Only update if the change came from another user
          if (newNote.title !== title || newNote.content !== content) {
            setTitle(newNote.title);
            setContent(newNote.content);
            if (editorRef.current && newNote.content !== editorRef.current.innerHTML) {
              editorRef.current.innerHTML = newNote.content;
            }
            setIsPinned(newNote.is_pinned || false);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${noteId}`,
        },
        () => {
          console.log('Note deleted');
          alert('This note has been deleted');
          router.push('/dashboard');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noteId, title, content]);

  // Real-time subscription for note shares
  useEffect(() => {
    if (!isOwner) return;

    const channel = supabase
      .channel(`note-shares-${noteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'note_shares',
          filter: `note_id=eq.${noteId}`,
        },
        () => {
          console.log('Note shares updated');
          loadSharedUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noteId, isOwner]);

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
    
    // Fetch note details (pinned)
    const fetchNoteDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('is_pinned')
          .eq('id', noteId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setIsPinned(data.is_pinned || false);
        }
      } catch (error) {
        console.error('Error fetching note details:', error);
      }
    };
    
    fetchNoteDetails();
  }, [noteId]);

  // Handle note deletion
  const handleDeleteNote = async () => {
    if (!isOwner) {
      alert('Only the note owner can delete this note');
      return;
    }

    if (!confirm('Are you sure you want to delete this note?')) return;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);
    
    redirect('/dashboard');
  };

  // Handle pin/unpin
  const handleTogglePin = async () => {
    if (!isOwner) {
      alert('Only the note owner can pin/unpin the note');
      return;
    }

    try {
      const newPinnedState = !isPinned;
      setIsPinned(newPinnedState);
      
      const { error } = await supabase
        .from('notes')
        .update({ 
          is_pinned: newPinnedState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) throw error;

      saveNote();
    } catch (error) {
      console.error('Error toggling pin:', error);
      setIsPinned(!isPinned);
    }
  };

  const handleShareNote = async () => {
    if (!isOwner) {
      alert('Only the note owner can share the note');
      return;
    }

    if (!shareUsername.trim()) {
      alert('Please enter a username');
      return;
    }

    try {
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

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        alert('You must be logged in to share notes');
        return;
      }

      if (userToShare.id === currentUser.id) {
        alert('Cannot share with yourself');
        return;
      }

      const { data: existingShare } = await supabase
        .from('note_shares')
        .select('*')
        .eq('note_id', noteId)
        .eq('user_id', userToShare.id)
        .maybeSingle();

      if (existingShare) {
        alert('Note already shared with this user');
        return;
      }

      const { error } = await supabase
        .from('note_shares')
        .insert({
          note_id: noteId,
          user_id: userToShare.id,
          permission: sharePermission,
          shared_by: currentUser.id,
          shared_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Insert error details:', error);
        throw error;
      }

      await loadSharedUsers();
      setShareUsername('');
      setSharePermission('view');
      setIsSharing(false);
      alert(`Note shared with ${userToShare.name || userToShare.username}!`);
    } catch (error) {
      console.error('Error sharing note:', error);
      alert('Failed to share note. Please try again.');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!isOwner) {
      alert('Only the note owner can remove shares');
      return;
    }

    try {
      const { error } = await supabase
        .from('note_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      setSharedUsers(prev => prev.filter(share => share.id !== shareId));
    } catch (error) {
      console.error('Error removing share:', error);
    }
  };

  const handleRemoveSelf = async () => {
    if (isOwner) {
      alert('You are the owner of this note. Transfer ownership or delete the note instead.');
      return;
    }

    if (!confirm('Are you sure you want to remove yourself from this note? You will lose access.')) {
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { error } = await supabase
        .from('note_shares')
        .delete()
        .eq('note_id', noteId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      alert('You have been removed from this note');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error removing self from note:', error);
      alert('Failed to remove yourself from the note');
    }
  };

  const handleUpdateSharePermission = async (shareId: string, newPermission: 'view' | 'edit') => {
    if (!isOwner) {
      alert('Only the note owner can update share permissions');
      return;
    }

    try {
      const { error } = await supabase
        .from('note_shares')
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
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="text-xl font-semibold bg-transparent border-none outline-none w-full text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  readOnly={!canEdit()}
                />
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {lastSaved && (
                    <span>Last saved: {lastSaved}</span>
                  )}
                  {renderPermissionBadge()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={() => setIsSharing(true)}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center gap-2"
                >
                  <span>🔗</span>
                  Share
                </button>
              )}
              
              {isOwner && (
                <button
                  onClick={handleTogglePin}
                  className={`p-2 rounded-lg ${isPinned ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  title={isPinned ? 'Unpin' : 'Pin'}
                >
                  {isPinned ? '📍' : '📌'}
                </button>
              )}
              
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
                  ⋯
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.focus();
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg"
                  >
                    ✏️ Focus Editor
                  </button>
                  {!isOwner && (
                    <button
                      onClick={handleRemoveSelf}
                      className="w-full px-4 py-2 text-left text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      🚪 Leave Note
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={handleDeleteNote}
                      className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 last:rounded-b-lg"
                    >
                      🗑️ Delete Note
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Share Modal */}
      {isSharing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share "{title}"</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Invite contacts to collaborate on this note
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSharing(false);
                  setShareUsername('');
                  setSharePermission('view');
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
                          if (e.key === 'Enter') handleShareNote();
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
                      onClick={handleShareNote}
                      className="px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-medium rounded-xl hover:from-[#4338CA] hover:to-[#6D28D9] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <span>+</span>
                      Invite
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You can only share with users who have a CoTask account
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    People with access ({sharedUsers.length})
                  </label>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
                          <span className="text-white font-medium">
                            {isOwner ? "You" : "Owner"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {isOwner ? "You" : "Note Owner"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Full access
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
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Invite someone to get started</p>
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

      {/* Toolbar with MS Word-like behavior */}
      {canEdit() && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleBold}
                className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                  isBold 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-600' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}
                title="Bold (Ctrl+B)"
              >
                B
              </button>
              
              <button
                onClick={toggleItalic}
                className={`px-3 py-1.5 rounded italic transition-colors ${
                  isItalic 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-600' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}
                title="Italic (Ctrl+I)"
              >
                I
              </button>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              
              <button
                onClick={() => applyBlockFormat('heading1')}
                className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                  blockFormat === 'heading1' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-600' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}
                title="Heading 1"
              >
                H1
              </button>
              
              <button
                onClick={() => applyBlockFormat('heading2')}
                className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                  blockFormat === 'heading2' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-600' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}
                title="Heading 2"
              >
                H2
              </button>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              
              <button
                onClick={insertBulletPoint}
                className="px-3 py-1.5 rounded transition-colors bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                title="Insert Bullet Point"
              >
                • Bullet
              </button>
              
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              
              <button
                onClick={insertTodo}
                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                title="Add Todo"
              >
                ✓ Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div
          ref={editorRef}
          contentEditable={canEdit()}
          onInput={handleEditorInput}
          onClick={handleEditorClick}
          onKeyUp={handleEditorKeyUp}
          onKeyDown={handleEditorKeyDown}
          className="min-h-[500px] p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white
                     [&>h1]:text-2xl [&>h1]:font-semibold [&>h1]:mt-4 [&>h1]:mb-2 dark:[&>h1]:text-gray-100
                     [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-2 dark:[&>h2]:text-gray-200
                     [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:my-2
                     [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:my-2
                     [&>li]:my-1
                     [&>p]:my-2 dark:[&>p]:text-gray-100
                     [&>strong]:font-semibold dark:[&>strong]:text-gray-100
                     [&_div[data-todo]]:flex [&_div[data-todo]]:items-center [&_div[data-todo]]:gap-2 [&_div[data-todo]]:my-2 [&_div[data-todo]]:p-2 [&_div[data-todo]]:rounded [&_div[data-todo]]:bg-gray-50 dark:[&_div[data-todo]]:bg-gray-700 [&_div[data-todo]]:border [&_div[data-todo]]:border-gray-200 dark:[&_div[data-todo]]:border-gray-600"
          suppressContentEditableWarning
        />
        
        {!canEdit() && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-700 dark:text-yellow-400">
              You have view-only access to this note. Only users with edit permission can modify it.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}