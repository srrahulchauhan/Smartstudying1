import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { StudyProvider } from './context/StudyContext';
import { TimerProvider } from './context/TimerContext';

// Layout components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { QuickActionModal } from './components/layout/QuickActionModal';
import { ToastContainer } from './components/common/ToastContainer';

// Entity Creation Modals
import { PreparationModal } from './components/preparations/PreparationModal';
import { SubjectModal } from './components/subjects/SubjectModal';
import { TopicModal } from './components/topics/TopicModal';
import { TimetableModal } from './components/timetable/TimetableModal';
import { TomorrowTargetModal } from './components/targets/TargetModal';
import { GoalModal } from './components/goals/GoalModal';

// Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PreparationsPage = lazy(() => import('./pages/PreparationsPage').then(m => ({ default: m.PreparationsPage })));
const SubjectsPage = lazy(() => import('./pages/SubjectsPage').then(m => ({ default: m.SubjectsPage })));
const TopicsPage = lazy(() => import('./pages/TopicsPage').then(m => ({ default: m.TopicsPage })));
const RevisionPage = lazy(() => import('./pages/RevisionPage').then(m => ({ default: m.RevisionPage })));
const VideoCoursePage = lazy(() => import('./pages/VideoCoursePage').then(m => ({ default: m.VideoCoursePage })));
const StudyTimerPage = lazy(() => import('./pages/StudyTimerPage').then(m => ({ default: m.StudyTimerPage })));
const TimetablePage = lazy(() => import('./pages/TimetablePage').then(m => ({ default: m.TimetablePage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const AttendancePage = lazy(() => import('./pages/AttendancePage').then(m => ({ default: m.AttendancePage })));
const TargetsPage = lazy(() => import('./pages/TargetsPage').then(m => ({ default: m.TargetsPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then(m => ({ default: m.GoalsPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const FocusModePage = lazy(() => import('./pages/FocusModePage').then(m => ({ default: m.FocusModePage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ExportBackupPage = lazy(() => import('./pages/ExportBackupPage').then(m => ({ default: m.ExportBackupPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Direct entity creation modals
  const [isNewPrepOpen, setIsNewPrepOpen] = useState(false);
  const [isNewSubjectOpen, setIsNewSubjectOpen] = useState(false);
  const [isNewTopicOpen, setIsNewTopicOpen] = useState(false);
  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false);
  const [isTomorrowTargetOpen, setIsTomorrowTargetOpen] = useState(false);
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);

  // Selected subject filter to pass into Topics page
  const [selectedSubjectIdForTopics, setSelectedSubjectIdForTopics] = useState(null);

  // Keyboard shortcut Ctrl/Cmd + K for Global Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickActionSelect = (actionId) => {
    if (actionId === 'new-prep') setIsNewPrepOpen(true);
    else if (actionId === 'new-subject') setIsNewSubjectOpen(true);
    else if (actionId === 'new-topic' || actionId === 'add-video') setIsNewTopicOpen(true);
    else if (actionId === 'start-study') setActivePage('timer');
    else if (actionId === 'schedule-study') setIsNewScheduleOpen(true);
    else if (actionId === 'add-target') setIsTomorrowTargetOpen(true);
    else if (actionId === 'add-goal') setIsNewGoalOpen(true);
  };

  // If in distraction-free Focus Mode, render it standalone
  if (activePage === 'focus') {
    return (
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-dark-950"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <FocusModePage setActivePage={setActivePage} />
        <ToastContainer />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Mobile Drawer & Bottom Navigation */}
      <MobileNav
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          setActivePage={setActivePage}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12">
          <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <div className="max-w-7xl mx-auto">
              {activePage === 'dashboard' && (
              <DashboardPage
                setActivePage={setActivePage}
                onOpenQuickAction={() => setIsQuickActionOpen(true)}
                onOpenNewPrep={() => setIsNewPrepOpen(true)}
                onOpenNewSubject={() => setIsNewSubjectOpen(true)}
                onOpenNewTopic={() => setIsNewTopicOpen(true)}
                onOpenSchedule={() => setIsNewScheduleOpen(true)}
                onOpenTomorrowTarget={() => setIsTomorrowTargetOpen(true)}
                onOpenNewGoal={() => setIsNewGoalOpen(true)}
              />
            )}

            {activePage === 'preparations' && (
              <PreparationsPage setActivePage={setActivePage} />
            )}

            {activePage === 'subjects' && (
              <SubjectsPage
                setActivePage={setActivePage}
                setSelectedSubjectId={setSelectedSubjectIdForTopics}
              />
            )}

            {activePage === 'topics' && (
              <TopicsPage
                setActivePage={setActivePage}
                selectedSubjectId={selectedSubjectIdForTopics}
              />
            )}

            {activePage === 'revision' && (
              <RevisionPage setActivePage={setActivePage} />
            )}

            {activePage === 'videos' && (
              <VideoCoursePage setActivePage={setActivePage} />
            )}

            {activePage === 'timer' && (
              <StudyTimerPage setActivePage={setActivePage} />
            )}

            {activePage === 'timetable' && (
              <TimetablePage setActivePage={setActivePage} />
            )}

            {activePage === 'calendar' && <CalendarPage />}

            {activePage === 'attendance' && <AttendancePage />}

            {activePage === 'targets' && <TargetsPage />}

            {activePage === 'goals' && <GoalsPage />}

            {activePage === 'history' && <HistoryPage />}

            {activePage === 'analytics' && <AnalyticsPage />}

            {activePage === 'notifications' && <NotificationsPage />}

            {activePage === 'export-backup' && <ExportBackupPage />}

            {activePage === 'settings' && <SettingsPage />}
            </div>
          </Suspense>
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActivePage={setActivePage}
      />

      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onAction={handleQuickActionSelect}
      />

      <PreparationModal
        isOpen={isNewPrepOpen}
        onClose={() => setIsNewPrepOpen(false)}
      />

      <SubjectModal
        isOpen={isNewSubjectOpen}
        onClose={() => setIsNewSubjectOpen(false)}
      />

      <TopicModal
        isOpen={isNewTopicOpen}
        onClose={() => setIsNewTopicOpen(false)}
      />

      <TimetableModal
        isOpen={isNewScheduleOpen}
        onClose={() => setIsNewScheduleOpen(false)}
      />

      <TomorrowTargetModal
        isOpen={isTomorrowTargetOpen}
        onClose={() => setIsTomorrowTargetOpen(false)}
      />

      <GoalModal
        isOpen={isNewGoalOpen}
        onClose={() => setIsNewGoalOpen(false)}
      />


      {/* Global In-App Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
        <StudyProvider>
          <TimerProvider>
            <AppContent />
          </TimerProvider>
        </StudyProvider>
    </ThemeProvider>
  );
}
