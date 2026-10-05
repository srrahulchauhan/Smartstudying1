import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useStudy } from '../../context/StudyContext';
import { getTodayDateString } from '../../utils/dateUtils';

export function PreparationModal({ isOpen, onClose, initialData = null }) {
  const { addPreparation, updatePreparation } = useStudy();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    startDate: getTodayDateString(),
    targetDate: '',
    priority: 'High',
    dailyTarget: 4,
    weeklyTarget: 25,
    status: 'In Progress',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        description: '',
        purpose: '',
        startDate: getTodayDateString(),
        targetDate: '',
        priority: 'High',
        dailyTarget: 4,
        weeklyTarget: 25,
        status: 'In Progress',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Preparation Name is required';
    if (!formData.purpose.trim()) errs.purpose = 'Purpose / Why learning this is required';
    if (!formData.targetDate) errs.targetDate = 'Target end date is required';
    if (formData.targetDate && formData.startDate && formData.targetDate < formData.startDate) {
      errs.targetDate = 'Target date must be after start date';
    }
    if (Number(formData.dailyTarget) <= 0) errs.dailyTarget = 'Daily target must be greater than 0';
    if (Number(formData.weeklyTarget) <= 0) errs.weeklyTarget = 'Weekly target must be greater than 0';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialData?.id) {
      updatePreparation(initialData.id, formData);
    } else {
      addPreparation(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Preparation' : 'Create New Preparation'}
      subtitle="Organize learning tracks, government exams, full-stack stacks, or interview prep"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Preparation Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder=""
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Purpose / Why I am learning this *
          </label>
          <textarea
            rows={2}
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            placeholder=""
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
          />
          {errors.purpose && <p className="text-xs text-rose-500 mt-1">{errors.purpose}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder=""
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target End Date *
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
            {errors.targetDate && <p className="text-xs text-rose-500 mt-1">{errors.targetDate}</p>}
          </div>

          {formData.startDate && formData.targetDate && formData.targetDate >= formData.startDate && (
            <div className="sm:col-span-2 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30 px-3 py-2 rounded-lg">
              Duration: {Math.ceil((new Date(formData.targetDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24 * 7))} weeks ({Math.ceil((new Date(formData.targetDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} days)
            </div>
          )}
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
        </div>

        {/* Target Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Daily Target (Hours) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={formData.dailyTarget}
              onChange={(e) => setFormData({ ...formData, dailyTarget: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
            {errors.dailyTarget && <p className="text-xs text-rose-500 mt-1">{errors.dailyTarget}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Weekly Target (Hours) *
            </label>
            <input
              type="number"
              step="1"
              min="1"
              max="168"
              value={formData.weeklyTarget}
              onChange={(e) => setFormData({ ...formData, weeklyTarget: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
            {errors.weeklyTarget && <p className="text-xs text-rose-500 mt-1">{errors.weeklyTarget}</p>}
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
            {initialData ? 'Update Preparation' : 'Create Preparation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
