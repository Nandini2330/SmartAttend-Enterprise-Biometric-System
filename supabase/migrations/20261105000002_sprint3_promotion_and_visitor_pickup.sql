-- ==============================================================================
-- SMARTATTEND: Sprint 3 Migration - Visitor Pickup, OTP Authorization & Promotions
-- Migration: 20261105000002_sprint3_promotion_and_visitor_pickup.sql
-- ==============================================================================

-- 1. Visitor Pickups & Student Gate Checkouts
CREATE TABLE IF NOT EXISTS public.visitor_pickups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    visitor_name VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(25) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    pickup_reason TEXT NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    otp_verified BOOLEAN DEFAULT false,
    otp_verified_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'AUTHORIZED_CHECKOUT', 'UNAUTHORIZED_BLOCKED', 'CANCELLED')),
    gate_pass_number VARCHAR(100) UNIQUE,
    authorized_by_guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
    verified_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    checkout_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Parent Pre-Authorized Pickup Persons
CREATE TABLE IF NOT EXISTS public.pickup_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    authorized_person_name VARCHAR(255) NOT NULL,
    authorized_person_phone VARCHAR(25) NOT NULL,
    relationship_to_child VARCHAR(50) NOT NULL,
    id_proof_number VARCHAR(100),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. School Visitors (General campus visitor register & badges)
CREATE TABLE IF NOT EXISTS public.school_visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(25) NOT NULL,
    email VARCHAR(255),
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    purpose VARCHAR(100) NOT NULL CHECK (purpose IN ('ADMISSION_ENQUIRY', 'OFFICIAL_MEETING', 'VENDOR_DELIVERY', 'CAMPUS_INSPECTION', 'GUEST_EVENT', 'OTHER')),
    whom_to_meet VARCHAR(255) NOT NULL,
    badge_number VARCHAR(50) NOT NULL,
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'CHECKED_IN' CHECK (status IN ('CHECKED_IN', 'CHECKED_OUT')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.visitor_pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_visitors ENABLE ROW LEVEL SECURITY;

-- Visitor Pickups Policies
CREATE POLICY "Staff can view and manage visitor pickups"
ON public.visitor_pickups FOR ALL
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') AND
  (public.current_user_role() = 'super_admin' OR school_id = public.current_user_school_id())
);

CREATE POLICY "Parents can view pickups for their linked children"
ON public.visitor_pickups FOR SELECT
USING (
  public.current_user_role() = 'parent' AND
  public.is_parent_of(auth.uid(), student_id)
);

-- Pickup Authorizations Policies
CREATE POLICY "Staff can view pickup authorizations"
ON public.pickup_authorizations FOR SELECT
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') AND
  (public.current_user_role() = 'super_admin' OR school_id = public.current_user_school_id())
);

CREATE POLICY "Parents can manage pickup authorizations for their children"
ON public.pickup_authorizations FOR ALL
USING (
  public.current_user_role() = 'parent' AND
  public.is_parent_of(auth.uid(), student_id)
);

-- School Visitors Policies
CREATE POLICY "Staff can view and manage school visitors"
ON public.school_visitors FOR ALL
USING (
  public.current_user_role() IN ('super_admin', 'school_admin', 'teacher') AND
  (public.current_user_role() = 'super_admin' OR school_id = public.current_user_school_id())
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_visitor_pickups_student ON public.visitor_pickups(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_pickups_status ON public.visitor_pickups(school_id, status);
CREATE INDEX IF NOT EXISTS idx_pickup_auth_student ON public.pickup_authorizations(student_id, is_active);
CREATE INDEX IF NOT EXISTS idx_school_visitors_lookup ON public.school_visitors(school_id, status, check_in_time DESC);
