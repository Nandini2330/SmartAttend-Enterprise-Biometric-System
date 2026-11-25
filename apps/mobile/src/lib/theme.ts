import { ThemeMode } from '../types';

export interface ThemeColors {
  background: string;
  card: string;
  cardElevated: string;
  header: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  
  // Status Colors
  present: string;
  presentBg: string;
  presentText: string;

  absent: string;
  absentBg: string;
  absentText: string;

  late: string;
  lateBg: string;
  lateText: string;

  leave: string;
  leaveBg: string;
  leaveText: string;

  pending: string;
  pendingBg: string;
  pendingText: string;

  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const lightTheme: ThemeColors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  header: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',

  present: '#10B981',
  presentBg: '#ECFDF5',
  presentText: '#065F46',

  absent: '#EF4444',
  absentBg: '#FEF2F2',
  absentText: '#991B1B',

  late: '#F59E0B',
  lateBg: '#FFFBEB',
  lateText: '#92400E',

  leave: '#3B82F6',
  leaveBg: '#EFF6FF',
  leaveText: '#1E40AF',

  pending: '#94A3B8',
  pendingBg: '#F8FAFC',
  pendingText: '#64748B',

  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#2563EB',
  tabBarInactive: '#94A3B8'
};

export const darkTheme: ThemeColors = {
  background: '#0F172A',
  card: '#1E293B',
  cardElevated: '#1A2436',
  header: '#111827',
  border: '#334155',
  borderSubtle: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  primary: '#3B82F6',
  primaryLight: '#1E293B',

  present: '#10B981',
  presentBg: 'rgba(16, 185, 129, 0.15)',
  presentText: '#6EE7B7',

  absent: '#EF4444',
  absentBg: 'rgba(239, 68, 68, 0.15)',
  absentText: '#FCA5A5',

  late: '#F59E0B',
  lateBg: 'rgba(245, 158, 11, 0.15)',
  lateText: '#FCD34D',

  leave: '#3B82F6',
  leaveBg: 'rgba(59, 130, 246, 0.15)',
  leaveText: '#93C5FD',

  pending: '#64748B',
  pendingBg: '#1E293B',
  pendingText: '#94A3B8',

  tabBarBg: '#111827',
  tabBarBorder: '#334155',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#64748B'
};

export const getThemeColors = (mode: ThemeMode): ThemeColors => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

