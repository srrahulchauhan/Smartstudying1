import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useStudy } from '../../context/StudyContext';

export function GoalModal({ isOpen, onClose, initialData = null }) {
  const { preparations, activePrepId, addGoal, updateGoal } = useStudy();

  const [formData, setFormData] = useState({
    name: '',
    preparationId: activePrepId || '',
    targetDate: '',
    targetHours: 100,
    progress: 0,
    status: 'In Progress',
    milestones: [],
  });

  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        preparationId: activePrepId || '',
        targetDate: '',
        targetHours: 100,
        progress: 0,
        status: 'In Progress',
        milestones: [],
      });
    }
    setErrors({});
  }, [initialData, activePrepId, isOpen]);

  const addMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { id: `m-${Date.now()}`, title: newMilestoneText.trim(), completed: false },
      ],
    }));
    setNewMilestoneText('');
  };

  const removeMilestone = (id) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Goal Name is required';
    if (!formData.targetDate) errs.targetDate = 'Target completion date is required';
    if (Number(formData.targetHours) <= 0) errs.targetHours = 'Target study hours must be > 0';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialData?.id) {
      updateGoal(initialData.id, formData);
    } else {
      addGoal(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Learning Goal' : 'Create New Learning Goal'}
      subtitle="Track major achievements, exams, and target study hours"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Goal Name *
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

        {/* Associated Prep */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Preparation (Optional)
          </label>
          <select
            value={formData.preparationId || ''}
            onChange={(e) => setFormData({ ...formData, preparationId: e.target.value || null })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
          >
            <option value="">General Goal (All Preparations)</option>
            {preparations.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Target Date & Target Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Date *
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
            {errors.targetDate && <p className="text-xs text-rose-500 mt-1">{errors.targetDate}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Study Hours *
            </label>
            <input
              type="number"
              min="1"
              value={formData.targetHours}
              onChange={(e) => setFormData({ ...formData, targetHours: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
            {errors.targetHours && <p className="text-xs text-rose-500 mt-1">{errors.targetHours}</p>}
          </div>
        </div>

        {/* Milestones Checklist */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Milestones & Checkpoints
          </label>
          <div className="space-y-2 mb-3">
            {formData.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-slate-800"
              >
                <span className="text-sm text-slate-800 dark:text-slate-200">{m.title}</span>
                <button
                  type="button"
                  onClick={() => removeMilestone(m.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMilestoneText}
              onChange={(e) => setNewMilestoneText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMilestone();
                }
              }}
              placeholder=""
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-950 text-sm text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            />
            <button
              type="button"
              onClick={addMilestone}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
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
            {initialData ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
