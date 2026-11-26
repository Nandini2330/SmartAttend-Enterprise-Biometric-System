/**
 * SmartAttend - Shared TypeScript Definitions
 * Standardized across Web Dashboard, Mobile Android App, Services, and Backend Functions
 */

// ============================================================================
// Enums & Constants
// ============================================================================

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'parent' | 'student';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'ON_LEAVE'
  | 'HOLIDAY'
  | 'EXCUSED';

export type VerificationMethod =
  | 'FACE'
  | 'FINGERPRINT'
  | 'MANUAL'
  | 'CARD'
  | 'SIMULATED';

export type EventType = 'CHECK_IN' | 'CHECK_OUT';

export type NotificationStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'DEAD_LETTER';

export type NotificationType = 'ARRIVAL' | 'ABSENCE' | 'DEPARTURE' | 'GENERAL_ANNOUNCEMENT' | 'LEAVE_STATUS' | 'LEAVE_SUBMISSION' | 'DPDP_CONSENT_ALERT';

export type BiometricType = 'FACE' | 'FINGERPRINT';

export type DeviceType = 'FINGERPRINT_TERMINAL' | 'FACE_KIOSK' | 'HYBRID_TERMINAL';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'ERROR';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type LeaveType = 'SICK_LEAVE' | 'PERSONAL_LEAVE' | 'EMERGENCY_LEAVE' | 'OTHER';

export type LeaveApplicantRole = 'PARENT' | 'STUDENT' | 'TEACHER' | 'ADMIN';

export type NotificationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL';

export type DpdpConsentStatus = 'GRANTED' | 'WITHDRAWN' | 'EXPIRED' | 'PENDING';

export type DpdpConsentType = 'FACIAL_RECOGNITION' | 'FINGERPRINT' | 'ALL_BIOMETRICS';

export type DpdpConsentSource = 'PARENT_PORTAL' | 'PHYSICAL_FORM' | 'ADMIN_KIOSK';

// ============================================================================
// Core Database Entities
// ============================================================================

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  timezone: string; // e.g. "Asia/Kolkata"
  opening_time: string; // "08:30"
  grace_period_minutes: number; // 15
  cutoff_time: string; // "10:00"
  whatsapp_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string; // e.g. "2026-2027"
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface ClassModel {
  id: string;
  school_id: string;
  name: string; // e.g. "Grade 10" or "Class 5"
  numeric_grade: number; // 10
  created_at: string;
}

export interface DivisionModel {
  id: string;
  class_id: string;
  name: string; // "A", "B", "C"
  class_teacher_id?: string;
  created_at: string;
}

export interface UserProfile {
  id: string; // references auth.users.id
  school_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  date_of_birth?: string;
  class_id: string;
  division_id: string;
  roll_number: string;
  academic_year_id: string;
  is_active: boolean;
  face_enrolled: boolean;
  fingerprint_enrolled: boolean;
  avatar_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Joined fields for UI convenience
  class_name?: string;
  division_name?: string;
  guardians?: Guardian[];
}

export interface Guardian {
  id: string;
  school_id: string;
  user_id?: string; // links to auth.users if parent logs in
  full_name: string;
  relationship: 'FATHER' | 'MOTHER' | 'LEGAL_GUARDIAN' | 'OTHER';
  phone_number: string; // E.164 formatted, e.g. "+919876543210"
  email?: string;
  whatsapp_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentGuardian {
  id: string;
  student_id: string;
  guardian_id: string;
  is_primary_contact: boolean;
  created_at: string;
}

export interface AttendanceSession {
  id: string;
  school_id: string;
  academic_year_id: string;
  session_date: string; // "YYYY-MM-DD"
  name: string; // "Morning Attendance"
  opening_time: string; // "08:30"
  grace_cutoff_time: string; // "08:45"
  final_cutoff_time: string; // "10:00"
  is_reconciled: boolean;
  reconciled_at?: string;
  reconciled_by?: string;
  created_at: string;
}

export interface AttendanceEvent {
  id: string;
  school_id: string;
  student_id: string;
  session_id: string;
  event_type: EventType;
  event_timestamp: string; // ISO 8601 UTC
  local_timestamp: string; // Asia/Kolkata formatted e.g. "08:34:12"
  verification_method: VerificationMethod;
  device_id?: string;
  confidence_score?: number; // 0.00 - 1.00
  liveness_verified?: boolean;
  recorded_by?: string; // user_profile id if manual
  is_duplicate_ignored: boolean;
  raw_payload?: Record<string, unknown>;
  created_at: string;

