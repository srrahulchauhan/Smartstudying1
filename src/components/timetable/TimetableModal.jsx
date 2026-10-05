import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useStudy } from '../../context/StudyContext';
import { DAYS_OF_WEEK } from '../../utils/dateUtils';

export function TimetableModal({ isOpen, onClose, initialData = null, defaultDay = 'Monday' }) {
  const { preparations, subjects, topics, activePrepId, addTimetableSlot, updateTimetableSlot } = useStudy();

  const [formData, setFormData] = useState({
    day: defaultDay,
    startTime: '19:00',
    endTime: '20:00',
    preparationId: activePrepId || '',
    subjectId: '',
    topicId: '',
    targetDuration: 60,
    repeat: true,
    priority: 'High',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const prepId = activePrepId || (preparations[0]?.id || '');
      const filteredSubs = subjects.filter((s) => s.preparationId === prepId);
      const subId = filteredSubs[0]?.id || '';
      const filteredTops = topics.filter((t) => t.subjectId === subId);
      const topId = filteredTops[0]?.id || '';

      setFormData({
        day: defaultDay,
        startTime: '19:00',
        endTime: '20:00',
        preparationId: prepId,
        subjectId: subId,
        topicId: topId,
        targetDuration: 60,
        repeat: true,
        priority: 'High',
      });
    }
    setErrors({});
  }, [initialData, defaultDay, activePrepId, preparations, subjects, topics, isOpen]);

  // When prep changes, update subjects list
  const availableSubjects = subjects.filter((s) => s.preparationId === formData.preparationId);
  const availableTopics = topics.filter((t) => t.subjectId === formData.subjectId);

  const validate = () => {
    const errs = {};
    if (!formData.day) errs.day = 'Day is required';
    if (!formData.startTime) errs.startTime = 'Start time is required';
    if (!formData.endTime) errs.endTime = 'End time is required';
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      errs.endTime = 'End time must be after start time';
    }
    if (Number(formData.targetDuration) <= 0) errs.targetDuration = 'Target duration must be > 0';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialData?.id) {
      updateTimetableSlot(initialData.id, formData);
    } else {
      addTimetableSlot(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Timetable Slot' : 'Schedule Study Slot'}
      subtitle="Plan regular time blocks for maximum consistency"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Day of Week */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Day of Week *
          </label>
          <select
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.day && <p className="text-xs text-rose-500 mt-1">{errors.day}</p>}
        </div>

        {/* Start Time & End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Start Time *
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => {
                const newStartTime = e.target.value;
                let newDuration = formData.targetDuration;
                if (newStartTime && formData.endTime) {
                  const [sH, sM] = newStartTime.split(':').map(Number);
                  const [eH, eM] = formData.endTime.split(':').map(Number);
                  let diff = (eH * 60 + eM) - (sH * 60 + sM);
                  if (diff < 0) diff += 24 * 60;
                  if (diff > 0) newDuration = diff;
                }
                setFormData({ ...formData, startTime: newStartTime, targetDuration: newDuration });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
            {errors.startTime && <p className="text-xs text-rose-500 mt-1">{errors.startTime}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              End Time *
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => {
                const newEndTime = e.target.value;
                let newDuration = formData.targetDuration;
                if (formData.startTime && newEndTime) {
                  const [sH, sM] = formData.startTime.split(':').map(Number);
                  const [eH, eM] = newEndTime.split(':').map(Number);
                  let diff = (eH * 60 + eM) - (sH * 60 + sM);
                  if (diff < 0) diff += 24 * 60;
                  if (diff > 0) newDuration = diff;
                }
                setFormData({ ...formData, endTime: newEndTime, targetDuration: newDuration });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
            {errors.endTime && <p className="text-xs text-rose-500 mt-1">{errors.endTime}</p>}
          </div>
        </div>

        {/* Preparation & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Preparation
            </label>
            <select
              value={formData.preparationId}
              onChange={(e) => {
                const prepId = e.target.value;
                const subs = subjects.filter((s) => s.preparationId === prepId);
                setFormData({
                  ...formData,
                  preparationId: prepId,
                  subjectId: subs[0]?.id || '',
                  topicId: '',
                });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            >
              {preparations.length === 0 ? (
                <option value="">General Plan</option>
              ) : (
                preparations.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Subject (Optional)
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => {
                const subId = e.target.value;
                const tops = topics.filter((t) => t.subjectId === subId);
                setFormData({
                  ...formData,
                  subjectId: subId,
                  topicId: tops[0]?.id || '',
                });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            >
              <option value="">General Study (No Subject)</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.subjectId && <p className="text-xs text-rose-500 mt-1">{errors.subjectId}</p>}
          </div>
        </div>

        {/* Topic & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Topic (Optional)
            </label>
            <select
              value={formData.topicId || ''}
              onChange={(e) => setFormData({ ...formData, topicId: e.target.value || null })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            >
              <option value="">Open / General Subject Study</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Target Duration & Repeat checkbox */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Duration (Hours) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0.25"
              value={formData.targetDuration ? formData.targetDuration / 60 : ''}
              onChange={(e) => setFormData({ ...formData, targetDuration: parseFloat(e.target.value) * 60 || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
            {errors.targetDuration && <p className="text-xs text-rose-500 mt-1">{errors.targetDuration}</p>}
          </div>

          <div className="pt-5">
            <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.repeat}
                onChange={(e) => setFormData({ ...formData, repeat: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
              <span>Repeat weekly on {formData.day}</span>
            </label>
          </div>
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
            {initialData ? 'Update Slot' : 'Schedule Slot'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
