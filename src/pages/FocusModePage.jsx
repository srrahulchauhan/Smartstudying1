import React, { useState, useEffect } from 'react';
import {
  Minimize2,
  Play,
  Pause,
  Coffee,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useStudy } from '../context/StudyContext';
import { BreakModal } from '../components/timer/BreakModal';
import { formatMsToHMS } from '../utils/timerUtils';

const MOTIVATIONAL_QUOTES = [
  "Stay Focused. Deep work creates rare value.",
  "Consistent daily effort compounds into mastery.",
  "Small disciplines repeated with consistency every day lead to great achievements.",
  "The secret of getting ahead is getting started.",
  "Energy flows where attention goes.",
  "Silence the noise. Focus on one concept at a time.",
];

export function FocusModePage({ setActivePage }) {
  const {
    session,
    liveTimings,
    isRunning,
    isPaused,
    isBreak,
    isIdle,
    pauseStudy,
    resumeStudy,
    takeBreak,
    stopSession,
  } = useTimer();

  const { preparations, subjects, topics, settings, updateSettings } = useStudy();

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const prep = preparations.find((p) => p.id === session.preparationId);
  const sub = subjects.find((s) => s.id === session.subjectId);
  const top = topics.find((t) => t.id === session.topicId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden animate-fade-in">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar: Brand, Sound Toggle, and Exit */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">
            FOCUS MODE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => updateSettings({ soundEnabled: !settings?.soundEnabled })}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={settings?.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {settings?.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            onClick={() => setActivePage('timer')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Minimize2 size={14} />
            <span>Exit Focus</span>
          </button>
        </div>
      </div>

      {/* Center Hero: Subject, Giant Timer, Quote */}
      <div className="text-center my-auto z-10 max-w-2xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-brand-400 block mb-1">
            {sub?.name || prep?.name || 'Active Study Session'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {top?.name || (sub?.name ? 'General Subject Study' : (prep?.name ? prep.name + ' Focus' : 'Deep Focus Session'))}
          </h2>
        </div>

        {/* Giant Monospace Timer */}
        <div className="py-6">
          <div className="text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter mono-number text-white font-mono drop-shadow-2xl">
            {formatMsToHMS(liveTimings.netStudyMs)}
          </div>
          <span className="text-xs font-mono text-slate-400 tracking-wider uppercase block mt-2">
            Net Active Study Time
          </span>
        </div>

        {/* Motivational Quote */}
        <p className="text-sm sm:text-base text-slate-400 font-light italic transition-all duration-700 max-w-lg mx-auto">
          "{MOTIVATIONAL_QUOTES[quoteIndex]}"
        </p>
      </div>

      {/* Bottom Controls Bar */}
      <div className="z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          {isRunning && (
            <button
              onClick={pauseStudy}
              className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg transition"
            >
              <Pause size={17} />
              <span>PAUSE</span>
            </button>
          )}

          {isPaused && (
            <button
              onClick={resumeStudy}
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
            >
              <Play size={17} className="fill-white" />
              <span>RESUME</span>
            </button>
          )}

          {!isBreak && (
            <button
              onClick={() => takeBreak('Rest')}
              className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm flex items-center gap-2 shadow-lg transition"
            >
              <Coffee size={17} />
              <span>TAKE BREAK</span>
            </button>
          )}

          <button
            onClick={() => {
              stopSession();
              setActivePage('timer');
            }}
            className="py-3 px-6 rounded-2xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-sm flex items-center gap-2 shadow-lg transition"
          >
            <Square size={16} />
            <span>STOP</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500">
          Press ESC or click Exit Focus to return to full dashboard
        </span>
      </div>

      {/* Break Mode Modal Overlay */}
      <BreakModal />
    </div>
  );
}
