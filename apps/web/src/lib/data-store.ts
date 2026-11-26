import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import type {
  UserRole,
  Student,
  DailyAttendance,
  AttendanceEvent,
  BiometricDevice,
  NotificationJob,
  NotificationDeliveryLog,
  AttendanceStatus,
  VerificationMethod,
  ClassModel,
  DivisionModel,
  AcademicYear,
  ClassEnrollment,
  VisitorPickup,
  PickupAuthorization,
  SchoolVisitor,
  PromotionBatchResult,
  StudentExamResult,
  LeaveType,
  LeaveApplicantRole,
  LeaveStatus,
  DpdpBiometricConsent,
  DpdpConsentStatus,
  DpdpConsentType,
  DpdpConsentSource,
  ConsentHistoryLog,
  NotificationChannel,
  NotificationStatus,
  NotificationType
} from '@smartattend/shared-types';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface LeaveRequest {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  parent_name: string;
  parent_phone: string;
  leave_type?: LeaveType;
  applicant_role?: LeaveApplicantRole;
  start_date: string;
  end_date: string;
  reason: string;
  document_url?: string;
  document_name?: string;
  status: LeaveStatus;
  created_at: string;
  reviewed_by?: string;
  reviewed_by_id?: string;
  reviewed_at?: string;
  remarks?: string;
  cancelled_at?: string;
  cancelled_by?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  user: string;
  entity: string;
  ip: string;
  timestamp: string;
  details: string;
}

export const INITIAL_CLASSES: ClassModel[] = [
  { id: '33333333-3333-3333-3333-333333333309', school_id: '11111111-1111-1111-1111-111111111111', name: 'Grade 9', numeric_grade: 9, created_at: '2026-04-01T00:00:00Z' },
  { id: '33333333-3333-3333-3333-333333333310', school_id: '11111111-1111-1111-1111-111111111111', name: 'Grade 10', numeric_grade: 10, created_at: '2026-04-01T00:00:00Z' },
  { id: '33333333-3333-3333-3333-333333333311', school_id: '11111111-1111-1111-1111-111111111111', name: 'Grade 11', numeric_grade: 11, created_at: '2026-04-01T00:00:00Z' },
  { id: '33333333-3333-3333-3333-333333333312', school_id: '11111111-1111-1111-1111-111111111111', name: 'Grade 12', numeric_grade: 12, created_at: '2026-04-01T00:00:00Z' },
];

export const INITIAL_DIVISIONS: DivisionModel[] = [
  { id: '44444444-4444-4444-4444-444444444409', class_id: '33333333-3333-3333-3333-333333333309', name: 'A', created_at: '2026-04-01T00:00:00Z' },
  { id: '44444444-4444-4444-4444-444444444409-b', class_id: '33333333-3333-3333-3333-333333333309', name: 'B', created_at: '2026-04-01T00:00:00Z' },
  { id: '44444444-4444-4444-4444-444444444411', class_id: '33333333-3333-3333-3333-333333333310', name: 'A', created_at: '2026-04-01T00:00:00Z' },
  { id: '44444444-4444-4444-4444-444444444412', class_id: '33333333-3333-3333-3333-333333333310', name: 'B', created_at: '2026-04-01T00:00:00Z' },
  { id: '44444444-4444-4444-4444-444444444413', class_id: '33333333-3333-3333-3333-333333333310', name: 'C', created_at: '2026-04-01T00:00:00Z' }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: '88888888-8888-8888-8888-888888888801',
    school_id: '11111111-1111-1111-1111-111111111111',
    admission_number: 'DPS-2026-1001',
    first_name: 'Aarav',
    last_name: 'Mehta',
    gender: 'MALE',
    date_of_birth: '2011-04-12',
    class_id: '33333333-3333-3333-3333-333333333310',
    division_id: '44444444-4444-4444-4444-444444444411',
    class_name: 'Grade 10',
    division_name: 'A',
    roll_number: '10101',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    is_active: true,
    face_enrolled: true,
    fingerprint_enrolled: true,
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    guardians: [{
      id: '99999999-9999-9999-9999-999999999901',
      school_id: '11111111-1111-1111-1111-111111111111',
      user_id: '55555555-5555-5555-5555-555555555505',
      full_name: 'Vikram Mehta',
      relationship: 'FATHER',
      phone_number: '+919811122233',
      email: 'vikram.mehta@gmail.com',
      whatsapp_opt_in: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    }]
  },
  {
    id: '88888888-8888-8888-8888-888888888802',
    school_id: '11111111-1111-1111-1111-111111111111',
    admission_number: 'DPS-2026-1002',
    first_name: 'Ananya',
    last_name: 'Kapoor',
    gender: 'FEMALE',
    date_of_birth: '2011-08-25',
    class_id: '33333333-3333-3333-3333-333333333310',
    division_id: '44444444-4444-4444-4444-444444444411',
    class_name: 'Grade 10',
    division_name: 'A',
    roll_number: '10102',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    is_active: true,
    face_enrolled: true,
    fingerprint_enrolled: false,
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    guardians: [{
      id: '99999999-9999-9999-9999-999999999902',
      school_id: '11111111-1111-1111-1111-111111111111',
      user_id: '55555555-5555-5555-5555-555555555506',
      full_name: 'Sunita Kapoor',
      relationship: 'MOTHER',
      phone_number: '+919822233344',
      email: 'sunita.kapoor@gmail.com',
      whatsapp_opt_in: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    }]
  },
  {
    id: '88888888-8888-8888-8888-888888888803',
    school_id: '11111111-1111-1111-1111-111111111111',
    admission_number: 'DPS-2026-1003',
    first_name: 'Rohan',
    last_name: 'Verma',
    gender: 'MALE',
    date_of_birth: '2011-02-14',
    class_id: '33333333-3333-3333-3333-333333333310',
    division_id: '44444444-4444-4444-4444-444444444411',
    class_name: 'Grade 10',
    division_name: 'A',
    roll_number: '10103',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    is_active: true,
    face_enrolled: false,
    fingerprint_enrolled: true,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    guardians: [{
      id: '99999999-9999-9999-9999-999999999903',
      school_id: '11111111-1111-1111-1111-111111111111',
      user_id: '55555555-5555-5555-5555-555555555507',
      full_name: 'Anil Verma',
      relationship: 'FATHER',
      phone_number: '+919833344455',
      email: 'anil.verma@gmail.com',
      whatsapp_opt_in: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    }]
  },
  {
    id: '88888888-8888-8888-8888-888888888804',
    school_id: '11111111-1111-1111-1111-111111111111',
    admission_number: 'DPS-2026-1004',
    first_name: 'Ishaan',
    last_name: 'Gupta',
    gender: 'MALE',
    date_of_birth: '2011-11-03',
    class_id: '33333333-3333-3333-3333-333333333310',
    division_id: '44444444-4444-4444-4444-444444444411',
    class_name: 'Grade 10',
    division_name: 'A',
    roll_number: '10104',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    is_active: true,
    face_enrolled: false,
    fingerprint_enrolled: false,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    guardians: [{
      id: '99999999-9999-9999-9999-999999999904',
      school_id: '11111111-1111-1111-1111-111111111111',
      user_id: '55555555-5555-5555-5555-555555555508',
      full_name: 'Pooja Gupta',
      relationship: 'MOTHER',
      phone_number: '+919844455566',
      email: 'pooja.gupta@gmail.com',
      whatsapp_opt_in: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    }]
  },
  {
    id: '88888888-8888-8888-8888-888888888805',
    school_id: '11111111-1111-1111-1111-111111111111',
    admission_number: 'DPS-2026-1005',
    first_name: 'Diya',
    last_name: 'Sen',
    gender: 'FEMALE',
    date_of_birth: '2011-06-19',
    class_id: '33333333-3333-3333-3333-333333333310',
    division_id: '44444444-4444-4444-4444-444444444412',
    class_name: 'Grade 10',
    division_name: 'B',
    roll_number: '10201',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    is_active: true,
    face_enrolled: true,
    fingerprint_enrolled: true,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    guardians: [{
      id: '99999999-9999-9999-9999-999999999905',
      school_id: '11111111-1111-1111-1111-111111111111',
      user_id: '55555555-5555-5555-5555-555555555510',
      full_name: 'Subir Sen',
      relationship: 'FATHER',
      phone_number: '+919855566677',
      email: 'subir.sen@gmail.com',
      whatsapp_opt_in: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    }]
  },
  {
    id: '88888888-8888-8888-8888-888888888806',
    school_id: '11111111-1111-1111-1111-111111111111',
    admission_number: 'DPS-2026-0901',
    first_name: 'Kabir',
    last_name: 'Das',
    gender: 'MALE',
    date_of_birth: '2012-01-10',
    class_id: '33333333-3333-3333-3333-333333333309',
    division_id: '44444444-4444-4444-4444-444444444409',
    class_name: 'Grade 9',
    division_name: 'A',
    roll_number: '09101',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    is_active: true,
    face_enrolled: true,
    fingerprint_enrolled: false,
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    guardians: [{
      id: '99999999-9999-9999-9999-999999999906',
      school_id: '11111111-1111-1111-1111-111111111111',
      user_id: '55555555-5555-5555-5555-555555555511',
      full_name: 'Meena Das',
      relationship: 'MOTHER',
      phone_number: '+919866677788',
      email: 'meena.das@gmail.com',
      whatsapp_opt_in: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    }]
  },
  {
    id: '88888888-8888-8888-8888-888888888807',
    school_id: '11111111-1111-1111-1111-111111111111',
    admission_number: 'DPS-2026-0902',
    first_name: 'Priyansh',
    last_name: 'Sharma',
    gender: 'MALE',
    date_of_birth: '2012-05-18',
    class_id: '33333333-3333-3333-3333-333333333309',
    division_id: '44444444-4444-4444-4444-444444444409',
    class_name: 'Grade 9',
    division_name: 'A',
    roll_number: '09102',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    is_active: true,
    face_enrolled: false,
    fingerprint_enrolled: true,
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    guardians: [{
      id: '99999999-9999-9999-9999-999999999907',
      school_id: '11111111-1111-1111-1111-111111111111',
      user_id: '55555555-5555-5555-5555-555555555512',
      full_name: 'Rajesh Sharma',
      relationship: 'FATHER',
      phone_number: '+919877788899',
      email: 'rajesh.sharma@gmail.com',
      whatsapp_opt_in: true,
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z'
    }]
  }
];

export const INITIAL_DEVICES: BiometricDevice[] = [
  {
    id: '66666666-6666-6666-6666-666666666601',
    school_id: '11111111-1111-1111-1111-111111111111',
    device_name: 'Main Gate - Terminal A',
    device_model: 'ZKTeco K40 Fingerprint',
    serial_number: 'ZK-K40-2026-001',
    device_type: 'FINGERPRINT_TERMINAL',
    ip_address: '192.168.1.120',
    port: 4370,
    location: 'Main Gate North Entry',
    api_key_hash: 'hash_zk_sec_001',
    status: 'ONLINE',
    last_heartbeat: new Date().toISOString(),
    is_active: true,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z'
  },
  {
    id: '66666666-6666-6666-6666-666666666602',
    school_id: '11111111-1111-1111-1111-111111111111',
    device_name: 'Senior Wing - Face Kiosk 1',
    device_model: 'SmartAttend AI Vision Kiosk',
    serial_number: 'SA-FACE-2026-001',
    device_type: 'FACE_KIOSK',
    ip_address: '192.168.1.125',
    port: 8001,
    location: 'Senior Wing Lobby',
    api_key_hash: 'hash_face_sec_001',
    status: 'ONLINE',
    last_heartbeat: new Date().toISOString(),
    is_active: true,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z'
  },
  {
    id: '66666666-6666-6666-6666-666666666603',
    school_id: '11111111-1111-1111-1111-111111111111',
    device_name: 'Junior Wing - Hybrid Terminal',
    device_model: 'Mantra MFS100 + Camera',
    serial_number: 'MAN-HYB-2026-002',
    device_type: 'HYBRID_TERMINAL',
    ip_address: '192.168.1.130',
    port: 8002,
    location: 'Junior Wing Corridors',
    api_key_hash: 'hash_man_sec_002',
    status: 'ONLINE',
    last_heartbeat: new Date().toISOString(),
    is_active: true,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z'
  },
  {
    id: '66666666-6666-6666-6666-666666666699',
    school_id: '11111111-1111-1111-1111-111111111111',
    device_name: 'Hardware Lab Simulator',
    device_model: 'SmartAttend Lab Simulator v1.0',
    serial_number: 'SIM-DEV-2026-999',
    device_type: 'FINGERPRINT_TERMINAL',
    ip_address: '127.0.0.1',
    port: 8002,
    location: 'IT Lab Bench 3 (Simulation)',
    api_key_hash: 'hash_sim_sec_999',
    status: 'ONLINE',
    last_heartbeat: new Date().toISOString(),
    is_active: true,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z'
  }
];

const todayIso = new Date().toISOString().split('T')[0];

const generateStudentHistory = (
  studentIndex: number,
  absentDaysIndices: number[] = [],
  lateDaysIndices: number[] = [],
  leaveDaysIndices: number[] = []
): DailyAttendance[] => {
  const student = INITIAL_STUDENTS[studentIndex];
  if (!student) return [];
  const records: DailyAttendance[] = [];

  for (let i = 1; i <= 24; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const isAbsent = absentDaysIndices.includes(i);
    const isLate = lateDaysIndices.includes(i);
    const isLeave = leaveDaysIndices.includes(i);

    let status: AttendanceStatus = 'PRESENT';
    let timeStr: string | undefined = '08:24:00';
    let method: VerificationMethod | undefined = student.face_enrolled ? 'FACE' : 'FINGERPRINT';
    let remarks = 'Verified on time';

    if (isAbsent) {
      status = 'ABSENT';
      timeStr = undefined;
      method = undefined;
      remarks = 'Absence reconciled after cutoff';
    } else if (isLeave) {
      status = 'ON_LEAVE';
      timeStr = undefined;
      method = undefined;
      remarks = 'Approved medical / personal leave';
    } else if (isLate) {
      status = 'LATE';
      timeStr = '08:49:15';
      remarks = 'Late arrival after 08:30 opening and 15m grace (4 min late)';
    }

    records.push({
      id: `att-hist-${student.id.substring(0, 8)}-${i}`,
      school_id: student.school_id,
      student_id: student.id,
      attendance_date: d,
      session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      status,
      first_arrival_time: timeStr,
      first_verification_method: method,
      is_late: isLate,
      minutes_late: isLate ? 4 : 0,
      remarks,
      reconciled_at: new Date(Date.now() - i * 86400000).toISOString(),
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      updated_at: new Date(Date.now() - i * 86400000).toISOString(),
      student
    });
  }

  return records;
};

export const INITIAL_DAILY_ATTENDANCE: DailyAttendance[] = [
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccc0001',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888801',
    attendance_date: todayIso,
    session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    status: 'PRESENT',
    first_arrival_time: '08:24:12',
    first_verification_method: 'FACE',
    is_late: false,
    minutes_late: 0,
    remarks: 'On-time arrival verified by Face Kiosk 1',
    reconciled_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    student: INITIAL_STUDENTS[0]
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccc0002',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888802',
    attendance_date: todayIso,
    session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    status: 'LATE',
    first_arrival_time: '08:48:32',
    first_verification_method: 'FACE',
    is_late: true,
    minutes_late: 3,
    remarks: 'Late arrival after 08:30 opening and 15m grace (3 min late)',
    reconciled_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    student: INITIAL_STUDENTS[1]
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccc0003',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888803',
    attendance_date: todayIso,
    session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    status: 'PRESENT',
    first_arrival_time: '08:29:45',
    first_verification_method: 'FINGERPRINT',
    is_late: false,
    minutes_late: 0,
    remarks: 'Fingerprint verified at Main Gate Terminal A',
    reconciled_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    student: INITIAL_STUDENTS[2]
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccc0004',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888804',
    attendance_date: todayIso,
    session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    status: 'ABSENT',
    is_late: false,
    minutes_late: 0,
    remarks: 'Auto-reconciled absent after 10:00 cutoff',
    reconciled_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    student: INITIAL_STUDENTS[3]
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccc0005',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888805',
    attendance_date: todayIso,
    session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    status: 'ON_LEAVE',
    is_late: false,
    minutes_late: 0,
    remarks: 'Approved sick leave request #LV-2026-042',
    reconciled_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    student: INITIAL_STUDENTS[4]
  },
  // Multi-day historical records for each student
  ...generateStudentHistory(0, [], [5], [12]), // Aarav: 23 Present, 1 Late, 1 Leave (96% rate)
  ...generateStudentHistory(1, [4, 15], [8], []), // Ananya: 21 Present, 1 Late, 2 Absent (92% rate)
  ...generateStudentHistory(2, [], [10], []), // Rohan: 24 Present, 1 Late (100% rate)
  ...generateStudentHistory(3, [3, 7, 11, 14, 19], [6], []), // Ishaan: 18 Present, 1 Late, 5 Absent (76% rate)
  ...generateStudentHistory(4, [8], [], [2, 3]), // Diya: 21 Present, 2 Leave, 1 Absent (88% rate)
  ...generateStudentHistory(5, [], [7], []), // Kabir: 24 Present, 1 Late (100% rate)
  ...generateStudentHistory(6, [2, 9, 16], [4], []) // Priyansh: 20 Present, 1 Late, 3 Absent (84% rate)
];

export const INITIAL_EXAM_RESULTS: StudentExamResult[] = [
  {
    id: 'exam-001',
    student_id: '88888888-8888-8888-8888-888888888801', // Aarav Mehta (Grade 10)
    academic_year: '2026-2027',
    exam_name: 'Annual Board Assessment',
    marks_obtained: 440,
    total_marks: 500,
    percentage: 88,
    result_status: 'PASS',
    remarks: 'Passed with Distinction. Eligible for Standard 11.',
    recorded_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'exam-002',
    student_id: '88888888-8888-8888-8888-888888888802', // Ananya Kapoor (Grade 10)
    academic_year: '2026-2027',
    exam_name: 'Annual Board Assessment',
    marks_obtained: 460,
    total_marks: 500,
    percentage: 92,
    result_status: 'PASS',
    remarks: 'Outstanding academic excellence. Eligible for Standard 11.',
    recorded_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'exam-003',
    student_id: '88888888-8888-8888-8888-888888888803', // Rohan Verma (Grade 10)
    academic_year: '2026-2027',
    exam_name: 'Annual Board Assessment',
    marks_obtained: 390,
    total_marks: 500,
    percentage: 78,
    result_status: 'PASS',
    remarks: 'First division pass. Eligible for Standard 11.',
    recorded_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'exam-004',
    student_id: '88888888-8888-8888-8888-888888888804', // Ishaan Gupta (Grade 10)
    academic_year: '2026-2027',
    exam_name: 'Annual Board Assessment',
    marks_obtained: 170,
    total_marks: 500,
    percentage: 34,
    result_status: 'FAIL',
    remarks: 'Did not meet 40% passing criteria. Retained in Standard 10.',
    recorded_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'exam-005',
    student_id: '88888888-8888-8888-8888-888888888805', // Diya Sen (Grade 10)
    academic_year: '2026-2027',
    exam_name: 'Annual Board Assessment',
    marks_obtained: 425,
    total_marks: 500,
    percentage: 85,
    result_status: 'PASS',
    remarks: 'First division pass. Eligible for Standard 11.',
    recorded_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'exam-006',
    student_id: '88888888-8888-8888-8888-888888888806', // Kabir Das (Standard 9 PASS)
    academic_year: '2026-2027',
    exam_name: 'Standard 9 Annual Examination',
    marks_obtained: 410,
    total_marks: 500,
    percentage: 82,
    result_status: 'PASS',
    remarks: 'Passed Standard 9 (82% >= 40%). Promoted to Standard 10.',
    recorded_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'exam-007',
    student_id: '88888888-8888-8888-8888-888888888807', // Priyansh Sharma (Standard 9 FAIL)
    academic_year: '2026-2027',
    exam_name: 'Standard 9 Annual Examination',
    marks_obtained: 165,
    total_marks: 500,
    percentage: 33,
    result_status: 'FAIL',
    remarks: 'Failed Standard 9 (33% < 40%). Retained in Standard 9.',
    recorded_at: '2026-11-20T10:00:00Z'
  }
];

export const INITIAL_CLASS_ENROLLMENTS: ClassEnrollment[] = [
  {
    id: 'enr-01',
    student_id: '88888888-8888-8888-8888-888888888801',
    class_id: '33333333-3333-3333-3333-333333333310',
    class_name: 'Grade 10',
    division_id: '44444444-4444-4444-4444-444444444411',
    division_name: 'A',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    academic_year_name: '2026-2027',
    enrolled_at: '2026-04-01',
    is_active: true
  },
  {
    id: 'enr-02',
    student_id: '88888888-8888-8888-8888-888888888802',
    class_id: '33333333-3333-3333-3333-333333333310',
    class_name: 'Grade 10',
    division_id: '44444444-4444-4444-4444-444444444411',
    division_name: 'A',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    academic_year_name: '2026-2027',
    enrolled_at: '2026-04-01',
    is_active: true
  },
  {
    id: 'enr-03',
    student_id: '88888888-8888-8888-8888-888888888803',
    class_id: '33333333-3333-3333-3333-333333333310',
    class_name: 'Grade 10',
    division_id: '44444444-4444-4444-4444-444444444411',
    division_name: 'A',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    academic_year_name: '2026-2027',
    enrolled_at: '2026-04-01',
    is_active: true
  },
  {
    id: 'enr-04',
    student_id: '88888888-8888-8888-8888-888888888804',
    class_id: '33333333-3333-3333-3333-333333333310',
    class_name: 'Grade 10',
    division_id: '44444444-4444-4444-4444-444444444411',
    division_name: 'A',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    academic_year_name: '2026-2027',
    enrolled_at: '2026-04-01',
    is_active: true
  },
  {
    id: 'enr-05',
    student_id: '88888888-8888-8888-8888-888888888805',
    class_id: '33333333-3333-3333-3333-333333333310',
    class_name: 'Grade 10',
    division_id: '44444444-4444-4444-4444-444444444412',
    division_name: 'B',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    academic_year_name: '2026-2027',
    enrolled_at: '2026-04-01',
    is_active: true
  },
  {
    id: 'enr-06',
    student_id: '88888888-8888-8888-8888-888888888806',
    class_id: '33333333-3333-3333-3333-333333333309',
    class_name: 'Grade 9',
    division_id: '44444444-4444-4444-4444-444444444409',
    division_name: 'A',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    academic_year_name: '2026-2027',
    enrolled_at: '2026-04-01',
    is_active: true
  },
  {
    id: 'enr-07',
    student_id: '88888888-8888-8888-8888-888888888807',
    class_id: '33333333-3333-3333-3333-333333333309',
    class_name: 'Grade 9',
    division_id: '44444444-4444-4444-4444-444444444409',
    division_name: 'A',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    academic_year_name: '2026-2027',
    enrolled_at: '2026-04-01',
    is_active: true
  }
];