  // Joined for display
  student_name?: string;
  admission_number?: string;
  class_division?: string;
  device_name?: string;
}

export interface DailyAttendance {
  id: string;
  school_id: string;
  student_id: string;
  attendance_date: string; // "YYYY-MM-DD"
  session_id: string;
  status: AttendanceStatus;
  first_arrival_time?: string; // "08:32:15"
  departure_time?: string; // "15:30:00"
  first_verification_method?: VerificationMethod;
  is_late: boolean;
  minutes_late: number;
  remarks?: string;
  verified_by?: string;
  reconciled_at?: string;
  created_at: string;
  updated_at: string;

  // Joined details
  student?: Student;
}

export interface BiometricEnrollment {
  id: string;
  school_id: string;
  student_id: string;
  biometric_type: BiometricType;
  template_version: string;
  quality_score: number; // 0 - 100
  feature_hash: string; // SHA-256 hash of embedding (raw vector stored in secure vault / service)
  is_active: boolean;
  enrolled_by: string;
  created_at: string;
  updated_at: string;
}

export interface BiometricDevice {
  id: string;
  school_id: string;
  device_name: string;
  device_model: string; // e.g. "ZKTeco K40", "Mantra MFS100", "SmartAttend Kiosk 01"
  serial_number: string;
  device_type: DeviceType;
  ip_address?: string;
  port?: number;
  location: string; // e.g. "Main Gate 1", "Junior Wing Entry"
  api_key_hash: string;
  status: DeviceStatus;
  last_heartbeat?: string;
  last_sync_at?: string;
  firmware_version?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceSyncLog {
  id: string;
  device_id: string;
  sync_type: 'PUNCH_UPLOAD' | 'USER_DOWNLOAD' | 'HEARTBEAT';
  events_count: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  error_message?: string;
  sync_duration_ms: number;
  created_at: string;
}

export interface NotificationTemplate {
  id: string;
  school_id: string;
  template_name: string; // e.g. "attendance_arrival_v1"
  meta_template_id: string; // Meta WhatsApp approved template name
  language_code: string; // e.g. "en_US"
  category: 'UTILITY' | 'MARKETING';
  header_text?: string;
  body_text: string; // "Dear Parent, your child {{1}} has been marked PRESENT at {{2}} on {{3}}. - {{4}}"
  footer_text?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  created_at: string;
}

export interface NotificationJob {
  id: string;
  school_id: string;
  student_id: string;
  guardian_id: string;
  template_id: string;
  notification_type: NotificationType;
  recipient_phone: string;
  template_parameters: string[]; // ["Aarav Sharma", "08:35 AM", "29-Oct-2026", "DPS RK Puram"]
  status: NotificationStatus;
  channel?: NotificationChannel;
  idempotency_key?: string;
  scheduled_for: string;
  attempts: number;
  max_attempts: number;
  next_retry_at?: string;
  dead_letter_reason?: string;
  provider_response?: string;
  last_error?: string;
  is_read?: boolean;
  title?: string;
  message?: string;
  student_name?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationDeliveryLog {
  id: string;
  job_id: string;
  whatsapp_message_id?: string; // wamid.HBg... from Meta Cloud API
  recipient_phone: string;
  status: NotificationStatus;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_code?: string;
  error_message?: string;
  raw_webhook_payload?: Record<string, unknown>;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  school_id: string;
  student_id: string;
  requested_by_guardian_id: string;
  leave_type?: LeaveType;
  applicant_role?: LeaveApplicantRole;
  start_date: string;
  end_date: string;
  reason: string;
  document_url?: string;
  document_name?: string;
  status: LeaveStatus;
  reviewed_by?: string;
  reviewed_by_id?: string;
  reviewed_at?: string;
  review_comments?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolHoliday {
  id: string;
  school_id: string;
  academic_year_id: string;
  holiday_date: string;
  name: string; // e.g. "Diwali", "Gandhi Jayanti", "Republic Day"
  description?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  school_id: string;
  user_id?: string;
  user_role?: UserRole;
  action: string; // e.g. "ATTENDANCE_OVERRIDE", "STUDENT_CREATED", "RECONCILIATION_RUN"
  entity_type: string; // "daily_attendance", "student", "device"
  entity_id: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================================================
// API & Service Contracts
// ============================================================================

export interface FaceEnrollRequest {
  student_id: string;
  school_id: string;
  image_base64: string; // Data URL or raw base64 JPEG/PNG
}

export interface FaceEnrollResponse {
  success: boolean;
  student_id: string;
  quality_score: number;
  face_detected: boolean;
  features_extracted: boolean;
  message: string;
}

export interface FaceVerifyRequest {
  school_id: string;
  image_base64: string;
  session_id?: string;
  device_id?: string;
}

export interface FaceVerifyResponse {
  verified: boolean;
  student_id?: string;
  student_name?: string;
  admission_number?: string;
  confidence: number; // 0.0 - 1.0
  distance: number;
  liveness_passed: boolean;
  liveness_score: number;
  verification_time_ms: number;
  message: string;
}

export interface DevicePunchPayload {
  device_serial: string;
  device_api_key: string;
  student_identifier: string; // Admission number or biometric PIN
  punch_time: string; // ISO 8601
  punch_type: EventType;
  verification_method: VerificationMethod;
  is_offline_sync?: boolean;
}

export interface AttendanceReconcileRequest {
  school_id: string;
  session_id?: string;
  date?: string; // Defaults to today
  force_reconcile?: boolean;
}

export interface AttendanceReconcileResult {
  session_date: string;
  total_enrolled: number;
  present_count: number;
  late_count: number;
  absent_count: number;
  on_leave_count: number;
  whatsapp_notifications_queued: number;
  reconciled_at: string;
}

// ============================================================================
// Web & Mobile Dashboard Summaries
// ============================================================================

export interface DashboardOverviewKPI {
  total_students: number;
  present_today: number;
  absent_today: number;
  late_today: number;
  attendance_rate_percentage: number;
  active_devices_online: number;
  total_devices: number;
  whatsapp_delivered_today: number;
  whatsapp_pending_today: number;
}

export interface LiveFeedItem {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_division: string;
  avatar_url?: string;
  timestamp: string;
  status: AttendanceStatus;
  verification_method: VerificationMethod;
  device_name: string;
  confidence?: number;
}

// ============================================================================
// Parent Portal & Privacy Authorization Types
// ============================================================================

export interface ParentChildSummary {
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  division_name: string;
  roll_number: string;
  avatar_url?: string;
  relationship: string;
  attendance_percentage: number;
  today_status: AttendanceStatus;
  first_arrival_time?: string;
}

export interface ParentAttendancePercentage {
  student_id: string;
  student_name: string;
  admission_number: string;
  total_school_days: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  on_leave_days: number;
  attendance_percentage: number;
  punctuality_rate: number;
}

export interface ParentAttendanceReportResponse {
  success: boolean;
  parent_id: string;
  parent_name: string;
  parent_email: string;
  children: ParentChildSummary[];
  attendance_records: DailyAttendance[];
  stats: ParentAttendancePercentage;
  privacy_enforced: boolean;
  authorized_child_ids: string[];
}

// ============================================================================
// Sprint 1: Offline Architecture & Device Health Monitoring Types
// ============================================================================

export type OfflineRecordStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'DUPLICATE_RESOLVED';

export interface OfflineAttendanceRecord {
  id: string; // Client-side unique UUID
  school_id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_division: string;
  session_id?: string;
  event_type: EventType;
  verification_method: VerificationMethod;
  timestamp: string; // ISO 8601 UTC
  local_timestamp: string; // HH:MM:SS
  device_serial?: string;
  device_name?: string;
  confidence_score?: number;
  status: OfflineRecordStatus;
  retry_count: number;
  last_attempt?: string;
  sync_error?: string;
  cloud_event_id?: string;
  synced_at?: string;
}

export interface DeviceHealthMetric {
  device_id: string;
  serial_number: string;
  device_name: string;
  device_model: string;
  device_type: DeviceType;
  location: string;
  status: DeviceStatus;
  last_heartbeat: string;
  last_sync_at?: string;
  ping_latency_ms: number;
  failure_count: number;
  health_score: number; // 0 - 100 percentage
  reconnect_attempts: number;
  is_auto_reconnecting: boolean;
  firmware_version?: string;
}

export interface DeviceHealthAlert {
  id: string;
  device_id: string;
  serial_number: string;
  device_name: string;
  alert_type: 'OFFLINE_DETECTED' | 'HIGH_LATENCY' | 'SYNC_FAILURE' | 'RECONNECTED';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

// ============================================================================
// Sprint 2: Academic Management - Timetable, Period Attendance & Calendar
// ============================================================================

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableSlot {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  division_id: string;
  day_of_week: DayOfWeek;
  period_number: number;
  subject_name: string;
  teacher_name: string;
  teacher_id?: string;
  room_number: string;
  start_time: string; // "08:30"
  end_time: string; // "09:15"
  created_at?: string;

  // Joined for UI convenience
  class_name?: string;
  division_name?: string;
}

export type PeriodAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface PeriodAttendanceRecord {
  id: string;
  school_id: string;
  timetable_id?: string;
  student_id: string;
  student_name?: string;
  admission_number?: string;
  class_id: string;
  division_id: string;
  subject_name: string;
  period_number: number;
  attendance_date: string; // "YYYY-MM-DD"
  status: PeriodAttendanceStatus;
  marked_by?: string;
  remarks?: string;
  created_at: string;
  updated_at?: string;
}

export interface TimetableConflict {
  conflict_type: 'TEACHER_DOUBLE_BOOKED' | 'ROOM_DOUBLE_BOOKED' | 'CLASS_OVERLAP';
  message: string;
  day_of_week: DayOfWeek;
  period_number: number;
  conflicting_slots: TimetableSlot[];
}

export type CalendarEventType = 'HOLIDAY' | 'EXAMINATION' | 'VACATION' | 'EVENT' | 'SPECIAL_WORKING_DAY';

export interface CalendarEventModel {
  id: string;
  school_id: string;
  academic_year_id: string;
  event_type: CalendarEventType;
  title: string;
  description?: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string; // "YYYY-MM-DD"
  is_instructional_day: boolean;
  created_at?: string;
}

export interface SubjectAttendanceSummary {
  subject: string;
  total_periods: number;
  attended_periods: number;
  percentage: number;
  punctuality_rate: number;
}

// ============================================================================
// Sprint 3: Promotion Wizard & Visitor/Student Pickup Management
// ============================================================================

export type PickupStatus = 'PENDING_VERIFICATION' | 'AUTHORIZED_CHECKOUT' | 'UNAUTHORIZED_BLOCKED' | 'CANCELLED';

export interface VisitorPickup {
  id: string;
  school_id: string;
  student_id: string;
  student_name?: string;
  admission_number?: string;
  visitor_name: string;
  visitor_phone: string;
  relationship: string;
  id_proof_type?: string;
  id_proof_number?: string;
  pickup_reason: string;
  otp_code: string;
  otp_verified: boolean;
  otp_verified_at?: string;
  status: PickupStatus;
  gate_pass_number?: string;
  checkout_time?: string;
  created_at: string;
}

export interface PickupAuthorization {
  id: string;
  school_id: string;
  student_id: string;
  guardian_id: string;
  authorized_person_name: string;
  authorized_person_phone: string;
  relationship_to_child: string;
  id_proof_number?: string;
  valid_from: string; // YYYY-MM-DD
  valid_until: string; // YYYY-MM-DD
  is_active: boolean;
  created_at?: string;
}

export interface ClassEnrollment {
  id: string;
  student_id: string;
  class_id: string;
  class_name?: string;
  division_id: string;
  division_name?: string;
  academic_year_id: string;
  academic_year_name?: string;
  enrolled_at: string;
  is_active: boolean;
}

export interface StudentExamResult {
  id: string;
  student_id: string;
  academic_year: string;
  exam_name: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  result_status: 'PASS' | 'FAIL';
  remarks?: string;
  recorded_at: string;
}

export interface PromotionBatchResult {
  promoted_count: number;
  retained_count?: number;
  skipped_duplicates: number;
  source_class: string;
  target_class: string;
  target_academic_year: string;
  promoted_students: string[];
  retained_students?: string[];
  details?: Array<{
    student_id: string;
    student_name: string;
    action: 'PROMOTED' | 'RETAINED' | 'SKIPPED_DUPLICATE';
    from_class: string;
    to_class: string;
    result_status: 'PASS' | 'FAIL';
    percentage: number;
    reason: string;
  }>;
}

export type VisitorPurpose =
  | 'ADMISSION_ENQUIRY'
  | 'OFFICIAL_MEETING'
  | 'VENDOR_DELIVERY'
  | 'CAMPUS_INSPECTION'
  | 'GUEST_EVENT'
  | 'OTHER';

export interface SchoolVisitor {
  id: string;
  school_id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  purpose: VisitorPurpose;
  whom_to_meet: string;
  badge_number: string;
  check_in_time: string; // ISO 8601 or HH:MM:SS
  check_out_time?: string;
  status: 'CHECKED_IN' | 'CHECKED_OUT';
  remarks?: string;
  created_at: string;
}

export interface DpdpBiometricConsent {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  guardian_id?: string;
  guardian_name: string;
  consent_type: DpdpConsentType;
  status: DpdpConsentStatus;
  consent_source: DpdpConsentSource;
  consent_date: string;
  valid_until: string;
  retention_days: number;
  hash_sha256: string;
  withdrawn_at?: string;
  withdrawn_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsentHistoryLog {
  id: string;
  consent_id?: string;
  student_id: string;
  action: 'CONSENT_GRANTED' | 'CONSENT_WITHDRAWN' | 'CONSENT_EXPIRED' | 'TEMPLATES_PURGED';
  performed_by: string;
  timestamp: string;
  details: string;
}





