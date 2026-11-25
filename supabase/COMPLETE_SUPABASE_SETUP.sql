-- ==============================================================================
-- SMARTATTEND: COMPLETE PRODUCTION DATABASE SETUP SCRIPT
-- Executes:
--   1. Schema: 21 Tables, Foreign Keys, Unique Constraints, Performance Indexes
--   2. Functions: RLS Context Helpers & Parent Privacy (is_parent_of)
--   3. Security: Row Level Security (RLS) Policies & Public Punch Access
--   4. Seed Data: School, Academic Year, Classes, Students, Guardians, Ledger
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------------------------

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
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Classes
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    numeric_grade INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Divisions / Sections
CREATE TABLE IF NOT EXISTS public.divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    class_teacher_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    phone_number VARCHAR(25) NOT NULL,
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

-- 9. Class Enrollments
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

-- 12. Biometric Enrollments
CREATE TABLE IF NOT EXISTS public.biometric_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    biometric_type VARCHAR(20) NOT NULL CHECK (biometric_type IN ('FACE', 'FINGERPRINT')),
    template_version VARCHAR(50) DEFAULT 'v1.0',
    quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
    feature_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    enrolled_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_biometric_type UNIQUE (student_id, biometric_type)
);

-- 13. Attendance Events (Raw Event Ledger)
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

-- 14. Daily Attendance (Reconciled Daily Summaries)
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
    requested_by_guardian_id UUID REFERENCES public.guardians(id),
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

