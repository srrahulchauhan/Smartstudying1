import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { AttendanceEditModal } from '../components/attendance/AttendanceEditModal';
import { AttendanceDistributionChart } from '../components/analytics/Charts';
import { ATTENDANCE_STATUS, computeAttendanceStats } from '../utils/attendanceLogic';
import {
  getMonthCalendarCells,
  MONTH_NAMES,
  getTodayDateString,
  formatFriendlyDate,
} from '../utils/dateUtils';

export function AttendancePage() {
  const { attendance, settings, updateSettings } = useStudy();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  // Edit Modal State
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const calendarCells = getMonthCalendarCells(currentYear, currentMonth);

  // Month-specific stats
  const monthStats = computeAttendanceStats(attendance, currentMonth, currentYear);
  const allTimeStats = computeAttendanceStats(attendance);

  const attendanceMap = Object.fromEntries(attendance.map((a) => [a.date, a]));

  const getStatusColor = (status) => {
    if (status === ATTENDANCE_STATUS.PRESENT) {
      return 'bg-emerald-500 text-white';
    }
    if (status === ATTENDANCE_STATUS.ABSENT) {
      return 'bg-rose-500 text-white';
    }
    if (status === ATTENDANCE_STATUS.PARTIAL) {
      return 'bg-amber-500 text-white';
    }
    if (status === ATTENDANCE_STATUS.HOLIDAY) {
      return 'bg-purple-500 text-white';
    }
    return 'bg-slate-200 dark:bg-slate-800 text-slate-500';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="text-brand-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Daily Study Attendance
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Auto-marked PRESENT if studied ≥ {settings?.minAttendanceMinutes || 30} mins, PARTIAL if &lt; {settings?.minAttendanceMinutes || 30} mins, ABSENT if scheduled but not studied.
          </p>
        </div>

        {/* Attendance Percentage Badge */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
          <div className="text-right">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
              Attendance Rate
            </span>
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mono-number">
              {monthStats.attendancePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Month Statistics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 block font-medium">Present Days</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mono-number mt-1 block">
            {monthStats.presentCount}
          </span>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 block font-medium">Partial Days</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mono-number mt-1 block">
            {monthStats.partialCount}
          </span>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 block font-medium">Absent Days</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mono-number mt-1 block">
            {monthStats.absentCount}
          </span>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-xs text-slate-400 block font-medium">Holidays</span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mono-number mt-1 block">
            {monthStats.holidayCount}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 glass-card p-4 text-center">
          <span className="text-xs text-slate-400 block font-medium">Threshold Setting</span>
          <div className="flex items-center justify-center gap-1 mt-1">
            <input
              type="number"
              min="10"
              max="120"
              step="5"
              value={settings?.minAttendanceMinutes || 30}
              onChange={(e) =>
                updateSettings({
                  minAttendanceMinutes: parseInt(e.target.value, 10) || 30,
                })
              }
              className="w-14 text-center px-1 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 font-bold text-sm text-slate-900 dark:text-white"
            />
            <span className="text-xs text-slate-500">mins</span>
          </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="glass-card p-6">
        {/* Calendar Month Navigation Header */}
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

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell) => {
            const att = attendanceMap[cell.dateStr];
            const hasRecord = !!att;

            return (
              <div
                key={cell.dateStr}
                onClick={() => {
                  setSelectedDate(cell.dateStr);
                  setIsEditModalOpen(true);
                }}
                className={`min-h-[78px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  cell.isToday
                    ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/20'
                    : cell.isCurrentMonth
                    ? 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dark-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'border-transparent bg-slate-50/40 dark:bg-dark-950/20 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold mono-number ${
                      cell.isToday
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>
                  {cell.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  )}
                </div>

                {hasRecord ? (
                  <div className="mt-1">
                    <span
                      className={`inline-block w-full text-center text-[10px] font-extrabold uppercase py-0.5 rounded-md ${getStatusColor(
                        att.status
                      )}`}
                    >
                      {att.status}
                    </span>
                    {att.studyMinutes > 0 && (
                      <span className="text-[10px] text-slate-400 mono-number block text-center mt-0.5">
                        {att.studyMinutes}m
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-300 dark:text-slate-700 block text-center">
                    —
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Partial (&lt;{settings?.minAttendanceMinutes || 30}m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Holiday</span>
          </div>
          <span className="text-slate-400">• Click any date to manually change status</span>
        </div>
      </div>

      {/* Manual Attendance Edit Modal */}
      <AttendanceEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDate(null);
        }}
        dateStr={selectedDate}
        existingRecord={selectedDate ? attendanceMap[selectedDate] : null}
      />
    </div>
  );
}
