import React, { useState, useEffect } from 'react';
import {
  Shield,
  School,
  GraduationCap,
  Users,
  User,
  ArrowRight,
  Lock,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Eye,
  EyeOff,
  ShieldAlert,
  Info,
  X
} from 'lucide-react';
import { useDataStore, USER_CREDENTIALS } from '../lib/data-store';
import { useLanguage } from '../lib/i18n';
import type { UserRole } from '@smartattend/shared-types';

interface LoginPageProps {
  onLogin: (role: UserRole, userEmailOrId?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const store = useDataStore();
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('principal@dpsrkpuram.edu.in');
  const [password, setPassword] = useState('Principal@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Active countdown timer for temporary account lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setAuthError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const quickProfiles: {
    label: string;
    email: string;
    role: UserRole;
    icon: any;
    badgeColor: string;
  }[] = [
    {
      label: language === 'mr' ? 'प्राचार्य' : 'Principal',
      email: 'principal@dpsrkpuram.edu.in',
      role: 'school_admin',
      icon: School,
      badgeColor: 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
    },
    {
      label: language === 'mr' ? 'शिक्षक' : 'Teacher',
      email: 'priya.sharma@dpsrkpuram.edu.in',
      role: 'teacher',
      icon: GraduationCap,
      badgeColor: 'border-teal-400 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
    },
    {
      label: language === 'mr' ? 'पालक (विक्रम)' : 'Parent (Vikram)',
      email: 'vikram.mehta@gmail.com',
      role: 'parent',
      icon: Users,
      badgeColor: 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
    },
    {
      label: language === 'mr' ? 'पालक (अनिल)' : 'Parent (Anil)',
      email: 'anil.verma@gmail.com',
      role: 'parent',
      icon: Users,
      badgeColor: 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
    },
    {
      label: language === 'mr' ? 'विद्यार्थी' : 'Student',
      email: 'aarav.mehta@student.dpsrkpuram.edu.in',
      role: 'student',
      icon: User,
      badgeColor: 'border-cyan-400 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800'
    },
    {
      label: language === 'mr' ? 'सुपर ॲडमिन' : 'Super Admin',
      email: 'superadmin@smartattend.edu',
      role: 'super_admin',
      icon: Shield,
      badgeColor: 'border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
    }
  ];

  const handleQuickFill = (targetEmail: string) => {
    setEmail(targetEmail);
    const cred = USER_CREDENTIALS[targetEmail.toLowerCase()];
    if (cred) {
      setPassword(cred.password);
    }
    setAuthError(null);
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutSeconds > 0) return;

    setAuthError(null);
    setIsSubmitting(true);

    const result = store.verifyCredentials(email, password);

    if (!result.success) {
      setIsSubmitting(false);
      setAuthError(result.message);
      if (result.error === 'ACCOUNT_LOCKED') {
        const remaining = store.getLockoutStatus(email).remainingSeconds;
        setLockoutSeconds(remaining > 0 ? remaining : 60);
      } else if (result.remainingAttempts !== undefined) {
        setRemainingAttempts(result.remainingAttempts);
      }
      return;
    }

    setAuthSuccess(true);
    setTimeout(() => {
      onLogin(result.role!, result.user!.email);
    }, 350);
  };

