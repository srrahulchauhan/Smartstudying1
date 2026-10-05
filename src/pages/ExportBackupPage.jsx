import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileJson,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { useAuth } from '../context/AuthContext';
import { exportStudyDataToExcel } from '../utils/exportExcel';
import { exportAllDataAsJSON, importAllDataFromJSON } from '../utils/storage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function ExportBackupPage() {
  const {
    preparations,
    subjects,
    topics,
    timetable,
    sessions,
    attendance,
    targets,
    goals,
    settings,
    clearAllData,
    resetToSampleData,
    addToast,
  } = useStudy();
  const { resetTimer } = useTimer();
  const { currentUser } = useAuth();

  const [excelFilter, setExcelFilter] = useState('all'); // 'all' | 'current_month' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isClearDataConfirmOpen, setIsClearDataConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handleExportExcel = () => {
    try {
      exportStudyDataToExcel({
        preparations,
        subjects,
        topics,
        timetable,
        sessions,
        attendance,
        targets,
        goals,
        filterMode: excelFilter,
        startDate,
        endDate,
      });
      addToast('Excel workbook with 10 worksheets downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export Excel file', 'error');
    }
  };

  const handleExportJSON = () => {
    try {
      const jsonStr = exportAllDataAsJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StudyFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('JSON backup file generated and downloaded', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export JSON backup', 'error');
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = importAllDataFromJSON(content);
        if (res.success) {
          addToast('Backup restored successfully! Refreshing view...', 'success');
          setTimeout(() => window.location.reload(), 800);
        } else {
          addToast(`Failed to restore: ${res.message}`, 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Excel Export & Data Backup
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Export full multi-sheet Excel workbooks or backup/restore entire study workspaces via JSON.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 24: EXCEL EXPORT */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <FileSpreadsheet className="text-emerald-500" size={18} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Export to Multi-Sheet Excel (.xlsx)
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Generates a clean, professional workbook containing <strong>10 distinct sheets</strong>:
            </p>

            {/* 10 sheets checklist */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-dark-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {[
                '1. Study Sessions',
                '2. Attendance',
                '3. Subjects',
                '4. Topics',
                '5. Timetable',
                '6. Daily Targets',
                '7. Weekly Targets',
                '8. Monthly Targets',
                '9. Break History',
                '10. Goals',
              ].map((sheet) => (
                <div key={sheet} className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                  <span>{sheet}</span>
                </div>
              ))}
            </div>

            {/* Filter selection */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Export Filter Mode
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'All Data' },
                  { id: 'current_month', label: 'Current Month' },
                  { id: 'custom', label: 'Custom Range' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setExcelFilter(m.id)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                      excelFilter === m.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {excelFilter === 'custom' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleExportExcel}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition transform active:scale-98"
          >
            <Download size={16} />
            <span>Generate & Download Excel Workbook</span>
          </button>
        </div>

        {/* Section 25: JSON BACKUP & RESTORE */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <FileJson className="text-brand-500" size={18} />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                JSON Workspace Backup & Restore
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Export all local state, preparations, topics, settings, and logs to a portable JSON backup. Transfer between devices or restore anytime.
            </p>

            <div className="space-y-4 mb-6">
              {/* Export JSON Button */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-dark-950/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Export JSON Backup
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Download complete snapshot of your data
                  </p>
                </div>
                <button
                  onClick={handleExportJSON}
                  className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>

              {/* Import JSON Button */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-dark-950/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Restore from JSON Backup
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Load previously saved .json file
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Upload size={14} />
                  <span>Restore File</span>
                </button>
              </div>

              {/* Option 1: Clear All Data (Fresh Start) */}
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>Clear All Data (Fresh Start)</span>
                  </h4>
                  <p className="text-[11px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">
                    Wipes all subjects, topics, logs, and attendance for a 100% clean 0-data start
                  </p>
                </div>
                <button
                  onClick={() => setIsClearDataConfirmOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0 active:scale-98"
                >
                  <Trash2 size={14} />
                  <span>Clear All Data</span>
                </button>
              </div>

              {/* Option 2: Reset to Demo Sample Data */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950/50 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <RotateCcw size={14} />
                    <span>Reset to Demo Sample Data</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Reloads rich initial MERN & Govt exam seed data
                  </p>
                </div>
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition shrink-0 active:scale-98"
                >
                  <RotateCcw size={14} />
                  <span>Restore Demo</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 text-center text-[11px] text-slate-400">
            Local data is persistently stored in your browser's LocalStorage.
          </div>
        </div>
      </div>

      {/* Clear All Data (Fresh Start) Confirmation */}
      <ConfirmDialog
        isOpen={isClearDataConfirmOpen}
        onClose={() => setIsClearDataConfirmOpen(false)}
        onConfirm={() => {
          resetTimer();
          clearAllData();
          setIsClearDataConfirmOpen(false);
        }}
        title="Clear All Data & Start Fresh?"
        message="Are you sure you want to clear all data? This will permanently wipe all study sessions, subjects, topics, timetable, and attendance records, giving you a 100% clean, fresh workspace."
        confirmText="Yes, Clear All Data"
        isDestructive={true}
      />

      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetTimer();
          resetToSampleData();
          setIsResetConfirmOpen(false);
        }}
        title="Reset to Factory Sample Data?"
        message="This will reset all preparations, subjects, topics, timetable, and study logs back to the default initial sample dataset."
        confirmText="Yes, Reset to Sample Data"
        isDestructive={false}
      />
    </div>
  );
}
