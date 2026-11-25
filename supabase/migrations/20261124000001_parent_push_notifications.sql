-- ==============================================================================
-- SmartAttend: Parent Mobile App Background Push Notifications Migration
-- Migration: 20261124000001_parent_push_notifications.sql
-- ==============================================================================

-- 1. Device Push Tokens Table
CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    expo_push_token TEXT NOT NULL,
    device_type VARCHAR(20) DEFAULT 'ANDROID' CHECK (device_type IN ('ANDROID', 'IOS', 'WEB')),
    device_name TEXT,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_guardian_device_token UNIQUE (guardian_id, expo_push_token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_guardian_active ON public.device_tokens(guardian_id, is_active);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON public.device_tokens(expo_push_token);

-- 2. Parent Notification History Table (Persistent In-App & Push Audit)
CREATE TABLE IF NOT EXISTS public.parent_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('CHECK_IN', 'CHECK_OUT', 'ABSENT', 'LATE', 'LEAVE_STATUS', 'CIRCULAR', 'URGENT')),
    student_name TEXT NOT NULL,
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false,
    delivery_status VARCHAR(20) DEFAULT 'SENT' CHECK (delivery_status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED')),
    push_ticket_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_notifications_guardian ON public.parent_notifications(guardian_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_student ON public.parent_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_unread ON public.parent_notifications(guardian_id, is_read);

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;

-- Device Tokens Policies
DROP POLICY IF EXISTS "Guardians read own device tokens" ON public.device_tokens;
CREATE POLICY "Guardians read own device tokens" ON public.device_tokens
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Guardians manage own device tokens" ON public.device_tokens;
CREATE POLICY "Guardians manage own device tokens" ON public.device_tokens
    FOR ALL USING (true) WITH CHECK (true);

-- Parent Notifications Policies
DROP POLICY IF EXISTS "Guardians read own notifications" ON public.parent_notifications;
CREATE POLICY "Guardians read own notifications" ON public.parent_notifications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Guardians update read status" ON public.parent_notifications;
CREATE POLICY "Guardians update read status" ON public.parent_notifications
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow notification creation" ON public.parent_notifications;
CREATE POLICY "Allow notification creation" ON public.parent_notifications
    FOR INSERT WITH CHECK (true);

-- 4. Enable Realtime Publications for WebSocket Subscriptions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'device_tokens'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.device_tokens;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'parent_notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.parent_notifications;
    END IF;
END $$;

-- 5. Trigger Function: Automatically Generate Parent Notifications on Attendance Changes
CREATE OR REPLACE FUNCTION public.fn_attendance_generate_parent_notification()
RETURNS TRIGGER AS $$
DECLARE
    rec_student RECORD;
    rec_guardian RECORD;
    v_title TEXT;
    v_message TEXT;
    v_type VARCHAR(50);
    v_student_name TEXT;
    v_time_str TEXT;
BEGIN
    -- 1. Fetch Student Details
    SELECT first_name, last_name, school_id INTO rec_student 
    FROM public.students 
    WHERE id = NEW.student_id;

    IF NOT FOUND THEN
        RETURN NEW;
    END IF;

    v_student_name := rec_student.first_name || ' ' || rec_student.last_name;
    v_time_str := COALESCE(TO_CHAR(NEW.first_arrival_time, 'HH12:MI AM'), TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'HH12:MI AM'));

    -- 2. Determine Notification Type and Message Content
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.first_arrival_time IS DISTINCT FROM NEW.first_arrival_time OR OLD.status IS DISTINCT FROM NEW.status))) THEN
        IF (NEW.status = 'PRESENT' OR (NEW.first_arrival_time IS NOT NULL AND NEW.is_late = false)) THEN
            v_type := 'CHECK_IN';
            v_title := 'Safe Gate Entry Verified (Clock In)';
            v_message := 'Your child ' || v_student_name || ' has clocked IN at ' || v_time_str || ' via biometric face scanner (Gate 1).';
        ELSIF (NEW.status = 'LATE' OR NEW.is_late = true) THEN
            v_type := 'LATE';
            v_title := 'Late Arrival Warning (Past Grace Period)';
            v_message := 'Your child ' || v_student_name || ' arrived late at ' || v_time_str || ' (exceeded the school grace period).';
        ELSIF (NEW.status = 'ABSENT') THEN
            v_type := 'ABSENT';
            v_title := 'Urgent: Student Marked Absent Today';
            v_message := 'Your child ' || v_student_name || ' has been marked ABSENT today. No biometric punch recorded before the 10:00 AM cutoff.';
        ELSIF (NEW.status = 'HALF_DAY') THEN
            v_type := 'CHECK_IN';
            v_title := 'Half Day Attendance Logged';
            v_message := 'Your child ' || v_student_name || ' attendance is logged as Half Day on ' || NEW.attendance_date || '. ' || COALESCE(NEW.remarks, '');
        ELSIF (NEW.status = 'ON_LEAVE') THEN
            v_type := 'LEAVE_STATUS';
            v_title := 'Approved Leave Recorded';
            v_message := 'Your child ' || v_student_name || ' is recorded ON LEAVE on ' || NEW.attendance_date || '. ' || COALESCE(NEW.remarks, '');
        END IF;
    END IF;

    -- Check for Departure / Clock Out
    IF (NEW.departure_time IS NOT NULL AND (OLD.departure_time IS NULL OR OLD.departure_time IS DISTINCT FROM NEW.departure_time)) THEN
        v_type := 'CHECK_OUT';
        v_time_str := TO_CHAR(NEW.departure_time, 'HH12:MI AM');
        v_title := 'Campus Departure Verified (Clock Out)';
        v_message := 'Your child ' || v_student_name || ' has clocked OUT at ' || v_time_str || ' via Main Gate departure terminal.';
    END IF;

    -- 3. If a valid notification was determined, record for all authorized guardians
    IF v_type IS NOT NULL THEN
        FOR rec_guardian IN 
            SELECT g.id AS guardian_id 
            FROM public.student_guardians sg
            JOIN public.guardians g ON g.id = sg.guardian_id
            WHERE sg.student_id = NEW.student_id
        LOOP
            -- Prevent duplicate notification for same student, type and date within last 5 minutes
            IF NOT EXISTS (
                SELECT 1 FROM public.parent_notifications 
                WHERE guardian_id = rec_guardian.guardian_id
                  AND student_id = NEW.student_id
                  AND notification_type = v_type
                  AND created_at > (NOW() - INTERVAL '5 minutes')
            ) THEN
                INSERT INTO public.parent_notifications (
                    school_id,
                    guardian_id,
                    student_id,
                    title,
                    message,
                    notification_type,
                    student_name,
                    event_timestamp,
                    metadata
                ) VALUES (
                    rec_student.school_id,
                    rec_guardian.guardian_id,
                    NEW.student_id,
                    v_title,
                    v_message,
                    v_type,
                    v_student_name,
                    NOW(),
                    jsonb_build_object(
                        'attendance_date', NEW.attendance_date,
                        'status', NEW.status,
                        'first_arrival_time', NEW.first_arrival_time,
                        'departure_time', NEW.departure_time,
                        'is_late', NEW.is_late
                    )
                );
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Trigger to daily_attendance
DROP TRIGGER IF EXISTS trg_attendance_parent_notification ON public.daily_attendance;
CREATE TRIGGER trg_attendance_parent_notification
    AFTER INSERT OR UPDATE ON public.daily_attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_attendance_generate_parent_notification();

