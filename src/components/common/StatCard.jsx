import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'brand',
  trend = null, // e.g. "+15% from last week"
  onClick = null,
  isLive = false,
  liveBadgeText = 'LIVE',
  children = null,
}) {
  const accentGradients = {
    brand: 'from-brand-500/15 via-indigo-500/5 to-transparent border-brand-500/30',
    emerald: 'from-emerald-500/15 via-teal-500/5 to-transparent border-emerald-500/30',
    amber: 'from-amber-500/15 via-yellow-500/5 to-transparent border-amber-500/30',
    sky: 'from-sky-500/15 via-blue-500/5 to-transparent border-sky-500/30',
    violet: 'from-violet-500/15 via-purple-500/5 to-transparent border-violet-500/30',
    rose: 'from-rose-500/15 via-pink-500/5 to-transparent border-rose-500/30',
  };

  const iconBg = {
    brand: 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 border border-brand-200/80 dark:border-brand-800/50 group-hover:bg-brand-500 group-hover:text-white',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50 group-hover:bg-emerald-500 group-hover:text-white',
    amber: 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/50 group-hover:bg-amber-500 group-hover:text-white',
    sky: 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/50 group-hover:bg-sky-500 group-hover:text-white',
    violet: 'bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 border border-violet-200/80 dark:border-violet-800/50 group-hover:bg-violet-500 group-hover:text-white',
    rose: 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/50 group-hover:bg-rose-500 group-hover:text-white',
  };

  const glowBorder = {
    brand: 'hover:border-brand-500/60 hover:shadow-brand-500/20',
    emerald: 'hover:border-emerald-500/60 hover:shadow-emerald-500/20',
    amber: 'hover:border-amber-500/60 hover:shadow-amber-500/20',
    sky: 'hover:border-sky-500/60 hover:shadow-sky-500/20',
    violet: 'hover:border-violet-500/60 hover:shadow-violet-500/20',
    rose: 'hover:border-rose-500/60 hover:shadow-rose-500/20',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`glass-card p-5 relative overflow-hidden transition-all duration-300 ease-out transform group ${
        onClick
          ? `cursor-pointer hover:-translate-y-2 hover:shadow-2xl active:scale-[0.97] ${glowBorder[accentColor] || glowBorder.brand}`
          : ''
      } ${
        isLive
          ? 'border-emerald-500/70 ring-2 ring-emerald-500/30 animate-live-card'
          : ''
      }`}
    >
      {/* Live ambient gradient animation background */}
      {isLive && (
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none animate-pulse" />
      )}

      {/* Top subtle highlight shimmer on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent group-hover:via-brand-500 group-hover:h-[3px] transition-all duration-500" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {title}
            </p>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider shadow-sm shadow-emerald-500/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                {liveBadgeText}
              </span>
            )}
          </div>

          <h4
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight mono-number transition-colors duration-300 ${
              isLive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400'
            }`}
          >
            {value}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {Icon && (
            <div
              className={`p-2.5 rounded-2xl shrink-0 transition-all duration-300 transform group-hover:scale-115 group-hover:rotate-3 shadow-xs ${
                iconBg[accentColor] || iconBg.brand
              }`}
            >
              <Icon size={20} className={isLive ? 'animate-spin-slow' : ''} />
            </div>
          )}

          {onClick && (
            <div className="p-1 rounded-lg text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
              <ArrowUpRight size={16} />
            </div>
          )}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative z-10">
          {subtitle && <span className="truncate pr-1">{subtitle}</span>}
          {trend && (
            <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              {trend}
            </span>
          )}
        </div>
      )}

      {children && <div className="mt-3 relative z-10">{children}</div>}
    </div>
  );
}
