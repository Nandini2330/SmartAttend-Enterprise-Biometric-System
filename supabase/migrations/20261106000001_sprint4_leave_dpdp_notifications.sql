-- ==============================================================================
-- SmartAttend Enterprise Upgrade — Sprint 4 Migration
-- Document ID: SAR-SPRINT-04-2026
-- Modules: Leave Applications, Approvals, DPDP Consent & Reliable Notifications
-- Additive, Non-Destructive Migration Only. Zero record loss. Zero RLS disablement.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DPDP Act 2023 Biometric Consent Records Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dpdp_biometric_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    admission_number TEXT NOT NULL,
    guardian_name TEXT NOT NULL,
    consent_type TEXT NOT NULL DEFAULT 'ALL_BIOMETRICS' CHECK (consent_type IN ('FACIAL_RECOGNITION', 'FINGERPRINT', 'ALL_BIOMETRICS')),
    status TEXT NOT NULL DEFAULT 'GRANTED' CHECK (status IN ('GRANTED', 'WITHDRAWN', 'EXPIRED', 'PENDING')),
    consent_source TEXT NOT NULL DEFAULT 'PARENT_PORTAL' CHECK (consent_source IN ('PARENT_PORTAL', 'PHYSICAL_FORM', 'ADMIN_KIOSK')),
    consent_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    retention_days INTEGER NOT NULL DEFAULT 365,
    hash_sha256 TEXT NOT NULL,
    withdrawn_at TIMESTAMPTZ,
    withdrawn_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_dpdp_consents_student_status ON public.dpdp_biometric_consents(student_id, status);
CREATE INDEX IF NOT EXISTS idx_dpdp_consents_school_status ON public.dpdp_biometric_consents(school_id, status);
CREATE INDEX IF NOT EXISTS idx_dpdp_consents_hash ON public.dpdp_biometric_consents(hash_sha256);

-- ------------------------------------------------------------------------------
-- 2. DPDP Statutory Consent Audit Log Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dpdp_consent_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_id UUID REFERENCES public.dpdp_biometric_consents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('CONSENT_GRANTED', 'CONSENT_WITHDRAWN', 'CONSENT_EXPIRED', 'TEMPLATES_PURGED')),
    performed_by TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_dpdp_history_student ON public.dpdp_consent_history(student_id);

-- ------------------------------------------------------------------------------
-- 3. Additive Columns to Leave Requests
-- ------------------------------------------------------------------------------
ALTER TABLE public.leave_requests 
    ADD COLUMN IF NOT EXISTS leave_type TEXT DEFAULT 'PERSONAL_LEAVE',
    ADD COLUMN IF NOT EXISTS applicant_role TEXT DEFAULT 'PARENT',
    ADD COLUMN IF NOT EXISTS document_url TEXT,
    ADD COLUMN IF NOT EXISTS document_name TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by_id UUID REFERENCES public.user_profiles(id),
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_by TEXT;

-- Update constraints safely
ALTER TABLE public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_status_check;
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_status_check 
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'));

ALTER TABLE public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_leave_type_check;
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_leave_type_check 
    CHECK (leave_type IN ('SICK_LEAVE', 'PERSONAL_LEAVE', 'EMERGENCY_LEAVE', 'OTHER'));

ALTER TABLE public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_applicant_role_check;
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_applicant_role_check 
    CHECK (applicant_role IN ('PARENT', 'STUDENT', 'TEACHER', 'ADMIN'));

CREATE INDEX IF NOT EXISTS idx_leave_requests_student_dates ON public.leave_requests(student_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_school_status ON public.leave_requests(school_id, status);

-- ------------------------------------------------------------------------------
-- 4. Additive Columns to Notification Jobs
-- ------------------------------------------------------------------------------
ALTER TABLE public.notification_jobs 
    ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'WHATSAPP',
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
    ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS dead_letter_reason TEXT,
    ADD COLUMN IF NOT EXISTS provider_response TEXT;

-- Update status constraint safely
ALTER TABLE public.notification_jobs DROP CONSTRAINT IF EXISTS notification_jobs_status_check;
ALTER TABLE public.notification_jobs ADD CONSTRAINT notification_jobs_status_check 
    CHECK (status IN ('PENDING', 'PROCESSING', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'DEAD_LETTER'));

ALTER TABLE public.notification_jobs DROP CONSTRAINT IF EXISTS notification_jobs_channel_check;
ALTER TABLE public.notification_jobs ADD CONSTRAINT notification_jobs_channel_check 
    CHECK (channel IN ('WHATSAPP', 'SMS', 'EMAIL'));

CREATE INDEX IF NOT EXISTS idx_notif_jobs_idempotency ON public.notification_jobs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_notif_jobs_retry ON public.notification_jobs(status, next_retry_at);

-- ------------------------------------------------------------------------------
-- 5. Row-Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.dpdp_biometric_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpdp_consent_history ENABLE ROW LEVEL SECURITY;

-- Staff Policy: Can read and manage consent records within their school
CREATE POLICY "School staff can manage biometric consents"
    ON public.dpdp_biometric_consents FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.school_staff ss
        WHERE ss.user_id = auth.uid() AND ss.school_id = dpdp_biometric_consents.school_id
    ));

-- Parent Policy: Can view only their own child's consent record
CREATE POLICY "Parents can view child biometric consent"
    ON public.dpdp_biometric_consents FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.guardians g ON g.id = sg.guardian_id
        WHERE g.user_id = auth.uid() AND sg.student_id = dpdp_biometric_consents.student_id
    ));

-- Parent Policy: Can withdraw/update consent for their own child
CREATE POLICY "Parents can update child biometric consent"
    ON public.dpdp_biometric_consents FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.guardians g ON g.id = sg.guardian_id
        WHERE g.user_id = auth.uid() AND sg.student_id = dpdp_biometric_consents.student_id
    ));

-- History Policy: Read-only for authorized staff and parent of student
CREATE POLICY "Staff can view consent history"
    ON public.dpdp_consent_history FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.students s
        JOIN public.school_staff ss ON ss.school_id = s.school_id
        WHERE ss.user_id = auth.uid() AND s.id = dpdp_consent_history.student_id
    ));