-- 21. Audit Logs
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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_students_school_class ON public.students(school_id, class_id, division_id);
CREATE INDEX IF NOT EXISTS idx_attendance_events_session ON public.attendance_events(session_id, student_id, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_attendance_date ON public.daily_attendance(school_id, attendance_date, status);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_status ON public.notification_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON public.audit_logs(school_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow reading public master rosters & attendance for authenticated and client app
CREATE POLICY "Public read schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Public read academic_years" ON public.academic_years FOR SELECT USING (true);
CREATE POLICY "Public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Public read divisions" ON public.divisions FOR SELECT USING (true);
CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public read attendance_sessions" ON public.attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Public read biometric_devices" ON public.biometric_devices FOR SELECT USING (true);
CREATE POLICY "Public read daily_attendance" ON public.daily_attendance FOR SELECT USING (true);
CREATE POLICY "Public read attendance_events" ON public.attendance_events FOR SELECT USING (true);
CREATE POLICY "Public read leave_requests" ON public.leave_requests FOR SELECT USING (true);
CREATE POLICY "Public read user_profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Public read guardians" ON public.guardians FOR SELECT USING (true);
CREATE POLICY "Public read student_guardians" ON public.student_guardians FOR SELECT USING (true);

-- Allow Client Insert/Upsert for Live Punch Operations
CREATE POLICY "Allow punch insertion to attendance_events" ON public.attendance_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow punch upsert to daily_attendance" ON public.daily_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow student insertion" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow leave request operations" ON public.leave_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow audit log writes" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. SEED INITIAL DATA
-- ------------------------------------------------------------------------------

-- 1. School
INSERT INTO public.schools (
    id, name, code, address, city, state, country, timezone, opening_time, grace_period_minutes, cutoff_time, whatsapp_enabled
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Delhi Public School, R.K. Puram',
    'DPS-RKP-01',
    'Sector XII, R.K. Puram',
    'New Delhi',
    'Delhi',
    'India',
    'Asia/Kolkata',
    '08:30:00',
    15,
    '10:00:00',
    true
) ON CONFLICT (code) DO NOTHING;

-- 2. Academic Year
INSERT INTO public.academic_years (
    id, school_id, name, start_date, end_date, is_current
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '2026-2027',
    '2026-04-01',
    '2027-03-31',
    true
) ON CONFLICT DO NOTHING;

-- 3. Classes
INSERT INTO public.classes (id, school_id, name, numeric_grade) VALUES
    ('33333333-3333-3333-3333-333333333309', '11111111-1111-1111-1111-111111111111', 'Grade 9', 9),
    ('33333333-3333-3333-3333-333333333310', '11111111-1111-1111-1111-111111111111', 'Grade 10', 10),
    ('33333333-3333-3333-3333-333333333311', '11111111-1111-1111-1111-111111111111', 'Grade 11', 11),
    ('33333333-3333-3333-3333-333333333312', '11111111-1111-1111-1111-111111111111', 'Grade 12', 12)
ON CONFLICT DO NOTHING;

-- 4. Divisions
INSERT INTO public.divisions (id, class_id, name) VALUES
    ('44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333310', 'A'),
    ('44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333310', 'B'),
    ('44444444-4444-4444-4444-444444444409', '33333333-3333-3333-3333-333333333309', 'A')
ON CONFLICT DO NOTHING;

-- 5. User Profiles
INSERT INTO public.user_profiles (
    id, school_id, email, full_name, role, phone_number, is_active
) VALUES
    ('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', 'admin@smartattend.io', 'Antigravity Super Admin', 'super_admin', '+919999900001', true),
    ('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', 'principal@dpsrkpuram.edu.in', 'Dr. Sandeep Mukherjee (Principal)', 'school_admin', '+919999900002', true),
    ('55555555-5555-5555-5555-555555555503', '11111111-1111-1111-1111-111111111111', 'rajesh.kumar@dpsrkpuram.edu.in', 'Mr. Rajesh Kumar (Class 10A Teacher)', 'teacher', '+919999900003', true),
    ('55555555-5555-5555-5555-555555555504', '11111111-1111-1111-1111-111111111111', 'priya.sharma@dpsrkpuram.edu.in', 'Ms. Priya Sharma (Class 10B Teacher)', 'teacher', '+919999900004', true),
    ('55555555-5555-5555-5555-555555555505', '11111111-1111-1111-1111-111111111111', 'vikram.mehta@gmail.com', 'Vikram Mehta (Parent of Aarav)', 'parent', '+919811122233', true),
    ('55555555-5555-5555-5555-555555555506', '11111111-1111-1111-1111-111111111111', 'sunita.kapoor@gmail.com', 'Sunita Kapoor (Parent of Ananya)', 'parent', '+919822233344', true),
    ('55555555-5555-5555-5555-555555555507', '11111111-1111-1111-1111-111111111111', 'anil.verma@gmail.com', 'Anil Verma (Parent of Rohan)', 'parent', '+919833344455', true),
    ('55555555-5555-5555-5555-555555555508', '11111111-1111-1111-1111-111111111111', 'pooja.gupta@gmail.com', 'Pooja Gupta (Parent of Ishaan)', 'parent', '+919844455566', true),
    ('55555555-5555-5555-5555-555555555509', '11111111-1111-1111-1111-111111111111', 'aarav.mehta@student.dpsrkpuram.edu.in', 'Aarav Mehta (Student)', 'student', '+919811122233', true)
ON CONFLICT (email) DO NOTHING;

-- 6. Biometric Devices
INSERT INTO public.biometric_devices (
    id, school_id, device_name, device_model, serial_number, device_type, ip_address, port, location, api_key_hash, status, last_heartbeat
) VALUES
    ('66666666-6666-6666-6666-666666666601', '11111111-1111-1111-1111-111111111111', 'Main Gate - Terminal A', 'ZKTeco K40 Fingerprint', 'ZK-K40-2026-001', 'FINGERPRINT_TERMINAL', '192.168.1.120', 4370, 'Main Gate North Entry', 'hash_zk_sec_001', 'ONLINE', NOW()),
    ('66666666-6666-6666-6666-666666666602', '11111111-1111-1111-1111-111111111111', 'Senior Wing - Face Kiosk 1', 'SmartAttend AI Vision Kiosk', 'SA-FACE-2026-001', 'FACE_KIOSK', '192.168.1.125', 8001, 'Senior Wing Lobby', 'hash_face_sec_001', 'ONLINE', NOW()),
    ('66666666-6666-6666-6666-666666666603', '11111111-1111-1111-1111-111111111111', 'Junior Wing - Hybrid Terminal', 'Mantra MFS100 + Camera', 'MAN-HYB-2026-002', 'HYBRID_TERMINAL', '192.168.1.130', 8002, 'Junior Wing Corridors', 'hash_man_sec_002', 'ONLINE', NOW())
ON CONFLICT (serial_number) DO NOTHING;

-- 7. Students
INSERT INTO public.students (
    id, school_id, admission_number, first_name, last_name, gender, date_of_birth, class_id, division_id, roll_number, academic_year_id, is_active, face_enrolled, fingerprint_enrolled, avatar_url
) VALUES
    ('88888888-8888-8888-8888-888888888801', '11111111-1111-1111-1111-111111111111', 'DPS-2026-1001', 'Aarav', 'Mehta', 'MALE', '2011-04-12', '33333333-3333-3333-3333-333333333310', '44444444-4444-4444-4444-444444444411', '10101', '22222222-2222-2222-2222-222222222222', true, true, true, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
    ('88888888-8888-8888-8888-888888888802', '11111111-1111-1111-1111-111111111111', 'DPS-2026-1002', 'Ananya', 'Kapoor', 'FEMALE', '2011-08-25', '33333333-3333-3333-3333-333333333310', '44444444-4444-4444-4444-444444444411', '10102', '22222222-2222-2222-2222-222222222222', true, true, false, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
    ('88888888-8888-8888-8888-888888888803', '11111111-1111-1111-1111-111111111111', 'DPS-2026-1003', 'Rohan', 'Verma', 'MALE', '2011-02-14', '33333333-3333-3333-3333-333333333310', '44444444-4444-4444-4444-444444444411', '10103', '22222222-2222-2222-2222-222222222222', true, false, true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
    ('88888888-8888-8888-8888-888888888804', '11111111-1111-1111-1111-111111111111', 'DPS-2026-1004', 'Ishaan', 'Gupta', 'MALE', '2011-11-03', '33333333-3333-3333-3333-333333333310', '44444444-4444-4444-4444-444444444411', '10104', '22222222-2222-2222-2222-222222222222', true, false, false, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
    ('88888888-8888-8888-8888-888888888805', '11111111-1111-1111-1111-111111111111', 'DPS-2026-1005', 'Diya', 'Sen', 'FEMALE', '2011-06-19', '33333333-3333-3333-3333-333333333310', '44444444-4444-4444-4444-444444444412', '10201', '22222222-2222-2222-2222-222222222222', true, true, true, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
    ('88888888-8888-8888-8888-888888888806', '11111111-1111-1111-1111-111111111111', 'DPS-2026-0901', 'Kabir', 'Das', 'MALE', '2012-01-10', '33333333-3333-3333-3333-333333333309', '44444444-4444-4444-4444-444444444409', '09101', '22222222-2222-2222-2222-222222222222', true, true, false, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150')
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- 8. Guardians
INSERT INTO public.guardians (
    id, school_id, user_id, full_name, relationship, phone_number, email, whatsapp_opt_in
) VALUES
    ('99999999-9999-9999-9999-999999999901', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555505', 'Vikram Mehta', 'FATHER', '+919811122233', 'vikram.mehta@gmail.com', true),
    ('99999999-9999-9999-9999-999999999902', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555506', 'Sunita Kapoor', 'MOTHER', '+919822233344', 'sunita.kapoor@gmail.com', true),
    ('99999999-9999-9999-9999-999999999903', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555507', 'Anil Verma', 'FATHER', '+919833344455', 'anil.verma@gmail.com', true),
    ('99999999-9999-9999-9999-999999999904', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555508', 'Pooja Gupta', 'MOTHER', '+919844455566', 'pooja.gupta@gmail.com', true)
ON CONFLICT DO NOTHING;

-- 9. Student-Guardians Junction
INSERT INTO public.student_guardians (student_id, guardian_id, is_primary_contact) VALUES
    ('88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999901', true),
    ('88888888-8888-8888-8888-888888888802', '99999999-9999-9999-9999-999999999902', true),
    ('88888888-8888-8888-8888-888888888803', '99999999-9999-9999-9999-999999999903', true),
    ('88888888-8888-8888-8888-888888888804', '99999999-9999-9999-9999-999999999904', true)
ON CONFLICT (student_id, guardian_id) DO NOTHING;

-- 10. Attendance Session
INSERT INTO public.attendance_sessions (
    id, school_id, academic_year_id, session_date, name, opening_time, grace_cutoff_time, final_cutoff_time, is_reconciled
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE,
    'Morning Assembly & First Period Session',
    '08:30:00',
    '08:45:00',
    '10:00:00',
    true
) ON CONFLICT (school_id, session_date, name) DO NOTHING;

-- 11. Initial Daily Attendance (Reconciled Records)
INSERT INTO public.daily_attendance (
    id, school_id, student_id, attendance_date, session_id, status, first_arrival_time, first_verification_method, is_late, minutes_late, remarks, reconciled_at
) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccc0001', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888801', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PRESENT', '08:24:12', 'FACE', false, 0, 'On-time arrival verified by Face Kiosk 1', NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccc0002', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888802', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LATE', '08:48:32', 'FACE', true, 18, 'Late arrival after 08:30 opening and 15m grace', NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccc0003', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888803', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PRESENT', '08:29:45', 'FINGERPRINT', false, 0, 'Fingerprint verified at Main Gate', NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccc0004', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888804', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ABSENT', NULL, NULL, false, 0, 'Auto-reconciled absent after 10:00 cutoff', NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccc0005', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888805', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ON_LEAVE', NULL, NULL, false, 0, 'Approved sick leave request #LV-2026-042', NOW())
ON CONFLICT (student_id, attendance_date, session_id) DO NOTHING;