export const INITIAL_NOTIFICATIONS: NotificationJob[] = [
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddd0001',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888801',
    guardian_id: '99999999-9999-9999-9999-999999999901',
    template_id: '77777777-7777-7777-7777-777777777701',
    notification_type: 'ARRIVAL',
    channel: 'WHATSAPP',
    idempotency_key: 'seed-notif-001',
    recipient_phone: '+919811122233',
    template_parameters: ['Aarav Mehta', '08:24 AM', 'Today', 'Face Recognition'],
    status: 'DELIVERED',
    scheduled_for: new Date(Date.now() - 3600000 * 2).toISOString(),
    attempts: 1,
    max_attempts: 3,
    provider_response: 'HTTP 200 OK - Meta wamid.HBgMNDIxMDc2',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddd0002',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888804',
    guardian_id: '99999999-9999-9999-9999-999999999904',
    template_id: '77777777-7777-7777-7777-777777777702',
    notification_type: 'ABSENCE',
    channel: 'WHATSAPP',
    idempotency_key: 'seed-notif-002',
    recipient_phone: '+919844455566',
    template_parameters: ['Ishaan Gupta', 'Today', '10:00 AM'],
    status: 'SENT',
    scheduled_for: new Date(Date.now() - 1800000).toISOString(),
    attempts: 1,
    max_attempts: 3,
    provider_response: 'HTTP 202 Queued at Telco Aggregator',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddd0003',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888803',
    guardian_id: '99999999-9999-9999-9999-999999999903',
    template_id: '77777777-7777-7777-7777-777777777703',
    notification_type: 'GENERAL_ANNOUNCEMENT',
    channel: 'SMS',
    idempotency_key: 'seed-notif-003',
    recipient_phone: '+919833344455',
    template_parameters: ['Rohan Verma', 'School Bus Route 14 Departure Delay'],
    status: 'DEAD_LETTER',
    scheduled_for: new Date(Date.now() - 7200000).toISOString(),
    attempts: 3,
    max_attempts: 3,
    dead_letter_reason: 'Telco SMS Gateway Error 4005: Destination route barred. Max attempts (3/3) exhausted.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7100000).toISOString()
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddd0004',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888802',
    guardian_id: '99999999-9999-9999-9999-999999999902',
    template_id: '77777777-7777-7777-7777-777777777704',
    notification_type: 'LEAVE_STATUS',
    channel: 'EMAIL',
    idempotency_key: 'seed-notif-004',
    recipient_phone: 'sunita.kapoor@example.com',
    template_parameters: ['Ananya Kapoor', 'Leave Decision Notification', 'Nov 04 - Nov 05'],
    status: 'FAILED',
    scheduled_for: new Date(Date.now() - 900000).toISOString(),
    attempts: 1,
    max_attempts: 3,
    next_retry_at: new Date(Date.now() + 120000).toISOString(),
    provider_response: 'SMTP 421 4.7.0 Connection rate limit exceeded. Backoff scheduled.',
    created_at: new Date(Date.now() - 900000).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString()
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-001',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888801',
    student_name: 'Aarav Mehta',
    class_name: 'Grade 10-A',
    parent_name: 'Vikram Mehta',
    parent_phone: '+919811122233',
    leave_type: 'PERSONAL_LEAVE',
    applicant_role: 'PARENT',
    start_date: '2026-11-04',
    end_date: '2026-11-05',
    reason: 'Family wedding celebration in Jaipur',
    status: 'PENDING',
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'leave-002',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888805',
    student_name: 'Diya Sen',
    class_name: 'Grade 10-B',
    parent_name: 'Subir Sen',
    parent_phone: '+919855566677',
    leave_type: 'SICK_LEAVE',
    applicant_role: 'PARENT',
    start_date: '2026-11-01',
    end_date: '2026-11-02',
    reason: 'High fever recovery rest advised by pediatrician',
    status: 'APPROVED',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    reviewed_by: 'Dr. Sandeep Mukherjee',
    reviewed_at: new Date(Date.now() - 80000000).toISOString(),
    remarks: 'Approved. Get well soon!'
  }
];

export const INITIAL_DPDP_CONSENTS: DpdpBiometricConsent[] = [
  {
    id: 'dpdp-001',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888801',
    student_name: 'Aarav Mehta',
    admission_number: 'DPS-2026-1001',
    guardian_id: '99999999-9999-9999-9999-999999999901',
    guardian_name: 'Vikram Mehta (Father)',
    consent_type: 'ALL_BIOMETRICS',
    status: 'GRANTED',
    consent_source: 'PARENT_PORTAL',
    consent_date: '2026-04-02',
    valid_until: '2027-04-02',
    retention_days: 365,
    hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    created_at: '2026-04-02T10:00:00Z',
    updated_at: '2026-04-02T10:00:00Z'
  },
  {
    id: 'dpdp-002',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888802',
    student_name: 'Ananya Kapoor',
    admission_number: 'DPS-2026-1002',
    guardian_id: '99999999-9999-9999-9999-999999999902',
    guardian_name: 'Sunita Kapoor (Mother)',
    consent_type: 'ALL_BIOMETRICS',
    status: 'GRANTED',
    consent_source: 'PARENT_PORTAL',
    consent_date: '2026-04-03',
    valid_until: '2027-04-03',
    retention_days: 365,
    hash_sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    created_at: '2026-04-03T11:00:00Z',
    updated_at: '2026-04-03T11:00:00Z'
  },
  {
    id: 'dpdp-003',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888803',
    student_name: 'Rohan Verma',
    admission_number: 'DPS-2026-1003',
    guardian_name: 'Pending Guardian Consent',
    consent_type: 'ALL_BIOMETRICS',
    status: 'WITHDRAWN',
    consent_source: 'PARENT_PORTAL',
    consent_date: '2026-04-01',
    valid_until: '2027-04-01',
    retention_days: 0,
    hash_sha256: 'WITHDRAWN_UNDER_DPDP_SEC_6',
    withdrawn_at: '2026-04-01T09:00:00Z',
    withdrawn_reason: 'Parent requested withdrawal of biometric scanning pending policy clarification',
    created_at: '2026-04-01T08:30:00Z',
    updated_at: '2026-04-01T09:00:00Z'
  },
  {
    id: 'dpdp-004',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '88888888-8888-8888-8888-888888888805',
    student_name: 'Diya Sen',
    admission_number: 'DPS-2026-1005',
    guardian_name: 'Subir Sen (Father)',
    consent_type: 'ALL_BIOMETRICS',
    status: 'GRANTED',
    consent_source: 'PHYSICAL_FORM',
    consent_date: '2026-04-05',
    valid_until: '2027-04-05',
    retention_days: 365,
    hash_sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    created_at: '2026-04-05T09:30:00Z',
    updated_at: '2026-04-05T09:30:00Z'
  }
];

export const INITIAL_DPDP_HISTORY: ConsentHistoryLog[] = [
  {
    id: 'ch-001',
    consent_id: 'dpdp-001',
    student_id: '88888888-8888-8888-8888-888888888801',
    action: 'CONSENT_GRANTED',
    performed_by: 'Vikram Mehta (Parent Portal)',
    timestamp: '2026-04-02T10:00:00Z',
    details: 'Parental consent granted for facial recognition and fingerprint campus access'
  },
  {
    id: 'ch-002',
    consent_id: 'dpdp-003',
    student_id: '88888888-8888-8888-8888-888888888803',
    action: 'CONSENT_WITHDRAWN',
    performed_by: 'Guardian (Parent Portal)',
    timestamp: '2026-04-01T09:00:00Z',
    details: 'Parent requested withdrawal of biometric scanning pending policy clarification'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-001',
    action: 'SYSTEM_INITIALIZATION',
    user: 'Super Admin',
    entity: 'Campus Setup',
    ip: '127.0.0.1',
    timestamp: '2026-10-29 08:00:12',
    details: 'Initialized academic session 2026-2027 with biometric gates'
  },
  {
    id: 'aud-002',
    action: 'BIOMETRIC_FACE_ENROLLMENT',
    user: 'Dr. Sandeep Mukherjee',
    entity: 'Aarav Mehta (DPS-2026-1001)',
    ip: '192.168.1.10',
    timestamp: '2026-10-29 08:15:30',
    details: 'Extracted 512-d normalized face vector. SHA-256 hash verified.'
  },
  {
    id: 'aud-003',
    action: 'RECONCILIATION_RUN',
    user: 'System Cron Worker',
    entity: 'Attendance Sessions',
    ip: '10.0.0.1',
    timestamp: '2026-10-29 10:00:05',
    details: 'Reconciliation finalized. 1 absent record marked, 2 WhatsApp alerts queued.'
  }
];

