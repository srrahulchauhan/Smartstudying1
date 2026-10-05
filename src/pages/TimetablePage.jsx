import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Copy,
  Edit2,
  Trash2,
  Play,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { PriorityBadge } from '../components/common/Badge';
import { TimetableModal } from '../components/timetable/TimetableModal';
import { RecurringPlanModal } from '../components/timetable/RecurringPlanModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DAYS_OF_WEEK } from '../utils/dateUtils';
import { formatMinutesToShort } from '../utils/timerUtils';

export function TimetablePage({ setActivePage }) {
  const {
    timetable,
    subjects,
    topics,
    preparations,
    deleteTimetableSlot,
    duplicateTimetableSlot,
  } = useStudy();

  const { startStudy } = useTimer();

  const [selectedDay, setSelectedDay] = useState('All'); // 'All' | 'Monday' ... 'Sunday'
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const displayDays = selectedDay === 'All' ? DAYS_OF_WEEK : [selectedDay];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="text-brand-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Weekly Timetable Builder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build repeatable weekly study schedules and recurring multi-day sprint plans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRecurringModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Repeat size={15} />
            <span>Recurring Plan</span>
          </button>
          <button
            onClick={() => {
              setEditingSlot(null);
              setIsSlotModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus size={15} />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['All', ...DAYS_OF_WEEK].map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-3.5 py-1.5 text-xs rounded-xl font-medium transition shrink-0 ${
              selectedDay === d
                ? 'bg-brand-600 text-white shadow-xs font-bold'
                : 'bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Timetable Days Display */}
      <div className="space-y-6">
        {displayDays.map((day) => {
          const daySlots = timetable
            .filter((t) => t.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={day} className="glass-card p-5 sm:p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {day}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {daySlots.length} {daySlots.length === 1 ? 'Slot' : 'Slots'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setEditingSlot({ day });
                    setIsSlotModalOpen(true);
                  }}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Add for {day}</span>
                </button>
              </div>

              {daySlots.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-dark-950/40 rounded-xl">
                  No study sessions scheduled for {day}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {daySlots.map((slot) => {
                    const sub = subjects.find((s) => s.id === slot.subjectId);
                    const top = topics.find((t) => t.id === slot.topicId);
                    const prep = preparations.find((p) => p.id === slot.preparationId);

                    return (
                      <div
                        key={slot.id}
                        className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-950/50 hover:border-brand-500/40 transition flex flex-col justify-between"
                      >
                        <div>
                          {/* Header badges */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <PriorityBadge priority={slot.priority} />
                          </div>

                          {/* Subject & Topic */}
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {sub?.name || prep?.name || 'General Study'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {top?.name || (sub?.name ? 'General Subject Study' : 'General Study Session')}
                          </p>

                          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Target: {formatMinutesToShort(slot.targetDuration)}</span>
                            {slot.repeat && (
                              <span className="text-brand-600 dark:text-brand-400 font-medium">
                                Repeats weekly
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                          <button
                            onClick={() => {
                              startStudy({
                                preparationId: slot.preparationId,
                                subjectId: slot.subjectId,
                                topicId: slot.topicId,
                                targetDurationMinutes: slot.targetDuration,
                              });
                              setActivePage('timer');
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs transition"
                          >
                            <Play size={11} className="fill-white" />
                            <span>Start</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {/* Duplicate to next day */}
                            <button
                              onClick={() => {
                                const nextDayIdx = (DAYS_OF_WEEK.indexOf(day) + 1) % 7;
                                duplicateTimetableSlot(slot.id, DAYS_OF_WEEK[nextDayIdx]);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                              title="Duplicate to next day"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingSlot(slot);
                                setIsSlotModalOpen(true);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                              title="Edit slot"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(slot.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Delete slot"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timetable Slot Modal */}
      <TimetableModal
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setEditingSlot(null);
        }}
        initialData={editingSlot}
        defaultDay={editingSlot?.day || 'Monday'}
      />

      {/* Recurring Plan Generator Modal */}
      <RecurringPlanModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteTimetableSlot(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Remove Timetable Slot?"
        message="Are you sure you want to delete this scheduled study block?"
        confirmText="Yes, Delete"
        isDestructive={true}
      />
    </div>
  );
}
