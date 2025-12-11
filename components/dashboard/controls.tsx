// components/dashboard/sections/ControlsSection.tsx - ORIGINAL LAYOUT WITH DARK MODE
'use client';

import { useState } from 'react';

interface ControlsSectionProps {
  onCreateClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: 'all' | 'lists' | 'notes';
  onFilterChange: (type: 'all' | 'lists' | 'notes') => void;
  sortBy: 'created' | 'modified' | 'name' | 'completion';
  onSortChange: (sort: 'created' | 'modified' | 'name' | 'completion') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  bulkSelectMode: boolean;
  onBulkSelectToggle: () => void;
  selectedItems: Set<string>;
  onBulkDelete: () => void;
}

export default function ControlsSection({
  onCreateClick,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  bulkSelectMode,
  onBulkSelectToggle,
  selectedItems,
  onBulkDelete,
}: ControlsSectionProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortLabels = {
    created: 'Date Created',
    modified: 'Date Modified',
    name: 'Name',
    completion: 'Completion %',
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search lists and notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('lists')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filterType === 'lists'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Lists
          </button>
          <button
            onClick={() => onFilterChange('notes')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              filterType === 'notes'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />        
            </svg>
            Notes
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            onBlur={() => setTimeout(() => setShowSortDropdown(false), 150)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 relative"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
            Sort: {sortLabels[sortBy]}
            <svg className={`w-4 h-4 ml-1 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />    
            </svg>
          </button>

          {/* Sort dropdown content */}
          {showSortDropdown && (
            <div className="absolute mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[180px]">
              {(['created', 'modified', 'name', 'completion'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onSortChange(option);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                    sortBy === option ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-200'
                  }`}
                >
                  {sortLabels[option]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-l-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            aria-label="Grid view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-r-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            aria-label="List view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Bulk Select */}
        <button
          onClick={onBulkSelectToggle}
          className={`px-4 py-2 rounded-lg transition-colors ${
            bulkSelectMode
              ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {bulkSelectMode ? 'Cancel Selection' : 'Select Multiple'}
        </button>

        {/* Bulk Delete - Only show when items are selected */}
        {bulkSelectMode && selectedItems.size > 0 && (
          <button
            onClick={onBulkDelete}
            className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 ml-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete ({selectedItems.size})
          </button>
        )}
      </div>
    </div>
  );
}