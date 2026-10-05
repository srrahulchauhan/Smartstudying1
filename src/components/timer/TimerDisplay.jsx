import React, { useState, useEffect } from 'react';
import { Clock, Coffee, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useStudy } from '../../context/StudyContext';
import { formatMsToHMS, formatSecondsToShort } from '../../utils/timerUtils';
import { formatTimeFromTimestamp } from '../../utils/dateUtils';

export function TimerDisplay({ compact = false }) {
  const { session, liveTimings, isRunning, isPaused, isBreak, isIdle } = useTimer();
  const { subjects, topics, preparations, settings } = useStudy();

  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prep = preparations.find((p) => p.id === session.preparationId);
  const sub = subjects.find((s) => s.id === session.subjectId);
  const top = topics.find((t) => t.id === session.topicId);

  if (isIdle) {
    return (
      <div className="glass-card p-8 text-center border-dashed border-2 border-slate-300 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
          <BookOpen size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ready to Study</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Choose a subject and topic below, then hit Start Study to launch the timer.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
      {/* Background ambient gradient based on timer status */}
      <div
        className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isRunning
            ? 'bg-emerald-500/10'
            : isBreak
            ? 'bg-amber-500/15'
            : 'bg-indigo-500/10'
        }`}
      />

      {/* Top Bar: Subject & Topic Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Layers size={14} />
            <span>{prep?.name || 'General Preparation'}</span>
            {sub && (
              <>
                <span>•</span>
                <span className="text-slate-600 dark:text-slate-300">{sub.name}</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {top?.name || 'Open Study Session'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isRunning
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                : isBreak
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-emerald-500 animate-ping' : isBreak ? 'bg-amber-500' : 'bg-slate-400'
              }`}
            />
            {session.status}
          </span>
        </div>
      </div>

      {/* Center: Hero Timer Display (Net Study Time) */}
      <div className="text-center my-4 sm:my-6">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 block mb-1">
          Actual Net Study Time
        </span>
        <div className="text-5xl sm:text-7xl font-extrabold tracking-tight mono-number text-slate-900 dark:text-white select-none">
          {formatMsToHMS(liveTimings.netStudyMs)}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Actual Study Time = Total Session Time – Total Break Time
        </p>
      </div>

      {/* Grid: Secondary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/70">
          <span className="text-[11px] text-slate-400 font-medium block">Start Time</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mono-number mt-0.5 block">
            {formatTimeFromTimestamp(session.sessionStartTime, settings?.timeFormat !== '24h')}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/70">
          <span className="text-[11px] text-slate-400 font-medium block">Current Time</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mono-number mt-0.5 block">
            {formatTimeFromTimestamp(currentTime, settings?.timeFormat !== '24h')}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/70">
          <span className="text-[11px] text-slate-400 font-medium block">Total Session</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mono-number mt-0.5 block">
            {formatMsToHMS(liveTimings.totalSessionMs)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950/70">
          <span className="text-[11px] text-slate-400 font-medium block">Total Break Time</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 mono-number mt-0.5 block">
            {formatMsToHMS(liveTimings.breakMs)}
          </span>
        </div>
      </div>
    </div>
  );
}
