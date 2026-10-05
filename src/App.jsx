import React, { useState, useEffect } from 'react';
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
import { DashboardPage } from './pages/DashboardPage';
import { PreparationsPage } from './pages/PreparationsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { TopicsPage } from './pages/TopicsPage';
import { RevisionPage } from './pages/RevisionPage';
import { VideoCoursePage } from './pages/VideoCoursePage';
import { StudyTimerPage } from './pages/StudyTimerPage';
import { TimetablePage } from './pages/TimetablePage';
import { CalendarPage } from './pages/CalendarPage';
import { AttendancePage } from './pages/AttendancePage';
import { TargetsPage } from './pages/TargetsPage';
import { GoalsPage } from './pages/GoalsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FocusModePage } from './pages/FocusModePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ExportBackupPage } from './pages/ExportBackupPage';
import { SettingsPage } from './pages/SettingsPage';

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
      <>
        <FocusModePage setActivePage={setActivePage} />
        <ToastContainer />
      </>
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
