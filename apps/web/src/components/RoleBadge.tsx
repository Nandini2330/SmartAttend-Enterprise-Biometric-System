import React from 'react';
import type { UserRole } from '@smartattend/shared-types';
import { useLanguage } from '../lib/i18n';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const { t } = useLanguage();

  switch (role) {
    case 'super_admin':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 ${className}`}>
          {t.roleSuperAdmin}
        </span>
      );
    case 'school_admin':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 ${className}`}>
          {t.rolePrincipalAdmin}
        </span>
      );
    case 'teacher':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 ${className}`}>
          {t.roleTeacher}
        </span>
      );
    case 'parent':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 ${className}`}>
          {t.roleParent}
        </span>
      );
    case 'student':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}>
          {t.roleStudent}
        </span>
      );
    default:
      return null;
  }
};
