import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Coffee,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  getMonthCalendarCells,
  MONTH_NAMES,
  formatFriendlyDate,
  getDayNameFromDate,
} from '../utils/dateUtils';
import { formatSecondsToShort } from '../utils/timerUtils';

export function CalendarPage() {
  const { sessions, attendance, timetable, topics, subjects, preparations } = useStudy();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  // Selected date modal deep-dive
  const [selectedDate, setSelectedDate] = useState(null);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const cells = getMonthCalendarCells(currentYear, currentMonth);

  // Group data by date
  const sessionsByDate = {};
  sessions.forEach((s) => {
    if (s.date) {
      if (!sessionsByDate[s.date]) sessionsByDate[s.date] = [];
      sessionsByDate[s.date].push(s);
    }
  });

  const attendanceByDate = Object.fromEntries(attendance.map((a) => [a.date, a]));

  // Selected Day Details calculation
  const daySessions = selectedDate ? (sessionsByDate[selectedDate] || []) : [];
  const dayStudySeconds = daySessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
  const dayBreakSeconds = daySessions.reduce((acc, s) => acc + (s.breakDuration || 0), 0);
  const dayAttendance = selectedDate ? attendanceByDate[selectedDate] : null;

  // Timetable scheduled for selected day
  const dayName = selectedDate ? getDayNameFromDate(selectedDate) : null;
  const dayTimetable = selectedDate ? timetable.filter((t) => t.day === dayName) : [];

  // Completed topics on selected date
  const dayCompletedTopics = topics.filter((t) => t.status === 'Completed' && t.targetDate === selectedDate);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-brand-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Study Calendar & Activity Log
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Click any date on the calendar to view a full breakdown of studied hours, sessions, breaks, and attendance.
          </p>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="glass-card p-6">
        {/* Month Navigator Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(now.getMonth());
                setCurrentYear(now.getFullYear());
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell) => {
            const daySess = sessionsByDate[cell.dateStr] || [];
            const att = attendanceByDate[cell.dateStr];
            const totalSec = daySess.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
            const hasStudy = totalSec > 0;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDate(cell.dateStr)}
                className={`min-h-[88px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  cell.isToday
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 shadow-xs'
                    : cell.isCurrentMonth
                    ? 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dark-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'border-transparent bg-slate-50/40 dark:bg-dark-950/20 opacity-30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold mono-number ${
                      cell.isToday ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>
                  {att && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        att.status === 'PRESENT'
                          ? 'bg-emerald-500'
                          : att.status === 'PARTIAL'
                          ? 'bg-amber-500'
                          : att.status === 'ABSENT'
                          ? 'bg-rose-500'
                          : 'bg-purple-500'
                      }`}
                    />
                  )}
                </div>

                {hasStudy ? (
                  <div className="mt-1">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                      {formatSecondsToShort(totalSec)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {daySess.length} {daySess.length === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-300 dark:text-slate-700 block mt-auto">
                    —
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={`Study Activity — ${selectedDate ? formatFriendlyDate(selectedDate) : ''}`}
        subtitle="Complete daily breakdown"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Day Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/60">
              <span className="text-[10px] text-slate-400 font-medium block">Total Study Time</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mono-number mt-0.5 block">
                {formatSecondsToShort(dayStudySeconds)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/60">
              <span className="text-[10px] text-slate-400 font-medium block">Break Time</span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400 mono-number mt-0.5 block">
                {formatSecondsToShort(dayBreakSeconds)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/60">
              <span className="text-[10px] text-slate-400 font-medium block">Sessions Count</span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 mono-number mt-0.5 block">
                {daySessions.length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/60">
              <span className="text-[10px] text-slate-400 font-medium block">Attendance</span>
              <div className="mt-1">
                <StatusBadge status={dayAttendance?.status || (dayStudySeconds > 0 ? 'PRESENT' : 'NONE')} size="xs" />
              </div>
            </div>
          </div>

          {/* Sessions logged for this day */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Recorded Study Sessions
            </h4>
            {daySessions.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-950/50 text-center text-xs text-slate-400">
                No study sessions logged on this date.
              </div>
            ) : (
              <div className="space-y-2">
                {daySessions.map((sess) => {
                  const sub = subjects.find((s) => s.id === sess.subjectId);
                  const prep = preparations.find((p) => p.id === sess.preparationId);
                  const top = topics.find((t) => t.id === sess.topicId);

                  return (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-dark-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {sub?.name || prep?.name || 'General Study'}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            {top?.name || (sub?.name ? 'General Subject Study' : 'Study Session')}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {sess.startTime} – {sess.endTime}
                        </span>
                        {sess.notes && (
                          <p className="text-xs text-slate-500 mt-1 italic">
                            "{sess.notes}"
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mono-number block">
                          {formatSecondsToShort(sess.actualStudyDuration)}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Break: {formatSecondsToShort(sess.breakDuration)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
