import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Radio,
  Users,
  GraduationCap,
  CalendarCheck,
  Calendar,
  BookOpen,
  ScanFace,
  Server,
  Clock,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  UserCheck,
  X,
  LogOut,
  ChevronDown,
  Lock
} from 'lucide-react';
import { useDataStore, PARENT_PROFILES } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';
import { RoleBadge } from './RoleBadge';
import type { UserRole } from '@smartattend/shared-types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onSignOut?: () => void;
}

interface NavItemDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: number;
  section: 'main' | 'academic' | 'operations' | 'system';
}

const standardRoles: { role: UserRole; name: string; title: string }[] = [
  { role: 'school_admin', name: 'Dr. Sandeep Mukherjee', title: 'Principal / Admin' },
  { role: 'teacher', name: 'Mr. Rajesh Kumar', title: 'Class 10-A Teacher' },
  { role: 'super_admin', name: 'Antigravity Super Admin', title: 'Platform Admin' },
  { role: 'student', name: 'Aarav Mehta', title: 'Student (10-A)' }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  onSignOut,
}) => {
  const store = useDataStore();
  const { t } = useLanguage();
  const role = store.currentUser.role as UserRole;
  const isParent = role === 'parent';
  const pendingLeaves = store.leaveRequests.filter((l) => l.status === 'PENDING').length;

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close role switch dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    if (showRoleMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showRoleMenu]);

  const navItems: NavItemDef[] = [
    // Main Group
    { id: 'overview', label: t.overviewDashboard, icon: LayoutDashboard, roles: ['super_admin', 'school_admin', 'teacher'], section: 'main' },
    { id: 'live', label: t.livePunchMonitor, icon: Radio, roles: ['super_admin', 'school_admin', 'teacher'], section: 'main' },
    { id: 'students', label: t.studentDirectory, icon: Users, roles: ['super_admin', 'school_admin', 'teacher'], section: 'main' },
    { id: 'classes', label: t.classesAndDivisions, icon: GraduationCap, roles: ['super_admin', 'school_admin', 'teacher'], section: 'main' },

    // Academic & Attendance
    { id: 'timetable', label: t.timetable, icon: BookOpen, roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student'], section: 'academic' },
    { id: 'calendar', label: t.schoolCalendar, icon: Calendar, roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student'], section: 'academic' },
    {
      id: 'history',
      label: role === 'parent' ? t.childAttendance : role === 'student' ? t.myAttendance : t.attendanceHistory,
      icon: CalendarCheck,
      roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student'],
      section: 'academic'
    },
    { id: 'visitor', label: t.visitorPickup, icon: UserCheck, roles: ['super_admin', 'school_admin', 'teacher'], section: 'academic' },

    // Operations & Reports
    {
      id: 'leaves',
      label: t.leaveApplications,
      icon: FileText,
      roles: ['super_admin', 'school_admin', 'teacher', 'parent'],
      badge: role !== 'parent' ? pendingLeaves : undefined,
      section: 'operations'
    },
    {
      id: 'reports',
      label: role === 'parent' ? t.childReports : role === 'student' ? t.myReports : t.reportsAndAnalytics,
      icon: BarChart3,
      roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student'],
      section: 'operations'
    },
    { id: 'reconcile', label: t.absenceReconciliation, icon: Clock, roles: ['super_admin', 'school_admin'], section: 'operations' },

    // System & Hardware
    { id: 'biometrics', label: t.biometricEnrollment, icon: ScanFace, roles: ['super_admin', 'school_admin'], section: 'system' },
    { id: 'devices', label: t.deviceManagement, icon: Server, roles: ['super_admin', 'school_admin'], section: 'system' },
    { id: 'settings', label: t.schoolConfiguration, icon: Settings, roles: ['super_admin', 'school_admin'], section: 'system' },
    { id: 'audit', label: t.auditLogs, icon: ShieldCheck, roles: ['super_admin', 'school_admin'], section: 'system' }
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  const sectionLabels: Record<string, string> = {
    main: t.sectionMain,
    academic: t.sectionAcademic,
    operations: t.sectionOperations,
    system: t.sectionInfrastructure
  };

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderRoleMenuContent = (isMobileView: boolean) => (
    <div
      ref={roleMenuRef}
      className={`${collapsed && !isMobileView
          ? 'absolute left-full bottom-0 ml-2 w-72'
          : 'absolute bottom-full left-2 right-2 mb-2'
        } bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-2xl p-3 z-50 max-h-[60vh] overflow-y-auto`}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-[#334155]">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">{t.switchRolePerspective}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowRoleMenu(false)}
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          aria-label="Close role menu"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Parent Portals */}
      <div className="mb-3">
        <div className="flex items-center justify-between px-1 py-1">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1">
            <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>{t.parentPortals}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">{PARENT_PROFILES.length} {t.roleParent}</span>
        </div>
        <div className="space-y-1 mt-1">
          {PARENT_PROFILES.map((p) => {
            const isCurrent = store.currentUser.email === p.email;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  store.switchParentUser(p.id);
                  setShowRoleMenu(false);
                  if (isMobileView && onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${isCurrent
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-700'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <img src={p.avatarUrl} alt={p.name} className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{p.name}</p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate">Child: {p.studentName}</p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 font-bold px-1.5 py-0.5 rounded shrink-0">Active</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Staff & Student Portals */}
      <div className="pt-2 border-t border-slate-100 dark:border-[#334155]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block mb-1">
          {t.staffPortals}
        </span>
        <div className="space-y-1">
          {standardRoles.map((item) => {
            const isCurrent = store.currentUser.role === item.role && !isParent;
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => {
                  store.switchRole(item.role);
                  setShowRoleMenu(false);
                  if (isMobileView && onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${isCurrent
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold border border-brand-200/60 dark:border-brand-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.name}</p>
                  </div>
                </div>
                <RoleBadge role={item.role} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const sidebarContent = (isMobileView: boolean) => {
    const isCollapsed = isMobileView ? false : collapsed;
    const sections: ('main' | 'academic' | 'operations' | 'system')[] = ['main', 'academic', 'operations', 'system'];

    return (
      <div className="flex flex-col h-full select-none">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/90 dark:border-[#334155] shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-brand-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-[15px] text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-none truncate">
                  {t.brandName}
                </span>
                <span className="text-[10px] text-brand-600 dark:text-[#3B82F6] font-bold tracking-wider uppercase mt-1">
                  School ERP
                </span>
              </div>
            )}
          </div>

          {isMobileView ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar collapse"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Scrollable Navigation List (Independently scrollable) */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {sections.map((sec) => {
            const secItems = visibleItems.filter((item) => item.section === sec);
            if (secItems.length === 0) return null;

            return (
              <div key={sec} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    {sectionLabels[sec]}
                  </p>
                )}
                {secItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-tab-${item.id}`}
                      data-testid={`nav-tab-${item.id}`}
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${isActive
                          ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'
                          }`}
                      />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold text-[10px] px-1.5 py-0.2 rounded-full ml-2">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Section (Fixed at bottom) */}
        <div className="p-3 border-t border-slate-200/90 dark:border-[#334155] shrink-0 bg-white dark:bg-[#111827] relative">
          {showRoleMenu && renderRoleMenuContent(isMobileView)}

          {!isCollapsed ? (
            <div>
              {/* Profile Card */}
              <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] transition-colors">
                <img
                  src={store.currentUser.avatarUrl}
                  alt={store.currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-[#334155] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate" title={store.currentUser.name}>
                      {store.currentUser.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <RoleBadge role={store.currentUser.role} className="text-[10px] py-0 px-1.5" />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5" title={store.currentUser.email}>
                    {store.currentUser.email}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                  title="Switch Profile / Role Perspective"
                  aria-label="Switch Profile / Role Perspective"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Clearly Visible Sign Out Option */}
              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleMenu(false);
                    if (isMobileView && onCloseMobile) onCloseMobile();
                    onSignOut();
                  }}
                  className="w-full mt-2 flex items-center justify-center space-x-2 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/70 dark:border-rose-800/60 transition-colors cursor-pointer"
                  title={t.signOut}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>{t.signOut}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="relative p-0.5 rounded-full hover:ring-2 hover:ring-brand-500 transition-all cursor-pointer"
                title={`${store.currentUser.name} (${store.currentUser.email})`}
              >
                <img
                  src={store.currentUser.avatarUrl}
                  alt={store.currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-[#334155]"
                />
              </button>

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title={t.signOut}
                  className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Minimal Footer: Version Badge */}
        <div className="px-3 py-2 border-t border-slate-100 dark:border-[#334155]/60 shrink-0 bg-slate-50/60 dark:bg-[#111827]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 dark:text-[#CBD5E1]">
              <span className="font-medium">{t.platformVersion}</span>
              <span className="font-mono text-[10px] bg-slate-200/70 dark:bg-[#1E293B] text-slate-600 dark:text-[#CBD5E1] px-1.5 py-0.5 rounded font-semibold border border-transparent dark:border-[#334155]">v2.4</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={`${t.platformVersion} v2.4`} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer (Slide in) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#111827] border-r border-slate-200/90 dark:border-[#334155] shadow-2xl lg:hidden transform transition-transform duration-200 ease-in-out overflow-touch ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent(true)}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen bg-white dark:bg-[#111827] border-r border-slate-200/90 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] transition-all duration-200 z-30 shrink-0 ${collapsed ? 'w-18' : 'w-64'
          }`}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
};
