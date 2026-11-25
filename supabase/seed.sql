-- ==============================================================================
-- SMARTATTEND: Comprehensive Seed Data
-- Seed file: supabase/seed.sql
-- Matches schema in 20261029000001_initial_schema.sql
-- ==============================================================================

-- 1. Insert School
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

-- 2. Insert Academic Year
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

-- 3. Insert Classes
INSERT INTO public.classes (id, school_id, name, numeric_grade) VALUES
    ('33333333-3333-3333-3333-333333333309', '11111111-1111-1111-1111-111111111111', 'Grade 9', 9),
    ('33333333-3333-3333-3333-333333333310', '11111111-1111-1111-1111-111111111111', 'Grade 10', 10),
    ('33333333-3333-3333-3333-333333333311', '11111111-1111-1111-1111-111111111111', 'Grade 11', 11),
    ('33333333-3333-3333-3333-333333333312', '11111111-1111-1111-1111-111111111111', 'Grade 12', 12)
ON CONFLICT DO NOTHING;

-- 4. Insert Divisions
INSERT INTO public.divisions (id, class_id, name) VALUES
    ('44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333310', 'A'),
    ('44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333310', 'B'),
    ('44444444-4444-4444-4444-444444444409', '33333333-3333-3333-3333-333333333309', 'A')
ON CONFLICT DO NOTHING;

-- 5. Mock User Profiles for testing
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

-- 6. Insert Biometric Devices
INSERT INTO public.biometric_devices (
    id, school_id, device_name, device_model, serial_number, device_type, ip_address, port, location, api_key_hash, status, last_heartbeat
) VALUES
    ('66666666-6666-6666-6666-666666666601', '11111111-1111-1111-1111-111111111111', 'Main Gate - Terminal A', 'ZKTeco K40 Fingerprint', 'ZK-K40-2026-001', 'FINGERPRINT_TERMINAL', '192.168.1.120', 4370, 'Main Gate North Entry', 'hash_zk_sec_001', 'ONLINE', NOW()),
    ('66666666-6666-6666-6666-666666666602', '11111111-1111-1111-1111-111111111111', 'Senior Wing - Face Kiosk 1', 'SmartAttend AI Vision Kiosk', 'SA-FACE-2026-001', 'FACE_KIOSK', '192.168.1.125', 8001, 'Senior Wing Lobby', 'hash_face_sec_001', 'ONLINE', NOW()),
    ('66666666-6666-6666-6666-666666666603', '11111111-1111-1111-1111-111111111111', 'Junior Wing - Hybrid Terminal', 'Mantra MFS100 + Camera', 'MAN-HYB-2026-002', 'HYBRID_TERMINAL', '192.168.1.130', 8002, 'Junior Wing Corridors', 'hash_man_sec_002', 'ONLINE', NOW())
ON CONFLICT (serial_number) DO NOTHING;

-- 7. Insert Notification Templates (Approved Meta WhatsApp Format)
INSERT INTO public.notification_templates (
    id, school_id, template_name, meta_template_id, language_code, category, header_text, body_text, footer_text, status
) VALUES
    ('77777777-7777-7777-7777-777777777701', '11111111-1111-1111-1111-111111111111', 'attendance_arrival_v1', 'smartattend_arrival_notice', 'en_US', 'UTILITY', 'SmartAttend Verified Check-In', 'Dear Parent, your child {{1}} has been marked PRESENT at {{2}} on {{3}}. Verification method: {{4}}.', 'DPS R.K. Puram Attendance Desk', 'APPROVED'),
    ('77777777-7777-7777-7777-777777777702', '11111111-1111-1111-1111-111111111111', 'attendance_absence_v1', 'smartattend_absence_alert', 'en_US', 'UTILITY', 'Important Attendance Alert', 'Dear Parent, {{1}} has NOT been marked present today, {{2}}. School cutoff was {{3}}. If your child is absent with prior notice, ignore this alert. Otherwise, kindly contact school reception immediately.', 'DPS R.K. Puram Administration', 'APPROVED'),
    ('77777777-7777-7777-7777-777777777703', '11111111-1111-1111-1111-111111111111', 'attendance_departure_v1', 'smartattend_departure_notice', 'en_US', 'UTILITY', 'SmartAttend Safe Departure', 'Dear Parent, your child {{1}} has checked out from school premises at {{2}} on {{3}}. Have a safe commute home.', 'DPS R.K. Puram Attendance Desk', 'APPROVED')
ON CONFLICT DO NOTHING;

-- 8. Insert Students
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

