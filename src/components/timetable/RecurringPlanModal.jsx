import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useStudy } from '../../context/StudyContext';
import { DAYS_OF_WEEK } from '../../utils/dateUtils';

export function RecurringPlanModal({ isOpen, onClose }) {
  const { preparations, subjects, topics, activePrepId, addRecurringPlan } = useStudy();

  const [preparationId, setPreparationId] = useState(activePrepId || '');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:15');
  const [targetDuration, setTargetDuration] = useState(75);
  const [priority, setPriority] = useState('High');

  // Days selection
  const [presetDays, setPresetDays] = useState('7'); // '1' | '3' | '7' | '15' | '30' | 'custom'
  const [selectedDays, setSelectedDays] = useState([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);

  const [errors, setErrors] = useState({});

  const availableSubjects = subjects.filter((s) => s.preparationId === preparationId);
  const availableTopics = topics.filter((t) => t.subjectId === subjectId);

  const handlePresetSelect = (preset) => {
    setPresetDays(preset);
    if (preset === '1') {
      setSelectedDays(['Monday']);
    } else if (preset === '3') {
      setSelectedDays(['Monday', 'Wednesday', 'Friday']);
    } else if (preset === '7') {
      setSelectedDays([...DAYS_OF_WEEK]);
    } else if (preset === '15' || preset === '30') {
      setSelectedDays([...DAYS_OF_WEEK]);
    }
  };

  const toggleDay = (day) => {
    setPresetDays('custom');
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (selectedDays.length === 0) errs.days = 'Select at least one day';
    if (!startTime || !endTime) errs.time = 'Time is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    addRecurringPlan({
      preparationId,
      subjectId,
      topicId: topicId || null,
      daysList: selectedDays,
      startTime,
      endTime,
      targetDuration,
      priority,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Recurring Study Plan"
      subtitle="Continue a subject or topic consistently across multiple days"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject & Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Subject (Optional)
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId('');
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Topic (Optional)
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            >
              <option value="">Whole Subject / Continuous</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Multi-Day Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Duration Cadence
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: '1', label: '1 Day' },
              { id: '3', label: '3 Days (Alt)' },
              { id: '7', label: '7 Days (All Week)' },
              { id: '15', label: '15 Days Plan' },
              { id: '30', label: '30 Days Sprint' },
              { id: 'custom', label: 'Custom Days' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  presetDays === p.id
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Days of Week Checkboxes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Active Scheduled Days ({selectedDays.length} selected) *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 dark:border-brand-600/50'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {errors.days && <p className="text-xs text-rose-500 mt-1">{errors.days}</p>}
        </div>

        {/* Time Slot & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                const newStartTime = e.target.value;
                setStartTime(newStartTime);
                if (newStartTime && endTime) {
                  const [sH, sM] = newStartTime.split(':').map(Number);
                  const [eH, eM] = endTime.split(':').map(Number);
                  let diff = (eH * 60 + eM) - (sH * 60 + sM);
                  if (diff < 0) diff += 24 * 60;
                  if (diff > 0) setTargetDuration(diff);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => {
                const newEndTime = e.target.value;
                setEndTime(newEndTime);
                if (startTime && newEndTime) {
                  const [sH, sM] = startTime.split(':').map(Number);
                  const [eH, eM] = newEndTime.split(':').map(Number);
                  let diff = (eH * 60 + eM) - (sH * 60 + sM);
                  if (diff < 0) diff += 24 * 60;
                  if (diff > 0) setTargetDuration(diff);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Duration (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.25"
              value={targetDuration ? targetDuration / 60 : ''}
              onChange={(e) => setTargetDuration(parseFloat(e.target.value) * 60 || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
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
            Generate Recurring Schedule
          </button>
        </div>
      </form>
    </Modal>
  );
}