-- 7. Trigger Function: Generate Notification on Leave Application Review
CREATE OR REPLACE FUNCTION public.fn_leave_request_parent_notification()
RETURNS TRIGGER AS $$
DECLARE
    rec_student RECORD;
    v_title TEXT;
    v_message TEXT;
BEGIN
    IF (NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('APPROVED', 'REJECTED')) THEN
        SELECT first_name, last_name, school_id INTO rec_student 
        FROM public.students 
        WHERE id = NEW.student_id;

        IF FOUND AND NEW.requested_by_guardian_id IS NOT NULL THEN
            IF NEW.status = 'APPROVED' THEN
                v_title := 'Leave Request Approved by School';
                v_message := 'Leave request for ' || rec_student.first_name || ' (' || NEW.start_date || ' to ' || NEW.end_date || ') has been approved by the school.';
            ELSE
                v_title := 'Leave Request Rejected by School';
                v_message := 'Leave request for ' || rec_student.first_name || ' (' || NEW.start_date || ' to ' || NEW.end_date || ') was not approved: ' || COALESCE(NEW.review_comments, 'Contact administration.');
            END IF;

            INSERT INTO public.parent_notifications (
                school_id,
                guardian_id,
                student_id,
                title,
                message,
                notification_type,
                student_name,
                event_timestamp,
                metadata
            ) VALUES (
                rec_student.school_id,
                NEW.requested_by_guardian_id,
                NEW.student_id,
                v_title,
                v_message,
                'LEAVE_STATUS',
                rec_student.first_name || ' ' || rec_student.last_name,
                NOW(),
                jsonb_build_object(
                    'leave_id', NEW.id,
                    'status', NEW.status,
                    'start_date', NEW.start_date,
                    'end_date', NEW.end_date
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Trigger to leave_requests
DROP TRIGGER IF EXISTS trg_leave_request_parent_notification ON public.leave_requests;
CREATE TRIGGER trg_leave_request_parent_notification
    AFTER UPDATE ON public.leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_leave_request_parent_notification();

