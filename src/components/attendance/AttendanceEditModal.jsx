import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useStudy } from '../../context/StudyContext';
import { ATTENDANCE_STATUS } from '../../utils/attendanceLogic';
import { formatFriendlyDate } from '../../utils/dateUtils';

export function AttendanceEditModal({ isOpen, onClose, dateStr, existingRecord }) {
  const { markAttendanceManual } = useStudy();

  const [status, setStatus] = useState(ATTENDANCE_STATUS.PRESENT);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingRecord) {
      setStatus(existingRecord.status);
      setNotes(existingRecord.notes || '');
    } else {
      setStatus(ATTENDANCE_STATUS.PRESENT);
      setNotes('');
    }
  }, [existingRecord, dateStr, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dateStr) return;
    markAttendanceManual({
      date: dateStr,
      status,
      notes,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Day Attendance"
      subtitle={`Set attendance status for ${formatFriendlyDate(dateStr)}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status choices */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Attendance Status *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: ATTENDANCE_STATUS.PRESENT, label: 'Present', color: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
              { id: ATTENDANCE_STATUS.ABSENT, label: 'Absent', color: 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
              { id: ATTENDANCE_STATUS.PARTIAL, label: 'Partial', color: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
              { id: ATTENDANCE_STATUS.HOLIDAY, label: 'Holiday', color: 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatus(opt.id)}
                className={`p-2.5 rounded-xl text-sm font-semibold border text-center transition ${
                  status === opt.id
                    ? `${opt.color} shadow-xs ring-1 ring-offset-1`
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Existing study duration info */}
        {existingRecord?.studyMinutes > 0 && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs text-slate-600 dark:text-slate-400">
            Recorded study time on this day: <strong>{existingRecord.studyMinutes} minutes</strong>
          </div>
        )}

        {/* Reason / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Notes / Reason for Override
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder=""
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
          >
            Save Attendance
          </button>
        </div>
      </form>
    </Modal>
  );
}