  return (
    <div className="min-h-screen w-full relative bg-gradient-to-br from-slate-100 via-blue-50/70 to-indigo-50/50 dark:from-[#0F172A] dark:via-[#111827] dark:to-[#0F172A] flex flex-col justify-center items-center px-4 py-16 sm:py-12 md:p-8 font-sans overflow-x-hidden">
      {/* Top Floating Controls (Language + Theme Switcher) */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-8 z-30 flex items-center space-x-1.5 sm:space-x-2.5">
        {/* Language Switcher */}
        <div className="flex items-center bg-white/90 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-full p-0.5 sm:p-1 shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('mr')}
            className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              language === 'mr'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            मराठी
          </button>
        </div>

        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={() => store.toggleTheme()}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] shadow-sm hover:shadow backdrop-blur-md hover:bg-white dark:hover:bg-[#111827] transition-all text-xs font-semibold cursor-pointer"
          title={store.theme === 'dark' ? t.lightMode : t.darkMode}
          aria-label="Toggle Theme"
        >
          {store.theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.lightMode}</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">{t.darkMode}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Single Login Container */}
      <div className="w-full max-w-md mx-auto my-auto z-10">
        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            SmartAttend
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 max-w-xs mx-auto">
            {language === 'mr'
              ? 'स्वयंचलित विद्यार्थी हजेरी आणि शाळा व्यवस्थापन प्रणाली'
              : 'Automated Student Attendance & School Management System'}
          </p>
        </div>

        {/* Single Login Card */}
        <div className="bg-white/95 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#334155] mb-5">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>{language === 'mr' ? 'आपल्या खात्यामध्ये प्रवेश करा' : 'Sign in to your account'}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'mr' ? 'सुरक्षित प्रणाली' : 'Encrypted'}</span>
            </div>
          </div>

          {/* Error / Account Lockout Banner */}
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">{authError}</p>
                {lockoutSeconds > 0 && (
                  <p className="mt-1 font-mono text-[11px] text-rose-700 dark:text-rose-300">
                    {language === 'mr'
                      ? `खाते लॉक: पुन्हा प्रयत्न करा ${lockoutSeconds} सेकंदात`
                      : `Brute-force lockout: Retry in ${lockoutSeconds}s`}
                  </p>
                )}
                {remainingAttempts !== null && remainingAttempts > 0 && lockoutSeconds === 0 && (
                  <p className="mt-0.5 text-[10px] text-rose-600 dark:text-rose-400">
                    {language === 'mr'
                      ? `उर्वरित प्रयत्न: ${remainingAttempts}`
                      : `${remainingAttempts} attempt(s) remaining before temporary lockout`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {authSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold">
                {language === 'mr'
                  ? 'ओळख प्रमाणित झाली! सुरक्षित सत्र सुरू होत आहे...'
                  : 'Credentials verified! Redirecting to dashboard...'}
              </span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'mr' ? 'ईमेल किंवा युझर आयडी' : 'Email or User ID'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError(null);
                  }}
                  disabled={lockoutSeconds > 0}
                  placeholder="name@school.edu.in"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'mr' ? 'पासवर्ड' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-brand-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  {language === 'mr' ? 'पासवर्ड विसरलात?' : 'Forgot Password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError(null);
                  }}
                  disabled={lockoutSeconds > 0}
                  placeholder={language === 'mr' ? 'खात्याचा पासवर्ड टाका' : 'Enter account password'}
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all disabled:opacity-50 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || lockoutSeconds > 0}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
                lockoutSeconds > 0
                  ? 'bg-slate-400 cursor-not-allowed text-white shadow-none'
                  : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-500/25 active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <span>{language === 'mr' ? 'प्रमाणित करत आहे...' : 'Authenticating...'}</span>
              ) : lockoutSeconds > 0 ? (
                <span>{language === 'mr' ? `प्रतीक्षा करा (${lockoutSeconds} सेकंद)` : `Cooldown (${lockoutSeconds}s)`}</span>
              ) : (
                <>
                  <span>{language === 'mr' ? 'प्रमाणित करा व प्रवेश करा' : 'Authenticate & Login'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Selector */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#334155]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{language === 'mr' ? 'त्वरित चाचणी खाती (१-क्लिक भरा):' : 'Quick Demo Fill (1-Click Fill):'}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {quickProfiles.map((p) => {
                const IconComponent = p.icon;
                const isCurrent = email.toLowerCase() === p.email.toLowerCase();
                return (
                  <button
                    key={p.email}
                    type="button"
                    onClick={() => handleQuickFill(p.email)}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center space-x-1.5 transition-all text-left cursor-pointer ${
                      isCurrent
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30'
                        : p.badgeColor + ' hover:opacity-90'
                    }`}
                  >
                    <IconComponent className="w-3 h-3 shrink-0" />
                    <span className="truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Minimalist Security & Trust Footer */}
        <div className="mt-4 text-center text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-3">
          <span className="flex items-center space-x-1">
            <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>AES-256 Encrypted</span>
          </span>
          <span>•</span>
          <span>Role-Based Access Control</span>
          <span>•</span>
          <span>DPDPA 2023 Compliant</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-2xl max-w-sm w-full p-4 sm:p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#334155] mb-3">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                <Info className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>{language === 'mr' ? 'पासवर्ड मदत' : 'Password Recovery'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              {language === 'mr'
                ? 'DPDPA २०२३ च्या सुरक्षा नियमांनुसार, पासवर्ड पुनर्प्राप्ती शाळा प्रशासक किंवा आयटी हेल्पडेस्कद्वारे व्यवस्थापित केली जाते.'
                : 'Under institutional DPDPA security policies, production password resets are handled by your school administrator.'}
            </p>
            <div className="bg-slate-50 dark:bg-[#111827] rounded-xl p-3 border border-slate-200 dark:border-[#334155] text-[11px] space-y-1.5 font-mono mb-4 text-slate-700 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white font-sans text-xs">Standard Demo Credentials:</p>
              <p>• Principal: <span className="text-brand-600 dark:text-blue-400">Principal@2026!</span></p>
              <p>• Teacher: <span className="text-teal-600 dark:text-teal-400">Teacher@2026!</span></p>
              <p>• Parents: <span className="text-amber-600 dark:text-amber-400">Parent@2026!</span></p>
              <p>• Student: <span className="text-cyan-600 dark:text-cyan-400">Student@2026!</span></p>
              <p>• Super Admin: <span className="text-purple-600 dark:text-purple-400">SuperAdmin@2026!</span></p>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {language === 'mr' ? 'समजले' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
