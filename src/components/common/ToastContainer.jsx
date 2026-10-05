import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useStudy();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info size={18} className="text-sky-500" />;
        let borderCls = 'border-sky-500/30 bg-white/95 dark:bg-dark-900/95';

        if (toast.type === 'success') {
          icon = <CheckCircle2 size={18} className="text-emerald-500" />;
          borderCls = 'border-emerald-500/30 bg-white/95 dark:bg-dark-900/95';
        } else if (toast.type === 'error') {
          icon = <AlertCircle size={18} className="text-rose-500" />;
          borderCls = 'border-rose-500/30 bg-white/95 dark:bg-dark-900/95';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all transform animate-slide-in ${borderCls}`}
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0">{icon}</div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
