import React, { useState } from 'react';
import { Coffee, Play, Check, Sparkles } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useStudy } from '../../context/StudyContext';
import { formatMsToHMS } from '../../utils/timerUtils';
import { formatTimeFromTimestamp } from '../../utils/dateUtils';

export function BreakModal() {
  const { session, liveTimings, isBreak, resumeFromBreak } = useTimer();
  const { settings } = useStudy();

  const [selectedReason, setSelectedReason] = useState(
    session?.currentBreakReason || 'Rest'
  );

  if (!isBreak) return null;

  const breakReasons = settings?.breakReasons || [
    'Tea',
    'Food',
    'Rest',
    'Phone',
    'Personal',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-dark-900 border border-amber-500/30 dark:border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden animate-scale-up">
        {/* Glow backdrop accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-300 dark:border-amber-800/60">
          <Coffee size={14} className="animate-bounce" />
          <span>Break Mode Active</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Take a Breather
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Study timer paused. Break time is strictly excluded from study hours.
        </p>

        {/* Live Break Ticker */}
        <div className="my-6 p-5 rounded-2xl bg-amber-50/70 dark:bg-dark-950/80 border border-amber-200 dark:border-amber-900/40">
          <div className="text-4xl font-extrabold text-amber-600 dark:text-amber-400 mono-number tracking-tight">
            {formatMsToHMS(liveTimings.currentBreakDurationMs)}
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Started:{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {formatTimeFromTimestamp(
                  session.currentBreakStartTime,
                  settings?.timeFormat !== '24h'
                )}
              </strong>
            </span>
            <span>•</span>
            <span>
              Total Break:{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {formatMsToHMS(liveTimings.breakMs)}
              </strong>
            </span>
          </div>
        </div>

        {/* Reason Selector */}
        <div className="text-left mb-6">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Break Reason
          </label>
          <div className="flex flex-wrap gap-2">
            {breakReasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  selectedReason === reason
                    ? 'bg-amber-500 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={resumeFromBreak}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition transform active:scale-98"
          >
            <Play size={18} className="fill-white" />
            <span>Resume Study</span>
          </button>
        </div>
      </div>
    </div>
  );
}