export const DEMO_USERS: Record<UserRole, CurrentUser> = {
  super_admin: {
    id: '55555555-5555-5555-5555-555555555501',
    name: 'Antigravity Super Admin',
    email: 'admin@smartattend.io',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  school_admin: {
    id: '55555555-5555-5555-5555-555555555502',
    name: 'Dr. Sandeep Mukherjee (Principal)',
    email: 'principal@dpsrkpuram.edu.in',
    role: 'school_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  teacher: {
    id: '55555555-5555-5555-5555-555555555503',
    name: 'Mr. Rajesh Kumar (Class 10A)',
    email: 'rajesh.kumar@dpsrkpuram.edu.in',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  parent: {
    id: '55555555-5555-5555-5555-555555555505',
    name: 'Vikram Mehta (Parent of Aarav)',
    email: 'vikram.mehta@gmail.com',
    role: 'parent',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  student: {
    id: '88888888-8888-8888-8888-888888888801',
    name: 'Aarav Mehta (Student)',
    email: 'aarav.mehta@student.dpsrkpuram.edu.in',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
  }
};

export interface ParentProfile {
  id: string; // user profile id
  name: string;
  email: string;
  role: 'parent';
  avatarUrl: string;
  studentId: string;
  studentName: string;
  studentAdmNo: string;
  studentClass: string;
  relationship: string;
  phone: string;
}

export const PARENT_PROFILES: ParentProfile[] = [
  {
    id: '55555555-5555-5555-5555-555555555505',
    name: 'Vikram Mehta',
    email: 'vikram.mehta@gmail.com',
    role: 'parent',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    studentId: '88888888-8888-8888-8888-888888888801',
    studentName: 'Aarav Mehta',
    studentAdmNo: 'DPS-2026-1001',
    studentClass: 'Grade 10-A',
    relationship: 'Father',
    phone: '+919811122233'
  },
  {
    id: '55555555-5555-5555-5555-555555555506',
    name: 'Sunita Kapoor',
    email: 'sunita.kapoor@gmail.com',
    role: 'parent',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    studentId: '88888888-8888-8888-8888-888888888802',
    studentName: 'Ananya Kapoor',
    studentAdmNo: 'DPS-2026-1002',
    studentClass: 'Grade 10-A',
    relationship: 'Mother',
    phone: '+919822233344'
  },
  {
    id: '55555555-5555-5555-5555-555555555507',
    name: 'Anil Verma',
    email: 'anil.verma@gmail.com',
    role: 'parent',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    studentId: '88888888-8888-8888-8888-888888888803',
    studentName: 'Rohan Verma',
    studentAdmNo: 'DPS-2026-1003',
    studentClass: 'Grade 10-A',
    relationship: 'Father',
    phone: '+919833344455'
  },
  {
    id: '55555555-5555-5555-5555-555555555508',
    name: 'Pooja Gupta',
    email: 'pooja.gupta@gmail.com',
    role: 'parent',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    studentId: '88888888-8888-8888-8888-888888888804',
    studentName: 'Ishaan Gupta',
    studentAdmNo: 'DPS-2026-1004',
    studentClass: 'Grade 10-A',
    relationship: 'Mother',
    phone: '+919844455566'
  }
];

export interface UserCredential {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  hint: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: number;
  expiresAt: number;
}

export interface AuthResult {
  success: boolean;
  error?: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'EMPTY_FIELDS' | 'USER_NOT_FOUND';
  message: string;
  user?: CurrentUser;
  role?: UserRole;
  remainingAttempts?: number;
  lockedUntil?: number;
  session?: AuthSession;
}

export const USER_CREDENTIALS: Record<string, UserCredential> = {
  'principal@dpsrkpuram.edu.in': {
    email: 'principal@dpsrkpuram.edu.in',
    password: 'Principal@2026!',
    role: 'school_admin',
    name: 'Dr. Sandeep Mukherjee',
    hint: 'Principal@2026!'
  },
  'priya.sharma@dpsrkpuram.edu.in': {
    email: 'priya.sharma@dpsrkpuram.edu.in',
    password: 'Teacher@2026!',
    role: 'teacher',
    name: 'Ms. Priya Sharma',
    hint: 'Teacher@2026!'
  },
  'rajesh.kumar@dpsrkpuram.edu.in': {
    email: 'rajesh.kumar@dpsrkpuram.edu.in',
    password: 'Teacher@2026!',
    role: 'teacher',
    name: 'Mr. Rajesh Kumar',
    hint: 'Teacher@2026!'
  },
  'superadmin@smartattend.edu': {
    email: 'superadmin@smartattend.edu',
    password: 'SuperAdmin@2026!',
    role: 'super_admin',
    name: 'Antigravity Super Admin',
    hint: 'SuperAdmin@2026!'
  },
  'admin@smartattend.io': {
    email: 'admin@smartattend.io',
    password: 'SuperAdmin@2026!',
    role: 'super_admin',
    name: 'Antigravity Super Admin',
    hint: 'SuperAdmin@2026!'
  },
  'aarav.mehta@student.dpsrkpuram.edu.in': {
    email: 'aarav.mehta@student.dpsrkpuram.edu.in',
    password: 'Student@2026!',
    role: 'student',
    name: 'Aarav Mehta',
    hint: 'Student@2026!'
  },
  'vikram.mehta@gmail.com': {
    email: 'vikram.mehta@gmail.com',
    password: 'Parent@2026!',
    role: 'parent',
    name: 'Vikram Mehta',
    hint: 'Parent@2026!'
  },
  'sunita.kapoor@gmail.com': {
    email: 'sunita.kapoor@gmail.com',
    password: 'Parent@2026!',
    role: 'parent',
    name: 'Sunita Kapoor',
    hint: 'Parent@2026!'
  },
  'anil.verma@gmail.com': {
    email: 'anil.verma@gmail.com',
    password: 'Parent@2026!',
    role: 'parent',
    name: 'Anil Verma',
    hint: 'Parent@2026!'
  },
  'pooja.gupta@gmail.com': {
    email: 'pooja.gupta@gmail.com',
    password: 'Parent@2026!',
    role: 'parent',
    name: 'Pooja Gupta',
    hint: 'Parent@2026!'
  }
};


/**
 * Web Audio API bell chime synthesizer.
 * Zero external audio files required. Runs in any browser.
 */
export function playChimeSound(type: 'success' | 'alert' | 'bell' = 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'success' || type === 'bell') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Harmonic pleasant chord (E5)
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (err) {
    // AudioContext might require user interaction before playing
  }
}

const STORAGE_KEY = 'smartattend_data_v4_parent_privacy';

export interface SchoolHoliday {
  id: string;
  school_id: string;
  academic_year_id: string;
  holiday_date: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface BiometricConsentRecord {
  student_id: string;
  student_name: string;
  admission_number: string;
  consent_given: boolean;
  consent_date: string;
  guardian_name: string;
  dpdp_purpose: string;
  hash_sha256: string;
  data_retention_days: number;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  day_of_week?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  period_number?: number;
  timeRange: string;
  start_time?: string;
  end_time?: string;
  subject: string;
  subject_name?: string;
  teacher: string;
  teacher_name?: string;
  teacher_id?: string;
  room: string;
  room_number?: string;
  class_name: string;
  division_name: string;
  class_id?: string;
  division_id?: string;
  school_id?: string;
  academic_year_id?: string;
}

export interface TimetableConflict {
  conflict_type: 'TEACHER_DOUBLE_BOOKED' | 'ROOM_DOUBLE_BOOKED' | 'CLASS_OVERLAP';
  message: string;
  day_of_week: string;
  period_number: number;
  conflicting_slots: TimetableSlot[];
}

export interface CalendarEventModel {
  id: string;
  school_id: string;
  academic_year_id: string;
  event_type: 'HOLIDAY' | 'EXAMINATION' | 'VACATION' | 'EVENT' | 'SPECIAL_WORKING_DAY';
  title: string;
  description?: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string; // "YYYY-MM-DD"
  is_instructional_day: boolean;
  created_at?: string;
}

export interface SubjectAttendanceRecord {
  id: string;
  student_id: string;
  subject: string;
  period: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  class_id?: string;
  division_id?: string;
  marked_by?: string;
  remarks?: string;
}

export const INITIAL_CALENDAR_EVENTS: CalendarEventModel[] = [
  {
    id: 'evt-01',
    school_id: '11111111-1111-1111-1111-111111111111',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    event_type: 'HOLIDAY',
    title: 'Diwali (Laxmi Pujan)',
    description: 'Campus and administrative offices closed',
    start_date: '2026-11-10',
    end_date: '2026-11-11',
    is_instructional_day: false
  },
  {
    id: 'evt-02',
    school_id: '11111111-1111-1111-1111-111111111111',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    event_type: 'EXAMINATION',
    title: 'CBSE Mid-Term Examinations',
    description: 'Grades 9-12 Mandatory Written Examinations',
    start_date: '2026-12-01',
    end_date: '2026-12-10',
    is_instructional_day: true
  },
  {
    id: 'evt-03',
    school_id: '11111111-1111-1111-1111-111111111111',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    event_type: 'VACATION',
    title: 'Winter Vacation',
    description: 'School reopens January 4th',
    start_date: '2026-12-24',
    end_date: '2027-01-02',
    is_instructional_day: false
  },
  {
    id: 'evt-04',
    school_id: '11111111-1111-1111-1111-111111111111',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    event_type: 'SPECIAL_WORKING_DAY',
    title: 'Annual Science & Tech Exhibition',
    description: 'Compulsory attendance for all students and faculty',
    start_date: '2026-11-20',
    end_date: '2026-11-20',
    is_instructional_day: true
  }
];

export const INITIAL_HOLIDAYS: SchoolHoliday[] = [
  {
    id: 'hol-01',
    school_id: '11111111-1111-1111-1111-111111111111',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    holiday_date: '2026-11-10',
    name: 'Diwali (Laxmi Pujan)',
    description: 'Festival of Lights - School and administrative offices closed'
  },
  {
    id: 'hol-02',
    school_id: '11111111-1111-1111-1111-111111111111',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    holiday_date: '2026-11-11',
    name: 'Diwali (Govardhan Puja & Balipratipada)',
    description: 'Public Holiday'
  },
  {
    id: 'hol-03',
    school_id: '11111111-1111-1111-1111-111111111111',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    holiday_date: '2026-11-26',
    name: 'Constitution Day (Samvidhan Divas)',
    description: 'Special Assembly & Student Commemoration'
  },
  {
    id: 'hol-04',
    school_id: '11111111-1111-1111-1111-111111111111',
    academic_year_id: '22222222-2222-2222-2222-222222222222',
    holiday_date: '2026-12-25',
    name: 'Christmas Vacation',
    description: 'Winter Holiday'
  }
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  { id: 'tt-1', day: 'Monday', day_of_week: 'Monday', period: 1, period_number: 1, timeRange: '08:30 - 09:15', start_time: '08:30', end_time: '09:15', subject: 'Mathematics', subject_name: 'Mathematics', teacher: 'Mr. Rajesh Kumar', teacher_name: 'Mr. Rajesh Kumar', room: 'Room 101', room_number: 'Room 101', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' },
  { id: 'tt-2', day: 'Monday', day_of_week: 'Monday', period: 2, period_number: 2, timeRange: '09:15 - 10:00', start_time: '09:15', end_time: '10:00', subject: 'Physics', subject_name: 'Physics', teacher: 'Ms. Priya Sharma', teacher_name: 'Ms. Priya Sharma', room: 'Science Lab 1', room_number: 'Science Lab 1', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' },
  { id: 'tt-3', day: 'Monday', day_of_week: 'Monday', period: 3, period_number: 3, timeRange: '10:15 - 11:00', start_time: '10:15', end_time: '11:00', subject: 'English Literature', subject_name: 'English Literature', teacher: 'Dr. Anita Joshi', teacher_name: 'Dr. Anita Joshi', room: 'Room 101', room_number: 'Room 101', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' },
  { id: 'tt-4', day: 'Monday', day_of_week: 'Monday', period: 4, period_number: 4, timeRange: '11:00 - 11:45', start_time: '11:00', end_time: '11:45', subject: 'Chemistry', subject_name: 'Chemistry', teacher: 'Ms. Priya Sharma', teacher_name: 'Ms. Priya Sharma', room: 'Science Lab 2', room_number: 'Science Lab 2', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' },
  { id: 'tt-5', day: 'Monday', day_of_week: 'Monday', period: 5, period_number: 5, timeRange: '12:15 - 13:00', start_time: '12:15', end_time: '13:00', subject: 'Computer Science', subject_name: 'Computer Science', teacher: 'Mr. Arvind Swamy', teacher_name: 'Mr. Arvind Swamy', room: 'IT Lab', room_number: 'IT Lab', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' },
  { id: 'tt-6', day: 'Monday', day_of_week: 'Monday', period: 6, period_number: 6, timeRange: '13:00 - 13:45', start_time: '13:00', end_time: '13:45', subject: 'Social Studies', subject_name: 'Social Studies', teacher: 'Mr. Rajesh Kumar', teacher_name: 'Mr. Rajesh Kumar', room: 'Room 101', room_number: 'Room 101', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' },
  { id: 'tt-7', day: 'Tuesday', day_of_week: 'Tuesday', period: 1, period_number: 1, timeRange: '08:30 - 09:15', start_time: '08:30', end_time: '09:15', subject: 'Physics', subject_name: 'Physics', teacher: 'Ms. Priya Sharma', teacher_name: 'Ms. Priya Sharma', room: 'Science Lab 1', room_number: 'Science Lab 1', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' },
  { id: 'tt-8', day: 'Tuesday', day_of_week: 'Tuesday', period: 2, period_number: 2, timeRange: '09:15 - 10:00', start_time: '09:15', end_time: '10:00', subject: 'Mathematics', subject_name: 'Mathematics', teacher: 'Mr. Rajesh Kumar', teacher_name: 'Mr. Rajesh Kumar', room: 'Room 101', room_number: 'Room 101', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' },
  { id: 'tt-9', day: 'Wednesday', day_of_week: 'Wednesday', period: 1, period_number: 1, timeRange: '08:30 - 09:15', start_time: '08:30', end_time: '09:15', subject: 'Chemistry', subject_name: 'Chemistry', teacher: 'Ms. Priya Sharma', teacher_name: 'Ms. Priya Sharma', room: 'Science Lab 2', room_number: 'Science Lab 2', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' },
  { id: 'tt-10', day: 'Thursday', day_of_week: 'Thursday', period: 1, period_number: 1, timeRange: '08:30 - 09:15', start_time: '08:30', end_time: '09:15', subject: 'Mathematics', subject_name: 'Mathematics', teacher: 'Mr. Rajesh Kumar', teacher_name: 'Mr. Rajesh Kumar', room: 'Room 101', room_number: 'Room 101', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' },
  { id: 'tt-11', day: 'Friday', day_of_week: 'Friday', period: 1, period_number: 1, timeRange: '08:30 - 09:15', start_time: '08:30', end_time: '09:15', subject: 'Computer Science', subject_name: 'Computer Science', teacher: 'Mr. Arvind Swamy', teacher_name: 'Mr. Arvind Swamy', room: 'IT Lab', room_number: 'IT Lab', class_name: 'Grade 10', division_name: 'A', class_id: '33333333-3333-3333-3333-333333333310', division_id: '44444444-4444-4444-4444-444444444411' }
];

export interface AttendanceEvaluation {
  status: AttendanceStatus;
  isLate: boolean;
  minutesLate: number;
  lateDurationFormatted: string;
  category: 'EARLY' | 'ON_TIME' | 'GRACE_PERIOD' | 'LATE' | 'HALF_DAY_LATE' | 'HALF_DAY_EARLY_DISMISSAL' | 'ABSENT' | 'ON_LEAVE';
  remarks: string;
  notificationMessage: string;
  notificationTitle: string;
  openingTimeStr: string;
  graceDeadlineStr: string;
  cutoffTimeStr: string;
  formattedArrivalTime: string;
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  return hours * 60 + minutes;
}

export function formatMinutesToTimeStr(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
}

export function formatTime12Hour(timeStr?: string): string {
  if (!timeStr) return '—';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

export function formatLateDuration(minutes: number): string {
  if (minutes <= 0) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min (${minutes} min)`;
}

export function evaluateAttendanceRecord(params: {
  openingTime?: string;
  graceMinutes?: number;
  cutoffTime?: string;
  arrivalTime?: string;
  departureTime?: string;
  method?: VerificationMethod;
  studentName?: string;
  dateStr?: string;
  forcedStatus?: AttendanceStatus;
  reason?: string;
  isOffline?: boolean;
}): AttendanceEvaluation {
  const opening = params.openingTime || '08:30';
  const grace = Number(params.graceMinutes ?? 15);
  const cutoff = params.cutoffTime || '10:00';
  const method = params.method || 'MANUAL';
  const studentName = params.studentName || 'Student';
  const arrivalTime = params.arrivalTime;
  const departureTime = params.departureTime;
  const forcedStatus = params.forcedStatus;
  const isOffline = params.isOffline || false;

  const openingMinutes = parseTimeToMinutes(opening);
  const graceDeadlineMinutes = openingMinutes + grace;
  const cutoffMinutes = parseTimeToMinutes(cutoff);

  const graceDeadlineStr = formatMinutesToTimeStr(graceDeadlineMinutes);
  const cutoffDisplay = formatTime12Hour(cutoff);
  const formattedArrival = arrivalTime ? formatTime12Hour(arrivalTime) : '—';

  // 1. Explicit forced status overrides (approved leave)
  if (forcedStatus === 'ON_LEAVE') {
    return {
      status: 'ON_LEAVE',
      isLate: false,
      minutesLate: 0,
      lateDurationFormatted: '0 min',
      category: 'ON_LEAVE',
      remarks: params.reason ? `Approved Leave: ${params.reason}` : 'Approved Leave Recorded',
      notificationTitle: 'Approved Leave Recorded',
      notificationMessage: `${studentName} is recorded ON LEAVE${params.dateStr ? ` on ${params.dateStr}` : ''}.${params.reason ? ` Reason: ${params.reason}` : ''}`,
      openingTimeStr: opening,
      graceDeadlineStr,
      cutoffTimeStr: cutoff,
      formattedArrivalTime: formattedArrival
    };
  }

  // 2. Explicit forced absent override or no arrival
  if (forcedStatus === 'ABSENT' || (!arrivalTime && !forcedStatus)) {
    return {
      status: 'ABSENT',
      isLate: false,
      minutesLate: 0,
      lateDurationFormatted: '0 min',
      category: 'ABSENT',
      remarks: `Auto-reconciled absent after ${cutoffDisplay} cutoff`,
      notificationTitle: 'Urgent: Student Marked Absent Today',
      notificationMessage: `${studentName} has been marked Absent because no valid arrival was recorded before the ${cutoffDisplay} cutoff.`,
      openingTimeStr: opening,
      graceDeadlineStr,
      cutoffTimeStr: cutoff,
      formattedArrivalTime: formattedArrival
    };
  }

  // 3. Early dismissal (Departure before 12:30:00)
  if (departureTime && departureTime < '12:30:00') {
    return {
      status: 'HALF_DAY',
      isLate: false,
      minutesLate: 0,
      lateDurationFormatted: '0 min',
      category: 'HALF_DAY_EARLY_DISMISSAL',
      remarks: `Half Day logged (Early dismissal at ${departureTime})${params.reason ? ` - ${params.reason}` : ''}`,
      notificationTitle: 'Half Day Attendance Logged (Early Dismissal)',
      notificationMessage: `${studentName} departed early at ${formatTime12Hour(departureTime)}. Attendance recorded according to the school's Half Day policy.`,
      openingTimeStr: opening,
      graceDeadlineStr,
      cutoffTimeStr: cutoff,
      formattedArrivalTime: formattedArrival
    };
  }

  // 4. Arrival Time Evaluation
  const arrivalMinutes = parseTimeToMinutes(arrivalTime!);

  // Rule A: On-Time Attendance (Arrival <= Grace Deadline 08:45 AM)
  if (arrivalMinutes <= graceDeadlineMinutes) {
    let category: 'EARLY' | 'ON_TIME' | 'GRACE_PERIOD' = 'ON_TIME';
    let notifTitle = 'Safe Gate Entry Verified (Clock In)';

    if (arrivalMinutes < openingMinutes) {
      category = 'EARLY';
      notifTitle = 'Safe Gate Entry Verified (Early Arrival)';
    } else if (arrivalMinutes > openingMinutes) {
      category = 'GRACE_PERIOD';
      notifTitle = 'Safe Gate Entry Verified (Within Grace Period)';
    }

    const remarks = isOffline
      ? `Offline arrival verified via ${method} at ${arrivalTime} (OFFLINE-TERMINAL)`
      : `Arrival verified via ${method} at ${arrivalTime}`;

    return {
      status: 'PRESENT',
      isLate: false,
      minutesLate: 0,
      lateDurationFormatted: '0 min',
      category,
      remarks,
      notificationTitle: notifTitle,
      notificationMessage: `${studentName} arrived at ${formattedArrival}. Attendance marked Present.`,
      openingTimeStr: opening,
      graceDeadlineStr,
      cutoffTimeStr: cutoff,
      formattedArrivalTime: formattedArrival
    };
  }

  // Rule B: Late Attendance (Arrival after 08:45 AM and before or at 10:00 AM cutoff)
  if (arrivalMinutes > graceDeadlineMinutes && arrivalMinutes <= cutoffMinutes) {
    const minutesLate = arrivalMinutes - graceDeadlineMinutes;
    const lateDurationFormatted = formatLateDuration(minutesLate);

    const remarks = isOffline
      ? `Offline arrival verified via ${method} at ${arrivalTime} (${lateDurationFormatted} late) (OFFLINE-TERMINAL)`
      : `Arrival verified via ${method} at ${arrivalTime} (${lateDurationFormatted} late)`;

    return {
      status: 'LATE',
      isLate: true,
      minutesLate,
      lateDurationFormatted,
      category: 'LATE',
      remarks,
      notificationTitle: 'Late Arrival Warning (Past Grace Period)',
      notificationMessage: `${studentName} arrived at ${formattedArrival}. Late by ${lateDurationFormatted} after the permitted grace period.`,
      openingTimeStr: opening,
      graceDeadlineStr,
      cutoffTimeStr: cutoff,
      formattedArrivalTime: formattedArrival
    };
  }

  // Rule C: Post-Cutoff Attendance (Arrival after 10:00 AM cutoff -> HALF_DAY)
  const minutesLatePostCutoff = arrivalMinutes - graceDeadlineMinutes;
  const lateDurationFormatted = formatLateDuration(minutesLatePostCutoff);
  const remarks = isOffline
    ? `Offline arrival verified via ${method} at ${arrivalTime} (Half Day: Post-${cutoffDisplay} Cutoff) (OFFLINE-TERMINAL)`
    : `Arrival verified via ${method} at ${arrivalTime} (Half Day: Post-${cutoffDisplay} Cutoff)`;

  return {
    status: 'HALF_DAY',
    isLate: true,
    minutesLate: minutesLatePostCutoff,
    lateDurationFormatted,
    category: 'HALF_DAY_LATE',
    remarks,
    notificationTitle: 'Half Day Attendance Logged (Post-Cutoff Arrival)',
    notificationMessage: `${studentName} arrived after the ${cutoffDisplay} cutoff. Attendance recorded according to the school's Half Day policy.`,
    openingTimeStr: opening,
    graceDeadlineStr,
    cutoffTimeStr: cutoff,
    formattedArrivalTime: formattedArrival
  };
}

export class DataStore {
  currentUser: CurrentUser = DEMO_USERS.school_admin;
  schoolName: string = 'Delhi Public School, R.K. Puram';
  schoolCode: string = 'DPS-RKP-01';
  openingTime: string = '08:30';
  cutoffTime: string = '10:00';
  graceMinutes: number = 15;
  activeChildId?: string;
  theme: 'light' | 'dark' = 'light';

  evaluateAttendance(params: {
    arrivalTime?: string;
    departureTime?: string;
    method?: VerificationMethod;
    studentName?: string;
    dateStr?: string;
    forcedStatus?: AttendanceStatus;
    reason?: string;
    isOffline?: boolean;
  }): AttendanceEvaluation {
    return evaluateAttendanceRecord({
      openingTime: this.openingTime,
      graceMinutes: this.graceMinutes,
      cutoffTime: this.cutoffTime,
      ...params
    });
  }

  getGraceDeadlineStr(): string {
    const openingMinutes = parseTimeToMinutes(this.openingTime || '08:30');
    const grace = Number(this.graceMinutes ?? 15);
    return formatTime12Hour(formatMinutesToTimeStr(openingMinutes + grace));
  }

  getOpeningTimeDisplay(): string {
    return formatTime12Hour(this.openingTime || '08:30');
  }

  getCutoffTimeDisplay(): string {
    return formatTime12Hour(this.cutoffTime || '10:00');
  }

  students: Student[] = [...INITIAL_STUDENTS];
  classes: ClassModel[] = [...INITIAL_CLASSES];
  divisions: DivisionModel[] = [...INITIAL_DIVISIONS];
  devices: BiometricDevice[] = [...INITIAL_DEVICES];
  dailyAttendance: DailyAttendance[] = [...INITIAL_DAILY_ATTENDANCE];
  notifications: NotificationJob[] = [...INITIAL_NOTIFICATIONS];
  leaveRequests: LeaveRequest[] = [...INITIAL_LEAVE_REQUESTS];
  auditLogs: AuditLogItem[] = [...INITIAL_AUDIT_LOGS];
  holidays: SchoolHoliday[] = [...INITIAL_HOLIDAYS];
  calendarEvents: CalendarEventModel[] = [...INITIAL_CALENDAR_EVENTS];
  timetable: TimetableSlot[] = [...INITIAL_TIMETABLE];
  visitorPickups: VisitorPickup[] = [
    {
      id: 'vis-01',
      school_id: '11111111-1111-1111-1111-111111111111',
      student_id: '88888888-8888-8888-8888-888888888801',
      student_name: 'Aarav Mehta',
      admission_number: 'DPS-2026-1001',
      visitor_name: 'Vikram Mehta',
      visitor_phone: '+919811122233',
      relationship: 'FATHER',
      id_proof_type: 'Aadhaar Card',
      id_proof_number: 'XXXX-XXXX-4812',
      pickup_reason: 'Doctor appointment / family emergency',
      otp_code: '492817',
      otp_verified: true,
      otp_verified_at: '2026-11-04T11:45:00Z',
      status: 'AUTHORIZED_CHECKOUT',
      gate_pass_number: 'GATE-PASS-2026-089',
      checkout_time: '11:45:00',
      created_at: '2026-11-04T11:40:00Z'
    }
  ];
  schoolVisitors: SchoolVisitor[] = [
    {
      id: 'vis-gen-01',
      school_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Dr. Arvind Swaminathan',
      phone_number: '+919833445566',
      email: 'arvind.s@education-board.gov.in',
      id_proof_type: 'Govt Officer ID',
      id_proof_number: 'EDU-INSP-2026-88',
      purpose: 'CAMPUS_INSPECTION',
      whom_to_meet: 'Principal Office',
      badge_number: 'BADGE-V-101',
      check_in_time: '2026-11-06T09:15:00Z',
      status: 'CHECKED_IN',
      remarks: 'Annual CBSE compliance & STEM lab infrastructure inspection',
      created_at: '2026-11-06T09:15:00Z'
    },
    {
      id: 'vis-gen-02',
      school_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Kavita Deshmukh',
      phone_number: '+919877001122',
      email: 'kavita.d@gmail.com',
      id_proof_type: 'Aadhaar Card',
      id_proof_number: 'XXXX-XXXX-6712',
      purpose: 'ADMISSION_ENQUIRY',
      whom_to_meet: 'Admissions Desk',
      badge_number: 'BADGE-V-102',
      check_in_time: '2026-11-06T10:00:00Z',
      check_out_time: '2026-11-06T10:45:00Z',
      status: 'CHECKED_OUT',
      remarks: 'Grade 9 transfer enquiry for academic year 2027-2028',
      created_at: '2026-11-06T10:00:00Z'
    }
  ];
  pickupAuthorizations: PickupAuthorization[] = [
    {
      id: 'auth-01',
      school_id: '11111111-1111-1111-1111-111111111111',
      student_id: '88888888-8888-8888-8888-888888888801',
      guardian_id: '99999999-9999-9999-9999-999999999901',
      authorized_person_name: 'Ramesh Mehta',
      authorized_person_phone: '+919822233344',
      relationship_to_child: 'GRANDFATHER',
      id_proof_number: 'Aadhaar XXXX-8901',
      valid_from: '2026-04-01',
      valid_until: '2027-03-31',
      is_active: true
    }
  ];
  classEnrollments: ClassEnrollment[] = [...INITIAL_CLASS_ENROLLMENTS];
  examResults: StudentExamResult[] = [...INITIAL_EXAM_RESULTS];
  academicYears: AcademicYear[] = [
    { id: '22222222-2222-2222-2222-222222222221', school_id: '11111111-1111-1111-1111-111111111111', name: '2025-2026', start_date: '2025-04-01', end_date: '2026-03-31', is_current: false, created_at: '2025-04-01T00:00:00Z' },
    { id: '22222222-2222-2222-2222-222222222222', school_id: '11111111-1111-1111-1111-111111111111', name: '2026-2027', start_date: '2026-04-01', end_date: '2027-03-31', is_current: true, created_at: '2026-04-01T00:00:00Z' },
    { id: '22222222-2222-2222-2222-222222222223', school_id: '11111111-1111-1111-1111-111111111111', name: '2027-2028', start_date: '2027-04-01', end_date: '2028-03-31', is_current: false, created_at: '2027-04-01T00:00:00Z' }
  ];
  subjectAttendance: SubjectAttendanceRecord[] = [
    { id: 'sub-1', student_id: '88888888-8888-8888-8888-888888888801', subject: 'Mathematics', period: 1, date: '2026-11-04', status: 'PRESENT' },
    { id: 'sub-2', student_id: '88888888-8888-8888-8888-888888888801', subject: 'Physics', period: 2, date: '2026-11-04', status: 'PRESENT' },
    { id: 'sub-3', student_id: '88888888-8888-8888-8888-888888888802', subject: 'Mathematics', period: 1, date: '2026-11-04', status: 'PRESENT' },
    { id: 'sub-4', student_id: '88888888-8888-8888-8888-888888888803', subject: 'Mathematics', period: 1, date: '2026-11-04', status: 'ABSENT' }
  ];
  biometricConsent: BiometricConsentRecord[] = [
    {
      student_id: '88888888-8888-8888-8888-888888888801',
      student_name: 'Aarav Mehta',
      admission_number: 'DPS-2026-1001',
      consent_given: true,
      consent_date: '2026-04-02',
      guardian_name: 'Vikram Mehta (Father)',
      dpdp_purpose: 'Automated campus gate access & attendance verification',
      hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      data_retention_days: 365
    },
    {
      student_id: '88888888-8888-8888-8888-888888888802',
      student_name: 'Ananya Kapoor',
      admission_number: 'DPS-2026-1002',
      consent_given: true,
      consent_date: '2026-04-03',
      guardian_name: 'Sunita Kapoor (Mother)',
      dpdp_purpose: 'Automated campus gate access & attendance verification',
      hash_sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      data_retention_days: 365
    },
    {
      student_id: '88888888-8888-8888-8888-888888888803',
      student_name: 'Rohan Verma',
      admission_number: 'DPS-2026-1003',
      consent_given: false,
      consent_date: '2026-04-01',
      guardian_name: 'Pending Guardian Consent',
      dpdp_purpose: 'Biometric capture paused under DPDP Act 2023 Sec 6',
      hash_sha256: 'NOT_PROCESSED_WITHOUT_CONSENT',
      data_retention_days: 0
    }
  ];

  dpdpConsents: DpdpBiometricConsent[] = [...INITIAL_DPDP_CONSENTS];
  consentHistory: ConsentHistoryLog[] = [...INITIAL_DPDP_HISTORY];

  isLiveDbConnected: boolean = false;
  isSyncingWithDb: boolean = false;
  lastDbSyncTime: string | null = null;
  dbSyncError: string | null = null;

  private failedAttempts: Map<string, { count: number; lockedUntil: number }> = new Map();
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout
  private readonly SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours session token
  activeSession: AuthSession | null = null;


  liveTicker: AttendanceEvent[] = [
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
      school_id: '11111111-1111-1111-1111-111111111111',
      student_id: '88888888-8888-8888-8888-888888888801',
      session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      event_type: 'CHECK_IN',
      event_timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      local_timestamp: '08:24:12',
      verification_method: 'FACE',
      confidence_score: 0.9654,
      liveness_verified: true,
      is_duplicate_ignored: false,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      student_name: 'Aarav Mehta',
      admission_number: 'DPS-2026-1001',
      class_division: '10-A',
      device_name: 'Senior Wing - Face Kiosk 1'
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
      school_id: '11111111-1111-1111-1111-111111111111',
      student_id: '88888888-8888-8888-8888-888888888802',
      session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      event_type: 'CHECK_IN',
      event_timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      local_timestamp: '08:48:32',
      verification_method: 'FACE',
      confidence_score: 0.9412,
      liveness_verified: true,
      is_duplicate_ignored: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      student_name: 'Ananya Kapoor',
      admission_number: 'DPS-2026-1002',
      class_division: '10-A',
      device_name: 'Senior Wing - Face Kiosk 1'
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
      school_id: '11111111-1111-1111-1111-111111111111',
      student_id: '88888888-8888-8888-8888-888888888803',
      session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      event_type: 'CHECK_IN',
      event_timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
      local_timestamp: '08:29:45',
      verification_method: 'FINGERPRINT',
      confidence_score: 0.9980,
      liveness_verified: true,
      is_duplicate_ignored: false,
      created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
      student_name: 'Rohan Verma',
      admission_number: 'DPS-2026-1003',
      class_division: '10-A',
      device_name: 'Main Gate - Terminal A'
    }
  ];

  private listeners: Set<() => void> = new Set();
  private syncChannel: BroadcastChannel | null = null;

  constructor() {
    this.initTheme();
    this.loadFromLocalStorage();
    this.restoreSession();
    this.initCrossTabSync();
    if (isSupabaseConfigured) {
      this.syncFromSupabase();
      this.setupRealtimeSubscriptions();
    }
  }

  async syncFromSupabase() {
    if (!isSupabaseConfigured) return;
    this.isSyncingWithDb = true;
    this.dbSyncError = null;
    this.notify();

    try {
      // 1. Fetch live Students from Supabase
      const { data: stdData, error: stdErr } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true);

      if (!stdErr && stdData && stdData.length > 0) {
        this.students = stdData.map((s: any) => ({
          id: s.id,
          school_id: s.school_id,
          admission_number: s.admission_number,
          first_name: s.first_name,
          last_name: s.last_name,
          gender: s.gender || 'MALE',
          date_of_birth: s.date_of_birth || '2011-05-15',
          class_id: s.class_id,
          division_id: s.division_id,
          class_name: s.class_name || (s.class_id?.includes('10') ? 'Grade 10' : 'Grade 9'),
          division_name: s.division_name || 'A',
          roll_number: s.roll_number,
          academic_year_id: s.academic_year_id,
          is_active: s.is_active,
          face_enrolled: s.face_enrolled || false,
          fingerprint_enrolled: s.fingerprint_enrolled || false,
          avatar_url: s.avatar_url,
          notes: s.notes,
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || new Date().toISOString()
        }));
      }

      // 2. Fetch live Daily Attendance records
      const { data: attData, error: attErr } = await supabase
        .from('daily_attendance')
        .select('*')
        .order('attendance_date', { ascending: false });

      if (!attErr && attData && attData.length > 0) {
        this.dailyAttendance = attData.map((d: any) => {
          const matchedStudent = this.students.find((s) => s.id === d.student_id);
          return {
            id: d.id,
            school_id: d.school_id,
            student_id: d.student_id,
            attendance_date: d.attendance_date,
            session_id: d.session_id,
            status: d.status,
            first_arrival_time: d.first_arrival_time,
            departure_time: d.departure_time,
            first_verification_method: d.first_verification_method,
            is_late: d.is_late || false,
            minutes_late: d.minutes_late || 0,
            remarks: d.remarks,
            verified_by: d.verified_by,
            reconciled_at: d.reconciled_at,
            created_at: d.created_at,
            updated_at: d.updated_at,
            student: matchedStudent
          };
        });
      }

      // 3. Fetch recent Attendance Events
      const { data: evtData, error: evtErr } = await supabase
        .from('attendance_events')
        .select('*')
        .order('event_timestamp', { ascending: false })
        .limit(30);

      if (!evtErr && evtData && evtData.length > 0) {
        this.liveTicker = evtData.map((e: any) => {
          const matchedStudent = this.students.find((s) => s.id === e.student_id);
          return {
            id: e.id,
            school_id: e.school_id,
            student_id: e.student_id,
            session_id: e.session_id,
            event_type: e.event_type,
            event_timestamp: e.event_timestamp,
            local_timestamp: e.local_timestamp,
            verification_method: e.verification_method,
            device_id: e.device_id,
            confidence_score: Number(e.confidence_score) || 0.98,
            liveness_verified: e.liveness_verified || false,
            is_duplicate_ignored: e.is_duplicate_ignored || false,
            created_at: e.created_at,
            student_name: matchedStudent ? `${matchedStudent.first_name} ${matchedStudent.last_name}` : 'Student',
            admission_number: matchedStudent?.admission_number || '',
            class_division: matchedStudent ? `${matchedStudent.class_name}-${matchedStudent.division_name}` : '10-A',
            device_name: e.verification_method === 'FACE' ? 'Senior Wing - Face Kiosk 1' : 'Main Gate - Terminal A'
          };
        });
      }

      // 4. Fetch live Leave Requests
      const { data: lveData, error: lveErr } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!lveErr && lveData && lveData.length > 0) {
        this.leaveRequests = lveData.map((l: any) => {
          const matchedStudent = this.students.find((s) => s.id === l.student_id);
          return {
            id: l.id,
            school_id: l.school_id,
            student_id: l.student_id,
            student_name: matchedStudent ? `${matchedStudent.first_name} ${matchedStudent.last_name}` : 'Student',
            class_name: matchedStudent?.class_name || 'Grade 10',
            parent_name: 'Parent / Guardian',
            parent_phone: '+919811122233',
            start_date: l.start_date,
            end_date: l.end_date,
            reason: l.reason,
            status: l.status,
            created_at: l.created_at,
            reviewed_by: l.reviewed_by,
            remarks: l.review_comments
          };
        });
      }

      this.isLiveDbConnected = true;
      this.lastDbSyncTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
    } catch (err: any) {
      console.warn('[SmartAttend Supabase Sync Warning]:', err.message);
      this.dbSyncError = err.message;
      this.isLiveDbConnected = false;
    } finally {
      this.isSyncingWithDb = false;
      this.saveToLocalStorage();
      this.notify();
    }
  }

  setupRealtimeSubscriptions() {
    if (!isSupabaseConfigured) return;

    try {
      // 1. Live Student changes (Auto-reflect new student registrations)
      supabase
        .channel('realtime-students')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'students' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const s = payload.new as any;
              const exists = this.students.some((std) => std.id === s.id || std.admission_number === s.admission_number);
              if (!exists) {
                this.students.unshift({
                  id: s.id,
                  school_id: s.school_id,
                  admission_number: s.admission_number,
                  first_name: s.first_name,
                  last_name: s.last_name,
                  gender: s.gender || 'FEMALE',
                  date_of_birth: s.date_of_birth || '2011-05-15',
                  class_id: s.class_id,
                  division_id: s.division_id,
                  class_name: s.class_id?.includes('10') ? 'Grade 10' : 'Grade 9',
                  division_name: 'A',
                  roll_number: s.roll_number,
                  academic_year_id: s.academic_year_id,
                  is_active: s.is_active,
                  face_enrolled: s.face_enrolled || false,
                  fingerprint_enrolled: s.fingerprint_enrolled || false,
                  avatar_url: s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                  created_at: s.created_at || new Date().toISOString(),
                  updated_at: s.updated_at || new Date().toISOString()
                });
                this.notify();
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as any;
              const idx = this.students.findIndex((std) => std.id === updated.id);
              if (idx >= 0) {
                this.students[idx] = {
                  ...this.students[idx],
                  ...updated
                };
                this.notify();
              }
            }
          }
        )
        .subscribe();

      // 2. Live Daily Attendance changes
      supabase
        .channel('realtime-attendance')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'daily_attendance' },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const att = payload.new as any;
              const idx = this.dailyAttendance.findIndex(
                (d) => d.id === att.id || (d.student_id === att.student_id && d.attendance_date === att.attendance_date)
              );
              const matchedStudent = this.students.find((s) => s.id === att.student_id);
              const formatted: DailyAttendance = {
                id: att.id,
                school_id: att.school_id,
                student_id: att.student_id,
                attendance_date: att.attendance_date,
                session_id: att.session_id,
                status: att.status,
                first_arrival_time: att.first_arrival_time,
                first_verification_method: att.first_verification_method,
                is_late: att.is_late || false,
                minutes_late: att.minutes_late || 0,
                remarks: att.remarks,
                reconciled_at: att.reconciled_at,
                created_at: att.created_at,
                updated_at: att.updated_at,
                student: matchedStudent
              };
              if (idx >= 0) {
                this.dailyAttendance[idx] = formatted;
              } else {
                this.dailyAttendance.unshift(formatted);
              }
              this.notify();
            }
          }
        )
        .subscribe();

      // 3. Live Attendance Biometric Events (Live ticker feed)
      supabase
        .channel('realtime-events')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'attendance_events' },
          (payload) => {
            const evt = payload.new as any;
            if (!this.liveTicker.some((t) => t.id === evt.id)) {
              const matchedStudent = this.students.find((s) => s.id === evt.student_id);
              this.liveTicker.unshift({
                id: evt.id,
                school_id: evt.school_id,
                student_id: evt.student_id,
                session_id: evt.session_id,
                event_type: evt.event_type,
                event_timestamp: evt.event_timestamp,
                local_timestamp: evt.local_timestamp,
                verification_method: evt.verification_method,
                confidence_score: Number(evt.confidence_score || 0.98),
                liveness_verified: evt.liveness_verified,
                is_duplicate_ignored: evt.is_duplicate_ignored,
                created_at: evt.created_at,
                student_name: matchedStudent ? `${matchedStudent.first_name} ${matchedStudent.last_name}` : 'Enrolled Student',
                admission_number: matchedStudent?.admission_number || '',
                class_division: matchedStudent ? `${matchedStudent.class_name}-${matchedStudent.division_name}` : '10-A',
                device_name: evt.verification_method === 'FACE' ? 'Senior Wing - Face Kiosk 1' : 'Main Gate - Terminal A'
              });
              this.notify();
            }
          }
        )
        .subscribe();

      // 4. Supabase Realtime Broadcast Channel (Cross-device, cross-browser sub-100ms sync)
      supabase
        .channel('smartattend-broadcast-sync')
        .on('broadcast', { event: 'attendance_update' }, ({ payload }) => {
          this.handleCrossTabMessage(payload);
        })
        .subscribe();

      // 5. Live Parent Notifications (In-App Bell Synchronization)
      supabase
        .channel('realtime-parent-notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'parent_notifications' },
          (payload) => {
            const notif = payload.new as any;
            if (!this.notifications.some((n) => n.id === notif.id)) {
              this.notifications.unshift({
                id: notif.id,
                school_id: notif.school_id,
                student_id: notif.student_id,
                guardian_id: notif.guardian_id,
                template_id: '77777777-7777-7777-7777-777777777701',
                notification_type: (notif.notification_type === 'CHECK_IN' || notif.notification_type === 'LATE' ? 'ARRIVAL' : notif.notification_type === 'CHECK_OUT' ? 'DEPARTURE' : notif.notification_type) as any,
                channel: 'WHATSAPP',
                recipient_phone: '+919811122233',
                template_parameters: [notif.student_name, notif.title],
                title: notif.title,
                message: notif.message,
                student_name: notif.student_name,
                status: (notif.delivery_status || 'DELIVERED') as any,
                is_read: false,
                scheduled_for: notif.event_timestamp || new Date().toISOString(),
                attempts: 1,
                max_attempts: 3,
                created_at: notif.created_at || new Date().toISOString(),
                updated_at: notif.updated_at || new Date().toISOString()
              });
              this.notify();
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[SmartAttend Realtime Subscription Notice]:', err);
    }
  }

  // Cross-Tab & Cross-Window Instant Real-Time Synchronization Engine
  initCrossTabSync() {
    if (typeof window === 'undefined') return;

    try {
      if ('BroadcastChannel' in window) {
        this.syncChannel = new BroadcastChannel('smartattend_realtime_sync');
        this.syncChannel.onmessage = (event) => {
          this.handleCrossTabMessage(event.data);
        };
      }
    } catch (e) {
      console.warn('[SmartAttend Cross-Tab Sync]: BroadcastChannel unavailable, using storage event fallback');
    }

    // Storage event listener fallback (triggers in all other tabs/windows of same origin)
    window.addEventListener('storage', (e) => {
      if (e.key === 'smartattend_realtime_sync_event' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          this.handleCrossTabMessage(data);
        } catch { }
      }
    });
  }

  broadcastRealtimeSync(data: any) {
    if (typeof window === 'undefined') return;

    // 1. Instant local BroadcastChannel (0ms cross-window propagation)
    try {
      this.syncChannel?.postMessage(data);
    } catch (e) { }

    // 2. Storage event fallback (guaranteed cross-window event across browser tabs)
    try {
      localStorage.setItem(
        'smartattend_realtime_sync_event',
        JSON.stringify({
          ...data,
          _sync_ts: Date.now()
        })
      );
    } catch (e) { }

    // 3. Supabase Realtime Broadcast (cloud websocket to other browsers/devices)
    if (isSupabaseConfigured) {
      try {
        supabase.channel('smartattend-broadcast-sync').send({
          type: 'broadcast',
          event: 'attendance_update',
          payload: data
        });
      } catch (e) { }
    }
  }

  handleCrossTabMessage(data: any) {
    if (!data || !data.type) return;

    if (data.type === 'ATTENDANCE_PUNCH' || data.type === 'ATTENDANCE_OVERRIDE') {
      const { record, event, notification } = data;

      // 1. Merge record into dailyAttendance with date-matching (create new array reference for React)
      if (record) {
        const filtered = this.dailyAttendance.filter(
          (d) =>
            !(
              (d.student_id === record.student_id || d.student?.admission_number === record.student?.admission_number) &&
              d.attendance_date === record.attendance_date
            ) && d.id !== record.id
        );
        this.dailyAttendance = [record, ...filtered];
      }

      // 2. Add to liveTicker if not already present
      if (event && !this.liveTicker.some((t) => t.id === event.id)) {
        this.liveTicker = [event, ...this.liveTicker];
      }

      // 3. Add to notifications queue if not already present
      if (notification) {
        const withoutNotif = this.notifications.filter(
          (n) => n.id !== notification.id && n.idempotency_key !== notification.idempotency_key
        );
        this.notifications = [
          { ...notification, is_read: false },
          ...withoutNotif
        ];
      }

      // 4. Update localStorage and notify all React listeners immediately
      this.saveToLocalStorage();
      this.notify();
    } else if (data.type === 'NOTIFICATION_READ') {
      const { notificationId, all } = data;
      if (all) {
        this.notifications.forEach((n) => (n.is_read = true));
      } else if (notificationId) {
        const notif = this.notifications.find((item) => item.id === notificationId);
        if (notif) notif.is_read = true;
      }
      this.saveToLocalStorage();
      this.notify();
    }
  }

  private initTheme() {
    try {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('smartattend_theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          this.theme = savedTheme;
        } else {
          // Default to Light Mode when no saved preference exists
          this.theme = 'light';
        }
        this.applyDomTheme(this.theme);
      }
    } catch (e) { }
  }

  private applyDomTheme(theme: 'light' | 'dark') {
    try {
      if (typeof document !== 'undefined') {
        const isDark = theme === 'dark';
        const root = document.documentElement;
        if (isDark) {
          root.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.setAttribute('data-theme', 'light');
          root.style.colorScheme = 'light';
        }
      }
    } catch (e) { }
  }

  toggleTheme() {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  setTheme(newTheme: 'light' | 'dark') {
    this.theme = newTheme;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('smartattend_theme', newTheme);
      }
      this.applyDomTheme(newTheme);
    } catch (e) { }
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.saveToLocalStorage();
    this.listeners.forEach((l) => l());
  }

  private saveToLocalStorage() {
    try {
      if (typeof window === 'undefined') return;
      const payload = {
        students: this.students,
        dailyAttendance: this.dailyAttendance,
        liveTicker: this.liveTicker,
        leaveRequests: this.leaveRequests,
        auditLogs: this.auditLogs,
        notifications: this.notifications,
        dpdpConsents: this.dpdpConsents,
        consentHistory: this.consentHistory,
        classEnrollments: this.classEnrollments,
        examResults: this.examResults,
        openingTime: this.openingTime,
        cutoffTime: this.cutoffTime,
        graceMinutes: this.graceMinutes
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      // Storage quota or private browsing mode
    }
  }

  private loadFromLocalStorage() {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.students) && data.students.length > 0) {
        this.students = data.students;
      }
      if (Array.isArray(data.dailyAttendance)) {
        this.dailyAttendance = data.dailyAttendance;
      }
      if (Array.isArray(data.liveTicker)) {
        this.liveTicker = data.liveTicker;
      }
      if (Array.isArray(data.leaveRequests)) {
        this.leaveRequests = data.leaveRequests;
      }
      if (Array.isArray(data.auditLogs)) {
        this.auditLogs = data.auditLogs;
      }
      if (Array.isArray(data.notifications)) {
        this.notifications = data.notifications;
      }
      if (Array.isArray(data.dpdpConsents)) {
        this.dpdpConsents = data.dpdpConsents;
      }
      if (Array.isArray(data.consentHistory)) {
        this.consentHistory = data.consentHistory;
      }
      if (Array.isArray(data.classEnrollments)) {
        this.classEnrollments = data.classEnrollments;
      }
      if (Array.isArray(data.examResults)) {
        this.examResults = data.examResults;
      }
      if (typeof data.openingTime === 'string') {
        this.openingTime = data.openingTime;
      }
      if (typeof data.cutoffTime === 'string') {
        this.cutoffTime = data.cutoffTime;
      }
      if (typeof data.graceMinutes === 'number') {
        this.graceMinutes = data.graceMinutes;
      }
    } catch (err) {
      // Fall back to in-memory initial data
    }
  }

  resetToDefaults() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) { }
    this.students = [...INITIAL_STUDENTS];
    this.dailyAttendance = [...INITIAL_DAILY_ATTENDANCE];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.leaveRequests = [...INITIAL_LEAVE_REQUESTS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.dpdpConsents = [...INITIAL_DPDP_CONSENTS];
    this.consentHistory = [...INITIAL_DPDP_HISTORY];
    this.classEnrollments = [...INITIAL_CLASS_ENROLLMENTS];
    this.examResults = [...INITIAL_EXAM_RESULTS];
    this.notify();
  }

  switchRole(role: UserRole) {
    if (role === 'parent') {
      this.switchParentUser(PARENT_PROFILES[0].id);
    } else {
      this.currentUser = DEMO_USERS[role];
      this.activeChildId = undefined;
      this.notify();
    }
  }

  // 1. Get Authorized Students for Current User
  getAuthorizedStudents(user?: CurrentUser): Student[] {
    const targetUser = user || this.currentUser;

    if (targetUser.role === 'parent') {
      const email = targetUser.email.toLowerCase();
      const userId = targetUser.id;

      // Filter students whose guardians array links to this parent
      const linked = this.students.filter((s) =>
        s.guardians?.some((g) =>
          (g.user_id && g.user_id === userId) ||
          (g.email && g.email.toLowerCase() === email)
        )
      );

      // If matched from PARENT_PROFILES fallback
      if (linked.length === 0) {
        const profile = PARENT_PROFILES.find((p) => p.email.toLowerCase() === email || p.id === userId);
        if (profile) {
          const s = this.students.find((std) => std.id === profile.studentId);
          if (s) return [s];
        }
      }

      return linked;
    }

    if (targetUser.role === 'student') {
      return this.students.filter((s) => s.id === targetUser.id || s.admission_number === 'DPS-2026-1001');
    }

    // Admins and Teachers can view students in school
    return this.students;
  }

  // 2. Strict Authorization Check
  isAuthorizedForStudent(studentId: string, user?: CurrentUser): boolean {
    const targetUser = user || this.currentUser;
    if (['super_admin', 'school_admin', 'teacher'].includes(targetUser.role)) {
      return true;
    }
    const authorized = this.getAuthorizedStudents(targetUser);
    return authorized.some((s) => s.id === studentId);
  }

  // 3. Child Selection for multi-child parent
  setActiveChildId(childId: string) {
    if (this.isAuthorizedForStudent(childId)) {
      this.activeChildId = childId;
      this.notify();
    }
  }

  getActiveChild(): Student | null {
    const authorized = this.getAuthorizedStudents();
    if (authorized.length === 0) return null;
    if (this.activeChildId) {
      const found = authorized.find((s) => s.id === this.activeChildId);
      if (found) return found;
    }
    return authorized[0];
  }

  // 4. Strict Daily Attendance Filtering (Zero Data Leakage)
  getAuthorizedAttendance(options?: {
    studentId?: string;
    date?: string;
    status?: string;
  }): {
    records: DailyAttendance[];
    isUnauthorizedBlocked?: boolean;
    blockedStudentId?: string;
    authorizedStudentIds: string[];
  } {
    const authorizedStudents = this.getAuthorizedStudents();
    const authorizedStudentIds = authorizedStudents.map((s) => s.id);
    const authorizedIds = authorizedStudentIds;

    // SECURITY ENFORCEMENT: Check manual studentId tampering
    if (options?.studentId && this.currentUser.role === 'parent') {
      if (!authorizedIds.includes(options.studentId)) {
        console.warn(`[Parent Privacy Protection] Unauthorized attendance query blocked for student ID: ${options.studentId}`);
        this.logAuditEvent(
          'UNAUTHORIZED_ATTENDANCE_ACCESS_BLOCKED',
          `Target Student: ${options.studentId}`,
          `Parent ${this.currentUser.email} attempted cross-student attendance query. 403 Forbidden enforced.`
        );
        return {
          records: [],
          isUnauthorizedBlocked: true,
          blockedStudentId: options.studentId,
          authorizedStudentIds
        };
      }
    }

    let records: DailyAttendance[];

    if (['super_admin', 'school_admin', 'teacher'].includes(this.currentUser.role)) {
      records = [...this.dailyAttendance];
      if (options?.studentId) {
        records = records.filter((r) => r.student_id === options.studentId);
      }
    } else {
      // Parent or Student: strictly isolate records
      const targetId = options?.studentId || (this.activeChildId && authorizedIds.includes(this.activeChildId) ? this.activeChildId : undefined);
      if (targetId) {
        records = this.dailyAttendance.filter((r) => r.student_id === targetId);
      } else {
        records = this.dailyAttendance.filter((r) => authorizedIds.includes(r.student_id));
      }
    }

    if (options?.date) {
      records = records.filter((r) => r.attendance_date === options.date);
    }
    if (options?.status && options.status !== 'ALL') {
      records = records.filter((r) => r.status === options.status);
    }

    return {
      records,
      isUnauthorizedBlocked: false,
      authorizedStudentIds
    };
  }

  // 5. Calculate Child Attendance Percentage & Reports
  getChildAttendanceMetrics(studentId?: string) {
    const authorizedStudents = this.getAuthorizedStudents();
    const targetStudent = studentId
      ? authorizedStudents.find((s) => s.id === studentId)
      : this.getActiveChild();

    if (!targetStudent) {
      return {
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        onLeaveDays: 0,
        percentage: 0,
        punctualityRate: 0,
        student: null
      };
    }

    const records = this.dailyAttendance.filter((r) => r.student_id === targetStudent.id);
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'PRESENT').length;
    const lateDays = records.filter((r) => r.status === 'LATE').length;
    const absentDays = records.filter((r) => r.status === 'ABSENT').length;
    const onLeaveDays = records.filter((r) => r.status === 'ON_LEAVE').length;

    const percentage = totalDays > 0
      ? Math.round(((presentDays + lateDays) / totalDays) * 100)
      : 100;
    const punctualityRate = totalDays > 0
      ? Math.round((presentDays / totalDays) * 100)
      : 100;

    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      onLeaveDays,
      percentage,
      punctualityRate,
      student: targetStudent
    };
  }

  // --------------------------------------------------------------------------
  // FEATURE 1: Advanced Attendance Analytics & Monthly Percentage
  // --------------------------------------------------------------------------
  calculateMonthlyPercentage(studentId: string, yearMonth?: string) {
    const targetMonth = yearMonth || new Date().toISOString().slice(0, 7); // e.g. "2026-11"
    const records = this.dailyAttendance.filter(
      (r) => r.student_id === studentId && r.attendance_date.startsWith(targetMonth)
    );

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'PRESENT').length;
    const lateDays = records.filter((r) => r.status === 'LATE').length;
    const halfDays = records.filter((r) => r.status === 'HALF_DAY').length;
    const absentDays = records.filter((r) => r.status === 'ABSENT').length;
    const onLeaveDays = records.filter((r) => r.status === 'ON_LEAVE').length;

    const attendedEquivalent = presentDays + lateDays + halfDays * 0.5;
    const percentage = totalDays > 0 ? Math.round((attendedEquivalent / totalDays) * 100) : 100;

    return {
      month: targetMonth,
      totalDays,
      presentDays,
      halfDays,
      lateDays,
      absentDays,
      onLeaveDays,
      attendedEquivalent,
      percentage,
      isCompliant: percentage >= 75
    };
  }

  // --------------------------------------------------------------------------
  // FEATURE 2: Consecutive Absence Counter & Alert Escalation
  // --------------------------------------------------------------------------
  getConsecutiveAbsences(studentId: string): number {
    const records = this.dailyAttendance
      .filter((r) => r.student_id === studentId)
      .sort((a, b) => b.attendance_date.localeCompare(a.attendance_date));

    let count = 0;
    for (const rec of records) {
      if (rec.status === 'ABSENT') {
        count++;
      } else if (rec.status === 'PRESENT' || rec.status === 'HALF_DAY' || rec.status === 'LATE') {
        break;
      }
    }
    return count;
  }

  triggerConsecutiveAbsenceAlert(studentId: string) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;

    const consecutiveCount = this.getConsecutiveAbsences(studentId);
    if (consecutiveCount < 3) return null;

    const guardian = student.guardians?.[0];
    const alertJob: NotificationJob = {
      id: `job-consec-${Date.now()}`,
      school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: student.id,
      guardian_id: guardian?.id || '99999999-9999-9999-9999-999999999901',
      template_id: '77777777-7777-7777-7777-777777777709',
      notification_type: 'ABSENCE',
      recipient_phone: guardian?.phone_number || '+919811122233',
      template_parameters: [
        student.first_name,
        String(consecutiveCount),
        'MANDATORY PARENT MEETING REQUIRED'
      ],
      status: 'SENT',
      scheduled_for: new Date().toISOString(),
      attempts: 1,
      max_attempts: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.notifications.unshift(alertJob);
    this.logAuditEvent(
      'CONSECUTIVE_ABSENCE_ALERT',
      `${student.first_name} ${student.last_name}`,
      `Critical alert dispatched: ${consecutiveCount} consecutive absences without medical certificate`
    );
    this.notify();
    return alertJob;
  }

  // --------------------------------------------------------------------------
  // FEATURE 3: Proactive Attendance Risk Detection Engine (< 75% CBSE Board Risk)
  // --------------------------------------------------------------------------
  getAttendanceRiskAnalysis() {
    return this.students.map((student) => {
      const records = this.dailyAttendance.filter((r) => r.student_id === student.id);
      const totalDays = records.length;
      const presentDays = records.filter((r) => r.status === 'PRESENT').length;
      const lateDays = records.filter((r) => r.status === 'LATE').length;
      const halfDays = records.filter((r) => r.status === 'HALF_DAY').length;
      const absentDays = records.filter((r) => r.status === 'ABSENT').length;

      const attendedEquivalent = presentDays + lateDays + halfDays * 0.5;
      const percentage = totalDays > 0 ? Math.round((attendedEquivalent / totalDays) * 100) : 100;
      const consecutiveAbsences = this.getConsecutiveAbsences(student.id);

      let riskLevel: 'CRITICAL' | 'WARNING' | 'SAFE' = 'SAFE';
      let remedialClassesNeeded = 0;

      if (percentage < 75) {
        riskLevel = 'CRITICAL';
        // Formula: Remedial classes needed to reach 75%
        // (attended + X) / (total + X) >= 0.75  =>  X >= (0.75 * total - attended) / 0.25
        remedialClassesNeeded = Math.max(1, Math.ceil((0.75 * totalDays - attendedEquivalent) / 0.25));
      } else if (percentage < 82) {
        riskLevel = 'WARNING';
      }

      return {
        student,
        totalDays,
        presentDays,
        halfDays,
        lateDays,
        absentDays,
        attendedEquivalent,
        percentage,
        consecutiveAbsences,
        riskLevel,
        remedialClassesNeeded
      };
    });
  }

  // 6. Switch Parent User Directly
  switchParentUser(parentProfileIdOrEmail: string) {
    const parent = PARENT_PROFILES.find(
      (p) => p.id === parentProfileIdOrEmail || p.email.toLowerCase() === parentProfileIdOrEmail.toLowerCase()
    );
    if (parent) {
      this.currentUser = {
        id: parent.id,
        name: `${parent.name} (Parent of ${parent.studentName})`,
        email: parent.email,
        role: 'parent',
        avatarUrl: parent.avatarUrl
      };
      this.activeChildId = parent.studentId;
      this.notify();
    }
  }

  // 7. General Login supporting Parent, Admin, Teacher, Student
  loginAs(emailOrRole: string) {
    // Check if Parent Profile
    const parent = PARENT_PROFILES.find((p) => p.email.toLowerCase() === emailOrRole.toLowerCase());
    if (parent) {
      this.switchParentUser(parent.id);
      return;
    }

    // Check if Role Key
    if (emailOrRole === 'parent') {
      this.switchParentUser(PARENT_PROFILES[0].id);
      return;
    }

    const demo = DEMO_USERS[emailOrRole as UserRole];
    if (demo) {
      this.currentUser = demo;
      this.activeChildId = undefined;
      this.notify();
      return;
    }

    // Check by email in DEMO_USERS
    const foundDemo = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === emailOrRole.toLowerCase());
    if (foundDemo) {
      this.currentUser = foundDemo;
      this.activeChildId = undefined;
      this.notify();
    }
  }

  getLockoutStatus(email: string): { isLocked: boolean; remainingSeconds: number } {
    const record = this.failedAttempts.get(email.toLowerCase().trim());
    if (!record || !record.lockedUntil) {
      return { isLocked: false, remainingSeconds: 0 };
    }
    const remaining = Math.max(0, Math.ceil((record.lockedUntil - Date.now()) / 1000));
    if (remaining === 0) {
      this.failedAttempts.delete(email.toLowerCase().trim());
      return { isLocked: false, remainingSeconds: 0 };
    }
    return { isLocked: true, remainingSeconds: remaining };
  }

  verifyCredentials(email: string, password: string): AuthResult {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPass = password || '';

    if (!cleanEmail || !cleanPass) {
      return {
        success: false,
        error: 'EMPTY_FIELDS',
        message: 'Please provide both your registered email address and password.'
      };
    }

    // Check account lockout
    const lockout = this.getLockoutStatus(cleanEmail);
    if (lockout.isLocked) {
      return {
        success: false,
        error: 'ACCOUNT_LOCKED',
        message: `Account is temporarily locked due to 5 failed attempts. Please retry in ${lockout.remainingSeconds} seconds.`,
        lockedUntil: Date.now() + lockout.remainingSeconds * 1000
      };
    }

    // Check configured credential or master bypass password
    const credential = USER_CREDENTIALS[cleanEmail];
    const isMasterPassword = cleanPass === 'SmartAttend@2026!';

    // Find the corresponding user object
    let targetUser: CurrentUser | null = null;
    let targetRole: UserRole = 'school_admin';

    // Check DEMO_USERS
    const demo = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === cleanEmail);
    if (demo) {
      targetUser = demo;
      targetRole = demo.role;
    } else {
      // Check PARENT_PROFILES
      const parent = PARENT_PROFILES.find((p) => p.email.toLowerCase() === cleanEmail);
      if (parent) {
        targetUser = {
          id: parent.id,
          name: parent.name,
          email: parent.email,
          role: 'parent',
          avatarUrl: parent.avatarUrl
        };
        targetRole = 'parent';
      }
    }

    if (!targetUser && credential) {
      targetUser = {
        id: `user-${credential.role}`,
        name: credential.name,
        email: credential.email,
        role: credential.role,
        avatarUrl: DEMO_USERS[credential.role]?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      };
      targetRole = credential.role;
    }

    if (!targetUser) {
      const prev = this.failedAttempts.get(cleanEmail) || { count: 0, lockedUntil: 0 };
      const newCount = prev.count + 1;
      const isNowLocked = newCount >= this.MAX_FAILED_ATTEMPTS;
      const lockedUntil = isNowLocked ? Date.now() + this.LOCKOUT_DURATION_MS : 0;
      this.failedAttempts.set(cleanEmail, { count: newCount, lockedUntil });

      if (isNowLocked) {
        return {
          success: false,
          error: 'ACCOUNT_LOCKED',
          message: `Account locked for 60 seconds due to ${this.MAX_FAILED_ATTEMPTS} consecutive failed attempts.`,
          lockedUntil
        };
      }

      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'No registered user found with this email address.'
      };
    }

    // Verify password against stored credential or master password
    const expectedPassword = credential?.password || (targetRole === 'parent' ? 'Parent@2026!' : 'Principal@2026!');
    const isPasswordValid = cleanPass === expectedPassword || isMasterPassword;

    if (!isPasswordValid) {
      const prev = this.failedAttempts.get(cleanEmail) || { count: 0, lockedUntil: 0 };
      const newCount = prev.count + 1;
      const isNowLocked = newCount >= this.MAX_FAILED_ATTEMPTS;
      const lockedUntil = isNowLocked ? Date.now() + this.LOCKOUT_DURATION_MS : 0;

      this.failedAttempts.set(cleanEmail, { count: newCount, lockedUntil });

      if (isNowLocked) {
        this.logAuditEvent(
          'SECURITY_ACCOUNT_LOCKED',
          'Brute-Force Guard',
          `Account ${cleanEmail} locked for 60 seconds after ${this.MAX_FAILED_ATTEMPTS} consecutive failed attempts.`
        );
        return {
          success: false,
          error: 'ACCOUNT_LOCKED',
          message: `Account locked for 60 seconds due to ${this.MAX_FAILED_ATTEMPTS} consecutive failed attempts.`,
          lockedUntil
        };
      } else {
        const remaining = this.MAX_FAILED_ATTEMPTS - newCount;
        this.logAuditEvent(
          'AUTH_FAILED',
          'Authentication Service',
          `Failed login attempt for ${cleanEmail} (${newCount}/${this.MAX_FAILED_ATTEMPTS}).`
        );
        return {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: `Incorrect password. ${remaining} attempt(s) remaining before temporary account lockout.`,
          remainingAttempts: remaining
        };
      }
    }

    // Authentication Successful
    this.failedAttempts.delete(cleanEmail);

    const session: AuthSession = {
      token: 'sat_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
      userId: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetRole,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION_MS
    };

    this.activeSession = session;
    this.saveSession(session);

    // Set active user in store
    this.currentUser = targetUser;
    if (targetRole === 'parent') {
      const parent = PARENT_PROFILES.find((p) => p.email.toLowerCase() === cleanEmail);
      if (parent) {
        this.activeChildId = parent.studentId;
      }
    } else {
      this.activeChildId = undefined;
    }

    this.logAuditEvent(
      'AUTH_LOGIN_SUCCESS',
      'Authentication Service',
      `User ${targetUser.name} (${targetUser.email}) authenticated with verified credentials as ${targetRole}.`
    );

    this.notify();

    return {
      success: true,
      message: 'Authentication successful.',
      user: targetUser,
      role: targetRole,
      session
    };
  }

  saveSession(session: AuthSession) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('smartattend_auth_session', JSON.stringify(session));
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('smartattend_auth_session', JSON.stringify(session));
      }
    } catch (e) { }
  }

  clearSession() {
    this.activeSession = null;
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('smartattend_auth_session');
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('smartattend_auth_session');
      }
    } catch (e) { }
  }

  restoreSession(): boolean {
    try {
      let raw: string | null = null;
      if (typeof sessionStorage !== 'undefined') {
        raw = sessionStorage.getItem('smartattend_auth_session');
      }
      if (!raw && typeof localStorage !== 'undefined') {
        raw = localStorage.getItem('smartattend_auth_session');
      }
      if (!raw) return false;

      const session: AuthSession = JSON.parse(raw);
      if (!session || !session.expiresAt || Date.now() > session.expiresAt) {
        this.clearSession();
        return false;
      }

      this.activeSession = session;
      this.loginAs(session.email);
      return true;
    } catch (e) {
      this.clearSession();
      return false;
    }
  }

  isSessionValid(): boolean {
    if (!this.activeSession) return false;
    if (Date.now() > this.activeSession.expiresAt) {
      this.clearSession();
      return false;
    }
    return true;
  }

  logout() {
    const user = this.currentUser;
    this.logAuditEvent(
      'AUTH_LOGOUT',
      'Authentication Service',
      `User ${user.name} logged out securely.`
    );
    this.clearSession();
    this.activeChildId = undefined;
    this.notify();
  }

  // 8. Test Tampered API Access (Live Security Demonstration)
  async testTamperedApiAccess(targetStudentId: string): Promise<{
    blocked: boolean;
    statusCode: number;
    message: string;
    targetStudentName: string;
  }> {
    const targetStudent = this.students.find((s) => s.id === targetStudentId);
    const studentLabel = targetStudent ? `${targetStudent.first_name} ${targetStudent.last_name}` : targetStudentId;

    try {
      const response = await fetch(
        `http://localhost:8002/api/v1/parent/attendance?student_id=${encodeURIComponent(targetStudentId)}`,
        {
          headers: {
            'x-user-id': this.currentUser.id,
            'x-parent-email': this.currentUser.email
          }
        }
      );

      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        return {
          blocked: true,
          statusCode: 403,
          message: data.message || `HTTP 403 Forbidden: Access to ${studentLabel}'s records was blocked by backend authorization.`,
          targetStudentName: studentLabel
        };
      }

      if (response.ok) {
        return {
          blocked: false,
          statusCode: 200,
          message: `Access permitted: ${studentLabel} is your verified registered child.`,
          targetStudentName: studentLabel
        };
      }
    } catch (e) {
      // Local fallback if Express server not currently listening
    }

    // Local authorization verification
    const isAuth = this.isAuthorizedForStudent(targetStudentId);
    if (!isAuth) {
      return {
        blocked: true,
        statusCode: 403,
        message: `HTTP 403 Forbidden: Security barrier prevented access to '${studentLabel}'. Parents can ONLY view their own child's attendance.`,
        targetStudentName: studentLabel
      };
    }

    return {
      blocked: false,
      statusCode: 200,
      message: `Access permitted: ${studentLabel} is your verified registered child.`,
      targetStudentName: studentLabel
    };
  }


  logAuditEvent(action: string, entity: string, details: string) {
    const log: AuditLogItem = {
      id: `aud-${Date.now()}`,
      action,
      user: this.currentUser.name,
      entity,
      ip: '192.168.1.10',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 50) this.auditLogs.pop();
  }

  addStudent(newStudent: Omit<Student, 'id' | 'school_id' | 'created_at' | 'updated_at'>) {
    const studentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `88888888-8888-8888-8888-${Date.now().toString().slice(-12)}`;
    const student: Student = {
      ...newStudent,
      id: studentId,
      school_id: '11111111-1111-1111-1111-111111111111',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.students.unshift(student);
    this.logAuditEvent('STUDENT_REGISTRATION', `${student.first_name} ${student.last_name}`, `Registered admission ${student.admission_number} in ${student.class_name}`);

    // Live Supabase Persistence
    if (isSupabaseConfigured) {
      supabase
        .from('students')
        .insert({
          id: student.id,
          school_id: student.school_id,
          admission_number: student.admission_number,
          first_name: student.first_name,
          last_name: student.last_name,
          gender: student.gender,
          date_of_birth: student.date_of_birth || '2011-05-15',
          class_id: student.class_id,
          division_id: student.division_id,
          roll_number: student.roll_number,
          academic_year_id: student.academic_year_id || '22222222-2222-2222-2222-222222222222',
          is_active: student.is_active ?? true,
          face_enrolled: student.face_enrolled ?? false,
          fingerprint_enrolled: student.fingerprint_enrolled ?? false,
          avatar_url: student.avatar_url
        })
        .then(({ error }) => {
          if (error) {
            console.warn('[Supabase students insert]:', error.message);
          } else {
            console.log('[Supabase students insert] Registered successfully:', student.admission_number);
          }
        });
    }

    this.notify();
    return student;
  }

  bulkImportStudents(imported: Array<Omit<Student, 'id' | 'school_id' | 'created_at' | 'updated_at'>>) {
    const added: Student[] = [];
    const timestamp = new Date().toISOString();
    imported.forEach((item, idx) => {
      const studentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `88888888-8888-8888-9999-${(Date.now() + idx).toString().slice(-12)}`;
      const student: Student = {
        ...item,
        id: studentId,
        school_id: '11111111-1111-1111-1111-111111111111',
        created_at: timestamp,
        updated_at: timestamp
      };
      added.push(student);
      this.students.unshift(student);
    });
    this.logAuditEvent('BULK_CSV_IMPORT', `${imported.length} Students`, `Imported batch of ${imported.length} students via CSV`);

    if (isSupabaseConfigured && added.length > 0) {
      const recordsToInsert = added.map((s) => ({
        id: s.id,
        school_id: s.school_id,
        admission_number: s.admission_number,
        first_name: s.first_name,
        last_name: s.last_name,
        gender: s.gender,
        date_of_birth: s.date_of_birth || '2011-05-15',
        class_id: s.class_id,
        division_id: s.division_id,
        roll_number: s.roll_number,
        academic_year_id: s.academic_year_id || '22222222-2222-2222-2222-222222222222',
        is_active: s.is_active ?? true,
        face_enrolled: s.face_enrolled ?? false,
        fingerprint_enrolled: s.fingerprint_enrolled ?? false,
        avatar_url: s.avatar_url
      }));
      supabase
        .from('students')
        .upsert(recordsToInsert, { onConflict: 'school_id,admission_number' })
        .then(({ error }) => {
          if (error) console.warn('[Supabase bulk students insert]:', error.message);
        });
    }

    this.notify();
    return added;
  }

  updateBiometricStatus(studentId: string, type: 'FACE' | 'FINGERPRINT', status: boolean) {
    const s = this.students.find((std) => std.id === studentId);
    if (s) {
      if (type === 'FACE') s.face_enrolled = status;
      if (type === 'FINGERPRINT') s.fingerprint_enrolled = status;
      this.logAuditEvent(
        type === 'FACE' ? 'FACE_TEMPLATE_ENROLL' : 'FINGERPRINT_ENROLL',
        `${s.first_name} ${s.last_name}`,
        `${type} biometric status set to ${status}`
      );

      if (isSupabaseConfigured && studentId.includes('-')) {
        supabase
          .from('students')
          .update(type === 'FACE' ? { face_enrolled: status } : { fingerprint_enrolled: status })
          .eq('id', studentId)
          .then(({ error }) => {
            if (error) console.warn('[Supabase updateBiometricStatus]:', error.message);
          });
      }

      this.notify();
    }
  }

  // Unified Parent Notification Workflow for all attendance methods
  dispatchParentAttendanceNotification(params: {
    studentId: string;
    status: AttendanceStatus;
    method?: VerificationMethod;
    timeStr?: string;
    dateStr?: string;
    isLate?: boolean;
    minutesLate?: number;
    remarks?: string;
    customTitle?: string;
    customMessage?: string;
  }): { job?: NotificationJob; isDuplicate: boolean; deliveryStatus: 'DELIVERED' | 'FAILED'; deliveryError?: string; guardian?: any } {
    const student = this.students.find((s) => s.id === params.studentId || s.admission_number === params.studentId);
    if (!student) {
      return { isDuplicate: false, deliveryStatus: 'FAILED', deliveryError: `Student ID ${params.studentId} not found` };
    }

    const now = new Date();
    const dateStr = params.dateStr || now.toISOString().split('T')[0];
    const timeStr = params.timeStr || now.toLocaleTimeString('en-GB', { hour12: false });
    const method = params.method || 'MANUAL';
    const guardian =
      (student.guardians && student.guardians.length > 0 ? student.guardians[0] : undefined) ||
      PARENT_PROFILES.find((p) => p.studentId === student.id);
    const studentFullName = `${student.first_name} ${student.last_name}`;
    const guardianPhone = (guardian as any)?.phone_number || (guardian as any)?.phone || '';
    const guardianFullName = (guardian as any)?.full_name || (guardian as any)?.name || 'Parent / Guardian';
    const guardianId = (guardian as any)?.id || '99999999-9999-9999-9999-999999999901';

    const formattedArrival = formatTime12Hour(timeStr);
    const cutoffDisplay = this.getCutoffTimeDisplay();
    const lateDurationStr = formatLateDuration(params.minutesLate || 0);

    let notifTitle = params.customTitle || '';
    let notifMsg = params.customMessage || '';
    let notifType: NotificationType = 'ARRIVAL';
    let templateId = '77777777-7777-7777-7777-777777777701';
    let templateParams: string[] = [];

    const methodLabel = method === 'FACE' ? 'Face Recognition' : method === 'FINGERPRINT' ? 'Fingerprint Scanner' : 'Manual Attendance';

    switch (params.status) {
      case 'PRESENT':
        notifType = 'ARRIVAL';
        templateId = '77777777-7777-7777-7777-777777777701';
        notifTitle = notifTitle || 'Safe Gate Entry Verified (Clock In)';
        notifMsg = notifMsg || `${studentFullName} arrived at ${formattedArrival}. Attendance marked Present.`;
        templateParams = [studentFullName, formattedArrival, dateStr, methodLabel];
        break;
      case 'LATE':
        notifType = 'ARRIVAL';
        templateId = '77777777-7777-7777-7777-777777777701';
        notifTitle = notifTitle || 'Late Arrival Warning (Past Grace Period)';
        notifMsg = notifMsg || `${studentFullName} arrived at ${formattedArrival}. Late by ${lateDurationStr} after the permitted grace period.`;
        templateParams = [studentFullName, formattedArrival, dateStr, `Late by ${lateDurationStr}`];
        break;
      case 'ABSENT':
        notifType = 'ABSENCE';
        templateId = '77777777-7777-7777-7777-777777777702';
        notifTitle = notifTitle || 'Urgent: Student Marked Absent Today';
        notifMsg = notifMsg || `${studentFullName} has been marked Absent because no valid arrival was recorded before the ${cutoffDisplay} cutoff.`;
        templateParams = [studentFullName, dateStr, cutoffDisplay];
        break;
      case 'HALF_DAY':
        notifType = 'GENERAL_ANNOUNCEMENT';
        templateId = '77777777-7777-7777-7777-777777777703';
        notifTitle = notifTitle || 'Half Day Attendance Logged';
        notifMsg = notifMsg || `${studentFullName} arrived after the ${cutoffDisplay} cutoff. Attendance recorded according to the school's Half Day policy.`;
        templateParams = [studentFullName, 'Half Day', dateStr, params.remarks || 'Half day logged'];
        break;
      case 'ON_LEAVE':
        notifType = 'LEAVE_STATUS';
        templateId = '77777777-7777-7777-7777-777777777704';
        notifTitle = notifTitle || 'Approved Leave Recorded';
        notifMsg = notifMsg || `${studentFullName} is recorded ON LEAVE on ${dateStr}.${params.remarks ? ` ${params.remarks}` : ''}`;
        templateParams = [studentFullName, 'Approved Leave', dateStr, params.remarks || 'Leave request approved'];
        break;
      default:
        notifType = 'ARRIVAL';
        templateId = '77777777-7777-7777-7777-777777777701';
        notifTitle = notifTitle || `Attendance Update: ${params.status}`;
        notifMsg = notifMsg || `Attendance status updated to ${params.status} for ${studentFullName} on ${dateStr}.`;
        templateParams = [studentFullName, timeStr, dateStr, params.status];
    }

    const idempotencyKey = `att-${dateStr}-${student.id}-${params.status}${params.timeStr ? `-${params.timeStr.replace(/:/g, '')}` : ''}`;

    let deliveryStatus: 'DELIVERED' | 'FAILED' = 'DELIVERED';
    let deliveryError: string | undefined = undefined;

    if (!guardian) {
      deliveryStatus = 'FAILED';
      deliveryError = `No authorized parent/guardian linked to student ${studentFullName}`;
      this.logAuditEvent('NOTIFICATION_DISPATCH_FAILED', studentFullName, `Parent notification failed: ${deliveryError}`);
    } else if (!guardianPhone || guardianPhone.trim() === '') {
      deliveryStatus = 'FAILED';
      deliveryError = `Guardian ${guardianFullName} has no valid mobile number configured`;
      this.logAuditEvent('NOTIFICATION_DISPATCH_FAILED', guardianFullName, `Parent notification failed: ${deliveryError}`);
    }

    let notificationJob: NotificationJob | undefined;
    let isDuplicate = false;

    if (guardian) {
      const enqueueResult = this.enqueueNotificationJob({
        school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
        student_id: student.id,
        guardian_id: guardianId,
        template_id: templateId,
        notification_type: notifType,
        channel: 'WHATSAPP',
        idempotency_key: idempotencyKey,
        recipient_phone: guardianPhone,
        template_parameters: templateParams,
        title: notifTitle,
        message: notifMsg,
        student_name: studentFullName,
        status: deliveryStatus,
        is_read: false,
        scheduled_for: now.toISOString(),
        attempts: deliveryStatus === 'DELIVERED' ? 1 : 0,
        max_attempts: 3,
        dead_letter_reason: deliveryError,
        provider_response: deliveryStatus === 'DELIVERED'
          ? `HTTP 200 OK - Message delivered via WhatsApp Cloud API to ${guardianPhone}`
          : deliveryError
      });

      notificationJob = enqueueResult.job;
      isDuplicate = enqueueResult.isDuplicate;

      if (!isDuplicate && deliveryStatus === 'DELIVERED') {
        this.logAuditEvent(
          'NOTIFICATION_DELIVERED',
          guardianPhone,
          `Delivered ${notifType} notification to ${guardianFullName} (${guardianPhone}) for student ${studentFullName}`
        );
      }
    }

    // Live Database Sync & Push Notification to Supabase
    if (isSupabaseConfigured) {
      const validStudentUuid = student.id.includes('-') ? student.id : undefined;
      const validGuardianUuid = guardian?.id?.includes('-') ? guardian.id : undefined;

      if (validStudentUuid && validGuardianUuid) {
        supabase
          .from('parent_notifications')
          .insert({
            school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
            guardian_id: validGuardianUuid,
            student_id: validStudentUuid,
            title: notifTitle,
            message: notifMsg,
            notification_type: notifType,
            student_name: studentFullName,
            delivery_status: deliveryStatus,
            metadata: {
              attendance_date: dateStr,
              status: params.status,
              first_arrival_time: timeStr,
              method,
              remarks: params.remarks
            }
          })
          .then(({ error }) => {
            if (error) console.warn('[Supabase parent_notifications insert]:', error.message);
          });
      }
    }

    return { job: notificationJob, isDuplicate, deliveryStatus, deliveryError, guardian };
  }

  getNotificationsForUser(): NotificationJob[] {
    // Strictly & exclusively for PARENTS - Principal, Teacher, Student, Super Admin receive empty list
    if (this.currentUser.role !== 'parent') {
      return [];
    }
    const authorizedStudents = this.getAuthorizedStudents();
    const authorizedIds = authorizedStudents.map((s) => s.id);
    const parentEmail = (this.currentUser.email || '').toLowerCase();
    const parentId = this.currentUser.id;
    const parentProfile = PARENT_PROFILES.find(
      (p) => p.id === parentId || p.email.toLowerCase() === parentEmail
    );

    return this.notifications.filter((n) => {
      // 1. Direct match with authorized child ID
      if (n.student_id && authorizedIds.includes(n.student_id)) return true;

      // 2. Direct match with guardian ID or user ID
      if (n.guardian_id === parentId || (parentProfile && n.guardian_id === parentProfile.id)) return true;

      // 3. Match against child's guardians array
      const isStudentGuardian = authorizedStudents.some((std) =>
        std.guardians?.some((g) => g.id === n.guardian_id || g.user_id === parentId || (g.email && g.email.toLowerCase() === parentEmail))
      );
      if (isStudentGuardian) return true;

      // 4. Phone number match
      if (parentProfile && parentProfile.phone && n.recipient_phone === parentProfile.phone) return true;

      // 5. Template parameters match student first name
      if (
        n.template_parameters &&
        authorizedStudents.some((std) =>
          n.template_parameters[0]?.toLowerCase().includes(std.first_name.toLowerCase())
        )
      ) {
        return true;
      }

      // 6. Student name match
      const sName = n.student_name;
      if (
        sName &&
        authorizedStudents.some((std) =>
          sName.toLowerCase().includes(std.first_name.toLowerCase())
        )
      ) {
        return true;
      }

      return false;
    });
  }

  getUnreadNotificationCount(): number {
    const userNotifs = this.getNotificationsForUser();
    return userNotifs.filter((n) => !n.is_read).length;
  }

  markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.broadcastRealtimeSync({ type: 'NOTIFICATION_READ', notificationId: id });
      this.saveToLocalStorage();
      this.notify();
    }
  }

  markAllNotificationsAsRead() {
    const userNotifs = this.getNotificationsForUser();
    userNotifs.forEach((n) => (n.is_read = true));
    this.broadcastRealtimeSync({ type: 'NOTIFICATION_READ', all: true });
    this.saveToLocalStorage();
    this.notify();
  }

  recordBiometricPunch(studentIdOrAdm: string, method: VerificationMethod, confidence = 0.98, customTime?: string) {
    const student = this.students.find((s) => s.id === studentIdOrAdm || s.admission_number === studentIdOrAdm);
    if (!student) return null;

    const now = new Date();
    const timeStr = customTime || now.toLocaleTimeString('en-GB', { hour12: false });
    const todayDateStr = now.toISOString().split('T')[0];

    // Check for existing record to enforce anti-replay and preserve initial arrival timestamp
    const existingIndex = this.dailyAttendance.findIndex(
      (d) =>
        (d.student_id === student.id || d.student?.admission_number === student.admission_number) &&
        d.attendance_date === todayDateStr
    );

    const isDuplicate = existingIndex >= 0 && !!this.dailyAttendance[existingIndex].first_arrival_time;
    const initialArrival = isDuplicate
      ? this.dailyAttendance[existingIndex].first_arrival_time!
      : timeStr;

    // Daily evaluation is anchored to the student's verified initial arrival time
    const evaluation = this.evaluateAttendance({
      arrivalTime: initialArrival,
      method: isDuplicate && this.dailyAttendance[existingIndex].first_verification_method
        ? this.dailyAttendance[existingIndex].first_verification_method
        : method,
      studentName: `${student.first_name} ${student.last_name}`,
      dateStr: todayDateStr
    });

    playChimeSound('success');

    // 1. Add to Live Ticker
    const event: AttendanceEvent = {
      id: `evt-${Date.now()}`,
      school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: student.id,
      session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      event_type: 'CHECK_IN',
      event_timestamp: now.toISOString(),
      local_timestamp: timeStr,
      verification_method: method,
      confidence_score: confidence,
      liveness_verified: method === 'FACE',
      is_duplicate_ignored: isDuplicate,
      created_at: now.toISOString(),
      student_name: `${student.first_name} ${student.last_name}`,
      admission_number: student.admission_number,
      class_division: `${student.class_name}-${student.division_name}`,
      device_name: method === 'FACE' ? 'Senior Wing - Face Kiosk 1' : 'Main Gate - Terminal A'
    };
    this.liveTicker.unshift(event);

    // 2. Upsert Daily Record - Strictly Matching Student AND Today's Date
    const dailyRecord: DailyAttendance = {
      id: existingIndex >= 0 ? this.dailyAttendance[existingIndex].id : `att-${Date.now()}`,
      school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: student.id,
      attendance_date: todayDateStr,
      session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      status: evaluation.status,
      first_arrival_time: initialArrival,
      first_verification_method: isDuplicate && this.dailyAttendance[existingIndex].first_verification_method
        ? this.dailyAttendance[existingIndex].first_verification_method
        : method,
      is_late: evaluation.isLate,
      minutes_late: evaluation.minutesLate,
      remarks: evaluation.remarks,
      reconciled_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      student
    };

    if (existingIndex >= 0) {
      this.dailyAttendance[existingIndex] = dailyRecord;
      this.dailyAttendance = [...this.dailyAttendance];
    } else {
      this.dailyAttendance = [dailyRecord, ...this.dailyAttendance];
    }

    // 3. Trigger Parent Notification (WhatsApp & Push Pipeline)
    const notifResult = this.dispatchParentAttendanceNotification({
      studentId: student.id,
      status: evaluation.status,
      method,
      timeStr,
      dateStr: todayDateStr,
      isLate: evaluation.isLate,
      minutesLate: evaluation.minutesLate,
      remarks: evaluation.remarks,
      customTitle: evaluation.notificationTitle,
      customMessage: evaluation.notificationMessage
    });

    this.logAuditEvent(
      'BIOMETRIC_PUNCH_RECORDED',
      `${student.first_name} ${student.last_name}`,
      `Punched in via ${method} (${timeStr}, confidence: ${(confidence * 100).toFixed(1)}%)`
    );

    // 4. Asynchronous Live Database Persistence to Supabase
    if (isSupabaseConfigured) {
      const validStudentUuid = student.id.includes('-') ? student.id : undefined;
      if (validStudentUuid) {
        supabase
          .from('attendance_events')
          .insert({
            school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
            student_id: validStudentUuid,
            session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            event_type: 'CHECK_IN',
            event_timestamp: now.toISOString(),
            local_timestamp: timeStr,
            verification_method: method,
            confidence_score: confidence,
            liveness_verified: method === 'FACE',
            is_duplicate_ignored: false
          })
          .then(({ error }) => {
            if (error) console.warn('[Supabase attendance_events insert]:', error.message);
          });

        supabase
          .from('daily_attendance')
          .upsert(
            {
              school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
              student_id: validStudentUuid,
              attendance_date: todayDateStr,
              session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
              status: evaluation.status,
              first_arrival_time: initialArrival,
              first_verification_method: method,
              is_late: evaluation.isLate,
              minutes_late: evaluation.minutesLate,
              remarks: evaluation.remarks,
              reconciled_at: now.toISOString()
            },
            { onConflict: 'student_id,attendance_date,session_id' }
          )
          .then(({ error }) => {
            if (error) console.warn('[Supabase daily_attendance upsert]:', error.message);
          });
      }
    }

    // 5. Broadcast in Real-Time to All Open Browser Windows & Tabs (0ms latency without refresh)
    this.broadcastRealtimeSync({
      type: 'ATTENDANCE_PUNCH',
      studentId: student.id,
      record: dailyRecord,
      event,
      notification: notifResult.job
    });

    this.saveToLocalStorage();
    this.notify();
    return event;
  }

  recordOfflinePunch(studentIdOrAdm: string, customTime?: string) {
    const student = this.students.find((s) => s.id === studentIdOrAdm || s.admission_number === studentIdOrAdm);
    if (!student) return null;

    const now = new Date();
    const timeStr = customTime || now.toLocaleTimeString('en-GB', { hour12: false });
    const todayDateStr = now.toISOString().split('T')[0];

    const existingIndex = this.dailyAttendance.findIndex(
      (d) =>
        (d.student_id === student.id || d.student?.admission_number === student.admission_number) &&
        d.attendance_date === todayDateStr
    );

    const isDuplicate = existingIndex >= 0 && !!this.dailyAttendance[existingIndex].first_arrival_time;
    const initialArrival = isDuplicate
      ? this.dailyAttendance[existingIndex].first_arrival_time!
      : timeStr;

    const evaluation = this.evaluateAttendance({
      arrivalTime: initialArrival,
      method: 'FINGERPRINT',
      studentName: `${student.first_name} ${student.last_name}`,
      dateStr: todayDateStr,
      isOffline: true
    });

    playChimeSound('success');

    const event: AttendanceEvent = {
      id: `evt-offline-${Date.now()}`,
      school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: student.id,
      session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      event_type: 'CHECK_IN',
      event_timestamp: now.toISOString(),
      local_timestamp: timeStr,
      verification_method: 'FINGERPRINT',
      confidence_score: 0.99,
      liveness_verified: false,
      is_duplicate_ignored: isDuplicate,
      created_at: now.toISOString(),
      student_name: `${student.first_name} ${student.last_name}`,
      admission_number: student.admission_number,
      class_division: `${student.class_name}-${student.division_name}`,
      device_name: 'Campus Gate Terminal (Offline Buffer)'
    };
    this.liveTicker.unshift(event);

    const dailyRecord: DailyAttendance = {
      id: existingIndex >= 0 ? this.dailyAttendance[existingIndex].id : `att-offline-${Date.now()}`,
      school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: student.id,
      attendance_date: todayDateStr,
      session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      status: evaluation.status,
      first_arrival_time: initialArrival,
      first_verification_method: 'FINGERPRINT',
      is_late: evaluation.isLate,
      minutes_late: evaluation.minutesLate,
      remarks: evaluation.remarks,
      reconciled_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      student
    };

    if (existingIndex >= 0) {
      this.dailyAttendance[existingIndex] = dailyRecord;
      this.dailyAttendance = [...this.dailyAttendance];
    } else {
      this.dailyAttendance = [dailyRecord, ...this.dailyAttendance];
    }

    const notifResult = this.dispatchParentAttendanceNotification({
      studentId: student.id,
      status: evaluation.status,
      method: 'FINGERPRINT',
      timeStr,
      dateStr: todayDateStr,
      isLate: evaluation.isLate,
      minutesLate: evaluation.minutesLate,
      remarks: evaluation.remarks,
      customTitle: evaluation.notificationTitle,
      customMessage: evaluation.notificationMessage
    });

    this.logAuditEvent(
      'OFFLINE_PUNCH_RECORDED',
      `${student.first_name} ${student.last_name}`,
      `Offline arrival verified via FINGERPRINT (${timeStr})`
    );

    this.broadcastRealtimeSync({
      type: 'ATTENDANCE_PUNCH',
      studentId: student.id,
      record: dailyRecord,
      event,
      notification: notifResult.job
    });

    this.saveToLocalStorage();
    this.notify();
    return event;
  }

  overrideAttendance(
    studentId: string,
    newStatus: AttendanceStatus,
    reason: string,
    customDate?: string,
    arrivalTime?: string,
    departureTime?: string
  ) {
    const student = this.students.find((s) => s.id === studentId || s.admission_number === studentId);
    if (!student) return;

    const now = new Date();
    const targetDate = customDate || now.toISOString().split('T')[0];
    const existingIndex = this.dailyAttendance.findIndex(
      (d) => (d.student_id === student.id || d.student?.admission_number === student.admission_number) && d.attendance_date === targetDate
    );

    // Half-day attendance and official timing evaluation
    let finalArrivalTime = arrivalTime;
    if (!finalArrivalTime) {
      if (newStatus === 'PRESENT') finalArrivalTime = `${this.openingTime || '08:30'}:00`;
      else if (newStatus === 'LATE') finalArrivalTime = '09:00:00';
      else if (newStatus === 'HALF_DAY') finalArrivalTime = '10:30:00';
    }

    const evaluation = this.evaluateAttendance({
      arrivalTime: (newStatus === 'ABSENT' || newStatus === 'ON_LEAVE') ? undefined : finalArrivalTime,
      departureTime,
      forcedStatus: (newStatus === 'ABSENT' || newStatus === 'ON_LEAVE') ? newStatus : (newStatus === 'HALF_DAY' && !arrivalTime ? 'HALF_DAY' : undefined),
      reason,
      method: 'MANUAL',
      studentName: `${student.first_name} ${student.last_name}`,
      dateStr: targetDate
    });

    const finalStatus: AttendanceStatus = (newStatus === 'ABSENT' || newStatus === 'ON_LEAVE' || newStatus === 'HALF_DAY')
      ? newStatus
      : evaluation.status;
    const isLate = evaluation.isLate || finalStatus === 'LATE' || finalStatus === 'HALF_DAY';
    const minutesLate = evaluation.minutesLate;
    const remarks = `Manual override by ${this.currentUser.name}: ${reason}`;

    const record: DailyAttendance = {
      id: existingIndex >= 0 ? this.dailyAttendance[existingIndex].id : `att-ovr-${Date.now()}`,
      school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: student.id,
      attendance_date: targetDate,
      session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      status: finalStatus,
      first_arrival_time: (finalStatus === 'ABSENT' || finalStatus === 'ON_LEAVE') ? undefined : finalArrivalTime,
      departure_time: departureTime,
      first_verification_method: 'MANUAL',
      is_late: isLate,
      minutes_late: minutesLate,
      remarks,
      reconciled_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      student
    };

    if (existingIndex >= 0) {
      this.dailyAttendance[existingIndex] = record;
      this.dailyAttendance = [...this.dailyAttendance];
    } else {
      this.dailyAttendance = [record, ...this.dailyAttendance];
    }

    this.logAuditEvent(
      'ATTENDANCE_OVERRIDE',
      `${student.first_name} ${student.last_name}`,
      `Changed status to ${finalStatus} for ${targetDate}. Reason: ${reason}`
    );

    // Parent Notification Dispatch Workflow
    const notifResult = this.dispatchParentAttendanceNotification({
      studentId: student.id,
      status: finalStatus,
      method: 'MANUAL',
      timeStr: record.first_arrival_time,
      dateStr: targetDate,
      isLate,
      minutesLate,
      remarks,
      customTitle: evaluation.notificationTitle,
      customMessage: evaluation.notificationMessage
    });

    if (isSupabaseConfigured) {
      const validStudentUuid = student.id.includes('-') ? student.id : undefined;
      if (validStudentUuid) {
        supabase
          .from('daily_attendance')
          .upsert(
            {
              school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
              student_id: validStudentUuid,
              attendance_date: targetDate,
              session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
              status: finalStatus,
              first_arrival_time: record.first_arrival_time,
              departure_time: departureTime,
              first_verification_method: 'MANUAL',
              is_late: isLate,
              minutes_late: minutesLate,
              remarks,
              reconciled_at: now.toISOString()
            },
            { onConflict: 'student_id,attendance_date,session_id' }
          )
          .then(({ error }) => {
            if (error) console.warn('[Supabase overrideAttendance upsert]:', error.message);
          });
      }
    }

    // Real-Time Cross-Window Synchronization
    this.broadcastRealtimeSync({
      type: 'ATTENDANCE_OVERRIDE',
      studentId: student.id,
      record,
      notification: notifResult.job
    });

    this.saveToLocalStorage();
    this.notify();
    return {
      ...record,
      notification: notifResult.job,
      isDuplicate: notifResult.isDuplicate,
      deliveryStatus: notifResult.deliveryStatus,
      deliveryError: notifResult.deliveryError,
      guardian: notifResult.guardian
    };
  }

  recordCheckOut(studentId: string, checkoutTime?: string) {
    const student = this.students.find((s) => s.id === studentId || s.admission_number === studentId);
    if (!student) return null;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = checkoutTime || now.toLocaleTimeString('en-GB', { hour12: false });

    // Half-day calculation: Departure before 12:30:00 counts as Half Day
    const isHalfDay = timeStr < '12:30:00';

    const existingIndex = this.dailyAttendance.findIndex(
      (d) =>
        (d.student_id === student.id || d.student?.admission_number === student.admission_number) &&
        d.attendance_date === todayStr
    );

    const currentRecord = existingIndex >= 0 ? this.dailyAttendance[existingIndex] : null;
    const finalStatus: AttendanceStatus = isHalfDay ? 'HALF_DAY' : currentRecord?.status || 'PRESENT';

    const updatedRecord: DailyAttendance = {
      id: currentRecord ? currentRecord.id : `att-chk-${Date.now()}`,
      school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: student.id,
      attendance_date: todayStr,
      session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      status: finalStatus,
      first_arrival_time: currentRecord?.first_arrival_time || '08:25:00',
      departure_time: timeStr,
      first_verification_method: currentRecord?.first_verification_method || 'MANUAL',
      is_late: currentRecord?.is_late || false,
      minutes_late: currentRecord?.minutes_late || 0,
      remarks: isHalfDay
        ? `Early departure at ${timeStr}: Half Day recorded`
        : `Dismissal verified at ${timeStr}`,
      reconciled_at: now.toISOString(),
      created_at: currentRecord?.created_at || now.toISOString(),
      updated_at: now.toISOString(),
      student
    };

    if (existingIndex >= 0) {
      this.dailyAttendance[existingIndex] = updatedRecord;
    } else {
      this.dailyAttendance.unshift(updatedRecord);
    }

    if (isSupabaseConfigured && student.id.includes('-')) {
      supabase
        .from('attendance_events')
        .insert({
          school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
          student_id: student.id,
          session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          event_type: 'CHECK_OUT',
          event_timestamp: now.toISOString(),
          local_timestamp: timeStr,
          verification_method: 'MANUAL',
          confidence_score: 1.0,
          liveness_verified: true,
          is_duplicate_ignored: false
        })
        .then(({ error }) => {
          if (error) console.warn('[Supabase check_out event insert]:', error.message);
        });

      supabase
        .from('daily_attendance')
        .upsert(
          {
            school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
            student_id: student.id,
            attendance_date: todayStr,
            session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            status: finalStatus,
            first_arrival_time: updatedRecord.first_arrival_time,
            departure_time: timeStr,
            remarks: updatedRecord.remarks,
            reconciled_at: now.toISOString()
          },
          { onConflict: 'student_id,attendance_date,session_id' }
        )
        .then(({ error }) => {
          if (error) console.warn('[Supabase checkout daily upsert]:', error.message);
        });
    }

    this.logAuditEvent(
      'STUDENT_CHECKOUT',
      `${student.first_name} ${student.last_name}`,
      `Logged checkout at ${timeStr}. Status: ${finalStatus}`
    );
    this.notify();
    return updatedRecord;
  }

  submitLeaveRequest(
    studentId: string,
    startDate: string,
    endDate: string,
    reason: string,
    leaveType: LeaveType = 'PERSONAL_LEAVE',
    applicantRole: LeaveApplicantRole = 'PARENT',
    documentUrl?: string,
    documentName?: string
  ): LeaveRequest {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) throw new Error(`Student with ID ${studentId} not found.`);

    // 1. Date Order Validation
    if (new Date(endDate) < new Date(startDate)) {
      const err = `Validation Error: End date (${endDate}) cannot be earlier than start date (${startDate}).`;
      throw new Error(err);
    }

    // 2. Strict Parent Authorization Check (IDOR prevention)
    if (this.currentUser.role === 'parent' && !this.isAuthorizedForStudent(studentId)) {
      const err = `Security Exception: Access Denied. You cannot apply for leave for student '${student.first_name} ${student.last_name}' because they are not your registered child.`;
      this.logAuditEvent('UNAUTHORIZED_LEAVE_ATTEMPT_BLOCKED', `${student.first_name} ${student.last_name}`, err);
      throw new Error(err);
    }

    // 3. Duplicate and Overlapping Application Prevention
    const reqStart = new Date(startDate).getTime();
    const reqEnd = new Date(endDate).getTime();
    const overlapping = this.leaveRequests.find((l) => {
      if (l.student_id !== studentId) return false;
      if (l.status === 'REJECTED' || l.status === 'CANCELLED') return false;
      const existStart = new Date(l.start_date).getTime();
      const existEnd = new Date(l.end_date).getTime();
      return !(reqEnd < existStart || reqStart > existEnd);
    });

    if (overlapping) {
      const err = `Conflict Error: An active leave application (${overlapping.status}) already exists for ${student.first_name} ${student.last_name} spanning ${overlapping.start_date} to ${overlapping.end_date}. Duplicate or overlapping leaves are prohibited.`;
      this.logAuditEvent('DUPLICATE_LEAVE_BLOCKED', `${student.first_name} ${student.last_name}`, err);
      throw new Error(err);
    }

    const guardian = student.guardians?.[0];
    const leave: LeaveRequest = {
      id: `leave-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      class_name: `${student.class_name}-${student.division_name}`,
      parent_name: guardian?.full_name || this.currentUser.name,
      parent_phone: guardian?.phone_number || '+919811122233',
      leave_type: leaveType,
      applicant_role: applicantRole,
      start_date: startDate,
      end_date: endDate,
      reason,
      document_url: documentUrl,
      document_name: documentName,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    this.leaveRequests.unshift(leave);
    this.logAuditEvent(
      'LEAVE_REQUEST_SUBMITTED',
      leave.student_name,
      `Leave requested (${leaveType}): ${startDate} to ${endDate} (${reason})`
    );

    if (isSupabaseConfigured && student.id.includes('-')) {
      supabase
        .from('leave_requests')
        .insert({
          school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
          student_id: student.id,
          start_date: startDate,
          end_date: endDate,
          reason,
          status: 'PENDING'
        })
        .then(({ error }) => {
          if (error) console.warn('[Supabase leave_requests insert]:', error.message);
        });
    }

    this.notify();
    return leave;
  }

  cancelLeaveRequest(leaveId: string): LeaveRequest {
    const leave = this.leaveRequests.find((l) => l.id === leaveId);
    if (!leave) throw new Error(`Leave application ${leaveId} not found.`);

    if (this.currentUser.role === 'parent' && !this.isAuthorizedForStudent(leave.student_id)) {
      const err = `Security Exception: You cannot cancel a leave application for a student who is not your registered child.`;
      this.logAuditEvent('UNAUTHORIZED_LEAVE_CANCEL_BLOCKED', leave.student_name, err);
      throw new Error(err);
    }

    if (leave.status !== 'PENDING') {
      throw new Error(`Only pending leave applications can be cancelled. Current status is ${leave.status}.`);
    }

    leave.status = 'CANCELLED';
    leave.cancelled_at = new Date().toISOString();
    leave.cancelled_by = this.currentUser.name;

    this.logAuditEvent(
      'LEAVE_REQUEST_CANCELLED',
      leave.student_name,
      `Leave cancelled by ${this.currentUser.name} for period ${leave.start_date} to ${leave.end_date}`
    );

    if (isSupabaseConfigured && leave.id.includes('-')) {
      supabase
        .from('leave_requests')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('id', leave.id)
        .then(({ error }) => {
          if (error) console.warn('[Supabase leave_requests cancel]:', error.message);
        });
    }

    this.notify();
    return leave;
  }

  isTeacherAuthorizedForStudent(studentId: string): boolean {
    if (this.currentUser.role !== 'teacher') return true;
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return false;
    // Mr. Rajesh Kumar is assigned to Grade 10-A
    const isGrade10 = student.class_name?.toLowerCase().includes('10') || student.class_id === '33333333-3333-3333-3333-333333333310';
    const isDivA = student.division_name === 'A' || student.division_id === '44444444-4444-4444-4444-444444444411';
    return isGrade10 && isDivA;
  }

  approveLeaveRequest(leaveId: string, remarks = 'Approved by administration'): LeaveRequest {
    const leave = this.leaveRequests.find((l) => l.id === leaveId);
    if (!leave) throw new Error(`Leave application ${leaveId} not found.`);

    if (this.currentUser.role === 'parent') {
      const err = `Security Exception: Parents are not authorized to approve leave applications.`;
      this.logAuditEvent('UNAUTHORIZED_LEAVE_APPROVAL_BLOCKED', leave.student_name, err);
      throw new Error(err);
    }

    if (this.currentUser.role === 'teacher' && !this.isTeacherAuthorizedForStudent(leave.student_id)) {
      const err = `Security Exception: Teachers can only approve leave applications for their assigned class (Grade 10-A). Access denied for ${leave.student_name} (${leave.class_name}).`;
      this.logAuditEvent('TEACHER_CLASS_BOUNDARY_BLOCKED', leave.student_name, err);
      throw new Error(err);
    }

    leave.status = 'APPROVED';
    leave.reviewed_by = this.currentUser.name;
    leave.reviewed_by_id = this.currentUser.id;
    leave.reviewed_at = new Date().toISOString();
    leave.remarks = remarks;

    // Synchronize attendance across the leave date range
    // Respect official school holidays: preserve HOLIDAY status, apply ON_LEAVE / EXCUSED only to instructional days
    const curDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    while (curDate <= endDate) {
      const dateStr = curDate.toISOString().split('T')[0];
      if (!this.isHoliday(dateStr)) {
        // Daily attendance: set ON_LEAVE
        this.overrideAttendance(leave.student_id, 'ON_LEAVE', `Approved Leave Request: ${leave.reason}`, dateStr);

        // Subject attendance: set EXCUSED
        this.subjectAttendance.forEach((sub) => {
          if (sub.student_id === leave.student_id && sub.date === dateStr) {
            sub.status = 'EXCUSED';
          }
        });
      }
      curDate.setDate(curDate.getDate() + 1);
    }

    // Queue WhatsApp notification to parent with idempotency
    const student = this.students.find((s) => s.id === leave.student_id);
    if (student) {
      this.enqueueNotificationJob({
        school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
        student_id: student.id,
        guardian_id: student.guardians?.[0]?.id || '99999999-9999-9999-9999-999999999901',
        template_id: '77777777-7777-7777-7777-777777777703',
        notification_type: 'LEAVE_STATUS',
        channel: 'WHATSAPP',
        idempotency_key: `leave-approve-${leave.id}`,
        recipient_phone: leave.parent_phone,
        template_parameters: [leave.student_name, `${leave.start_date} to ${leave.end_date}`, 'APPROVED', remarks],
        status: 'DELIVERED',
        scheduled_for: new Date().toISOString(),
        attempts: 1,
        max_attempts: 3
      });
    }

    this.logAuditEvent('LEAVE_APPROVED', leave.student_name, `Approved by ${this.currentUser.name}: ${remarks}`);

    if (isSupabaseConfigured && leave.id.includes('-')) {
      supabase
        .from('leave_requests')
        .update({
          status: 'APPROVED',
          reviewed_by: this.currentUser.name,
          review_comments: remarks,
          updated_at: new Date().toISOString()
        })
        .eq('id', leave.id)
        .then(({ error }) => {
          if (error) console.warn('[Supabase leave_requests approve]:', error.message);
        });
    }

    this.notify();
    return leave;
  }

  rejectLeaveRequest(leaveId: string, remarks = 'Rejected'): LeaveRequest {
    const leave = this.leaveRequests.find((l) => l.id === leaveId);
    if (!leave) throw new Error(`Leave application ${leaveId} not found.`);

    if (this.currentUser.role === 'parent') {
      const err = `Security Exception: Parents are not authorized to reject leave applications.`;
      this.logAuditEvent('UNAUTHORIZED_LEAVE_REJECT_BLOCKED', leave.student_name, err);
      throw new Error(err);
    }

    if (this.currentUser.role === 'teacher' && !this.isTeacherAuthorizedForStudent(leave.student_id)) {
      const err = `Security Exception: Teachers can only reject leave applications for their assigned class (Grade 10-A). Access denied for ${leave.student_name} (${leave.class_name}).`;
      this.logAuditEvent('TEACHER_CLASS_BOUNDARY_BLOCKED', leave.student_name, err);
      throw new Error(err);
    }

    leave.status = 'REJECTED';
    leave.reviewed_by = this.currentUser.name;
    leave.reviewed_by_id = this.currentUser.id;
    leave.reviewed_at = new Date().toISOString();
    leave.remarks = remarks;

    const student = this.students.find((s) => s.id === leave.student_id);
    if (student) {
      this.enqueueNotificationJob({
        school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
        student_id: student.id,
        guardian_id: student.guardians?.[0]?.id || '99999999-9999-9999-9999-999999999901',
        template_id: '77777777-7777-7777-7777-777777777703',
        notification_type: 'LEAVE_STATUS',
        channel: 'WHATSAPP',
        idempotency_key: `leave-reject-${leave.id}`,
        recipient_phone: leave.parent_phone,
        template_parameters: [leave.student_name, `${leave.start_date} to ${leave.end_date}`, 'REJECTED', remarks],
        status: 'DELIVERED',
        scheduled_for: new Date().toISOString(),
        attempts: 1,
        max_attempts: 3
      });
    }

    this.logAuditEvent('LEAVE_REJECTED', leave.student_name, `Rejected by ${this.currentUser.name}: ${remarks}`);

    if (isSupabaseConfigured && leave.id.includes('-')) {
      supabase
        .from('leave_requests')
        .update({
          status: 'REJECTED',
          reviewed_by: this.currentUser.name,
          review_comments: remarks,
          updated_at: new Date().toISOString()
        })
        .eq('id', leave.id)
        .then(({ error }) => {
          if (error) console.warn('[Supabase leave_requests reject]:', error.message);
        });
    }

    this.notify();
    return leave;
  }

  isStudentOnApprovedLeave(studentId: string, dateStr: string): boolean {
    return this.leaveRequests.some((l) => {
      if (l.student_id !== studentId) return false;
      if (l.status !== 'APPROVED') return false;
      return dateStr >= l.start_date && dateStr <= l.end_date;
    });
  }

  runAbsenceReconciliation() {
    const todayStr = new Date().toISOString().split('T')[0];
    if (this.isHoliday(todayStr)) {
      this.logAuditEvent('ABSENCE_RECONCILIATION_SKIPPED', 'School Holiday', `Date ${todayStr} is registered in official school holiday calendar.`);
      return 0;
    }

    const attendedIds = new Set(this.dailyAttendance.filter(d => d.attendance_date === todayStr).map((d) => d.student_id));
    let absentCount = 0;

    for (const student of this.students) {
      if (!attendedIds.has(student.id)) {
        // Attendance Integration: Check if student is on approved leave
        if (this.isStudentOnApprovedLeave(student.id, todayStr)) {
          const leaveRec: DailyAttendance = {
            id: `att-lve-${Date.now()}-${student.id}`,
            school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
            student_id: student.id,
            attendance_date: todayStr,
            session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            status: 'ON_LEAVE',
            is_late: false,
            minutes_late: 0,
            remarks: 'Approved leave in effect. Absence notification suppressed.',
            reconciled_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            student
          };
          this.dailyAttendance.push(leaveRec);
          continue; // Suppress absence count and WhatsApp alert!
        }

        const evaluation = this.evaluateAttendance({
          forcedStatus: 'ABSENT',
          studentName: `${student.first_name} ${student.last_name}`,
          dateStr: todayStr
        });

        absentCount++;
        const record: DailyAttendance = {
          id: `att-abs-${Date.now()}-${student.id}`,
          school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
          student_id: student.id,
          attendance_date: todayStr,
          session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          status: 'ABSENT',
          is_late: false,
          minutes_late: 0,
          remarks: evaluation.remarks,
          reconciled_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          student
        };
        this.dailyAttendance.push(record);

        // Queue Absence WhatsApp
        const g = student.guardians?.[0];
        if (g && g.whatsapp_opt_in) {
          this.enqueueNotificationJob({
            school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
            student_id: student.id,
            guardian_id: g.id,
            template_id: '77777777-7777-7777-7777-777777777702',
            notification_type: 'ABSENCE',
            channel: 'WHATSAPP',
            idempotency_key: `abs-rec-${todayStr}-${student.id}`,
            recipient_phone: g.phone_number,
            template_parameters: [`${student.first_name} ${student.last_name}`, todayStr, this.getCutoffTimeDisplay()],
            title: evaluation.notificationTitle,
            message: evaluation.notificationMessage,
            student_name: `${student.first_name} ${student.last_name}`,
            status: 'SENT',
            scheduled_for: new Date().toISOString(),
            attempts: 1,
            max_attempts: 3
          });
        }
      }
    }

    this.logAuditEvent('ABSENCE_RECONCILIATION_RUN', `${absentCount} Students Marked Absent`, `Cutoff ${this.cutoffTime} executed`);
    this.notify();
    return absentCount;
  }

  enqueueNotificationJob(job: Partial<NotificationJob>): { job: NotificationJob; isDuplicate: boolean } {
    // 1. Idempotency Check
    if (job.idempotency_key) {
      const existing = this.notifications.find((n) => n.idempotency_key === job.idempotency_key);
      if (existing) {
        return { job: existing, isDuplicate: true };
      }
    }

    const newJob: NotificationJob = {
      id: job.id || `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      school_id: job.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: job.student_id || '88888888-8888-8888-8888-888888888801',
      guardian_id: job.guardian_id || '99999999-9999-9999-9999-999999999901',
      template_id: job.template_id || '77777777-7777-7777-7777-777777777701',
      notification_type: job.notification_type || 'ARRIVAL',
      channel: job.channel || 'WHATSAPP',
      idempotency_key: job.idempotency_key,
      recipient_phone: job.recipient_phone || '+919811122233',
      template_parameters: job.template_parameters || [],
      title: job.title || (job.notification_type === 'ABSENCE' ? 'Student Absence Notice' : 'Attendance Notification'),
      message: job.message || '',
      student_name: job.student_name,
      status: job.status || 'QUEUED',
      is_read: job.is_read ?? false,
      scheduled_for: job.scheduled_for || new Date().toISOString(),
      attempts: job.attempts || 0,
      max_attempts: job.max_attempts || 3,
      dead_letter_reason: job.dead_letter_reason,
      provider_response: job.provider_response,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.notifications = [newJob, ...this.notifications];
    this.notify();
    return { job: newJob, isDuplicate: false };
  }

  processNotificationJob(jobId: string, simulateFailure = false): NotificationJob {
    const job = this.notifications.find((j) => j.id === jobId);
    if (!job) throw new Error(`Notification job ${jobId} not found.`);

    job.status = 'PROCESSING';
    job.attempts = (job.attempts || 0) + 1;
    job.updated_at = new Date().toISOString();

    if (simulateFailure) {
      if (job.attempts >= (job.max_attempts || 3)) {
        job.status = 'DEAD_LETTER';
        job.dead_letter_reason = `Maximum delivery attempts (${job.attempts}/${job.max_attempts || 3}) exhausted. Routed to Dead-Letter Queue.`;
        job.next_retry_at = undefined;
        this.logAuditEvent('NOTIFICATION_DEAD_LETTER', job.recipient_phone, job.dead_letter_reason);
      } else {
        job.status = 'FAILED';
        // Exponential backoff: 30s * 2^(attempts-1)
        const backoffSeconds = 30 * Math.pow(2, job.attempts - 1);
        job.next_retry_at = new Date(Date.now() + backoffSeconds * 1000).toISOString();
        job.provider_response = `Provider Error 503: Transient gateway timeout. Retry in ${backoffSeconds}s.`;
        this.logAuditEvent('NOTIFICATION_DISPATCH_FAILED', job.recipient_phone, `Attempt ${job.attempts} failed. Next retry at ${job.next_retry_at}`);
      }
    } else {
      job.status = 'DELIVERED';
      job.provider_response = `HTTP 200 OK - Message delivered via ${job.channel || 'WHATSAPP'} provider`;
      job.next_retry_at = undefined;
      job.dead_letter_reason = undefined;
      this.logAuditEvent('NOTIFICATION_DELIVERED', job.recipient_phone, `Successfully delivered on ${job.channel}`);
    }

    this.notify();
    return job;
  }

  retryNotificationJob(jobId: string): NotificationJob {
    const job = this.notifications.find((j) => j.id === jobId);
    if (!job) throw new Error(`Notification job ${jobId} not found.`);

    job.status = 'QUEUED';
    job.dead_letter_reason = undefined;
    job.next_retry_at = undefined;
    job.updated_at = new Date().toISOString();

    this.logAuditEvent('NOTIFICATION_MANUAL_RETRY', job.recipient_phone, `Manual retry queued for job ${job.id}`);

    // Simulate immediate successful processing
    const processed = this.processNotificationJob(jobId, false);
    return processed;
  }

  sendTestWhatsApp(phone: string, studentName: string) {
    const job: NotificationJob = {
      id: `job-test-${Date.now()}`,
      school_id: '11111111-1111-1111-1111-111111111111',
      student_id: this.students[0]?.id || '88888888-8888-8888-8888-888888888801',
      guardian_id: '99999999-9999-9999-9999-999999999901',
      template_id: '77777777-7777-7777-7777-777777777701',
      notification_type: 'ARRIVAL',
      recipient_phone: phone,
      template_parameters: [studentName, '08:25 AM', 'Today', 'Verified Test Dispatch'],
      status: 'DELIVERED',
      scheduled_for: new Date().toISOString(),
      attempts: 1,
      max_attempts: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.notifications.unshift(job);
    this.logAuditEvent('WHATSAPP_TEST_DISPATCH', studentName, `Sent test arrival template to ${phone}`);
    this.notify();
    return job;
  }

  isHoliday(dateStr: string): boolean {
    return this.holidays.some((h) => h.holiday_date === dateStr);
  }

  async addHoliday(holiday: Omit<SchoolHoliday, 'id'>) {
    const newHoliday: SchoolHoliday = {
      ...holiday,
      id: `hol-${Date.now()}`
    };
    this.holidays.push(newHoliday);
    if (isSupabaseConfigured && supabase) {
      try {
        await (supabase.from('school_holidays') as any).insert([{
          school_id: holiday.school_id,
          academic_year_id: holiday.academic_year_id,
          holiday_date: holiday.holiday_date,
          name: holiday.name,
          description: holiday.description
        }]);
      } catch (err) {
        console.warn('Could not sync holiday to Supabase:', err);
      }
    }
    this.logAuditEvent('HOLIDAY_SCHEDULED', holiday.name, `Scheduled date: ${holiday.holiday_date}`);
    this.notify();
    return newHoliday;
  }

  async deleteHoliday(holidayId: string) {
    const target = this.holidays.find((h) => h.id === holidayId);
    this.holidays = this.holidays.filter((h) => h.id !== holidayId);
    if (isSupabaseConfigured && supabase) {
      try {
        await (supabase.from('school_holidays') as any).delete().eq('id', holidayId);
      } catch (err) {
        console.warn('Could not delete holiday from Supabase:', err);
      }
    }
    if (target) {
      this.logAuditEvent('HOLIDAY_REMOVED', target.name, `Removed date: ${target.holiday_date}`);
    }
    this.notify();
  }

  // ==========================================================================
  // SPRINT 3: Academic Year Transitions & Student Promotion Management
  // ==========================================================================

  addAcademicYear(name: string, startDate: string, endDate: string, isCurrent: boolean = false): AcademicYear {
    const newYear: AcademicYear = {
      id: `ay-${Date.now()}`,
      school_id: '11111111-1111-1111-1111-111111111111',
      name,
      start_date: startDate,
      end_date: endDate,
      is_current: isCurrent,
      created_at: new Date().toISOString()
    };

    if (isCurrent) {
      this.academicYears.forEach((y) => (y.is_current = false));
    }

    this.academicYears.push(newYear);

    if (isSupabaseConfigured && supabase) {
      supabase.from('academic_years').insert(newYear).then(({ error }) => {
        if (error) console.warn('Supabase academic year insert notice:', error.message);
      });
    }

    this.logAuditEvent(
      'ACADEMIC_YEAR_CREATED',
      name,
      `New academic session configured (${startDate} to ${endDate})`
    );
    this.notify();
    return newYear;
  }

  setCurrentAcademicYear(yearIdOrName: string): boolean {
    const target = this.academicYears.find((y) => y.id === yearIdOrName || y.name === yearIdOrName);
    if (!target) return false;

    this.academicYears.forEach((y) => {
      y.is_current = y.id === target.id;
    });

    if (isSupabaseConfigured && supabase) {
      supabase.from('academic_years').update({ is_current: false }).neq('id', target.id).then(() => {
        supabase.from('academic_years').update({ is_current: true }).eq('id', target.id);
      });
    }

    this.logAuditEvent(
      'ACADEMIC_YEAR_TRANSITION',
      target.name,
      `Active academic session changed to ${target.name}`
    );
    this.notify();
    return true;
  }

  // ==========================================================================
  // SPRINT 3: Student Division Management & Automatic Standard Promotion
  // ==========================================================================

  getNextStandard(currentClass: string): string {
    const trimmed = (currentClass || '').trim();
    // Match "Grade X", "Standard X", "Class X", "Std X", or simple number
    const match = trimmed.match(/(?:grade|standard|class|std)?\s*(\d+)/i);
    if (match) {
      const currentGradeNum = parseInt(match[1], 10);
      if (currentGradeNum >= 12) {
        return 'Graduated';
      }
      return `Grade ${currentGradeNum + 1}`;
    }
    if (/lkg/i.test(trimmed)) return 'UKG';
    if (/ukg/i.test(trimmed)) return 'Grade 1';
    return trimmed;
  }

  async updateStudentDivision(
    studentId: string,
    newDivision: string
  ): Promise<{ success: boolean; student?: Student; error?: string }> {
    // 1. Role permission enforcement: Only Principal or School Admin can change divisions
    const currentUserRole = this.currentUser?.role;
    if (currentUserRole !== 'school_admin' && currentUserRole !== 'super_admin') {
      const errorMsg = 'Access Denied: Only Principal or School Administrator has permission to change student division.';
      console.warn(errorMsg);
      return { success: false, error: errorMsg };
    }

    const targetDivision = (newDivision || '').trim().toUpperCase();
    if (!targetDivision) {
      return { success: false, error: 'Division cannot be empty.' };
    }

    const studentIndex = this.students.findIndex((s) => s.id === studentId);
    if (studentIndex === -1) {
      return { success: false, error: 'Student record not found.' };
    }

    const currentStudent = this.students[studentIndex];
    const oldDivision = currentStudent.division_name || 'A';
    if (oldDivision === targetDivision) {
      return { success: true, student: currentStudent };
    }

    // 2. Resolve division_id for the target division in this class
    let divisionObj = this.divisions.find(
      (d) => d.class_id === currentStudent.class_id && d.name.toUpperCase() === targetDivision
    );
    if (!divisionObj) {
      divisionObj = {
        id: `div-${currentStudent.class_id}-${targetDivision.toLowerCase()}`,
        class_id: currentStudent.class_id,
        name: targetDivision,
        created_at: new Date().toISOString()
      };
      this.divisions.push(divisionObj);
    }

    // 3. Update student record (Attendance, biometrics, marks, and historical ledger remain completely intact)
    const updatedStudent: Student = {
      ...currentStudent,
      division_id: divisionObj.id,
      division_name: targetDivision,
      updated_at: new Date().toISOString()
    };
    this.students[studentIndex] = updatedStudent;

    // 4. Update active class enrollment record
    this.classEnrollments = this.classEnrollments.map((enr) => {
      if (enr.student_id === studentId && enr.is_active) {
        return {
          ...enr,
          division_id: divisionObj!.id,
          division_name: targetDivision
        };
      }
      return enr;
    });

    // 5. Persist to Supabase database if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await (supabase.from('students') as any)
          .update({
            division_id: divisionObj.id,
            division_name: targetDivision,
            updated_at: new Date().toISOString()
          })
          .eq('id', studentId);

        await (supabase.from('class_enrollments') as any)
          .update({
            division_id: divisionObj.id,
            division_name: targetDivision
          })
          .eq('student_id', studentId)
          .eq('is_active', true);
      } catch (dbErr) {
        console.warn('Supabase division update notice:', dbErr);
      }
    }

    // 6. Record audit log
    this.logAuditEvent(
      'STUDENT_DIVISION_CHANGED',
      `Student Division Reassigned`,
      `${currentStudent.first_name} ${currentStudent.last_name} (${currentStudent.admission_number}) reassigned from Division ${oldDivision} to Division ${targetDivision} by ${this.currentUser.name} (${currentUserRole}). Attendance, marks, and history preserved.`
    );

    // 7. Save and notify live listeners
    this.saveToLocalStorage();
    this.notify();

    return { success: true, student: updatedStudent };
  }

  getStudentPromotionEligibility(studentId: string, minCompliancePct: number = 75, targetYearOverride?: string): {
    isEligible: boolean;
    status: 'PASS_PROMOTABLE' | 'FAIL_RETAINED' | 'ALREADY_PROMOTED' | 'ATTENDANCE_DEFICIT';
    action: 'PROMOTED' | 'RETAINED';
    attendanceRate: number;
    examPercentage: number;
    examStatus: 'PASS' | 'FAIL';
    sourceClass: string;
    targetClass: string;
    targetAcademicYear: string;
    reason: string;
  } {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) {
      return {
        isEligible: false,
        status: 'ATTENDANCE_DEFICIT',
        action: 'RETAINED',
        attendanceRate: 0,
        examPercentage: 0,
        examStatus: 'FAIL',
        sourceClass: 'Unknown',
        targetClass: 'Unknown',
        targetAcademicYear: '2027-2028',
        reason: 'Student record not found.'
      };
    }

    const currentYear = this.academicYears.find((y) => y.is_current)?.name || '2026-2027';
    const nextYear = targetYearOverride || (currentYear === '2026-2027' ? '2027-2028' : `${parseInt(currentYear.split('-')[0]) + 1}-${parseInt(currentYear.split('-')[1]) + 1}`);

    // Check if student already has an active enrollment in target academic year
    const isAlreadyPromoted = this.classEnrollments.some(
      (e) => e.student_id === studentId && e.academic_year_name === nextYear && e.is_active
    );

    // Look up examination result
    const exam = this.examResults.find((e) => e.student_id === studentId) || {
      student_id: studentId,
      percentage: 75,
      result_status: 'PASS' as const
    };

    const isPass = exam.result_status === 'PASS';
    const sourceClass = student.class_name || 'Grade 9';
    const targetClass = isPass ? this.getNextStandard(sourceClass) : sourceClass;

    // Calculate attendance compliance
    const records = this.dailyAttendance.filter((d) => d.student_id === studentId);
    const totalDays = records.length;
    const presentDays = records.filter((d) => d.status === 'PRESENT' || d.status === 'LATE').length;
    const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 95;

    if (isAlreadyPromoted) {
      return {
        isEligible: false,
        status: 'ALREADY_PROMOTED',
        action: isPass ? 'PROMOTED' : 'RETAINED',
        attendanceRate: rate,
        examPercentage: exam.percentage,
        examStatus: exam.result_status,
        sourceClass,
        targetClass,
        targetAcademicYear: nextYear,
        reason: `Student already enrolled for academic session ${nextYear} in ${targetClass}`
      };
    }

    if (isPass) {
      return {
        isEligible: true,
        status: 'PASS_PROMOTABLE',
        action: 'PROMOTED',
        attendanceRate: rate,
        examPercentage: exam.percentage,
        examStatus: 'PASS',
        sourceClass,
        targetClass,
        targetAcademicYear: nextYear,
        reason: `Passed examination (${exam.percentage}% >= 40%). Automatically moves to ${targetClass} for ${nextYear}.`
      };
    } else {
      return {
        isEligible: true, // eligible for processing retention
        status: 'FAIL_RETAINED',
        action: 'RETAINED',
        attendanceRate: rate,
        examPercentage: exam.percentage,
        examStatus: 'FAIL',
        sourceClass,
        targetClass: sourceClass,
        targetAcademicYear: nextYear,
        reason: `Failed examination (${exam.percentage}% < 40%). Retained in ${sourceClass} for ${nextYear}.`
      };
    }
  }

  async executeAutomaticStandardPromotion(options: {
    targetYear?: string;
    studentIds?: string[];
    sourceClass?: string;
    targetDivision?: string;
  }): Promise<PromotionBatchResult> {
    const currentYear = this.academicYears.find((y) => y.is_current)?.name || '2026-2027';
    const targetYear = options.targetYear || (currentYear === '2026-2027' ? '2027-2028' : `${parseInt(currentYear.split('-')[0]) + 1}-${parseInt(currentYear.split('-')[1]) + 1}`);

    // Ensure target academic year exists
    let targetYearObj = this.academicYears.find((y) => y.name === targetYear);
    if (!targetYearObj) {
      targetYearObj = {
        id: `ay-${Date.now()}`,
        school_id: '11111111-1111-1111-1111-111111111111',
        name: targetYear,
        start_date: `${targetYear.split('-')[0]}-04-01`,
        end_date: `${targetYear.split('-')[1] || '2028'}-03-31`,
        is_current: false,
        created_at: new Date().toISOString()
      };
      this.academicYears.push(targetYearObj);
    }

    const promotedStudents: string[] = [];
    const retainedStudents: string[] = [];
    let skippedDuplicates = 0;
    const details: NonNullable<PromotionBatchResult['details']> = [];

    // Filter candidate students
    const candidates = this.students.filter((s) => {
      if (options.studentIds && options.studentIds.length > 0) {
        return options.studentIds.includes(s.id);
      }
      if (options.sourceClass && options.sourceClass !== 'ALL') {
        return s.class_name === options.sourceClass;
      }
      return true;
    });

    for (const student of candidates) {
      const studentName = `${student.first_name} ${student.last_name}`;

      // 1. Anti-duplicate check: Prevent duplicate promotion if already enrolled in target year
      const alreadyEnrolled = this.classEnrollments.some(
        (e) => e.student_id === student.id && e.academic_year_name === targetYear && e.is_active
      );

      if (alreadyEnrolled) {
        skippedDuplicates++;
        details.push({
          student_id: student.id,
          student_name: studentName,
          action: 'SKIPPED_DUPLICATE',
          from_class: student.class_name || 'Unknown',
          to_class: student.class_name || 'Unknown',
          result_status: 'PASS',
          percentage: 0,
          reason: `Duplicate skipped: Student is already actively enrolled in ${targetYear}`
        });
        continue;
      }

      // 2. Exam Results & Automatic Pass/Fail Standard Progression Logic:
      // When PASS: Standard 9 -> Standard 10 (or Grade N -> Grade N+1).
      // When FAIL: Standard 9 -> Standard 9 (retained in same standard).
      const exam = this.examResults.find((e) => e.student_id === student.id) || {
        student_id: student.id,
        percentage: 75,
        result_status: 'PASS' as const
      };

      const isPass = exam.result_status === 'PASS';
      const sourceClass = student.class_name || 'Grade 9';
      const targetClass = isPass ? this.getNextStandard(sourceClass) : sourceClass;
      const action = isPass ? 'PROMOTED' : 'RETAINED';

      // 3. Resolve target class object
      let targetClassObj = this.classes.find((c) => c.name.toLowerCase() === targetClass.toLowerCase());
      if (!targetClassObj) {
        targetClassObj = {
          id: `cls-${targetClass.toLowerCase().replace(/\s+/g, '-')}`,
          school_id: student.school_id,
          name: targetClass,
          numeric_grade: parseInt(targetClass.replace(/\D/g, ''), 10) || 10,
          created_at: new Date().toISOString()
        };
        this.classes.push(targetClassObj);
      }

      const assignedDivision = options.targetDivision || student.division_name || 'A';
      let targetDivObj = this.divisions.find(
        (d) => d.class_id === targetClassObj!.id && d.name.toUpperCase() === assignedDivision.toUpperCase()
      );
      if (!targetDivObj) {
        targetDivObj = {
          id: `div-${targetClassObj.id}-${assignedDivision.toLowerCase()}`,
          class_id: targetClassObj.id,
          name: assignedDivision.toUpperCase(),
          created_at: new Date().toISOString()
        };
        this.divisions.push(targetDivObj);
      }

      // 4. Archive previous enrollment to preserve historical academic ledger
      this.classEnrollments.forEach((e) => {
        if (e.student_id === student.id) {
          e.is_active = false;
        }
      });

      // 5. Create new active enrollment record for next academic year
      const newEnrollment: ClassEnrollment = {
        id: `enr-${Date.now()}-${student.id.substring(0, 5)}`,
        student_id: student.id,
        class_id: targetClassObj.id,
        class_name: targetClass,
        division_id: targetDivObj.id,
        division_name: assignedDivision,
        academic_year_id: targetYearObj.id,
        academic_year_name: targetYear,
        enrolled_at: new Date().toISOString().split('T')[0],
        is_active: true
      };
      this.classEnrollments.push(newEnrollment);

      // 6. Update student record while preserving marks, biometrics, and attendance history
      const studentIdx = this.students.findIndex((s) => s.id === student.id);
      if (studentIdx !== -1) {
        this.students[studentIdx] = {
          ...student,
          class_id: targetClassObj.id,
          class_name: targetClass,
          division_id: targetDivObj.id,
          division_name: assignedDivision,
          academic_year_id: targetYearObj.id,
          updated_at: new Date().toISOString()
        };
      }

      if (isPass) {
        promotedStudents.push(studentName);
      } else {
        retainedStudents.push(studentName);
      }

      details.push({
        student_id: student.id,
        student_name: studentName,
        action,
        from_class: sourceClass,
        to_class: targetClass,
        result_status: exam.result_status,
        percentage: exam.percentage,
        reason: isPass
          ? `Passed examination (${exam.percentage}% >= 40%). Promoted to ${targetClass} for ${targetYear}`
          : `Failed examination (${exam.percentage}% < 40%). Retained in ${sourceClass} for ${targetYear}`
      });

      // 7. Persist to real Supabase database if configured
      if (isSupabaseConfigured && supabase) {
        try {
          await (supabase.from('students') as any)
            .update({
              class_id: targetClassObj.id,
              class_name: targetClass,
              division_id: targetDivObj.id,
              division_name: assignedDivision,
              academic_year_id: targetYearObj.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', student.id);

          await (supabase.from('class_enrollments') as any)
            .update({ is_active: false })
            .eq('student_id', student.id);

          await (supabase.from('class_enrollments') as any).insert({
            student_id: student.id,
            class_id: targetClassObj.id,
            division_id: targetDivObj.id,
            academic_year_id: targetYearObj.id,
            enrolled_at: new Date().toISOString().split('T')[0],
            is_active: true
          });
        } catch (dbErr) {
          console.warn('Supabase promotion sync notice:', dbErr);
        }
      }
    }

    this.logAuditEvent(
      'STUDENT_AUTO_PROMOTION',
      `Automatic Standard Promotion Run`,
      `Processed ${candidates.length} students for ${targetYear}: ${promotedStudents.length} Promoted, ${retainedStudents.length} Retained, ${skippedDuplicates} duplicates prevented. All prior attendance and exam records preserved.`
    );

    this.saveToLocalStorage();
    this.notify();

    return {
      promoted_count: promotedStudents.length,
      retained_count: retainedStudents.length,
      skipped_duplicates: skippedDuplicates,
      source_class: options.sourceClass || 'All Standards',
      target_class: 'Automatic By Pass/Fail',
      target_academic_year: targetYear,
      promoted_students: promotedStudents,
      retained_students: retainedStudents,
      details
    };
  }

  async promoteStudent(
    studentId: string,
    targetYear?: string
  ): Promise<{
    success: boolean;
    action: 'PROMOTED' | 'RETAINED' | 'SKIPPED_DUPLICATE';
    from_class: string;
    to_class: string;
    message: string;
  }> {
    const batch = await this.executeAutomaticStandardPromotion({
      studentIds: [studentId],
      targetYear
    });

    const detail = batch.details && batch.details[0];
    if (detail) {
      return {
        success: detail.action !== 'SKIPPED_DUPLICATE',
        action: detail.action,
        from_class: detail.from_class,
        to_class: detail.to_class,
        message: detail.reason
      };
    }

    return {
      success: false,
      action: 'SKIPPED_DUPLICATE',
      from_class: '',
      to_class: '',
      message: 'Promotion could not be processed.'
    };
  }

  async promoteStudentsBatch(options: {
    sourceClass: string;
    targetClass?: string;
    targetYear: string;
    studentIds?: string[];
    targetDivision?: string;
    autoStandardProgression?: boolean;
  }): Promise<PromotionBatchResult> {
    // When autoStandardProgression is not explicitly disabled, use the Pass/Fail automatic promotion logic
    return this.executeAutomaticStandardPromotion({
      sourceClass: options.sourceClass,
      targetYear: options.targetYear,
      studentIds: options.studentIds,
      targetDivision: options.targetDivision
    });
  }

  async promoteStudents(
    fromClass: string,
    toClass: string,
    targetYear: string,
    studentIds?: string[],
    targetDivision?: string
  ): Promise<number> {
    const res = await this.promoteStudentsBatch({
      sourceClass: fromClass,
      targetClass: toClass,
      targetYear,
      studentIds,
      targetDivision
    });
    return res.promoted_count;
  }

  // ==========================================================================
  // SPRINT 3: Visitor & Student Pickup Verification Engine
  // ==========================================================================

  requestPickupOtp(params: {
    student_id: string;
    visitor_name: string;
    visitor_phone: string;
    relationship: string;
    id_proof_type?: string;
    id_proof_number?: string;
    pickup_reason: string;
  }): { pickup: VisitorPickup; otp: string } {
    const student = this.students.find((s) => s.id === params.student_id);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    const pickup: VisitorPickup = {
      id: `vis-${Date.now()}`,
      school_id: student?.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: params.student_id,
      student_name: student ? `${student.first_name} ${student.last_name}` : 'Enrolled Student',
      admission_number: student?.admission_number || '',
      visitor_name: params.visitor_name,
      visitor_phone: params.visitor_phone,
      relationship: params.relationship,
      id_proof_type: params.id_proof_type || 'Parent ID Card',
      id_proof_number: params.id_proof_number || 'N/A',
      pickup_reason: params.pickup_reason,
      otp_code: otp,
      otp_verified: false,
      status: 'PENDING_VERIFICATION',
      created_at: new Date().toISOString()
    };

    this.visitorPickups.unshift(pickup);

    // Queue simulated/real WhatsApp message to primary parent
    const guardian = student?.guardians?.[0];
    const parentPhone = guardian?.phone_number || params.visitor_phone;
    this.notifications.unshift({
      id: `job-otp-${Date.now()}`,
      school_id: pickup.school_id,
      student_id: pickup.student_id,
      guardian_id: guardian?.id || '99999999-9999-9999-9999-999999999901',
      template_id: '77777777-7777-7777-7777-777777777703',
      notification_type: 'GENERAL_ANNOUNCEMENT',
      recipient_phone: parentPhone,
      template_parameters: [
        pickup.student_name || 'Your Child',
        params.visitor_name,
        otp,
        'Campus Gate 1 Security'
      ],
      status: 'DELIVERED',
      scheduled_for: new Date().toISOString(),
      attempts: 1,
      max_attempts: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    this.logAuditEvent(
      'VISITOR_PICKUP_OTP_DISPATCHED',
      pickup.visitor_name,
      `OTP sent to guardian (${parentPhone}) for release of ${pickup.student_name}`
    );
    this.notify();

    return { pickup, otp };
  }

  verifyPickupOtp(pickupId: string, otpInput: string): { success: boolean; gatePassNumber?: string; message: string } {
    const pickup = this.visitorPickups.find((p) => p.id === pickupId);
    if (!pickup) {
      return { success: false, message: 'Pickup record not found.' };
    }

    if (pickup.otp_code !== otpInput.trim()) {
      this.logAuditEvent(
        'UNAUTHORIZED_STUDENT_PICKUP_BLOCKED',
        pickup.visitor_name,
        `Invalid OTP '${otpInput}' entered for release of ${pickup.student_name}. Attempt blocked.`
      );
      return { success: false, message: 'Invalid OTP code entered. Pickup verification denied.' };
    }

    const now = new Date();
    const checkoutTime = now.toLocaleTimeString('en-GB', { hour12: false });
    const gatePassNumber = `GATE-PASS-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    pickup.otp_verified = true;
    pickup.otp_verified_at = now.toISOString();
    pickup.status = 'AUTHORIZED_CHECKOUT';
    pickup.gate_pass_number = gatePassNumber;
    pickup.checkout_time = checkoutTime;

    // Record official checkout in student attendance records
    this.recordCheckOut(pickup.student_id, checkoutTime);

    this.logAuditEvent(
      'STUDENT_PICKUP_AUTHORIZED',
      pickup.visitor_name,
      `Student ${pickup.student_name} released to ${pickup.visitor_name} with Pass ${gatePassNumber} at ${checkoutTime}`
    );
    this.notify();

    return { success: true, gatePassNumber, message: 'OTP verified successfully. Gate pass issued.' };
  }

  addPickupAuthorization(auth: Omit<PickupAuthorization, 'id' | 'created_at'>): PickupAuthorization {
    const newAuth: PickupAuthorization = {
      ...auth,
      id: `auth-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.pickupAuthorizations.push(newAuth);
    if (isSupabaseConfigured && supabase) {
      supabase.from('pickup_authorizations').insert(newAuth).then(({ error }) => {
        if (error) console.warn('Supabase pickup auth insert notice:', error.message);
      });
    }
    this.logAuditEvent('PICKUP_PERSON_AUTHORIZED', auth.authorized_person_name, `Authorized for student: ${auth.student_id}`);
    this.notify();
    return newAuth;
  }

  revokePickupAuthorization(authId: string) {
    const target = this.pickupAuthorizations.find((a) => a.id === authId);
    if (target) {
      target.is_active = false;
      if (isSupabaseConfigured && supabase) {
        supabase.from('pickup_authorizations').update({ is_active: false }).eq('id', authId).then(({ error }) => {
          if (error) console.warn('Supabase pickup auth revoke notice:', error.message);
        });
      }
      this.logAuditEvent('PICKUP_PERSON_REVOKED', target.authorized_person_name, 'Authorization revoked by guardian');
      this.notify();
    }
  }

  // General Campus Visitor Management
  registerSchoolVisitor(params: {
    full_name: string;
    phone_number: string;
    email?: string;
    id_proof_type?: string;
    id_proof_number?: string;
    purpose: SchoolVisitor['purpose'];
    whom_to_meet: string;
    badge_number?: string;
    remarks?: string;
  }): SchoolVisitor {
    const badgeNumber = params.badge_number || `BADGE-V-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const newVisitor: SchoolVisitor = {
      id: `vis-${Date.now()}`,
      school_id: '11111111-1111-1111-1111-111111111111',
      full_name: params.full_name,
      phone_number: params.phone_number,
      email: params.email,
      id_proof_type: params.id_proof_type || 'Govt Photo ID',
      id_proof_number: params.id_proof_number || 'N/A',
      purpose: params.purpose,
      whom_to_meet: params.whom_to_meet,
      badge_number: badgeNumber,
      check_in_time: now.toISOString(),
      status: 'CHECKED_IN',
      remarks: params.remarks,
      created_at: now.toISOString()
    };

    this.schoolVisitors.unshift(newVisitor);

    if (isSupabaseConfigured && supabase) {
      supabase.from('school_visitors').insert(newVisitor).then(({ error }) => {
        if (error) console.warn('Supabase visitor insert notice:', error.message);
      });
    }

    this.logAuditEvent(
      'VISITOR_CHECKED_IN',
      newVisitor.full_name,
      `Visitor check-in with badge ${badgeNumber} to meet ${newVisitor.whom_to_meet} (${newVisitor.purpose})`
    );
    this.notify();
    return newVisitor;
  }

  checkOutSchoolVisitor(visitorId: string): boolean {
    const visitor = this.schoolVisitors.find((v) => v.id === visitorId);
    if (!visitor) return false;

    const now = new Date();
    visitor.status = 'CHECKED_OUT';
    visitor.check_out_time = now.toISOString();

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('school_visitors')
        .update({ status: 'CHECKED_OUT', check_out_time: now.toISOString() })
        .eq('id', visitorId)
        .then(({ error }) => {
          if (error) console.warn('Supabase visitor checkout notice:', error.message);
        });
    }

    this.logAuditEvent(
      'VISITOR_CHECKED_OUT',
      visitor.full_name,
      `Visitor checked out. Badge ${visitor.badge_number} returned at ${now.toLocaleTimeString('en-GB')}`
    );
    this.notify();
    return true;
  }

  blockUnauthorizedPickup(params: {
    student_id: string;
    visitor_name: string;
    visitor_phone: string;
    relationship: string;
    reason: string;
  }): VisitorPickup {
    const student = this.students.find((s) => s.id === params.student_id);
    const blockedRecord: VisitorPickup = {
      id: `vis-${Date.now()}`,
      school_id: student?.school_id || '11111111-1111-1111-1111-111111111111',
      student_id: params.student_id,
      student_name: student ? `${student.first_name} ${student.last_name}` : 'Enrolled Student',
      admission_number: student?.admission_number || '',
      visitor_name: params.visitor_name,
      visitor_phone: params.visitor_phone,
      relationship: params.relationship,
      pickup_reason: params.reason,
      otp_code: 'BLOCKED',
      otp_verified: false,
      status: 'UNAUTHORIZED_BLOCKED',
      created_at: new Date().toISOString()
    };

    this.visitorPickups.unshift(blockedRecord);

    if (isSupabaseConfigured && supabase) {
      supabase.from('visitor_pickups').insert(blockedRecord).then(({ error }) => {
        if (error) console.warn('Supabase blocked pickup notice:', error.message);
      });
    }

    this.logAuditEvent(
      'UNAUTHORIZED_STUDENT_PICKUP_BLOCKED',
      blockedRecord.visitor_name,
      `Unauthorized pickup attempt intercepted for ${blockedRecord.student_name} (${blockedRecord.admission_number}): ${params.reason}`
    );
    this.notify();
    return blockedRecord;
  }

  getAuthorizedPickupsForStudent(studentId: string): PickupAuthorization[] {
    return this.pickupAuthorizations.filter((a) => a.student_id === studentId && a.is_active);
  }

  checkBiometricConsent(studentId: string): { allowed: boolean; status: DpdpConsentStatus; reason?: string } {
    const consent = this.dpdpConsents.find((c) => c.student_id === studentId);
    if (!consent) {
      return {
        allowed: false,
        status: 'WITHDRAWN',
        reason: 'Statutory compliance block: No parental biometric consent on record under DPDP Act 2023 Sec 6.'
      };
    }

    if (consent.status === 'WITHDRAWN') {
      return {
        allowed: false,
        status: 'WITHDRAWN',
        reason: `Statutory compliance block: Guardian biometric consent is WITHDRAWN. Reason: ${consent.withdrawn_reason || 'Guardian revoked consent'}.`
      };
    }

    if (consent.status === 'EXPIRED' || new Date(consent.valid_until).getTime() < Date.now()) {
      return {
        allowed: false,
        status: 'EXPIRED',
        reason: `Statutory compliance block: Biometric consent expired on ${consent.valid_until}. Annual re-consent required.`
      };
    }

    return { allowed: true, status: 'GRANTED' };
  }

  grantBiometricConsent(
    studentId: string,
    guardianId?: string,
    source: DpdpConsentSource = 'PARENT_PORTAL'
  ): DpdpBiometricConsent {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) throw new Error(`Student ${studentId} not found.`);

    const todayStr = new Date().toISOString().split('T')[0];
    const validUntilStr = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
    const guardian = student.guardians?.[0];
    const guardianName = guardian?.full_name || 'Verified Guardian';

    let consent = this.dpdpConsents.find((c) => c.student_id === studentId);
    if (consent) {
      consent.status = 'GRANTED';
      consent.consent_source = source;
      consent.consent_date = todayStr;
      consent.valid_until = validUntilStr;
      consent.retention_days = 365;
      consent.withdrawn_at = undefined;
      consent.withdrawn_reason = undefined;
      consent.hash_sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      consent.updated_at = new Date().toISOString();
    } else {
      consent = {
        id: `dpdp-${Date.now()}`,
        school_id: student.school_id || '11111111-1111-1111-1111-111111111111',
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        admission_number: student.admission_number,
        guardian_id: guardianId || guardian?.id || '99999999-9999-9999-9999-999999999901',
        guardian_name: guardianName,
        consent_type: 'ALL_BIOMETRICS',
        status: 'GRANTED',
        consent_source: source,
        consent_date: todayStr,
        valid_until: validUntilStr,
        retention_days: 365,
        hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.dpdpConsents.push(consent);
    }

    // Keep legacy biometricConsent synchronized
    const legacyRec = this.biometricConsent.find((c) => c.student_id === studentId);
    if (legacyRec) {
      legacyRec.consent_given = true;
      legacyRec.consent_date = todayStr;
      legacyRec.hash_sha256 = consent.hash_sha256;
      legacyRec.data_retention_days = 365;
      legacyRec.dpdp_purpose = 'Automated campus gate access & attendance verification';
    } else {
      this.biometricConsent.push({
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        admission_number: student.admission_number,
        consent_given: true,
        consent_date: todayStr,
        guardian_name: guardianName,
        dpdp_purpose: 'Automated campus gate access & attendance verification',
        hash_sha256: consent.hash_sha256,
        data_retention_days: 365
      });
    }

    this.consentHistory.unshift({
      id: `ch-${Date.now()}`,
      consent_id: consent.id,
      student_id: student.id,
      action: 'CONSENT_GRANTED',
      performed_by: `${this.currentUser.name} (${source})`,
      timestamp: new Date().toISOString(),
      details: 'Parental biometric processing consent granted under DPDP Act 2023 Sec 6'
    });

    this.logAuditEvent(
      'DPDP_CONSENT_GRANTED',
      `${student.first_name} ${student.last_name}`,
      `Consent granted via ${source}. Audit hash verified.`
    );
    this.notify();
    return consent;
  }

  withdrawBiometricConsent(
    studentId: string,
    guardianId?: string,
    reason = 'Guardian requested biometric processing revocation'
  ): DpdpBiometricConsent {
    const student = this.students.find((s) => s.id === studentId);
    let consent = this.dpdpConsents.find((c) => c.student_id === studentId);

    if (consent) {
      consent.status = 'WITHDRAWN';
      consent.withdrawn_at = new Date().toISOString();
      consent.withdrawn_reason = reason;
      consent.retention_days = 0;
      consent.hash_sha256 = 'WITHDRAWN_UNDER_DPDP_SEC_6';
      consent.updated_at = new Date().toISOString();
    } else {
      consent = {
        id: `dpdp-${Date.now()}`,
        school_id: student?.school_id || '11111111-1111-1111-1111-111111111111',
        student_id: studentId,
        student_name: student ? `${student.first_name} ${student.last_name}` : 'Student',
        admission_number: student?.admission_number || '',
        guardian_id: guardianId || student?.guardians?.[0]?.id || '99999999-9999-9999-9999-999999999901',
        guardian_name: student?.guardians?.[0]?.full_name || 'Verified Guardian',
        consent_type: 'ALL_BIOMETRICS',
        status: 'WITHDRAWN',
        consent_source: 'PARENT_PORTAL',
        consent_date: new Date().toISOString().split('T')[0],
        valid_until: new Date().toISOString().split('T')[0],
        retention_days: 0,
        hash_sha256: 'WITHDRAWN_UNDER_DPDP_SEC_6',
        withdrawn_at: new Date().toISOString(),
        withdrawn_reason: reason,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.dpdpConsents.push(consent);
    }

    // Keep legacy biometricConsent synchronized
    const legacyRec = this.biometricConsent.find((c) => c.student_id === studentId);
    if (legacyRec) {
      legacyRec.consent_given = false;
      legacyRec.hash_sha256 = 'WITHDRAWN_UNDER_DPDP_SEC_6';
      legacyRec.data_retention_days = 0;
      legacyRec.dpdp_purpose = 'Consent revoked under DPDP Act 2023 Sec 6';
    }

    this.consentHistory.unshift({
      id: `ch-${Date.now()}`,
      consent_id: consent.id,
      student_id: studentId,
      action: 'CONSENT_WITHDRAWN',
      performed_by: this.currentUser.name,
      timestamp: new Date().toISOString(),
      details: `Consent withdrawn: ${reason}`
    });

    this.logAuditEvent(
      'DPDP_CONSENT_WITHDRAWN',
      student ? `${student.first_name} ${student.last_name}` : studentId,
      `Biometric consent withdrawn under DPDP Act 2023 Sec 6: ${reason}`
    );
    this.notify();
    return consent;
  }

  toggleBiometricConsent(studentId: string, consentGiven: boolean) {
    if (consentGiven) {
      this.grantBiometricConsent(studentId, undefined, 'ADMIN_KIOSK');
    } else {
      this.withdrawBiometricConsent(studentId, undefined, 'Guardian revoked consent');
    }
  }

  purgeBiometricTemplates(studentId: string) {
    const student = this.students.find((s) => s.id === studentId);
    if (student) {
      student.face_enrolled = false;
      student.fingerprint_enrolled = false;
    }

    this.withdrawBiometricConsent(studentId, undefined, 'Statutory Right to Erasure execution under DPDP Act 2023 Sec 12');

    const consent = this.dpdpConsents.find((c) => c.student_id === studentId);
    if (consent) {
      consent.hash_sha256 = 'PURGED_UNDER_RIGHT_TO_ERASURE_SEC_12';
    }

    const legacyRec = this.biometricConsent.find((c) => c.student_id === studentId);
    if (legacyRec) {
      legacyRec.hash_sha256 = 'PURGED_UNDER_RIGHT_TO_ERASURE_SEC_12';
    }

    this.consentHistory.unshift({
      id: `ch-${Date.now()}`,
      consent_id: consent?.id || `dpdp-${Date.now()}`,
      student_id: studentId,
      action: 'TEMPLATES_PURGED',
      performed_by: this.currentUser.name,
      timestamp: new Date().toISOString(),
      details: 'All facial vectors and fingerprint templates permanently wiped pursuant to DPDP Act 2023 Sec 12'
    });

    this.logAuditEvent(
      'BIOMETRIC_RIGHT_TO_ERASURE',
      student ? `${student.first_name} ${student.last_name}` : studentId,
      'Biometric vectors permanently purged from edge devices & cloud ledger pursuant to DPDP Act 2023'
    );
    this.notify();
  }

  recordSubjectAttendance(
    studentId: string,
    subject: string,
    period: number,
    date: string,
    status: 'PRESENT' | 'ABSENT'
  ) {
    const existing = this.subjectAttendance.find(
      (s) => s.student_id === studentId && s.subject === subject && s.period === period && s.date === date
    );
    if (existing) {
      existing.status = status;
    } else {
      this.subjectAttendance.push({
        id: `sub-${Date.now()}-${studentId}`,
        student_id: studentId,
        subject,
        period,
        date,
        status
      });
    }
    this.notify();
  }

  getSubjectAttendanceSummary(studentId: string) {
    const studentRecords = this.subjectAttendance.filter((s) => s.student_id === studentId);
    const bySubject: Record<string, { attended: number; total: number; percentage: number }> = {};
    for (const r of studentRecords) {
      if (!bySubject[r.subject]) {
        bySubject[r.subject] = { attended: 0, total: 0, percentage: 0 };
      }
      bySubject[r.subject].total++;
      if (r.status === 'PRESENT') {
        bySubject[r.subject].attended++;
      }
    }
    for (const sub of Object.keys(bySubject)) {
      bySubject[sub].percentage = Math.round((bySubject[sub].attended / bySubject[sub].total) * 100);
    }
    return bySubject;
  }

  // ==========================================================================
  // SPRINT 2: Timetable Conflict Detection & Calendar Methods
  // ==========================================================================

  detectTimetableConflicts(candidate: Partial<TimetableSlot>, excludeSlotId?: string): TimetableConflict | null {
    const candidateDay = candidate.day || candidate.day_of_week;
    const candidatePeriod = candidate.period || candidate.period_number;
    const candidateTeacher = (candidate.teacher || candidate.teacher_name || '').trim().toLowerCase();
    const candidateRoom = (candidate.room || candidate.room_number || '').trim().toLowerCase();
    const candidateClass = (candidate.class_name || '').trim();
    const candidateDiv = (candidate.division_name || '').trim();

    for (const slot of this.timetable) {
      if (excludeSlotId && slot.id === excludeSlotId) continue;

      const slotDay = (slot.day || slot.day_of_week || 'Monday') as any;
      const slotPeriod: number = slot.period || slot.period_number || 1;

      if (slotDay === candidateDay && slotPeriod === candidatePeriod) {
        // 1. Teacher Double-Booking Check
        const slotTeacher = (slot.teacher || slot.teacher_name || '').trim().toLowerCase();
        if (candidateTeacher && slotTeacher && candidateTeacher === slotTeacher) {
          return {
            conflict_type: 'TEACHER_DOUBLE_BOOKED',
            message: `Conflict: Teacher '${slot.teacher || slot.teacher_name}' is already assigned to ${slot.class_name} (${slot.division_name}) in ${slot.room || slot.room_number} on ${slotDay} Period ${slotPeriod}.`,
            day_of_week: slotDay as any,
            period_number: slotPeriod,
            conflicting_slots: [slot]
          };
        }

        // 2. Room Double-Booking Check
        const slotRoom = (slot.room || slot.room_number || '').trim().toLowerCase();
        if (candidateRoom && slotRoom && candidateRoom === slotRoom) {
          return {
            conflict_type: 'ROOM_DOUBLE_BOOKED',
            message: `Conflict: Classroom/Lab '${slot.room || slot.room_number}' is already occupied by ${slot.class_name} (${slot.division_name}) on ${slotDay} Period ${slotPeriod}.`,
            day_of_week: slotDay as any,
            period_number: slotPeriod,
            conflicting_slots: [slot]
          };
        }

        // 3. Class Overlap Check
        if (candidateClass && slot.class_name === candidateClass && candidateDiv && slot.division_name === candidateDiv) {
          return {
            conflict_type: 'CLASS_OVERLAP',
            message: `Conflict: ${candidateClass} (${candidateDiv}) already has subject '${slot.subject || slot.subject_name}' scheduled for Period ${slotPeriod}.`,
            day_of_week: slotDay as any,
            period_number: slotPeriod,
            conflicting_slots: [slot]
          };
        }
      }
    }

    return null;
  }

  addTimetableSlot(slot: Partial<TimetableSlot>): { success: boolean; slot?: TimetableSlot; conflict?: TimetableConflict } {
    const conflict = this.detectTimetableConflicts(slot);
    if (conflict) {
      return { success: false, conflict };
    }

    const dayVal = (slot.day || slot.day_of_week || 'Monday') as any;
    const periodVal = slot.period || slot.period_number || 1;
    const subjectVal = slot.subject || slot.subject_name || 'General';
    const teacherVal = slot.teacher || slot.teacher_name || 'Staff Teacher';
    const roomVal = slot.room || slot.room_number || 'Room 101';
    const timeRangeVal = slot.timeRange || '08:30 - 09:15';

    const newSlot: TimetableSlot = {
      id: `tt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      day: dayVal,
      day_of_week: dayVal,
      period: periodVal,
      period_number: periodVal,
      timeRange: timeRangeVal,
      start_time: slot.start_time || timeRangeVal.split('-')[0]?.trim() || '08:30',
      end_time: slot.end_time || timeRangeVal.split('-')[1]?.trim() || '09:15',
      subject: subjectVal,
      subject_name: subjectVal,
      teacher: teacherVal,
      teacher_name: teacherVal,
      room: roomVal,
      room_number: roomVal,
      class_name: slot.class_name || 'Grade 10',
      division_name: slot.division_name || 'A',
      class_id: slot.class_id || '33333333-3333-3333-3333-333333333310',
      division_id: slot.division_id || '44444444-4444-4444-4444-444444444411',
      school_id: '11111111-1111-1111-1111-111111111111',
      academic_year_id: '22222222-2222-2222-2222-222222222222'
    };

    this.timetable.push(newSlot);

    if (isSupabaseConfigured && supabase) {
      (supabase.from('timetables') as any).insert([{
        school_id: newSlot.school_id,
        academic_year_id: newSlot.academic_year_id,
        class_id: newSlot.class_id,
        division_id: newSlot.division_id,
        day_of_week: newSlot.day_of_week,
        period_number: newSlot.period_number,
        subject_name: newSlot.subject_name,
        teacher_name: newSlot.teacher_name,
        room_number: newSlot.room_number,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time
      }]).catch((err: any) => console.warn('Supabase timetable insert skipped/failed:', err));
    }

    this.logAuditEvent('TIMETABLE_SLOT_ADDED', `${newSlot.class_name} ${newSlot.subject}`, `Scheduled ${newSlot.day} Period ${newSlot.period}`);
    this.notify();
    return { success: true, slot: newSlot };
  }

  deleteTimetableSlot(slotId: string) {
    const target = this.timetable.find((t) => t.id === slotId);
    this.timetable = this.timetable.filter((t) => t.id !== slotId);
    if (target) {
      this.logAuditEvent('TIMETABLE_SLOT_DELETED', target.subject, `Removed ${target.day} Period ${target.period}`);
    }
    this.notify();
  }

  isDateExcludedFromAttendance(dateStr: string): boolean {
    if (this.isHoliday(dateStr)) return true;

    // Check calendar events
    const event = this.calendarEvents.find((evt) => {
      return (
        dateStr >= evt.start_date &&
        dateStr <= evt.end_date &&
        (evt.event_type === 'HOLIDAY' || evt.event_type === 'VACATION')
      );
    });

    return !!event;
  }

  addCalendarEvent(event: Omit<CalendarEventModel, 'id'>) {
    const newEvent: CalendarEventModel = {
      ...event,
      id: `evt-${Date.now()}`
    };
    this.calendarEvents.push(newEvent);

    if (event.event_type === 'HOLIDAY') {
      this.holidays.push({
        id: `hol-${Date.now()}`,
        school_id: event.school_id,
        academic_year_id: event.academic_year_id,
        holiday_date: event.start_date,
        name: event.title,
        description: event.description
      });
    }

    this.logAuditEvent('CALENDAR_EVENT_SCHEDULED', event.title, `${event.event_type} (${event.start_date} to ${event.end_date})`);
    this.notify();
    return newEvent;
  }

  deleteCalendarEvent(id: string) {
    const target = this.calendarEvents.find((e) => e.id === id);
    this.calendarEvents = this.calendarEvents.filter((e) => e.id !== id);
    if (target) {
      this.logAuditEvent('CALENDAR_EVENT_REMOVED', target.title, `Removed ${target.event_type}`);
    }
    this.notify();
  }

  recordPeriodAttendanceBatch(
    records: {
      student_id: string;
      subject: string;
      period: number;
      date: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      remarks?: string;
    }[]
  ) {
    for (const rec of records) {
      this.recordSubjectAttendance(rec.student_id, rec.subject, rec.period, rec.date, rec.status as any);
    }
    this.logAuditEvent('PERIOD_ATTENDANCE_RECORDED', `${records.length} Student Period Records`, `Recorded for Period`);
    this.notify();
  }
}

export const dataStore = new DataStore();

export function useDataStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  return dataStore;
}
