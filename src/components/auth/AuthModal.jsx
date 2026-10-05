import React, { useState } from 'react';
import { X, User, Mail, Sparkles, Smartphone, Laptop, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';

const AVATAR_OPTIONS = ['👨‍💻', '👩‍💻', '🎓', '📚', '🚀', '💡', '⚡', '🏆', '🎯', '🔥'];

export function AuthModal() {
  const { currentUser, isAuthModalOpen, setIsAuthModalOpen, login, logout, updateProfile } = useAuth();
  const { addToast } = useStudy();

  const [email, setEmail] = useState(currentUser?.email || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '🎓');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your email', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, name);
      updateProfile({ avatar });
      addToast(`Logged in as ${name || email}! Fetching your cloud study records...`, 'success');
      setIsAuthModalOpen(false);
      // Brief reload to hydrate context cleanly
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      addToast('Failed to switch user account', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Switched to Guest session', 'info');
    setIsAuthModalOpen(false);
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-dark-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
              <User size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Account & Multi-Device Sync
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Log in to sync seamlessly between your Laptop & Mobile
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Choose Profile Avatar
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`text-xl p-2 rounded-xl transition ${
                    avatar === av
                      ? 'bg-brand-100 dark:bg-brand-950/80 ring-2 ring-brand-500 scale-105'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-950 text-xs text-slate-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-950 text-xs text-slate-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Enter your email to personalize your study profile.
            </p>
          </div>

          {/* Cross Device Hint */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              <Laptop size={16} />
              <span>↔</span>
              <Smartphone size={16} />
            </div>
            <span className="text-[11px]">
              Every session, topic, and timetable entry is saved with this profile locally on your device.
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Syncing Account...' : 'Save & Sync Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
