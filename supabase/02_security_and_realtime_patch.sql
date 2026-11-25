-- ==============================================================================
-- SmartAttend: Production Security & Realtime Replication Patch
-- Target: Supabase PostgreSQL (Mumbai, India)
-- ==============================================================================

-- 1. Enable Realtime Publications for WebSocket Subscriptions
DO $$
BEGIN
    -- Enable realtime for students
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'students'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
    END IF;

    -- Enable realtime for daily_attendance
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'daily_attendance'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_attendance;
    END IF;

    -- Enable realtime for attendance_events
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'attendance_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_events;
    END IF;

    -- Enable realtime for leave_requests
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'leave_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
    END IF;
END $$;

-- 2. Client Insertion & Management Policies for Guardians & Relationships
DROP POLICY IF EXISTS "Allow guardian operations" ON public.guardians;
CREATE POLICY "Allow guardian operations" ON public.guardians 
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow student_guardians operations" ON public.student_guardians;
CREATE POLICY "Allow student_guardians operations" ON public.student_guardians 
FOR ALL USING (true) WITH CHECK (true);

-- 3. Confirm Full Table Coverage
COMMENT ON TABLE public.students IS 'SmartAttend Student Master Roster (Connected Live)';
COMMENT ON TABLE public.daily_attendance IS 'SmartAttend Daily Attendance Ledger with Half-Day & Manual Support';
COMMENT ON TABLE public.attendance_events IS 'SmartAttend Biometric Raw Punch Audit Trail';

