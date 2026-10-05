import React from 'react';

export function StatusBadge({ status, size = 'sm' }) {
  const s = (status || '').toLowerCase();
  let color = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  if (s === 'completed' || s === 'present') {
    color = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50';
  } else if (s === 'in progress' || s === 'partial' || s === 'running') {
    color = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50';
  } else if (s === 'pending' || s === 'not started') {
    color = 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50';
  } else if (s === 'absent' || s === 'overdue') {
    color = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50';
  } else if (s === 'holiday' || s === 'paused' || s === 'skipped') {
    color = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50';
  }

  const sizeCls = size === 'xs' ? 'text-[11px] px-2 py-0.5' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeCls} ${color}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const p = (priority || '').toLowerCase();
  let color = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

  if (p === 'high') {
    color = 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50';
  } else if (p === 'medium') {
    color = 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50';
  } else if (p === 'low') {
    color = 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50';
  }

  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {priority}
    </span>
  );
}
