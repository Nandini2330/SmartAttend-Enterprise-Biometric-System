-- ==============================================================================
-- SMARTATTEND: Initial Relational Database Schema
-- Migration: 20261029000001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Schools
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    opening_time TIME DEFAULT '08:30:00',
    grace_period_minutes INTEGER DEFAULT 15,
    cutoff_time TIME DEFAULT '10:00:00',
    whatsapp_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Academic Years
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. "2026-2027"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Classes
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Grade 10"
    numeric_grade INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Divisions / Sections
CREATE TABLE IF NOT EXISTS public.divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. "A", "B"
    class_teacher_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'school_admin', 'teacher', 'parent', 'student')),
    phone_number VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    admission_number VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    date_of_birth DATE,
    class_id UUID NOT NULL REFERENCES public.classes(id),
    division_id UUID NOT NULL REFERENCES public.divisions(id),
    roll_number VARCHAR(50) NOT NULL,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
    is_active BOOLEAN DEFAULT true,
    face_enrolled BOOLEAN DEFAULT false,
    fingerprint_enrolled BOOLEAN DEFAULT false,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_school_admission UNIQUE (school_id, admission_number)
);

-- 7. Guardians
CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('FATHER', 'MOTHER', 'LEGAL_GUARDIAN', 'OTHER')),
    phone_number VARCHAR(25) NOT NULL, -- E.164 standard e.g. +919876543210
    email VARCHAR(255),
    whatsapp_opt_in BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Student-Guardian Junction
CREATE TABLE IF NOT EXISTS public.student_guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    is_primary_contact BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_guardian UNIQUE (student_id, guardian_id)
);

-- 9. Class Enrollments (Historical mapping)
CREATE TABLE IF NOT EXISTS public.class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id),
    division_id UUID NOT NULL REFERENCES public.divisions(id),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
    enrolled_at DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true
);

-- 10. Attendance Sessions
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    name VARCHAR(100) DEFAULT 'Morning Attendance Session',
    opening_time TIME DEFAULT '08:30:00',
    grace_cutoff_time TIME DEFAULT '08:45:00',
    final_cutoff_time TIME DEFAULT '10:00:00',
    is_reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMPTZ,
    reconciled_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_school_session_date UNIQUE (school_id, session_date, name)
);

-- 11. Biometric Devices
CREATE TABLE IF NOT EXISTS public.biometric_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('FINGERPRINT_TERMINAL', 'FACE_KIOSK', 'HYBRID_TERMINAL')),
    ip_address VARCHAR(50),
    port INTEGER DEFAULT 4370,
    location VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'SYNCING', 'ERROR')),
    last_heartbeat TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    firmware_version VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Biometric Enrollments (Secure Metadata only - vectors stored securely)
CREATE TABLE IF NOT EXISTS public.biometric_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    biometric_type VARCHAR(20) NOT NULL CHECK (biometric_type IN ('FACE', 'FINGERPRINT')),
    template_version VARCHAR(50) DEFAULT 'v1.0',
    quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
    feature_hash VARCHAR(255) NOT NULL, -- SHA-256 of template
    is_active BOOLEAN DEFAULT true,
    enrolled_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_biometric_type UNIQUE (student_id, biometric_type)
);

-- 13. Attendance Events (Raw immutable event log)
CREATE TABLE IF NOT EXISTS public.attendance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id),
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('CHECK_IN', 'CHECK_OUT')),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    local_timestamp TIME NOT NULL,
    verification_method VARCHAR(20) NOT NULL CHECK (verification_method IN ('FACE', 'FINGERPRINT', 'MANUAL', 'CARD', 'SIMULATED')),
    device_id UUID REFERENCES public.biometric_devices(id),
    confidence_score NUMERIC(5, 4),
    liveness_verified BOOLEAN DEFAULT false,
    recorded_by UUID REFERENCES public.user_profiles(id),
    is_duplicate_ignored BOOLEAN DEFAULT false,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Daily Attendance (Reconciled summary records)
CREATE TABLE IF NOT EXISTS public.daily_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'EXCUSED')),
    first_arrival_time TIME,
    departure_time TIME,
    first_verification_method VARCHAR(20),
    is_late BOOLEAN DEFAULT false,
    minutes_late INTEGER DEFAULT 0,
    remarks TEXT,
    verified_by UUID REFERENCES public.user_profiles(id),
    reconciled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_daily_attendance UNIQUE (student_id, attendance_date, session_id)
);

-- 15. Notification Templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL,
    meta_template_id VARCHAR(100) NOT NULL,
    language_code VARCHAR(20) DEFAULT 'en_US',
    category VARCHAR(50) DEFAULT 'UTILITY',
    header_text VARCHAR(255),
    body_text TEXT NOT NULL,
    footer_text VARCHAR(255),
    status VARCHAR(50) DEFAULT 'APPROVED' CHECK (status IN ('APPROVED', 'PENDING', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Notification Jobs
CREATE TABLE IF NOT EXISTS public.notification_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.notification_templates(id),
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('ARRIVAL', 'ABSENCE', 'DEPARTURE', 'GENERAL_ANNOUNCEMENT')),
    recipient_phone VARCHAR(25) NOT NULL,
    template_parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'QUEUED' CHECK (status IN ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED')),
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Notification Delivery Logs
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.notification_jobs(id) ON DELETE CASCADE,
    whatsapp_message_id VARCHAR(100),
    recipient_phone VARCHAR(25) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    error_code VARCHAR(50),
    error_message TEXT,
    raw_webhook_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Leave Requests
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    requested_by_guardian_id UUID NOT NULL REFERENCES public.guardians(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES public.user_profiles(id),
    review_comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. School Holidays
CREATE TABLE IF NOT EXISTS public.school_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
    holiday_date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_school_holiday_date UNIQUE (school_id, holiday_date)
);

-- 20. Device Sync Logs
CREATE TABLE IF NOT EXISTS public.device_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES public.biometric_devices(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL,
    events_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'PARTIAL', 'FAILED')),
    error_message TEXT,
    sync_duration_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Audit Logs (Immutable audit log)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_school_class ON public.students(school_id, class_id, division_id);
CREATE INDEX IF NOT EXISTS idx_attendance_events_session ON public.attendance_events(session_id, student_id, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_date ON public.daily_attendance(school_id, attendance_date, status);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_status ON public.notification_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON public.audit_logs(school_id, created_at DESC);
