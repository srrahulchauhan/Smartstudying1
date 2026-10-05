import React, { useState } from 'react';
import { formatMinutesToShort } from '../../utils/timerUtils';

/**
 * Responsive Bar Chart for Daily Study Hours
 */
export function DailyBarChart({ data = [], height = 220 }) {
  // data format: [{ label: '14 Sep', valueHours: 2.5, isToday: false }, ...]
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
        No study activity recorded in this period.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.valueHours), 4); // minimum ceiling 4h

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 sm:gap-4 h-48 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
        {data.map((item, idx) => {
          const heightPercent = Math.min(100, Math.max(4, Math.round((item.valueHours / maxVal) * 100)));
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={item.label || idx}
              className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 z-10 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-mono shadow-md whitespace-nowrap pointer-events-none animate-scale-up">
                  {item.valueHours.toFixed(1)} hrs ({Math.round(item.valueHours * 60)}m)
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full rounded-t-xl transition-all duration-300 ${
                  item.isToday
                    ? 'bg-gradient-to-t from-brand-600 to-indigo-500 shadow-md shadow-brand-500/20'
                    : isHovered
                    ? 'bg-brand-500 dark:bg-brand-400'
                    : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
                style={{ height: `${heightPercent}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* X-Axis Labels */}
      <div className="flex items-center gap-2 sm:gap-4 mt-2">
        {data.map((item, idx) => (
          <span
            key={item.label || idx}
            className={`flex-1 text-center text-[10px] truncate ${
              item.isToday ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-400'
            }`}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Donut / Segment Chart for Subject Distribution
 */
export function SubjectBreakdownChart({ subjects = [], sessions = [] }) {
  // Calculate total study time per subject
  const totals = {};
  let generalSeconds = 0;
  sessions.forEach((s) => {
    if (s.subjectId && s.actualStudyDuration) {
      totals[s.subjectId] = (totals[s.subjectId] || 0) + s.actualStudyDuration;
    } else if (s.actualStudyDuration) {
      generalSeconds += s.actualStudyDuration;
    }
  });

  const totalAllSeconds = Object.values(totals).reduce((a, b) => a + b, 0) + generalSeconds;

  const subjectData = subjects
    .map((sub) => {
      const seconds = totals[sub.id] || 0;
      const percentage = totalAllSeconds > 0 ? Math.round((seconds / totalAllSeconds) * 100) : 0;
      return {
        id: sub.id,
        name: sub.name,
        color: sub.color || '#6366f1',
        seconds,
        hours: (seconds / 3600).toFixed(1),
        percentage,
      };
    })
    .filter((s) => s.seconds > 0);

  if (generalSeconds > 0) {
    subjectData.push({
      id: 'general',
      name: 'General Study',
      color: '#6366f1',
      seconds: generalSeconds,
      hours: (generalSeconds / 3600).toFixed(1),
      percentage: totalAllSeconds > 0 ? Math.round((generalSeconds / totalAllSeconds) * 100) : 0,
    });
  }

  subjectData.sort((a, b) => b.seconds - a.seconds);

  if (subjectData.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No study sessions logged yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Visual multi-segmented bar */}
      <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
        {subjectData.map((item) => (
          <div
            key={item.id}
            title={`${item.name}: ${item.percentage}%`}
            className="h-full transition-all duration-300"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
          />
        ))}
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        {subjectData.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-dark-950/60 text-xs"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 font-mono">
              <span className="text-slate-400">{item.hours}h</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Attendance Visual Status Rings
 */
export function AttendanceDistributionChart({ stats }) {
  const { presentCount = 0, absentCount = 0, partialCount = 0, holidayCount = 0 } = stats || {};
  const total = presentCount + absentCount + partialCount + holidayCount;

  if (total === 0) {
    return <div className="text-xs text-slate-400">No attendance data.</div>;
  }

  const items = [
    { label: 'Present', count: presentCount, color: 'bg-emerald-500', text: 'text-emerald-500' },
    { label: 'Partial', count: partialCount, color: 'bg-amber-500', text: 'text-amber-500' },
    { label: 'Absent', count: absentCount, color: 'bg-rose-500', text: 'text-rose-500' },
    { label: 'Holiday', count: holidayCount, color: 'bg-purple-500', text: 'text-purple-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
        {items.map((i) => {
          const pct = Math.round((i.count / total) * 100);
          return (
            <div
              key={i.label}
              className={`h-full ${i.color}`}
              style={{ width: `${pct}%` }}
              title={`${i.label}: ${i.count} days (${pct}%)`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        {items.map((i) => (
          <div key={i.label} className="p-2 rounded-xl bg-slate-50 dark:bg-dark-950/60">
            <span className="text-slate-400 block text-[10px] font-medium">{i.label}</span>
            <span className={`text-base font-bold mono-number ${i.text}`}>{i.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
