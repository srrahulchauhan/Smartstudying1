import React from 'react';
import {
  Layers,
  BookOpen,
  ListTodo,
  CalendarPlus,
  Play,
  Target,
  Trophy,
  Video,
  X,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export function QuickActionModal({
  isOpen,
  onClose,
  onAction,
}) {
  const actions = [
    {
      id: 'new-prep',
      title: 'New Preparation',
      description: 'Create a new learning plan or exam goal',
      icon: Layers,
      color: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
    },
    {
      id: 'new-subject',
      title: 'New Subject',
      description: 'Add a subject under your active preparation',
      icon: BookOpen,
      color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    },
    {
      id: 'new-topic',
      title: 'New Topic',
      description: 'Add a specific study topic to master',
      icon: ListTodo,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    },
    {
      id: 'add-video',
      title: 'Add Video Course',
      description: 'Add a new video link to study from',
      icon: Video,
      color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    },
    {
      id: 'start-study',
      title: 'Start Study Timer',
      description: 'Jump directly to the study timer workstation',
      icon: Play,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      id: 'schedule-study',
      title: 'Schedule Study Slot',
      description: 'Add a time block to your weekly timetable',
      icon: CalendarPlus,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    },
    {
      id: 'add-target',
      title: 'Set Target',
      description: 'Configure daily, tomorrow or weekly targets',
      icon: Target,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    },
    {
      id: 'add-goal',
      title: 'Add Major Goal',
      description: 'Define milestones and target completion dates',
      icon: Trophy,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Actions" maxWidth="max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => {
                onClose();
                onAction(act.id);
              }}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-left group"
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${act.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {act.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
