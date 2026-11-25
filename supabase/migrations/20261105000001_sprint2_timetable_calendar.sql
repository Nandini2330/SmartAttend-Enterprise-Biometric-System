-- ==============================================================================
-- SMARTATTEND: Sprint 2 Migration - Timetable, Period Attendance & School Calendar
-- Migration: 20261105000001_sprint2_timetable_calendar.sql
-- ==============================================================================

-- 1. Timetables (Weekly period slots per class, division & teacher)
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 10),
    subject_name VARCHAR(100) NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    teacher_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    room_number VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_class_period_slot UNIQUE (class_id, division_id, day_of_week, period_number)
);

-- 2. Period Attendance (Individual period-level student records)
CREATE TABLE IF NOT EXISTS public.period_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    timetable_id UUID REFERENCES public.timetables(id) ON DELETE SET NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL,
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 10),
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    marked_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_period_date UNIQUE (student_id, attendance_date, period_number)
);

-- 3. School Calendar Events (Examinations, vacations, working days & holidays)
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('HOLIDAY', 'EXAMINATION', 'VACATION', 'EVENT', 'SPECIAL_WORKING_DAY')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_instructional_day BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Timetable RLS
CREATE POLICY "Staff can view all timetables in school"
ON public.timetables FOR SELECT
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') AND
  (public.current_user_role() = 'super_admin' OR school_id = public.current_user_school_id())
);

CREATE POLICY "School admins can manage timetables"
ON public.timetables FOR ALL
USING (
  public.current_user_role() = 'super_admin' OR
  (school_id = public.current_user_school_id() AND public.current_user_role() = 'school_admin')
);

CREATE POLICY "Parents and students can view timetables"
ON public.timetables FOR SELECT
USING (
  public.current_user_role() IN ('parent', 'student') AND
  school_id = public.current_user_school_id()
);

-- Period Attendance RLS
CREATE POLICY "Staff can view and record period attendance"
ON public.period_attendance FOR ALL
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') AND
  (public.current_user_role() = 'super_admin' OR school_id = public.current_user_school_id())
);

CREATE POLICY "Parents can view period attendance for linked children"
ON public.period_attendance FOR SELECT
USING (
  public.current_user_role() = 'parent' AND
  public.is_parent_of(auth.uid(), student_id)
);

CREATE POLICY "Students can view their own period attendance"
ON public.period_attendance FOR SELECT
USING (
  public.current_user_role() = 'student' AND
  student_id = auth.uid()
);

-- Calendar Events RLS
CREATE POLICY "Users can view calendar events for their school"
ON public.calendar_events FOR SELECT
USING (
  public.current_user_role() = 'super_admin' OR
  school_id = public.current_user_school_id()
);

CREATE POLICY "School admins can manage calendar events"
ON public.calendar_events FOR ALL
USING (
  public.current_user_role() = 'super_admin' OR
  (school_id = public.current_user_school_id() AND public.current_user_role() = 'school_admin')
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_timetables_lookup ON public.timetables(class_id, division_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetables_teacher ON public.timetables(teacher_name, day_of_week);
CREATE INDEX IF NOT EXISTS idx_period_attendance_student_date ON public.period_attendance(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON public.calendar_events(school_id, start_date, end_date);
