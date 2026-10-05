import React from 'react';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  ListTodo,
  Timer,
  CalendarDays,
  Calendar,
  UserCheck,
  Target,
  Trophy,
  History,
  BarChart3,
  Maximize2,
  Bell,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Video,
  RotateCcw,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';
import { calculateStudyStreaks } from '../../utils/dateUtils';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'preparations', label: 'My Preparations', icon: Layers },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'topics', label: 'Topics', icon: ListTodo },
  { id: 'revision', label: 'Revision Hub', icon: RotateCcw },
  { id: 'videos', label: 'Video Course', icon: Video },
  { id: 'timer', label: 'Study Timer', icon: Timer, hasLiveBadge: true },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
  { id: 'targets', label: 'Targets', icon: Target },
  { id: 'goals', label: 'Goals', icon: Trophy },
  { id: 'history', label: 'Study History', icon: History },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'focus', label: 'Focus Mode', icon: Maximize2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'export-backup', label: 'Export / Backup', icon: FileSpreadsheet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activePage, setActivePage, isCollapsed, setIsCollapsed }) {
  const { activePreparation, notifications, sessions, settings } = useStudy();
  const { isRunning, isBreak, formattedNetStudyTime } = useTimer();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const streaks = calculateStudyStreaks(sessions, settings?.minAttendanceMinutes || 30);

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActivePage('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
            <Timer size={22} className="animate-pulse" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                StudyFlow
              </span>
              <span className="block text-[10px] text-brand-600 dark:text-brand-400 font-semibold tracking-wider uppercase">
                Smart Tracker
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Streak & Active Prep Snippet */}
      {!isCollapsed && (
        <div className="p-4 mx-3 my-2 rounded-xl bg-slate-50 dark:bg-dark-950/60 border border-slate-200/70 dark:border-slate-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Study Streak</span>
            <div className="flex items-center gap-1 font-bold text-amber-500 dark:text-amber-400">
              <Flame size={14} className="fill-amber-500" />
              <span>{streaks.currentStreak} Days</span>
            </div>
          </div>
          {activePreparation && (
            <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/60 text-xs truncate">
              <span className="text-[11px] text-slate-400 block font-medium">Active Prep:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                {activePreparation.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const isTimerActive = item.hasLiveBadge && (isRunning || isBreak);

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="relative shrink-0">
                <Icon
                  size={19}
                  className={`${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                {/* Live timer pulsing dot */}
                {isTimerActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-dark-900 animate-ping" />
                )}
              </div>

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {/* Notification badge */}
              {!isCollapsed && item.id === 'notifications' && unreadNotifs > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                  {unreadNotifs}
                </span>
              )}

              {/* Active timer badge */}
              {!isCollapsed && isTimerActive && (
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {formattedNetStudyTime}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          StudyFlow v1.0 • Plan & Master
        </div>
      )}
    </aside>
  );
}
