import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { StudentsPage } from './pages/StudentsPage';
import { ClassesPage } from './pages/ClassesPage';
import { HistoryPage } from './pages/HistoryPage';
import { BiometricEnrollPage } from './pages/BiometricEnrollPage';
import { DeviceManagementPage } from './pages/DeviceManagementPage';
import { ReconciliationPage } from './pages/ReconciliationPage';
import { LeavesPage } from './pages/LeavesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { VisitorPickupPage } from './pages/VisitorPickupPage';
import { TimetablePage } from './pages/TimetablePage';
import { CalendarPage } from './pages/CalendarPage';
import { useDataStore } from './lib/data-store';
import { LanguageProvider } from './lib/i18n';
import type { UserRole } from '@smartattend/shared-types';

export function App() {
  const store = useDataStore();
  const [isLoggedIn, setIsLoggedIn] = useState(() => store.isSessionValid());
  const [currentTab, setCurrentTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Periodic security session check
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!store.isSessionValid() && isLoggedIn) {
        setIsLoggedIn(false);
      }
    }, 15000);
    return () => clearInterval(checkInterval);
  }, [isLoggedIn, store]);

  // Expose store & navigation hooks for test automation & CDP verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__dataStore = store;
      (window as any).__setCurrentTab = setCurrentTab;
      (window as any).__setIsLoggedIn = setIsLoggedIn;
      (window as any).__handleLogin = handleLogin;
    }
  }, [store]);

  const handleLogin = (role: UserRole, userEmailOrId?: string) => {
    if (userEmailOrId) {
      store.loginAs(userEmailOrId);
    } else {
      store.switchRole(role);
    }

    const activeRole = store.currentUser.role;
    if (activeRole === 'parent' || activeRole === 'student') {
      setCurrentTab('history');
    } else {
      setCurrentTab('overview');
    }
    setIsLoggedIn(true);
  };

  const handleSignOut = () => {
    store.logout();
    setIsLoggedIn(false);
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    const role = store.currentUser.role;

    // Strict role-based route guard
    if (role === 'parent' && !['history', 'leaves', 'reports', 'timetable', 'calendar'].includes(currentTab)) {
      return <HistoryPage />;
    }

    if (role === 'student' && !['history', 'reports', 'timetable', 'calendar'].includes(currentTab)) {
      return <HistoryPage />;
    }

    switch (currentTab) {
      case 'overview':
        return <OverviewPage onNavigate={handleSelectTab} />;
      case 'live':
        return <LiveMonitorPage />;
      case 'students':
        return <StudentsPage />;
      case 'classes':
        return <ClassesPage />;
      case 'timetable':
        return <TimetablePage />;
      case 'calendar':
        return <CalendarPage />;
      case 'history':
        return <HistoryPage />;
      case 'visitor':
        return <VisitorPickupPage />;
      case 'biometrics':
        return <BiometricEnrollPage />;
      case 'devices':
        return <DeviceManagementPage />;
      case 'reconcile':
        return <ReconciliationPage />;
      case 'leaves':
        return <LeavesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'audit':
        return <AuditLogsPage />;
      default:
        return role === 'parent' || role === 'student' ? <HistoryPage /> : <OverviewPage onNavigate={handleSelectTab} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <LanguageProvider>
        <LoginPage onLogin={handleLogin} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A]">
        {/* Responsive Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onSignOut={handleSignOut}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A]">
          {/* Top Navbar */}
          <Navbar
            onSignOut={handleSignOut}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC]">
            <div className="max-w-7xl mx-auto space-y-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}

export default App;
