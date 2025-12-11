// components/dashboard/modals/CreateItemModal.tsx
'use client';

import { useState } from 'react';

// Database stores icon as string (emoji), so use emoji directly
type ListIcon = '📋' | '💼' | '🛒' | '🏠' | '❤️' | '📚' | '👥' | '⭐' | '🎯' | '📅' | '⚡' | '☕' | '💡' | '🚀' | '✅';
type ListColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (list: {
    title: string;
    icon: string; // Changed to string for emoji
    color: string;
  }) => void;
  onCreateNote: (note: {
    title: string;
  }) => void;
}

export default function CreateItemModal({
  isOpen,
  onClose,
  onCreateList,
  onCreateNote,
}: CreateItemModalProps) {
  const [mode, setMode] = useState<'list' | 'note'>('list');
  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<ListIcon>('📋');
  const [selectedColor, setSelectedColor] = useState<ListColor>('indigo');

  // Use emoji directly as values
  const iconOptions: Array<{ value: ListIcon; icon: string }> = [
    { value: '📋', icon: '📋' },
    { value: '💼', icon: '💼' },
    { value: '🛒', icon: '🛒' },
    { value: '🏠', icon: '🏠' },
    { value: '❤️', icon: '❤️' },
    { value: '📚', icon: '📚' },
    { value: '👥', icon: '👥' },
    { value: '⭐', icon: '⭐' },
    { value: '🎯', icon: '🎯' },
    { value: '📅', icon: '📅' },
    { value: '⚡', icon: '⚡' },
    { value: '☕', icon: '☕' },
    { value: '💡', icon: '💡' },
    { value: '🚀', icon: '🚀' },
    { value: '✅', icon: '✅' }
  ];

  const colorOptions: Array<{ value: ListColor; bg: string; name: string }> = [
    { value: 'indigo', bg: 'bg-indigo-600', name: 'Indigo' },
    { value: 'emerald', bg: 'bg-emerald-600', name: 'Emerald' },
    { value: 'amber', bg: 'bg-amber-500', name: 'Amber' },
    { value: 'rose', bg: 'bg-rose-500', name: 'Rose' },
    { value: 'purple', bg: 'bg-purple-600', name: 'Purple' },
    { value: 'blue', bg: 'bg-blue-600', name: 'Blue' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (mode === 'list') {
      onCreateList({
        title: title.trim(),
        icon: selectedIcon, // This is now the emoji string
        color: selectedColor,
      });
    } else {
      onCreateNote({
        title: title.trim(),
      });
    }

    // Don't reset form here - let the parent handle it after successful creation
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setSelectedIcon('📋');
    setSelectedColor('indigo');
    setMode('list');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={handleClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Create New {mode === 'list' ? 'List' : 'Note'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {mode === 'list' 
                    ? 'Set up a new task list with custom icon and color'
                    : 'Create a new note to capture your thoughts'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mode === 'list'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📋 Create List
              </button>
              <button
                type="button"
                onClick={() => setMode('note')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mode === 'note'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📝 Create Note
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'list' ? 'List Title' : 'Note Title'}
              </label>
              <input
                id="title"
                type="text"
                placeholder={mode === 'list' 
                  ? 'e.g., Personal Tasks, Work Projects, Shopping...'
                  : 'e.g., Meeting Notes, Ideas, Journal...'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                autoFocus
              />
            </div>

            {mode === 'list' && (
              <>
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose an Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconOptions.map(({ value, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedIcon(value)}
                        className={`
                          p-3 rounded-lg border-2 transition-all hover:scale-105
                          ${selectedIcon === value 
                            ? 'border-indigo-600 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <span className="text-xl">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a Color
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {colorOptions.map(({ value, bg, name }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedColor(value)}
                        className={`
                          p-2 rounded-lg border-2 transition-all hover:scale-105
                          ${selectedColor === value 
                            ? 'border-gray-900' 
                            : 'border-transparent'
                          }
                        `}
                      >
                        <div className={`w-full h-8 rounded ${bg}`} />
                        <div className="text-xs mt-1 text-gray-600">{name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!title.trim()}
              >
                Create {mode === 'list' ? 'List' : 'Note'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}