import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Flame,
  Clock,
  BookOpen,
  Layers,
  CheckCircle2,
  Coffee,
  Calendar,
  Award,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  DailyBarChart,
  SubjectBreakdownChart,
  AttendanceDistributionChart,
} from '../components/analytics/Charts';
import {
  getTodayDateString,
  getCurrentWeekDates,
  calculateStudyStreaks,
  formatFriendlyDate,
} from '../utils/dateUtils';
import { formatSecondsToShort, formatHoursToShort } from '../utils/timerUtils';
import { computeAttendanceStats } from '../utils/attendanceLogic';

export function AnalyticsPage() {
  const { sessions, subjects, topics, preparations, attendance, settings } = useStudy();

  const [dateRangeMode, setDateRangeMode] = useState('weekly'); // 'daily' | 'weekly' | 'monthly' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const todayStr = getTodayDateString();

  // Filter sessions by selected range
  const filteredSessions = useMemo(() => {
    if (dateRangeMode === 'daily') {
      return sessions.filter((s) => s.date === todayStr);
    }
    if (dateRangeMode === 'weekly') {
      const currentWeek = getCurrentWeekDates(settings?.weekStartDay === 'Sunday');
      const weekDates = new Set(currentWeek.map((w) => w.dateStr));
      return sessions.filter((s) => weekDates.has(s.date));
    }
    if (dateRangeMode === 'monthly') {
      const monthPrefix = todayStr.slice(0, 7);
      return sessions.filter((s) => s.date && s.date.startsWith(monthPrefix));
    }
    if (dateRangeMode === 'custom' && customStart && customEnd) {
      return sessions.filter((s) => s.date >= customStart && s.date <= customEnd);
    }
    return sessions;
  }, [sessions, dateRangeMode, customStart, customEnd, todayStr, settings]);

  // Aggregate Metrics
  const totalStudySeconds = filteredSessions.reduce(
    (acc, s) => acc + (s.actualStudyDuration || 0),
    0
  );
  const totalBreakSeconds = filteredSessions.reduce(
    (acc, s) => acc + (s.breakDuration || 0),
    0
  );

  // Distinct days studied in filtered range
  const distinctDaysStudied = new Set(filteredSessions.map((s) => s.date)).size;
  const avgDailyStudySeconds =
    distinctDaysStudied > 0 ? Math.round(totalStudySeconds / distinctDaysStudied) : 0;

  // Most studied subject
  const subjectStudyMap = {};
  filteredSessions.forEach((s) => {
    if (s.subjectId) {
      subjectStudyMap[s.subjectId] = (subjectStudyMap[s.subjectId] || 0) + (s.actualStudyDuration || 0);
    }
  });
  let mostStudiedSubId = null;
  let maxSubSec = 0;
  Object.entries(subjectStudyMap).forEach(([id, sec]) => {
    if (sec > maxSubSec) {
      maxSubSec = sec;
      mostStudiedSubId = id;
    }
  });
  const mostStudiedSubject = subjects.find((s) => s.id === mostStudiedSubId);

  // Most studied preparation
  const prepStudyMap = {};
  filteredSessions.forEach((s) => {
    if (s.preparationId) {
      prepStudyMap[s.preparationId] = (prepStudyMap[s.preparationId] || 0) + (s.actualStudyDuration || 0);
    }
  });
  let mostStudiedPrepId = null;
  let maxPrepSec = 0;
  Object.entries(prepStudyMap).forEach(([id, sec]) => {
    if (sec > maxPrepSec) {
      maxPrepSec = sec;
      mostStudiedPrepId = id;
    }
  });
  const mostStudiedPrep = preparations.find((p) => p.id === mostStudiedPrepId);

  // Longest single study session
  let longestSessionSeconds = 0;
  filteredSessions.forEach((s) => {
    if ((s.actualStudyDuration || 0) > longestSessionSeconds) {
      longestSessionSeconds = s.actualStudyDuration;
    }
  });

  // Streaks
  const streaks = calculateStudyStreaks(sessions, settings?.minAttendanceMinutes || 30);

  // Attendance stats
  const attStats = computeAttendanceStats(attendance);

  // Completed vs Pending Topics
  const completedTopicsCount = topics.filter((t) => t.status === 'Completed').length;
  const pendingTopicsCount = topics.filter((t) => t.status !== 'Completed').length;
  const totalTopicsCount = topics.length;

  // Chart data for daily trend
  const weekDates = getCurrentWeekDates(settings?.weekStartDay === 'Sunday');
  const barChartData = weekDates.map((w) => {
    const daySessions = sessions.filter((s) => s.date === w.dateStr);
    const sec = daySessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
    return {
      label: w.dayName.slice(0, 3),
      valueHours: sec / 3600,
      isToday: w.isToday,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-brand-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Advanced Productivity Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze time investments, streaks, subject distribution, and syllabus completion.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'daily', label: 'Today' },
            { id: 'weekly', label: 'This Week' },
            { id: 'monthly', label: 'This Month' },
            { id: 'custom', label: 'Custom Range' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateRangeMode(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                dateRangeMode === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker (if selected) */}
      {dateRangeMode === 'custom' && (
        <div className="glass-card p-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">From:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
          />
          <span className="font-semibold text-slate-700 dark:text-slate-300">To:</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
          />
        </div>
      )}

      {/* Key Analytical Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-4 text-center">
          <span className="text-[11px] text-slate-400 font-medium block">Total Study</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mono-number mt-1 block">
            {formatSecondsToShort(totalStudySeconds)}
          </span>
        </div>

        <div className="glass-card p-4 text-center">
          <span className="text-[11px] text-slate-400 font-medium block">Daily Average</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mono-number mt-1 block">
            {formatSecondsToShort(avgDailyStudySeconds)}
          </span>
        </div>

        <div className="glass-card p-4 text-center">
          <span className="text-[11px] text-slate-400 font-medium block">Current Streak</span>
          <span className="text-xl font-bold text-amber-500 mono-number mt-1 block flex items-center justify-center gap-1">
            <Flame size={16} className="fill-amber-500" />
            <span>{streaks.currentStreak}d</span>
          </span>
        </div>

        <div className="glass-card p-4 text-center">
          <span className="text-[11px] text-slate-400 font-medium block">Longest Streak</span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400 mono-number mt-1 block">
            {streaks.longestStreak} Days
          </span>
        </div>

        <div className="glass-card p-4 text-center">
          <span className="text-[11px] text-slate-400 font-medium block">Total Breaks</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mono-number mt-1 block">
            {formatSecondsToShort(totalBreakSeconds)}
          </span>
        </div>

        <div className="glass-card p-4 text-center">
          <span className="text-[11px] text-slate-400 font-medium block">Longest Session</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mono-number mt-1 block">
            {formatSecondsToShort(longestSessionSeconds)}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Trend */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Study Hours (This Week)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hours spent per day
              </p>
            </div>
            <TrendingUp size={16} className="text-brand-500" />
          </div>
          <DailyBarChart data={barChartData} />
        </div>

        {/* Subject-wise Distribution */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Subject-Wise Study Investment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Study hours ratio across subjects
              </p>
            </div>
            <BookOpen size={16} className="text-brand-500" />
          </div>
          <SubjectBreakdownChart subjects={subjects} sessions={filteredSessions} />
        </div>

        {/* Syllabus Progress (Completed vs Pending) */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Topics Mastery (Completed vs Pending)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Progress through all defined topics
              </p>
            </div>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>

          <div className="space-y-4">
            <ProgressBar
              value={completedTopicsCount}
              max={totalTopicsCount}
              label="Overall Topics Completion"
              subLabel={`${completedTopicsCount} / ${totalTopicsCount} (${
                totalTopicsCount > 0
                  ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
                  : 0
              }%)`}
              height="h-3"
              color="bg-emerald-500"
            />

            <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-emerald-600 dark:text-emerald-400 block font-medium">
                  Completed Topics
                </span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mono-number mt-0.5 block">
                  {completedTopicsCount}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Pending Topics</span>
                <span className="text-xl font-bold text-slate-700 dark:text-slate-300 mono-number mt-0.5 block">
                  {pendingTopicsCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Attendance Consistency
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attendance breakdown & overall percentage
              </p>
            </div>
            <Award size={16} className="text-amber-500" />
          </div>

          <AttendanceDistributionChart stats={attStats} />

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">All-time Attendance Rate:</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mono-number">
              {attStats.attendancePercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
