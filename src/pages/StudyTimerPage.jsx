import React, { useState } from 'react';
import {
  Timer,
  Clock,
  Play,
  Pause,
  Coffee,
  Square,
  CheckCircle,
  Layers,
  BookOpen,
  ListTodo,
  Calendar,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { TimerDisplay } from '../components/timer/TimerDisplay';
import { TimerControls } from '../components/timer/TimerControls';
import { BreakModal } from '../components/timer/BreakModal';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  getTodayDateString,
  formatFriendlyDate,
  getDayNameFromDate,
  formatTimeFromTimestamp,
} from '../utils/dateUtils';
import { formatSecondsToShort, formatHoursToShort, formatMsToHMS } from '../utils/timerUtils';

export function StudyTimerPage({ setActivePage }) {
  const {
    preparations,
    subjects,
    topics,
    timetable,
    sessions,
    attendance,
    targets,
    settings,
    activePrepId,
  } = useStudy();

  const {
    session,
    isRunning,
    isPaused,
    isBreak,
    isIdle,
    liveTimings,
    formattedNetStudyTime,
    startStudy,
    pauseStudy,
    resumeStudy,
    takeBreak,
    resumeFromBreak,
    stopSession,
    completeTopicAndStop,
  } = useTimer();

  // Launcher state when timer is idle
  const [selectedPrepId, setSelectedPrepId] = useState(activePrepId || (preparations[0]?.id || ''));
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [pomodoroPreset, setPomodoroPreset] = useState('25'); // '25' | '50' | '45' | 'custom'
  const [targetMins, setTargetMins] = useState(45);

  const todayStr = getTodayDateString();
  const todayDayName = getDayNameFromDate(todayStr);

  // Today's metrics for Daily Study Control
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayStudySeconds = todaySessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
  const todayBreakSeconds = todaySessions.reduce((acc, s) => acc + (s.breakDuration || 0), 0);
  const todayStudyHours = todayStudySeconds / 3600;
  const plannedHours = targets.daily?.targetHours || settings?.dailyTargetHours || 4;
  const remainingHours = Math.max(0, plannedHours - todayStudyHours);
  const targetProgress = Math.min(100, Math.round((todayStudyHours / plannedHours) * 100));

  const todayAttendance = attendance.find((a) => a.date === todayStr);

  // Filtered dropdown lists
  const availableSubjects = subjects.filter((s) => s.preparationId === selectedPrepId);
  const availableTopics = topics.filter((t) => t.subjectId === selectedSubjectId);

  // Upcoming scheduled session today
  const upcomingSlots = timetable
    .filter((t) => t.day === todayDayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const nextSlot = upcomingSlots[0] || null;
  const nextSub = nextSlot ? subjects.find((s) => s.id === nextSlot.subjectId) : null;
  const nextPrep = nextSlot ? preparations.find((p) => p.id === nextSlot.preparationId) : null;
  const nextTop = nextSlot ? topics.find((t) => t.id === nextSlot.topicId) : null;

  const handleLaunch = () => {
    startStudy({
      preparationId: selectedPrepId,
      subjectId: selectedSubjectId || null,
      topicId: selectedTopicId || null,
      pomodoroMode: isPomodoro,
      targetDurationMinutes: parseInt(pomodoroPreset, 10) || targetMins,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Focus Mode Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <Timer className="text-brand-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Study Workstation & Live Control
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accurate timestamp-based tracking. Break durations are strictly excluded from study hours.
          </p>
        </div>

        <button
          onClick={() => setActivePage('focus')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          title="Enter Distraction-Free Focus Mode"
        >
          <Maximize2 size={15} />
          <span>Enter Focus Mode</span>
        </button>
      </div>

      {/* Main Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timer Display & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Timer Display */}
          <TimerDisplay />

          {/* Controls Bar */}
          <div className="glass-card p-6">
            <TimerControls onStartNewSession={handleLaunch} />
          </div>

          {/* If idle: Session Launcher Configurator */}
          {isIdle && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Configure New Study Session
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Prep */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Preparation
                  </label>
                  <select
                    value={selectedPrepId}
                    onChange={(e) => {
                      setSelectedPrepId(e.target.value);
                      setSelectedSubjectId('');
                      setSelectedTopicId('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  >
                    {preparations.length === 0 ? (
                      <option value="">General Study</option>
                    ) : (
                      preparations.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Subject (Optional)
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedTopicId('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  >
                    <option value="">General Study (No Subject)</option>
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Topic
                  </label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500"
                  >
                    <option value="">Select Topic (Optional)</option>
                    {availableTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pomodoro presets */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Study Mode & Duration
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={isPomodoro}
                      onChange={(e) => setIsPomodoro(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600"
                    />
                    <span>Enable Pomodoro Mode</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: '25', label: '25m (Pomodoro)' },
                    { id: '45', label: '45m (Standard)' },
                    { id: '50', label: '50m (Deep Work)' },
                    { id: '90', label: '90m (Mastery Sprint)' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPomodoroPreset(preset.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        pomodoroPreset === preset.id
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-dark-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLaunch}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition transform active:scale-98"
                >
                  <Play size={16} className="fill-white" />
                  <span>LAUNCH STUDY SESSION</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Today's Study Control & Next Up Widget */}
        <div className="space-y-6">
          {/* Section 31: Daily Study Control Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Section 31
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Today's Study Control
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatFriendlyDate(todayStr)}
                </p>
              </div>
              <StatusBadge status={todayAttendance?.status || (todayStudySeconds > 0 ? 'PRESENT' : 'PENDING')} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Planned Target:</span>
                <span className="font-bold text-slate-900 dark:text-white mono-number">
                  {plannedHours} Hours
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Completed Study:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 mono-number">
                  {formatSecondsToShort(todayStudySeconds)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Remaining to Target:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mono-number">
                  {formatHoursToShort(remainingHours)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Attendance Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {todayAttendance?.status || 'Evaluated on Save'}
                </span>
              </div>

              <div className="pt-2">
                <ProgressBar
                  value={todayStudyHours}
                  max={plannedHours}
                  showLabel={true}
                  label="Daily Completion"
                  height="h-2"
                  color="bg-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Next Up Scheduled Session */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Next Scheduled Session
              </h3>
              <Calendar size={15} className="text-slate-400" />
            </div>

            {nextSlot ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 block mb-1">
                    {nextSlot.startTime} - {nextSlot.endTime}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {nextSub?.name || nextPrep?.name || 'General Study'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {nextTop?.name || (nextSub?.name ? 'General Subject Study' : 'General Study Session')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    startStudy({
                      preparationId: nextSlot.preparationId,
                      subjectId: nextSlot.subjectId,
                      topicId: nextSlot.topicId,
                      targetDurationMinutes: nextSlot.targetDuration,
                    });
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Play size={13} className="fill-slate-800 dark:fill-white" />
                  <span>Start This Scheduled Session</span>
                </button>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No more sessions scheduled for today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Break Mode Modal Overlay */}
      <BreakModal />
    </div>
  );
}
