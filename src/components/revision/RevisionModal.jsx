import React, { useState } from 'react';
import { X, Play, BrainCircuit, HelpCircle, XCircle, FileText, CheckCircle2, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';

export function RevisionModal({ isOpen, onClose, mode, setActivePage }) {
  const { topics, subjects, addToast } = useStudy();
  const { startStudy } = useTimer();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);

  if (!isOpen) return null;

  // Filter topics specifically marked for revision
  const revisionTopics = topics.filter((t) => t.status === 'Revision');

  const getSubjectName = (subId) => subjects.find(s => s.id === subId)?.name || 'General';

  const handleStartTimer = (topic) => {
    startStudy({
      subjectId: topic.subjectId,
      topicId: topic.id,
      targetDurationMinutes: 25,
    });
    onClose();
    setActivePage('timer');
  };

  const renderTodayRevision = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">Topics you have manually marked for pending revision.</p>
      {revisionTopics.length === 0 ? (
        <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-dark-900 rounded-xl">No topics due for revision today!</div>
      ) : (
        <div className="space-y-3">
          {revisionTopics.slice(0, 5).map(topic => (
            <div key={topic.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-900 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-amber-500 block mb-1">{getSubjectName(topic.subjectId)}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{topic.name}</span>
              </div>
              <button 
                onClick={() => handleStartTimer(topic)}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
              >
                <Play size={12} className="fill-white" /> Revise
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFlashcards = () => {
    if (!selectedTopic) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Select a topic to view flashcards:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {revisionTopics.map(topic => (
              <button 
                key={topic.id} 
                onClick={() => setSelectedTopic(topic)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left transition-colors"
              >
                <BrainCircuit size={20} className="text-teal-500 mb-2" />
                <div className="font-semibold text-slate-800 dark:text-slate-200">{topic.name}</div>
                <div className="text-xs text-slate-500 mt-1">{getSubjectName(topic.subjectId)}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Dummy flashcard UI
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{selectedTopic.name} - Flashcards</h3>
        <div className="w-full max-w-md aspect-video bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-2xl flex items-center justify-center p-6 text-center cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors group">
          <span className="text-xl font-bold text-teal-700 dark:text-teal-300 group-hover:scale-105 transition-transform">
            What is the main concept of {selectedTopic.name}? <br/><br/>
            <span className="text-sm font-normal text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
              (Click to flip and see the answer)
            </span>
          </span>
        </div>
        <div className="flex gap-4 mt-8">
          <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300">
            <ChevronLeft size={24} />
          </button>
          <span className="py-2 text-sm font-bold text-slate-500">Card 1 of 10</span>
          <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300">
            <ChevronRight size={24} />
          </button>
        </div>
        <button onClick={() => setSelectedTopic(null)} className="mt-6 text-xs text-brand-600 hover:underline">
          Back to Topics
        </button>
      </div>
    );
  };

  const renderPracticeQuestions = () => (
    <div className="space-y-4 text-center py-10">
      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <HelpCircle size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Practice Mode</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Start a dedicated practice timer session to test your knowledge.
      </p>
      <button 
        onClick={() => {
          addToast('Starting Practice Session...', 'info');
          startStudy({
            targetDurationMinutes: 30,
          });
          onClose();
          setActivePage('timer');
        }}
        className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30"
      >
        Start Practice Timer
      </button>
    </div>
  );

  const renderWrongQuestions = () => (
    <div className="space-y-4 text-center py-10">
      <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mistakes Bank</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        You currently have 0 unresolved mistakes. Keep practicing to identify weak points!
      </p>
      <button onClick={() => onClose()} className="mt-4 px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl">
        Close
      </button>
    </div>
  );
  
  const renderMyNotes = () => {
    const notesTopics = topics.filter(t => t.description && t.description.trim() !== '');
    return (
      <div className="space-y-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Saved Notes</h3>
        </div>
        {notesTopics.length === 0 ? (
          <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-dark-900 rounded-xl">No notes found. Add descriptions to your topics to see them here!</div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {notesTopics.map((topic, i) => (
              <div key={topic.id} className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 text-left">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{topic.name} Notes</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTestYourself = () => (
    <div className="space-y-4 text-center py-10">
      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mock Test</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Simulate an exam environment with a full mock test timer.
      </p>
      <button 
        onClick={() => {
          addToast('Starting Full Mock Test Timer...', 'info');
          startStudy({
            targetDurationMinutes: 180,
          });
          onClose();
          setActivePage('timer');
        }}
        className="mt-4 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30"
      >
        Start Full Mock Test Timer
      </button>
    </div>
  );

  const renderContent = () => {
    switch (mode) {
      case 'today': return renderTodayRevision();
      case 'quick': return renderFlashcards(); // Quick revision acts like flashcards here
      case 'flashcards': return renderFlashcards();
      case 'practice': return renderPracticeQuestions();
      case 'wrong': return renderWrongQuestions();
      case 'notes': return renderMyNotes();
      case 'test': return renderTestYourself();
      default: return null;
    }
  };

  const modeTitles = {
    today: "Today's Revision",
    quick: "Quick Revision",
    flashcards: "Flashcards",
    practice: "Practice Questions",
    wrong: "Wrong Questions",
    notes: "My Notes",
    test: "Test Yourself",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-dark-900/50 shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {modeTitles[mode] || "Revision Action"}
          </h2>
          <button
            onClick={() => { setSelectedTopic(null); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
