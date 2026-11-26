import React, { useState } from 'react';
import {
  Search,
  Bell,
  School,
  Lock,
  Sun,
  Moon,
  CheckCheck,
  Clock
} from 'lucide-react';
import { useDataStore } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';

interface NavbarProps {
  onSearch?: (term: string) => void;
  onSignOut?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, onOpenMobileMenu }) => {
  const store = useDataStore();
  const { language, setLanguage, t, formatStatus } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);

  const isParent = store.currentUser.role === 'parent';
  const activeChild = isParent ? store.getActiveChild() : null;
  const childMetrics = activeChild ? store.getChildAttendanceMetrics(activeChild.id) : null;

  const unreadCount = store.getUnreadNotificationCount();
  const userNotifications = store.getNotificationsForUser();

  return (
    <header className="h-16 bg-white dark:bg-[#0F172A] border-b border-slate-200/90 dark:border-[#334155] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Hamburger, School Badge & Quick Search */}
      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 max-w-2xl min-w-0">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-[#CBD5E1] dark:hover:text-white dark:hover:bg-[#1E293B] transition-colors shrink-0 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* School Identifier */}
        <div className="hidden sm:flex items-center space-x-2 text-slate-700 dark:text-[#CBD5E1] bg-slate-50 dark:bg-[#1E293B] px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-[#334155] text-xs font-semibold shrink-0">
          <School className="w-3.5 h-3.5 text-brand-600 dark:text-[#3B82F6] shrink-0" />
          <span className="truncate max-w-[180px] font-bold text-slate-800 dark:text-[#F8FAFC]">{store.schoolName}</span>
          <span className="text-[10px] bg-slate-200/80 dark:bg-[#111827] text-slate-600 dark:text-[#CBD5E1] px-1.5 py-0.5 rounded font-mono font-medium">
            {store.schoolCode}
          </span>
        </div>

        {/* Parent Registered Child Badge OR Search Bar */}
        {isParent && activeChild ? (
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 rounded-lg px-2 sm:px-3 py-1 text-xs truncate max-w-[220px] sm:max-w-none">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400 hidden md:inline">{t.childLabel}</span>
            <strong className="text-emerald-950 dark:text-emerald-200 font-bold truncate text-[11px] sm:text-xs">
              {activeChild.first_name} <span className="hidden sm:inline">{activeChild.last_name}</span>
            </strong>
            <span className="font-mono text-emerald-800 dark:text-emerald-300 font-semibold text-[10px] sm:text-[11px] shrink-0">
              {activeChild.class_name}-{activeChild.division_name}
            </span>
            {childMetrics && (
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded ml-0.5 sm:ml-1 shrink-0">
                {childMetrics.percentage}%
              </span>
            )}
          </div>
        ) : (
          <div className="relative flex-1 max-w-md min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchNavbarPlaceholder}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-lg pl-7 sm:pl-8 pr-2.5 sm:pr-3 py-1.5 text-xs text-slate-800 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all truncate"
            />
          </div>
        )}
      </div>

      {/* Right: Theme Toggle, Language Switcher, Notifications */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
        {/* Theme Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={() => store.toggleTheme()}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#CBD5E1] dark:hover:text-amber-300 dark:hover:bg-[#1E293B] rounded-lg transition-colors border border-slate-200/80 dark:border-[#334155] cursor-pointer"
          title={store.theme === 'dark' ? t.lightMode : t.darkMode}
          aria-label="Toggle Theme"
        >
          {store.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Language Switcher (EN / MR) */}
        <div className="flex items-center bg-slate-100 dark:bg-[#1E293B] p-0.5 rounded-lg border border-slate-200 dark:border-[#334155] text-xs font-bold">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-1.5 sm:px-2 py-1 rounded transition-all text-[11px] ${
              language === 'en'
                ? 'bg-white dark:bg-[#111827] text-brand-600 dark:text-[#3B82F6] shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('mr')}
            className={`px-1.5 sm:px-2 py-1 rounded transition-all text-[11px] ${
              language === 'mr'
                ? 'bg-white dark:bg-[#111827] text-brand-600 dark:text-[#3B82F6] shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="मराठी"
          >
            मराठी
          </button>
        </div>

        {/* Notifications Popover - Strictly & Exclusively for Parents */}
        {isParent && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-[#CBD5E1] dark:hover:text-slate-200 dark:hover:bg-[#1E293B] rounded-lg relative transition-colors border border-slate-200/80 dark:border-[#334155] cursor-pointer"
              title={t.automatedAlerts}
              aria-label="Parent Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 mt-2 sm:w-96 max-w-sm bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#334155] mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-[#F8FAFC]">
                      {language === 'mr' ? 'पालक सूचना केंद्र' : 'Parent Notification Center'}
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount} {language === 'mr' ? 'नवीन' : 'new'}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => store.markAllNotificationsAsRead()}
                      className="text-[11px] text-brand-600 dark:text-blue-400 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>{language === 'mr' ? 'सर्व वाचलेले चिन्हांकित करा' : 'Mark all read'}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {userNotifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      <Bell className="w-6 h-6 mx-auto mb-1 opacity-40" />
                      <p>{language === 'mr' ? 'कोणत्याही नवीन सूचना नाहीत' : 'No notifications yet'}</p>
                    </div>
                  ) : (
                    userNotifications.slice(0, 15).map((n) => {
                      const isUnread = !n.is_read;
                      const dateObj = new Date(n.created_at);
                      const formattedTime = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';
                      const formattedDate = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })
                        : '';

                      return (
                        <div
                          key={n.id}
                          onClick={() => store.markNotificationAsRead(n.id)}
                          className={`p-2.5 rounded-lg text-xs border transition-all cursor-pointer ${
                            isUnread
                              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 shadow-xs'
                              : 'bg-slate-50 dark:bg-[#111827] border-slate-100 dark:border-[#334155] opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center space-x-1.5 min-w-0">
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                              )}
                              <span className="font-bold text-slate-800 dark:text-[#F8FAFC] truncate">
                                {n.student_name || n.template_parameters[0] || 'Child Alert'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 shrink-0">
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                                n.notification_type === 'ARRIVAL'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : n.notification_type === 'ABSENCE'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {n.notification_type}
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                {formatStatus(n.status)}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                            {n.message || n.title || n.template_parameters.slice(1).join(' • ')}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 pt-1 border-t border-slate-100/80 dark:border-slate-800/80">
                            <span className="font-mono">{n.channel}: {n.recipient_phone}</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formattedDate} {formattedTime}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
