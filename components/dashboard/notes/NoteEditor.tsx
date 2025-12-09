// components/dashboard/notes/NoteEditor.tsx - UPDATED WITH SHARING
'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
  const [isArchived, setIsArchived] = useState(false);
  const [activeFormat, setActiveFormat] = useState<Record<string, boolean>>({
    bold: false,
    italic: false,
  });
  const [isSharing, setIsSharing] = useState(false);
  const [shareUsername, setShareUsername] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [sharedUsers, setSharedUsers] = useState<NoteShare[]>([]);
  const [userPermission, setUserPermission] = useState<'owner' | 'edit' | 'view'>(initialUserPermission);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);
  const lastSelectionRef = useRef<Range | null>(null);
  const todoInputsRef = useRef<Map<string, HTMLInputElement>>(new Map());

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

  // Check active formatting on selection change
  useEffect(() => {
    const checkActiveFormatting = () => {
      if (!canEdit() || !editorRef.current) return;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
      
      try {
        setActiveFormat({
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
        });
      } catch (e) {
        // Ignore errors
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('mouseup', checkActiveFormatting);
      editor.addEventListener('keyup', checkActiveFormatting);
      return () => {
        editor.removeEventListener('mouseup', checkActiveFormatting);
        editor.removeEventListener('keyup', checkActiveFormatting);
      };
    }
  }, [canEdit]);

  // Save selection before content updates
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      lastSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  // Restore selection after content updates
  const restoreSelection = () => {
    if (lastSelectionRef.current && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(lastSelectionRef.current);
          editorRef.current.focus();
        } catch (e) {
          // Fallback to end of editor
          const range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          editorRef.current.focus();
        }
      }
    }
  };

  // Formatting functions
  const applyFormat = (command: string, value?: string) => {
    if (!editorRef.current || !canEdit()) return;
    
    saveSelection();
    
    // Toggle the format
    document.execCommand(command, false, value);
    
    // Update active format state
    if (command === 'bold' || command === 'italic') {
      setActiveFormat(prev => ({
        ...prev,
        [command]: document.queryCommandState(command),
      }));
    }
    
    handleEditorChange();
    restoreSelection();
  };

  const insertHeading = (level: 1 | 2) => {
    if (!canEdit()) {
      alert('You do not have permission to edit this note');
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

    saveSelection();
    
    const range = selection.getRangeAt(0);
    
    // Check if we're inside a todo or other non-editable element
    let currentNode = range.startContainer;
    while (currentNode && currentNode !== editorRef.current) {
      if ((currentNode as HTMLElement).contentEditable === 'false') {
        // Can't insert heading inside non-editable element
        alert('Cannot insert heading inside a todo item. Move cursor outside first.');
        return;
      }
      currentNode = currentNode.parentNode!;
    }
    
    // If selection is collapsed (just cursor), we need to insert heading
    // If there's text selected, wrap it in heading
    if (range.collapsed) {
      // Insert empty heading
      const heading = document.createElement(level === 1 ? 'h1' : 'h2');
      heading.className = level === 1 ? 'text-2xl font-semibold mt-4 mb-2' : 'text-xl font-semibold mt-3 mb-2';
      heading.innerHTML = '<br>';
      
      range.insertNode(heading);
      
      // Place cursor inside heading
      const newRange = document.createRange();
      newRange.selectNodeContents(heading);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Wrap selected text in heading
      const heading = document.createElement(level === 1 ? 'h1' : 'h2');
      heading.className = level === 1 ? 'text-2xl font-semibold mt-4 mb-2' : 'text-xl font-semibold mt-3 mb-2';
      
      try {
        const fragment = range.extractContents();
        heading.appendChild(fragment);
        range.insertNode(heading);
      } catch (e) {
        console.error('Error wrapping heading:', e);
        return;
      }
    }
    
    handleEditorChange();
    editorRef.current.focus();
  };

  const insertList = (ordered: boolean) => {
    if (!editorRef.current || !canEdit()) {
      alert('You do not have permission to edit this note');
      return;
    }
    
    saveSelection();
    
    // Use document.execCommand for lists - it handles multi-item lists better
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
    
    handleEditorChange();
    restoreSelection();
  };

  const insertTodo = () => {
    if (!editorRef.current || !canEdit()) {
      alert('You do not have permission to edit this note');
      return;
    }
    
    saveSelection();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const todoId = `todo-${Date.now()}`;
    
    const todoWrapper = document.createElement('div');
    todoWrapper.className = 'flex items-center gap-2 my-2 p-2 rounded bg-gray-50 border border-gray-200';
    todoWrapper.setAttribute('data-todo-id', todoId);
    todoWrapper.setAttribute('data-todo', 'true');

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'w-4 h-4 rounded border-gray-300 cursor-pointer';
    checkbox.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const textInput = todoWrapper.querySelector('input[type="text"]') as HTMLInputElement;
      if (textInput) {
        textInput.classList.toggle('line-through', target.checked);
        textInput.classList.toggle('text-gray-500', target.checked);
      }
      handleEditorChange();
    };

    // Text input
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Task description...';
    textInput.className = 'flex-1 bg-transparent border-none outline-none text-sm';
    
    // Store reference to this input
    todoInputsRef.current.set(todoId, textInput);
    
    // Handle input changes
    textInput.oninput = () => {
      // Don't trigger handleEditorChange while typing in todo
      // We'll save when focus is lost
    };
    
    textInput.onblur = () => {
      handleEditorChange();
    };
    
    textInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        
        // Create a new paragraph after the todo
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        
        todoWrapper.after(p);
        
        // Move cursor to the new paragraph
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
    deleteBtn.className = 'text-gray-500 hover:text-red-500 font-bold text-xl px-2';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      todoWrapper.remove();
      todoInputsRef.current.delete(todoId);
      handleEditorChange();
      editorRef.current?.focus();
    };

    todoWrapper.appendChild(checkbox);
    todoWrapper.appendChild(textInput);
    todoWrapper.appendChild(deleteBtn);

    // Insert at cursor
    try {
      if (!range.collapsed) {
        range.deleteContents();
      }
      
      // Insert todo
      range.insertNode(todoWrapper);
      
      // Add a zero-width space after for better cursor placement
      const space = document.createTextNode('\u200B');
      todoWrapper.after(space);
      
      handleEditorChange();
      
      // Focus the input after a short delay
      setTimeout(() => {
        textInput.focus();
        lastSelectionRef.current = null;
      }, 50);
    } catch (e) {
      console.error('Error inserting todo:', e);
    }
  };

  // Handle editor content changes
  const handleEditorChange = () => {
    if (!editorRef.current || isUpdatingRef.current || !canEdit()) return;
    
    isUpdatingRef.current = true;
    
    // Save current selection (unless we're in a todo input)
    const activeElement = document.activeElement;
    if (!activeElement || !activeElement.closest('[data-todo]')) {
      saveSelection();
    }
    
    // Update content state
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    
    isUpdatingRef.current = false;
  };

  // Handle editor events
  const handleEditorInput = () => {
    handleEditorChange();
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    // If clicking on a todo element, don't restore selection
    const target = e.target as HTMLElement;
    if (target.closest('[data-todo]')) {
      e.stopPropagation();
      return;
    }
    
    // Save selection on click
    setTimeout(() => {
      saveSelection();
    }, 0);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (!canEdit()) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (!selection || !editorRef.current) return;
      
      // Check if we're inside a todo input
      const activeElement = document.activeElement;
      if (activeElement?.tagName === 'INPUT' && 
          activeElement.closest('[data-todo]')) {
        // Let the todo input handle Enter
        return;
      }
      
      // Check if we're at the end of a heading
      const range = selection.getRangeAt(0);
      const container = range.endContainer;
      
      if (container.parentElement?.tagName === 'H1' || 
          container.parentElement?.tagName === 'H2') {
        // Insert paragraph after heading
        const heading = container.parentElement;
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        heading.after(p);
        
        // Move cursor to new paragraph
        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Default behavior: insert paragraph
        document.execCommand('insertParagraph', false);
      }
      
      handleEditorChange();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Check if we're in a list
        const container = range.commonAncestorContainer as HTMLElement;
        const listItem = container.closest('li');
        
        if (listItem && e.shiftKey) {
          // Shift+Tab: outdent
          document.execCommand('outdent', false);
        } else if (listItem) {
          // Tab: indent
          document.execCommand('indent', false);
        } else {
          // Insert tab character
          document.execCommand('insertText', false, '\t');
        }
        
        handleEditorChange();
      }
    }
  };

  // Save note with debouncing
  const saveNote = async () => {
    if (!canEdit()) return;
    
    setIsSaving(true);
    
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
    } finally {
      setIsSaving(false);
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
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, canEdit]);

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
    
    // Fetch note details (pinned/archived status)
    const fetchNoteDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('is_pinned, is_archived')
          .eq('id', noteId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setIsPinned(data.is_pinned || false);
          setIsArchived(data.is_archived || false);
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

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting note:', error);
    }
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

  // Handle archive/unarchive
  const handleToggleArchive = async () => {
    if (!isOwner) {
      alert('Only the note owner can archive/unarchive the note');
      return;
    }

    try {
      const newArchivedState = !isArchived;
      setIsArchived(newArchivedState);
      
      const { error } = await supabase
        .from('notes')
        .update({ 
          is_archived: newArchivedState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) throw error;

      saveNote();
    } catch (error) {
      console.error('Error toggling archive:', error);
      setIsArchived(!isArchived);
    }
  };

  // Sharing functions
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

      // Get current user's ID
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        alert('You must be logged in to share notes');
        return;
      }

      if (userToShare.id === currentUser.id) {
        alert('Cannot share with yourself');
        return;
      }

      // Check if already shared
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

      // Create share
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

  // Render permission badge
  const renderPermissionBadge = () => {
    if (userPermission === 'owner') return null;
    
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
              
              <div className="flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="text-xl font-semibold bg-transparent border-none outline-none w-full"
                  readOnly={!canEdit()}
                />
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {lastSaved && (
                    <span>Last saved: {lastSaved}</span>
                  )}
                  {isSaving && (
                    <span className="text-blue-500">Saving...</span>
                  )}
                  {renderPermissionBadge()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={() => setIsSharing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <span>🔗</span>
                  Share
                </button>
              )}
              
              {isOwner && (
                <>
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
                </>
              )}
              
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  ⋯
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.focus();
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                  >
                    ✏️ Focus Editor
                  </button>
                  {isOwner && (
                    <button
                      onClick={handleDeleteNote}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 last:rounded-b-lg"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Share Note</h2>
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
                  if (e.key === 'Enter') handleShareNote();
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
                onClick={handleShareNote}
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

      {/* Toolbar */}
      {canEdit() && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyFormat('bold')}
                className={`px-3 py-1 rounded hover:bg-gray-200 ${activeFormat.bold ? 'bg-gray-300' : 'bg-gray-100'}`}
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => applyFormat('italic')}
                className={`px-3 py-1 rounded hover:bg-gray-200 ${activeFormat.italic ? 'bg-gray-300' : 'bg-gray-100'}`}
                title="Italic"
              >
                <em>I</em>
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <button
                onClick={() => insertHeading(1)}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                title="Heading 1"
              >
                H1
              </button>
              <button
                onClick={() => insertHeading(2)}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                title="Heading 2"
              >
                H2
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <button
                onClick={() => insertList(false)}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                title="Bullet List"
              >
                • List
              </button>
              <button
                onClick={() => insertList(true)}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                title="Numbered List"
              >
                1. List
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <button
                onClick={insertTodo}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
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
          onKeyDown={handleEditorKeyDown}
          className="min-h-[500px] p-4 bg-white rounded-lg border border-gray-200 outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500
                     [&>h1]:text-2xl [&>h1]:font-semibold [&>h1]:mt-4 [&>h1]:mb-2
                     [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-2
                     [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:my-2
                     [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:my-2
                     [&>li]:my-1
                     [&>p]:my-2
                     [&>div[data-todo]]:flex [&>div[data-todo]]:items-center [&>div[data-todo]]:gap-2 [&>div[data-todo]]:my-2 [&>div[data-todo]]:p-2 [&>div[data-todo]]:rounded [&>div[data-todo]]:bg-gray-50 [&>div[data-todo]]:border [&>div[data-todo]]:border-gray-200"
          suppressContentEditableWarning
        />
        
        {/* Editor help text */}
        {canEdit() && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Use the toolbar above to format your text. Changes are auto-saved.
              <br />
              <strong>Enter key:</strong> Creates new paragraphs. Press Enter twice to exit lists.
              <br />
              <strong>Tab key:</strong> Indent list items. Shift+Tab to outdent.
              <br />
              <strong>Headings:</strong> Select text and click H1/H2, or click with cursor to create empty heading.
            </p>
          </div>
        )}
        
        {!canEdit() && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              You have view-only access to this note. Only users with edit permission can modify it.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}