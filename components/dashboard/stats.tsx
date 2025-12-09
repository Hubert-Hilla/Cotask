// components/dashboard/sections/StatsSection.tsx
interface StatsSectionProps {
  tasksLeft: number;
  completedTasks: number;
  totalTasks: number;
  dueToday: number;
  listsCount: number;
  notesCount: number;
  statsFilter: string | null;
  onStatsFilter: (filter: string | null) => void;
}

export default function StatsSection({
  tasksLeft,
  completedTasks,
  totalTasks,
  dueToday,
  listsCount,
  notesCount,
  statsFilter,
  onStatsFilter,
}: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <button
        onClick={() => onStatsFilter(statsFilter === 'incomplete' ? null : 'incomplete')}
        className={`bg-white rounded-xl p-6 border-2 transition-all hover:shadow-md ${
          statsFilter === 'incomplete' ? 'border-indigo-600 shadow-md' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500">Tasks Left</span>
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <div className="text-3xl font-bold">{tasksLeft}</div>
        <div className="text-sm text-gray-500 mt-1">
          {completedTasks}/{totalTasks} completed
        </div>
        {statsFilter === 'incomplete' && (
          <div className="text-xs text-indigo-600 mt-2">Click again to clear filter</div>
        )}
      </button>

      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500">Due Today</span>
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <span className="text-xl">📅</span>
          </div>
        </div>
        <div className="text-3xl font-bold">{dueToday}</div>
        <div className="text-sm text-gray-500 mt-1">
          Requires attention
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500">Items Created</span>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
        </div>
        <div className="text-3xl font-bold">{listsCount + notesCount}</div>
        <div className="text-sm text-gray-500 mt-1">
          {listsCount} lists, {notesCount} notes
        </div>
      </div>
    </div>
  );
}