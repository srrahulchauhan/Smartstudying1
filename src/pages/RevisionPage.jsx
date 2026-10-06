import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  HelpCircle,
  XCircle,
  BrainCircuit,
  Calendar,
  BookOpen,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { RevisionModal } from '../components/revision/RevisionModal';
import { TopicModal } from '../components/topics/TopicModal';
import { SubjectModal } from '../components/subjects/SubjectModal';

export function RevisionPage({ setActivePage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Modal state
  const [activeModalMode, setActiveModalMode] = useState(null); // 'today', 'quick', 'practice', 'wrong', 'flashcards', 'notes', 'test'
  
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  
  const { topics } = useStudy();
  
  // Real calculation for revision progress
  const completedTopics = topics.filter(t => t.status === 'Completed' || t.status === 'Revision').length;
  const totalTopics = topics.length || 1;
  const revisionProgress = Math.round((completedTopics / totalTopics) * 100);
  
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-card p-6 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              Revision Mode
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            Revision Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review, practice, and master your topics systematically.
          </p>
        </div>

        {/* Progress & Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="w-full sm:w-48 space-y-1.5 hidden sm:block">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Overall Progress</span>
              <span>{revisionProgress}%</span>
            </div>
            <ProgressBar value={revisionProgress} max={100} showLabel={false} height="h-2.5" color="bg-gradient-to-r from-brand-500 to-indigo-500" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Plus size={14} />
              <span>Add Subject</span>
            </button>
            <button
              onClick={() => setIsTopicModalOpen(true)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Plus size={14} />
              <span>Add Revision</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics to revise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:text-slate-200 transition-shadow"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Maths">Mathematics</option>
          </select>
          <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 transition">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Revision Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Today's Revision */}
        <div 
          onClick={() => setActiveModalMode('today')}
          className="glass-card p-5 border-l-4 border-l-amber-500 hover:border-amber-500/50 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <span className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              Due Today
            </span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg relative z-10">Today's Revision</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 relative z-10">
            Topics you have manually scheduled or marked for pending revision.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform relative z-10">
            <span>View Pending</span>
            <ArrowRight size={14} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* 2. Quick Revision */}
        <div 
          onClick={() => setActiveModalMode('quick')}
          className="glass-card p-5 hover:border-brand-500/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <RotateCcw size={20} />
            </div>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg relative z-10">Quick Revision</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 relative z-10">
            Review important concepts, formulas, definitions, and key points in a flash format.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform relative z-10">
            <span>Start Review</span>
            <ArrowRight size={14} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* 3. Practice Questions */}
        <div 
          onClick={() => setActiveModalMode('practice')}
          className="glass-card p-5 hover:border-indigo-500/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg relative z-10">Practice Questions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 relative z-10">
            Topic-wise practice questions to solidify your understanding and test concepts.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform relative z-10">
            <span>Solve Now</span>
            <ArrowRight size={14} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* 4. Wrong Questions */}
        <div 
          onClick={() => setActiveModalMode('wrong')}
          className="glass-card p-5 border-l-4 border-l-rose-500 hover:border-rose-500/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle size={20} />
            </div>
            <span className="px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">
              Needs Focus
            </span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg relative z-10">Wrong Questions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 relative z-10">
            A separate list of questions you answered incorrectly. Revise to avoid repeating mistakes.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform relative z-10">
            <span>Mistakes Bank</span>
            <ArrowRight size={14} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* 5. Flashcards */}
        <div 
          onClick={() => setActiveModalMode('flashcards')}
          className="glass-card p-5 hover:border-teal-500/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <BrainCircuit size={20} />
            </div>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg relative z-10">Flashcards</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 relative z-10">
            Flip through digital flashcards for important terms, formulas, and definitions.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform relative z-10">
            <span>View Decks</span>
            <ArrowRight size={14} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* 6. My Notes */}
        <div 
          onClick={() => setActiveModalMode('notes')}
          className="glass-card p-5 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg relative z-10">My Notes</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 relative z-10">
            Access and review your important personal study notes and highlights.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform relative z-10">
            <span>Open Notebook</span>
            <ArrowRight size={14} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* 7. Test Yourself */}
        <div 
          onClick={() => setActiveModalMode('test')}
          className="glass-card p-5 hover:border-purple-500/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg relative z-10">Test Yourself</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 relative z-10">
            Quick self-test option. Test your knowledge blindly without viewing answers first.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform relative z-10">
            <span>Take a Quiz</span>
            <ArrowRight size={14} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* 8. Next Revision */}
        <div 
          onClick={() => setActivePage('timetable')}
          className="glass-card p-5 hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              Upcoming
            </span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg relative z-10">Next Revision</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 relative z-10">
            Check the schedule for when specific topics should be revised next.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform relative z-10">
            <span>View Calendar</span>
            <ArrowRight size={14} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* 9. Revision Progress */}
        <div 
          onClick={() => setActivePage('analytics')}
          className="glass-card p-5 hover:border-sky-500/30 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <span className="px-2 py-1 rounded-md bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-[10px] font-bold uppercase tracking-wider">
              Analytics
            </span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg relative z-10">Revision Progress</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 line-clamp-2 relative z-10">
            Detailed breakdown of completed vs pending revision topics and performance.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform relative z-10">
            <span>View Stats</span>
            <ArrowRight size={14} />
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
        </div>

      </div>

      <RevisionModal 
        isOpen={!!activeModalMode} 
        onClose={() => setActiveModalMode(null)} 
        mode={activeModalMode} 
        setActivePage={setActivePage}
      />

      {isTopicModalOpen && (
        <TopicModal
          isOpen={isTopicModalOpen}
          onClose={() => setIsTopicModalOpen(false)}
          defaultStatus="Revision"
        />
      )}

      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
      />
    </div>
  );
}
