import React from 'react';

export function ProgressBar({
  value = 0,
  max = 100,
  showLabel = true,
  height = 'h-2.5',
  color = 'bg-brand-500',
  label = null,
  subLabel = null,
  isLive = false,
  isAnimated = true,
  glowColor = null,
}) {
  const percentage = Math.min(100, Math.max(0, max > 0 ? Math.round((value / max) * 100) : 0));

  return (
    <div className="w-full select-none">
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <span>{label || 'Progress'}</span>
            {isLive && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live
              </span>
            )}
          </div>
          <span className="mono-number text-slate-900 dark:text-slate-200 font-bold shrink-0">
            {subLabel ? subLabel : `${percentage}%`}
          </span>
        </div>
      )}

      {/* Progress Track with subtle ambient glow when live */}
      <div className="relative">
        {/* Ambient background glow when live */}
        {isLive && (
          <div
            className="absolute -inset-0.5 bg-emerald-500/20 rounded-full blur-xs pointer-events-none transition-all duration-500"
            style={{ width: `${Math.max(10, percentage)}%` }}
          />
        )}

        <div className={`w-full bg-slate-200/80 dark:bg-slate-800/90 rounded-full overflow-hidden relative shadow-inner transition-all duration-300 ${height}`}>
          {/* Progress Fill Bar */}
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${color} ${
              isLive ? 'animate-fluid-gradient shadow-md' : ''
            }`}
            style={{ width: `${percentage}%` }}
          >
            {/* Animated Barber-pole Stripes when Live */}
            {isLive && (
              <div className="absolute inset-0 animate-stripes opacity-35 pointer-events-none" />
            )}

            {/* Flowing Light Shimmer Ray */}
            {(isAnimated || isLive) && percentage > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/35 to-transparent animate-live-shimmer pointer-events-none" />
            )}

            {/* Lead glowing laser beacon at the edge with radiant energy pulse */}
            {percentage > 2 && percentage < 100 && (
              <div className="absolute top-0 bottom-0 right-0 flex items-center justify-center pr-0.5 pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_14px_rgba(255,255,255,0.9)] animate-beacon-pulse" />
                {isLive && (
                  <span className="absolute w-5 h-5 rounded-full bg-white/40 animate-ping pointer-events-none" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

