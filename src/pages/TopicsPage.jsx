import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Search,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Square,
  BookOpen,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { TopicModal } from '../components/topics/TopicModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatFriendlyDate, getTodayDateString, formatTimeString } from '../utils/dateUtils';
import { formatMinutesToShort } from '../utils/timerUtils';

export function TopicsPage({ setActivePage, selectedSubjectId = null }) {
  const {
    topics,
    subjects,
    preparations,
    setTopicStatus,
    deleteTopic,
    addSession,
    settings,
  } = useStudy();

  const {
    session,
    isRunning,
    isPaused,
    startStudy,
    pauseStudy,
    resumeStudy,
    stopSession,
    completeTopicAndStop,
  } = useTimer();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState(selectedSubjectId || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Filter topics
  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = subjectFilter === 'all' || t.subjectId === subjectFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="text-brand-500" size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Topic Management & Study Controls
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Every topic has direct study, pause, resume, and completion controls.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTopic(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={16} />
          <span>Add Topic</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-900 dark:text-white outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 font-semibold outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['all', 'Pending', 'In Progress', 'Completed', 'Skipped'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition shrink-0 ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topics List Table / Cards */}
      <div className="space-y-3">
        {filteredTopics.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-sm">
            No topics match your filters. Click "+ Add Topic" to create one.
          </div>
        ) : (
          filteredTopics.map((top) => {
            const sub = subjects.find((s) => s.id === top.subjectId);
            const prep = preparations.find((p) => p.id === sub?.preparationId);
            const isTopicRunning = session?.topicId === top.id && isRunning;
            const isTopicPaused = session?.topicId === top.id && isPaused;

            return (
              <div
                key={top.id}
                className={`glass-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${
                  isTopicRunning
                    ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Left details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 mt-1.5 shadow-xs"
                    style={{ backgroundColor: sub?.color || '#6366f1' }}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {sub?.name || 'Subject'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <StatusBadge status={top.status} size="xs" />
                      <PriorityBadge priority={top.priority} />
                      {isTopicRunning && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse">
                          Active Session
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {top.name}
                    </h3>
                    {top.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {top.description}
                      </p>
                    )}

                    {top.videoLinks && top.videoLinks.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <span>🎥 Video Links</span>
                        </div>
                        {top.videoLinks.map((link, idx) => (
                          <a key={idx} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline">
                            <span className="text-[10px] opacity-70">▶</span>
                            <span className="truncate max-w-[200px] sm:max-w-[300px]">{link}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Est: {formatMinutesToShort(top.estimatedStudyTime)}</span>
                      </div>
                      {top.targetDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Target: {formatFriendlyDate(top.targetDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Direct Study Controls (START, PAUSE, RESUME, STOP, COMPLETE) */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* START STUDY */}
                  {!isTopicRunning && !isTopicPaused && (
                    <button
                      onClick={() => {
                        startStudy({
                          preparationId: sub?.preparationId,
                          subjectId: sub?.id,
                          topicId: top.id,
                        });
                        setActivePage('timer');
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs transition"
                      title="START STUDY"
                    >
                      <Play size={13} className="fill-white" />
                      <span>START STUDY</span>
                    </button>
                  )}

                  {/* PAUSE */}
                  {isTopicRunning && (
                    <button
                      onClick={pauseStudy}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1 shadow-xs transition"
                      title="PAUSE"
                    >
                      <Pause size={13} />
                      <span>PAUSE</span>
                    </button>
                  )}

                  {/* RESUME */}
                  {isTopicPaused && (
                    <button
                      onClick={resumeStudy}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs transition"
                      title="RESUME"
                    >
                      <Play size={13} className="fill-white" />
                      <span>RESUME</span>
                    </button>
                  )}

                  {/* STOP */}
                  {(isTopicRunning || isTopicPaused) && (
                    <button
                      onClick={() => stopSession()}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 shadow-xs transition"
                      title="STOP"
                    >
                      <Square size={13} />
                      <span>STOP</span>
                    </button>
                  )}

                  {/* COMPLETE */}
                  {top.status !== 'Completed' ? (
                    <button
                      onClick={() => {
                        if (session?.topicId === top.id) {
                          completeTopicAndStop();
                        } else {
                          setTopicStatus(top.id, 'Completed');
                          const studyMinutes = top.estimatedStudyTime || 0;
                          if (studyMinutes > 0) {
                            const now = new Date();
                            const startTime = new Date(now.getTime() - studyMinutes * 60 * 1000);
                            addSession({
                              date: getTodayDateString(),
                              preparationId: sub?.preparationId,
                              subjectId: top.subjectId,
                              topicId: top.id,
                              startTime: formatTimeString(startTime.toTimeString().slice(0, 5), settings?.timeFormat !== '24h'),
                              endTime: formatTimeString(now.toTimeString().slice(0, 5), settings?.timeFormat !== '24h'),
                              totalDuration: studyMinutes * 60,
                              breakDuration: 0,
                              actualStudyDuration: studyMinutes * 60,
                              breaks: [],
                              status: 'Completed',
                              notes: 'Directly marked as completed',
                            });
                          }
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-300 flex items-center gap-1 transition"
                      title="Mark Topic as Completed"
                    >
                      <CheckCircle size={13} />
                      <span>COMPLETE</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setTopicStatus(top.id, 'In Progress')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Reopen topic"
                    >
                      Reopen
                    </button>
                  )}

                  {/* Edit / Delete */}
                  <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setEditingTopic(top);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Topic"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(top.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                      title="Delete Topic"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Topic Create/Edit Modal */}
      <TopicModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTopic(null);
        }}
        initialData={editingTopic}
        defaultSubjectId={subjectFilter !== 'all' ? subjectFilter : null}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteTopic(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Topic?"
        message="Are you sure you want to remove this topic?"
        confirmText="Yes, Delete"
        isDestructive={true}
      />
    </div>
  );
}
