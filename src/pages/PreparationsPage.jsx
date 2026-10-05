import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { PreparationModal } from '../components/preparations/PreparationModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatFriendlyDate } from '../utils/dateUtils';
import { formatSecondsToShort } from '../utils/timerUtils';

export function PreparationsPage({ setActivePage }) {
  const {
    preparations,
    activePrepId,
    setActivePrepId,
    subjects,
    topics,
    sessions,
    deletePreparation,
  } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrep, setEditingPrep] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Filter preparations
  const filteredPreps = preparations.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.purpose && p.purpose.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-brand-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Learning Preparations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your individual learning plans, certifications, exam curricula, and tech stacks.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPrep(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={16} />
          <span>New Preparation</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search preparations..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
          {['all', 'In Progress', 'Completed', 'Not Started', 'Paused'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition shrink-0 ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Preparations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPreps.map((prep) => {
          const isActive = activePrepId === prep.id;
          const prepSubjects = subjects.filter((s) => s.preparationId === prep.id);
          const prepSubjectIds = new Set(prepSubjects.map((s) => s.id));
          const prepTopics = topics.filter((t) => prepSubjectIds.has(t.subjectId));
          const completedCount = prepTopics.filter((t) => t.status === 'Completed').length;
          const totalCount = prepTopics.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          const prepSessions = sessions.filter((s) => s.preparationId === prep.id);
          const totalPrepStudySeconds = prepSessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);

          return (
            <div
              key={prep.id}
              className={`glass-card p-6 flex flex-col justify-between relative transition-all duration-200 ${
                isActive
                  ? 'ring-2 ring-brand-500 shadow-md'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={prep.status} size="xs" />
                    <PriorityBadge priority={prep.priority} />
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500 text-white uppercase tracking-wider shadow-xs">
                      Active
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {prep.name}
                </h3>
                {prep.purpose && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1">
                    🎯 {prep.purpose}
                  </p>
                )}
                {prep.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {prep.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-5">
                  <ProgressBar
                    value={progressPercent}
                    max={100}
                    label="Curriculum Progress"
                    subLabel={`${completedCount}/${totalCount} Topics (${progressPercent}%)`}
                    height="h-2"
                    color="bg-brand-500"
                  />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-xl bg-slate-50 dark:bg-dark-950/60 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Subjects</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mono-number">
                      {prepSubjects.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Studied</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 mono-number">
                      {formatSecondsToShort(totalPrepStudySeconds)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Daily Target</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mono-number">
                      {prep.dailyTarget}h/day
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>Target: {formatFriendlyDate(prep.targetDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>Weekly: {prep.weeklyTarget}h</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {!isActive ? (
                  <button
                    onClick={() => setActivePrepId(prep.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                  >
                    Switch to This
                  </button>
                ) : (
                  <button
                    onClick={() => setActivePage('subjects')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-300 flex items-center gap-1 transition"
                  >
                    <span>View Subjects</span>
                    <ChevronRight size={14} />
                  </button>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingPrep(prep);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit Preparation"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(prep.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                    title="Delete Preparation"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Create/Edit */}
      <PreparationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrep(null);
        }}
        initialData={editingPrep}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deletePreparation(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Preparation?"
        message="Deleting this preparation will also cascade delete all its subjects, topics, and timetable entries."
        confirmText="Yes, Delete"
        isDestructive={true}
      />
    </div>
  );
}
