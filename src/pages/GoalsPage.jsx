import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudy } from '../context/StudyContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/Badge';
import { GoalModal } from '../components/goals/GoalModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatFriendlyDate } from '../utils/dateUtils';

export function GoalsPage() {
  const { goals, preparations, toggleMilestone, deleteGoal } = useStudy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleMilestoneToggle = (goalId, milestoneId) => {
    toggleMilestone(goalId, milestoneId);
    // Check if that completed the goal
    const g = goals.find((item) => item.id === goalId);
    if (g) {
      const remainingUnchecked = (g.milestones || []).filter(
        (m) => m.id !== milestoneId && !m.completed
      );
      if (remainingUnchecked.length === 0) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (err) {}
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="text-brand-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Goals & Milestone Tracking
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set long-term learning goals, track target hours, and mark sequential milestones.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={16} />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const prep = preparations.find((p) => p.id === goal.preparationId);
          const isCompleted = goal.status === 'Completed' || goal.progress === 100;

          return (
            <div
              key={goal.id}
              className={`glass-card p-6 flex flex-col justify-between relative transition-all duration-200 ${
                isCompleted
                  ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                    {prep?.name || 'General Goal'}
                  </span>
                  <StatusBadge status={goal.status} size="xs" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {goal.name}
                </h3>

                <div className="mt-4">
                  <ProgressBar
                    value={goal.progress}
                    max={100}
                    label="Goal Progress"
                    subLabel={`${goal.progress}%`}
                    height="h-2"
                    color={isCompleted ? 'bg-emerald-500' : 'bg-brand-500'}
                  />
                </div>

                {/* Target Hours & Date */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-dark-950/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Target Hours</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mono-number mt-0.5 block">
                      {goal.targetHours}h
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Target Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {formatFriendlyDate(goal.targetDate)}
                    </span>
                  </div>
                </div>

                {/* Milestones Checklist */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Milestones
                    </span>
                    {goal.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleMilestoneToggle(goal.id, m.id)}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                          m.completed
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-slate-500 line-through'
                            : 'bg-slate-50 dark:bg-dark-950 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {m.completed ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <Circle size={14} className="text-slate-400" />
                          )}
                        </div>
                        <span className="flex-1 leading-snug">{m.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingGoal(goal);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Edit Goal"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => setDeleteTargetId(goal.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                  title="Delete Goal"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        initialData={editingGoal}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteGoal(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Goal?"
        message="Are you sure you want to remove this learning goal?"
        confirmText="Yes, Delete"
        isDestructive={true}
      />
    </div>
  );
}
