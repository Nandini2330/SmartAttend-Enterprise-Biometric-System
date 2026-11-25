-- ==============================================================================
-- SMARTATTEND: Parent-Student Authorization & Attendance Privacy Enforcement
-- Migration: 20261029000003_parent_privacy_authorization.sql
-- ==============================================================================

-- 1. Security Definer Helper: Verify parent-student authorization link
CREATE OR REPLACE FUNCTION public.is_parent_of(p_user_id UUID, p_student_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.student_guardians sg
    JOIN public.guardians g ON g.id = sg.guardian_id
    WHERE g.user_id = p_user_id
      AND sg.student_id = p_student_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Security Definer Helper: Return authorized student IDs for a parent user
CREATE OR REPLACE FUNCTION public.get_parent_student_ids(p_user_id UUID)
RETURNS TABLE (student_id UUID) AS $$
  SELECT sg.student_id
  FROM public.student_guardians sg
  JOIN public.guardians g ON g.id = sg.guardian_id
  WHERE g.user_id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 3. Guardians & Student-Guardians RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view all guardians" ON public.guardians;
CREATE POLICY "Staff can view all guardians"
ON public.guardians FOR SELECT
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') AND
  (public.current_user_role() = 'super_admin' OR school_id = public.current_user_school_id())
);

DROP POLICY IF EXISTS "Parents can view their own guardian profile" ON public.guardians;
CREATE POLICY "Parents can view their own guardian profile"
ON public.guardians FOR SELECT
USING (
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "Staff can view student guardians" ON public.student_guardians;
CREATE POLICY "Staff can view student guardians"
ON public.student_guardians FOR SELECT
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher')
);

DROP POLICY IF EXISTS "Parents can view their own student links" ON public.student_guardians;
CREATE POLICY "Parents can view their own student links"
ON public.student_guardians FOR SELECT
USING (
  guardian_id IN (
    SELECT id FROM public.guardians WHERE user_id = auth.uid()
  )
);

-- ------------------------------------------------------------------------------
-- 4. Students Table RLS Policies (Privacy-Enforced)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Parents can only view their linked children" ON public.students;
CREATE POLICY "Parents can only view their linked children"
ON public.students FOR SELECT
USING (
  public.current_user_role() = 'parent' AND
  public.is_parent_of(auth.uid(), id)
);

DROP POLICY IF EXISTS "Students can only view their own record" ON public.students;
CREATE POLICY "Students can only view their own record"
ON public.students FOR SELECT
USING (
  public.current_user_role() = 'student' AND
  id = auth.uid()
);

-- ------------------------------------------------------------------------------
-- 5. Daily Attendance Table RLS Policies (Privacy-Enforced)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Parents can only view daily attendance for linked children" ON public.daily_attendance;
CREATE POLICY "Parents can only view daily attendance for linked children"
ON public.daily_attendance FOR SELECT
USING (
  public.current_user_role() = 'parent' AND
  public.is_parent_of(auth.uid(), student_id)
);

DROP POLICY IF EXISTS "Students can only view their own daily attendance" ON public.daily_attendance;
CREATE POLICY "Students can only view their own daily attendance"
ON public.daily_attendance FOR SELECT
USING (
  public.current_user_role() = 'student' AND
  student_id = auth.uid()
);

-- ------------------------------------------------------------------------------
-- 6. Raw Attendance Events Table RLS Policies (Privacy-Enforced)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Parents can only view attendance events for linked children" ON public.attendance_events;
CREATE POLICY "Parents can only view attendance events for linked children"
ON public.attendance_events FOR SELECT
USING (
  public.current_user_role() = 'parent' AND
  public.is_parent_of(auth.uid(), student_id)
);

DROP POLICY IF EXISTS "Students can only view their own attendance events" ON public.attendance_events;
CREATE POLICY "Students can only view their own attendance events"
ON public.attendance_events FOR SELECT
USING (
  public.current_user_role() = 'student' AND
  student_id = auth.uid()
);

-- ------------------------------------------------------------------------------
-- 7. Leave Requests Table RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Parents can manage leave requests for their children" ON public.leave_requests;
CREATE POLICY "Parents can manage leave requests for their children"
ON public.leave_requests FOR ALL
USING (
  public.current_user_role() = 'parent' AND
  public.is_parent_of(auth.uid(), student_id)
);

-- ------------------------------------------------------------------------------
-- 8. Notification Jobs Table RLS Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Parents can only view notifications for their linked children" ON public.notification_jobs;
CREATE POLICY "Parents can only view notifications for their linked children"
ON public.notification_jobs FOR SELECT
USING (
  public.current_user_role() = 'parent' AND
  public.is_parent_of(auth.uid(), student_id)
);

-- ------------------------------------------------------------------------------
-- 9. Defense-in-Depth Authorization Trigger for Leave Applications
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_parent_leave_authorization()
RETURNS TRIGGER AS $$
BEGIN
  -- If action performed by a parent user, verify child relationship
  IF public.current_user_role() = 'parent' THEN
    IF NOT public.is_parent_of(auth.uid(), NEW.student_id) THEN
      RAISE EXCEPTION 'Access Denied: You cannot submit or modify leave requests for a student who is not your registered child.'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_parent_leave_authorization ON public.leave_requests;
CREATE TRIGGER trg_enforce_parent_leave_authorization
BEFORE INSERT OR UPDATE ON public.leave_requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_parent_leave_authorization();

