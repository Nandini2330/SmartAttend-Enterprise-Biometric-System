-- ==============================================================================
-- SMARTATTEND: Row Level Security (RLS) Policies
-- Migration: 20261029000002_rls_policies.sql
-- ==============================================================================

-- Helper functions for current user context
CREATE OR REPLACE FUNCTION public.current_user_profile()
RETURNS public.user_profiles AS $$
  SELECT * FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS across all tables
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

-- ------------------------------------------------------------------------------
-- 1. Schools Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Super admins can view and manage all schools"
ON public.schools FOR ALL
USING (public.current_user_role() = 'super_admin');

CREATE POLICY "School users can view their own school"
ON public.schools FOR SELECT
USING (id = public.current_user_school_id());

CREATE POLICY "School admins can update their own school"
ON public.schools FOR UPDATE
USING (id = public.current_user_school_id() AND public.current_user_role() = 'school_admin');

-- ------------------------------------------------------------------------------
-- 2. User Profiles Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view profiles in their school"
ON public.user_profiles FOR SELECT
USING (
  public.current_user_role() = 'super_admin' OR
  school_id = public.current_user_school_id() OR
  id = auth.uid()
);

CREATE POLICY "School admins can manage profiles in their school"
ON public.user_profiles FOR ALL
USING (
  public.current_user_role() = 'super_admin' OR
  (school_id = public.current_user_school_id() AND public.current_user_role() = 'school_admin')
);

-- ------------------------------------------------------------------------------
-- 3. Students Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff can view students in their school"
ON public.students FOR SELECT
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') AND
  (public.current_user_role() = 'super_admin' OR school_id = public.current_user_school_id())
);

CREATE POLICY "Parents can only view their linked children"
ON public.students FOR SELECT
USING (
  public.current_user_role() = 'parent' AND
  id IN (
    SELECT sg.student_id
    FROM public.student_guardians sg
    JOIN public.guardians g ON g.id = sg.guardian_id
    WHERE g.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert and update students"
ON public.students FOR ALL
USING (
  public.current_user_role() = 'super_admin' OR
  (school_id = public.current_user_school_id() AND public.current_user_role() = 'school_admin')
);

-- ------------------------------------------------------------------------------
-- 4. Attendance Events & Daily Attendance Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Staff can view daily attendance in their school"
ON public.daily_attendance FOR SELECT
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') AND
  (public.current_user_role() = 'super_admin' OR school_id = public.current_user_school_id())
);

CREATE POLICY "Parents can only view daily attendance for linked children"
ON public.daily_attendance FOR SELECT
USING (
  public.current_user_role() = 'parent' AND
  student_id IN (
    SELECT sg.student_id
    FROM public.student_guardians sg
    JOIN public.guardians g ON g.id = sg.guardian_id
    WHERE g.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can record attendance events"
ON public.attendance_events FOR INSERT
WITH CHECK (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') OR
  auth.role() = 'service_role'
);

CREATE POLICY "Staff can view attendance events"
ON public.attendance_events FOR SELECT
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') AND
  (public.current_user_role() = 'super_admin' OR school_id = public.current_user_school_id())
);

-- ------------------------------------------------------------------------------
-- 5. Leave Requests Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Parents can manage leave requests for their children"
ON public.leave_requests FOR ALL
USING (
  student_id IN (
    SELECT sg.student_id
    FROM public.student_guardians sg
    JOIN public.guardians g ON g.id = sg.guardian_id
    WHERE g.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can view and review leave requests"
ON public.leave_requests FOR ALL
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') AND
  (public.current_user_role() = 'super_admin' OR school_id = public.current_user_school_id())
);

-- ------------------------------------------------------------------------------
-- 6. Biometric Devices & Sync Logs (Restricted to Admins and Service Role)
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins can manage biometric devices"
ON public.biometric_devices FOR ALL
USING (
  public.current_user_role() = 'super_admin' OR
  (school_id = public.current_user_school_id() AND public.current_user_role() = 'school_admin')
);

CREATE POLICY "Admins can view sync logs"
ON public.device_sync_logs FOR SELECT
USING (
  public.current_user_role() IN ('super_admin', 'school_admin')
);

-- ------------------------------------------------------------------------------
-- 7. Audit Logs Policies (Append-only, strictly immutable)
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (
  public.current_user_role() = 'super_admin' OR
  (school_id = public.current_user_school_id() AND public.current_user_role() = 'school_admin')
);

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);
