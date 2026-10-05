import React, { useState, useMemo } from 'react';
import {
  Search,
  Layers,
  BookOpen,
  ListTodo,
  Trophy,
  Calendar,
  History,
  X,
  Play,
  ArrowRight,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';

export function GlobalSearchModal({ isOpen, onClose, setActivePage }) {
  const { preparations, subjects, topics, timetable, goals, sessions } = useStudy();
  const { startStudy } = useTimer();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'preparations' | 'subjects' | 'topics' | 'goals'

  // Filtered search results
  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const list = [];

    // Search Preparations
    if (filterType === 'all' || filterType === 'preparations') {
      preparations.forEach((p) => {
        if (
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.purpose && p.purpose.toLowerCase().includes(q))
        ) {
          list.push({
            type: 'Preparation',
            id: p.id,
            title: p.name,
            subtitle: p.description || p.purpose,
            status: p.status,
            priority: p.priority,
            icon: Layers,
            page: 'preparations',
          });
        }
      });
    }

    // Search Subjects
    if (filterType === 'all' || filterType === 'subjects') {
      subjects.forEach((s) => {
        if (
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.whyImportant && s.whyImportant.toLowerCase().includes(q))
        ) {
          const prep = preparations.find((p) => p.id === s.preparationId);
          list.push({
            type: 'Subject',
            id: s.id,
            title: s.name,
            subtitle: `${prep?.name ? prep.name + ' • ' : ''}${s.description || ''}`,
            status: s.status,
            priority: s.priority,
            icon: BookOpen,
            page: 'subjects',
            subjectId: s.id,
            preparationId: s.preparationId,
          });
        }
      });
    }

    // Search Topics
    if (filterType === 'all' || filterType === 'topics') {
      topics.forEach((t) => {
        if (
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
        ) {
          const sub = subjects.find((s) => s.id === t.subjectId);
          list.push({
            type: 'Topic',
            id: t.id,
            title: t.name,
            subtitle: `${sub?.name ? sub.name + ' • ' : ''}${t.description || ''}`,
            status: t.status,
            priority: t.priority,
            icon: ListTodo,
            page: 'topics',
            topicId: t.id,
            subjectId: t.subjectId,
            canStartStudy: true,
          });
        }
      });
    }

    // Search Goals
    if (filterType === 'all' || filterType === 'goals') {
      goals.forEach((g) => {
        if (g.name.toLowerCase().includes(q)) {
          list.push({
            type: 'Goal',
            id: g.id,
            title: g.name,
            subtitle: `Target: ${g.targetDate || 'No date'} • ${g.progress}% completed`,
            status: g.status,
            icon: Trophy,
            page: 'goals',
          });
        }
      });
    }

    return list.slice(0, 20);
  }, [searchQuery, filterType, preparations, subjects, topics, goals]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search preparations, subjects, topics, goals..."
            autoFocus
            className="flex-1 bg-transparent text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-50 dark:bg-dark-950 border-b border-slate-100 dark:border-slate-800 text-xs overflow-x-auto">
          {['all', 'preparations', 'subjects', 'topics', 'goals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition shrink-0 ${
                filterType === tab
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {searchQuery.trim() === '' ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              Type keywords to search across all your study materials...
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No results found for "<span className="text-slate-700 dark:text-slate-300">{searchQuery}</span>"
            </div>
          ) : (
            results.map((res) => {
              const Icon = res.icon;
              return (
                <div
                  key={`${res.type}-${res.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                  onClick={() => {
                    setActivePage(res.page);
                    onClose();
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                          {res.type}
                        </span>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {res.title}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {res.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {res.status && <StatusBadge status={res.status} size="xs" />}
                    {res.priority && <PriorityBadge priority={res.priority} />}
                    {res.canStartStudy && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startStudy({
                            subjectId: res.subjectId,
                            topicId: res.topicId,
                          });
                          setActivePage('timer');
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 shadow-xs transition"
                        title="Start Study Session"
                      >
                        <Play size={11} className="fill-white" />
                        <span>Study</span>
                      </button>
                    )}
                    <ArrowRight
                      size={16}
                      className="text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
