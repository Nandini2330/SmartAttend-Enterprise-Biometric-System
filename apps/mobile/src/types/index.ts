export type UserRole = 'parent';

export type LanguageCode = 'en' | 'mr';
export type ThemeMode = 'light' | 'dark';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY';
export type VerificationMethod = 'FACE' | 'FINGERPRINT' | 'MANUAL' | 'RFID' | 'QR';

export interface ChildRecord {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number: string;
  class_name: string;
  division_name: string;
  avatar_url?: string;
  academic_year: string;
  school_name: string;
  school_code: string;
  today_status: AttendanceStatus;
  clock_in_time?: string;
  clock_in_method?: VerificationMethod;
  clock_in_verified: boolean;
  clock_out_time?: string;
  clock_out_method?: VerificationMethod;
  clock_out_verified: boolean;
  is_late: boolean;
  minutes_late?: number;
  monthly_rate: number; // percentage
  present_days: number;
  absent_days: number;
  late_days: number;
  leave_days: number;
  total_working_days: number;
}

export interface ParentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  avatar_url: string;
  school_name: string;
  school_code: string;
  children: ChildRecord[];
}

export interface DailyLedgerItem {
  id: string;
  date: string; // YYYY-MM-DD
  day_name: string;
  status: AttendanceStatus;
  clock_in_time?: string;
  clock_out_time?: string;
  method?: VerificationMethod;
  is_late: boolean;
  minutes_late?: number;
  remarks?: string;
}

export interface LeaveRequestItem {
  id: string;
  student_id: string;
  student_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  description: string;
  document_name?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  reviewed_by?: string;
  remarks?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'ABSENT' | 'LATE' | 'LEAVE_STATUS' | 'CIRCULAR' | 'URGENT';
  timestamp: string;
  is_read: boolean;
  student_id?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: 'CIRCULAR' | 'EXAM' | 'HOLIDAY' | 'PTM' | 'NOTICE';
  author: string;
  date: string;
  is_pinned: boolean;
  attachment_name?: string;
  attachment_size?: string;
}

