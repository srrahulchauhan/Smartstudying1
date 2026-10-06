import React, { useState } from 'react';
import {
  History,
  Search,
  Calendar,
  Clock,
  Coffee,
  Trash2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Edit2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StatusBadge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';
import { formatFriendlyDate } from '../utils/dateUtils';
import { formatSecondsToShort, formatSecondsToHMS } from '../utils/timerUtils';

export function HistoryPage() {
  const { sessions, subjects, topics, preparations, deleteSession, updateSession } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [prepFilter, setPrepFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'duration-desc' | 'duration-asc'
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [editMinutes, setEditMinutes] = useState(0);

  // Filtered & sorted sessions
  const filteredSessions = sessions
    .filter((s) => {
      const sub = subjects.find((subItem) => subItem.id === s.subjectId);
      const top = topics.find((topItem) => topItem.id === s.topicId);
      const prep = preparations.find((prepItem) => prepItem.id === s.preparationId);

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (sub?.name && sub.name.toLowerCase().includes(q)) ||
        (top?.name && top.name.toLowerCase().includes(q)) ||
        (prep?.name && prep.name.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q));

      const matchesPrep = prepFilter === 'all' || s.preparationId === prepFilter;
      const matchesSubject = subjectFilter === 'all' || s.subjectId === subjectFilter;
      const matchesDate = !dateFilter || s.date === dateFilter;

      return matchesSearch && matchesPrep && matchesSubject && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return (b.date || '').localeCompare(a.date || '');
      if (sortBy === 'date-asc') return (a.date || '').localeCompare(b.date || '');
      if (sortBy === 'duration-desc') return (b.actualStudyDuration || 0) - (a.actualStudyDuration || 0);
      if (sortBy === 'duration-asc') return (a.actualStudyDuration || 0) - (b.actualStudyDuration || 0);
      return 0;
    });

  const totalFilteredSeconds = filteredSessions.reduce(
    (acc, s) => acc + (s.actualStudyDuration || 0),
    0
  );
  const totalFilteredBreakSeconds = filteredSessions.reduce(
    (acc, s) => acc + (s.breakDuration || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <History className="text-brand-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Study Session History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete audit trail of study sessions, start/end timestamps, and break intervals.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-slate-400 block font-medium">Filtered Study Time</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mono-number">
              {formatSecondsToShort(totalFilteredSeconds)}
            </span>
          </div>
          <div className="text-right pl-4 border-l border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block font-medium">Total Breaks</span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mono-number">
              {formatSecondsToShort(totalFilteredBreakSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions or notes..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 outline-none"
            />

            {/* Prep Filter */}
            <select
              value={prepFilter}
              onChange={(e) => setPrepFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 font-semibold outline-none"
            >
              <option value="all">All Preps</option>
              {preparations.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 font-semibold outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 font-semibold outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="duration-desc">Longest Duration</option>
              <option value="duration-asc">Shortest Duration</option>
            </select>

            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="px-2.5 py-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-sm">
            No study sessions found matching your criteria.
          </div>
        ) : (
          filteredSessions.map((sess) => {
            const sub = subjects.find((s) => s.id === sess.subjectId);
            const top = topics.find((t) => t.id === sess.topicId);
            const prep = preparations.find((p) => p.id === sess.preparationId);
            const isExpanded = expandedSessionId === sess.id;
            const hasBreaks = sess.breaks && sess.breaks.length > 0;

            return (
              <div
                key={sess.id}
                className="glass-card p-4 sm:p-5 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-1.5 shadow-xs"
                      style={{ backgroundColor: sub?.color || '#6366f1' }}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {formatFriendlyDate(sess.date)}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                          {prep?.name || 'General'}
                        </span>
                        {sub?.name && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {sub.name}
                            </span>
                          </>
                        )}
                        <StatusBadge status={sess.status || 'Completed'} size="xs" />
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {top?.name || 'Open Study Session'}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span>
                          {sess.startTime} – {sess.endTime}
                        </span>
                        {sess.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-500 dark:text-slate-400 truncate max-w-sm">
                              "{sess.notes}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right metrics & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Actual Study</span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mono-number">
                        {formatSecondsToShort(sess.actualStudyDuration)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Break Time</span>
                      <span className="text-base font-bold text-amber-600 dark:text-amber-400 mono-number">
                        {formatSecondsToShort(sess.breakDuration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {hasBreaks && (
                        <button
                          onClick={() => setExpandedSessionId(isExpanded ? null : sess.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs"
                          title="View break details"
                        >
                          <Coffee size={14} />
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingSession(sess);
                          setEditMinutes(Math.round((sess.actualStudyDuration || 0) / 60));
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition"
                        title="Edit Session"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(sess.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete Session"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Break Details Drawer */}
                {isExpanded && hasBreaks && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px] block mb-2">
                      Break Intervals Recorded:
                    </span>
                    <div className="space-y-1.5">
                      {sess.breaks.map((b, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-dark-950/60"
                        >
                          <div className="flex items-center gap-2">
                            <Coffee size={13} className="text-amber-500" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {b.reason || 'Rest'}
                            </span>
                            <span className="text-slate-400">
                              ({b.startTime} - {b.endTime})
                            </span>
                          </div>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            {formatSecondsToShort(b.duration)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteSession(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Study Session?"
        message="Are you sure you want to remove this logged study session from your history?"
        confirmText="Yes, Delete"
        isDestructive={true}
      />

      {/* Edit Session Modal */}
      <Modal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        title="Edit Session Time"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Actual Study Time (Minutes)
            </label>
            <input
              type="number"
              min="0"
              value={editMinutes}
              onChange={(e) => setEditMinutes(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setEditingSession(null)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (editingSession) {
                  updateSession(editingSession.id, {
                    actualStudyDuration: editMinutes * 60,
                    totalDuration: editMinutes * 60 + (editingSession.breakDuration || 0)
                  });
                  setEditingSession(null);
                }
              }}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