-- 9. Insert Guardians
INSERT INTO public.guardians (
    id, school_id, user_id, full_name, relationship, phone_number, email, whatsapp_opt_in
) VALUES
    ('99999999-9999-9999-9999-999999999901', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555505', 'Vikram Mehta', 'FATHER', '+919811122233', 'vikram.mehta@gmail.com', true),
    ('99999999-9999-9999-9999-999999999902', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555506', 'Sunita Kapoor', 'MOTHER', '+919822233344', 'sunita.kapoor@gmail.com', true),
    ('99999999-9999-9999-9999-999999999903', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555507', 'Anil Verma', 'FATHER', '+919833344455', 'anil.verma@gmail.com', true),
    ('99999999-9999-9999-9999-999999999904', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555508', 'Pooja Gupta', 'MOTHER', '+919844455566', 'pooja.gupta@gmail.com', true)
ON CONFLICT DO NOTHING;

-- 10. Link Students to Guardians
INSERT INTO public.student_guardians (student_id, guardian_id, is_primary_contact) VALUES
    ('88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999901', true), -- Aarav -> Vikram
    ('88888888-8888-8888-8888-888888888802', '99999999-9999-9999-9999-999999999902', true), -- Ananya -> Sunita
    ('88888888-8888-8888-8888-888888888803', '99999999-9999-9999-9999-999999999903', true), -- Rohan -> Anil
    ('88888888-8888-8888-8888-888888888804', '99999999-9999-9999-9999-999999999904', true)  -- Ishaan -> Pooja
ON CONFLICT (student_id, guardian_id) DO NOTHING;

-- 11. Insert Today's Attendance Session
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

-- 12. Insert Verified Attendance Events (Raw Event Log)
INSERT INTO public.attendance_events (
    id, school_id, student_id, session_id, event_type, event_timestamp, local_timestamp, verification_method, device_id, confidence_score, liveness_verified, is_duplicate_ignored
) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888801', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CHECK_IN', NOW() - INTERVAL '3 hours', '08:24:12', 'FACE', '66666666-6666-6666-6666-666666666602', 0.9654, true, false),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888802', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CHECK_IN', NOW() - INTERVAL '2 hours 40 minutes', '08:48:32', 'FACE', '66666666-6666-6666-6666-666666666602', 0.9412, true, false),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888803', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CHECK_IN', NOW() - INTERVAL '2 hours 55 minutes', '08:29:45', 'FINGERPRINT', '66666666-6666-6666-6666-666666666601', 0.9980, true, false)
ON CONFLICT DO NOTHING;

-- 13. Insert Daily Attendance (Reconciled Records)
INSERT INTO public.daily_attendance (
    id, school_id, student_id, attendance_date, session_id, status, first_arrival_time, first_verification_method, is_late, minutes_late, remarks, reconciled_at
) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccc0001', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888801', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PRESENT', '08:24:12', 'FACE', false, 0, 'On-time arrival verified by Face Kiosk 1', NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccc0002', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888802', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'LATE', '08:48:32', 'FACE', true, 18, 'Late arrival after 08:30 opening and 15m grace', NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccc0003', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888803', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PRESENT', '08:29:45', 'FINGERPRINT', false, 0, 'Fingerprint verified at Main Gate', NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccc0004', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888804', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ABSENT', NULL, NULL, false, 0, 'Auto-reconciled absent after 10:00 cutoff', NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccc0005', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888805', CURRENT_DATE, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ON_LEAVE', NULL, NULL, false, 0, 'Approved sick leave request #LV-2026-042', NOW())
ON CONFLICT (student_id, attendance_date, session_id) DO NOTHING;

-- 14. Insert Notification Jobs & WhatsApp Delivery Logs
INSERT INTO public.notification_jobs (
    id, school_id, student_id, guardian_id, template_id, notification_type, recipient_phone, template_parameters, status, scheduled_for, attempts
) VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddd0001', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999901', '77777777-7777-7777-7777-777777777701', 'ARRIVAL', '+919811122233', '["Aarav Mehta", "08:24 AM", "Today", "Face Recognition"]'::jsonb, 'DELIVERED', NOW() - INTERVAL '2 hours 50 minutes', 1),
    ('dddddddd-dddd-dddd-dddd-dddddddd0002', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888804', '99999999-9999-9999-9999-999999999904', '77777777-7777-7777-7777-777777777702', 'ABSENCE', '+919844455566', '["Ishaan Gupta", "Today", "10:00 AM"]'::jsonb, 'SENT', NOW() - INTERVAL '1 hour', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.notification_delivery_logs (
    id, job_id, whatsapp_message_id, recipient_phone, status, sent_at, delivered_at
) VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'dddddddd-dddd-dddd-dddd-dddddddd0001', 'wamid.HBgMOTE5ODExMTIyMjMzFQIAERgSMzAyQzA5QTY3Qzg1MEEwQzAzAA==', '+919811122233', 'DELIVERED', NOW() - INTERVAL '2 hours 49 minutes', NOW() - INTERVAL '2 hours 48 minutes'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'dddddddd-dddd-dddd-dddd-dddddddd0002', 'wamid.HBgMOTE5ODQ0NDU1NTY2FQIAERgSNDUxRDlGOTU3RTk1MEEwQzAzAA==', '+919844455566', 'SENT', NOW() - INTERVAL '58 minutes', NULL)
ON CONFLICT DO NOTHING;

-- 15. Insert Initial Audit Logs
INSERT INTO public.audit_logs (
    id, school_id, user_id, user_role, action, entity_type, entity_id, new_value, ip_address
) VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffff0001', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555502', 'school_admin', 'SYSTEM_INITIALIZATION', 'school', '11111111-1111-1111-1111-111111111111', '{"status": "READY", "academic_year": "2026-2027"}'::jsonb, '127.0.0.1'),
    ('ffffffff-ffff-ffff-ffff-ffffffff0002', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555502', 'school_admin', 'RECONCILIATION_RUN', 'attendance_sessions', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"absent_marked": 1, "present_reconciled": 3, "whatsapp_queued": 2}'::jsonb, '127.0.0.1')
ON CONFLICT DO NOTHING;
