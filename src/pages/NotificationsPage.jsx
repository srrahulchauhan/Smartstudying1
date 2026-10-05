import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  Check,
  Flame,
  Volume2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export function NotificationsPage() {
  const {
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    addNotification,
    settings,
    updateSettings,
    addToast,
  } = useStudy();

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        updateSettings({ browserNotifications: true });
        addToast('Browser notifications enabled!', 'success');
        new Notification('StudyFlow', { body: 'Notifications active! You will receive study reminders.' });
      } else {
        addToast('Notification permission denied', 'error');
      }
    } else {
      addToast('Browser notifications not supported by this browser', 'error');
    }
  };

  const triggerTestNotification = () => {
    addNotification(
      'Timetable Reminder ⏰',
      'Your React: useState study session is scheduled to start in 10 minutes.',
      'info'
    );
    addToast('Test reminder queued in notifications', 'info');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="text-brand-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Notification & Reminder Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Session reminders, streak warnings, target deadlines, and in-app alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerTestNotification}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            Send Test Alert
          </button>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition flex items-center gap-1"
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Browser Permission Banner */}
      {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
        <div className="p-4 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500 text-white shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-900 dark:text-brand-200">
                Enable Browser Push Notifications
              </h4>
              <p className="text-xs text-brand-700 dark:text-brand-400">
                Get notified when your scheduled study sessions begin, or when your streak is at risk.
              </p>
            </div>
          </div>

          <button
            onClick={requestBrowserPermission}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shrink-0 shadow-xs transition"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Notification List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-sm">
            You're all caught up! No notifications right now.
          </div>
        ) : (
          notifications.map((notif) => {
            let icon = <Info size={18} className="text-sky-500" />;
            if (notif.type === 'success') icon = <CheckCircle2 size={18} className="text-emerald-500" />;
            if (notif.type === 'warning') icon = <AlertTriangle size={18} className="text-amber-500" />;

            return (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`glass-card p-4 flex items-start justify-between gap-4 transition cursor-pointer ${
                  !notif.read
                    ? 'border-brand-500/50 bg-brand-50/20 dark:bg-brand-950/20'
                    : 'opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(notif.id);
                    }}
                    className="p-1 text-xs text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition shrink-0"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
