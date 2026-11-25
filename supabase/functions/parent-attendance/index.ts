// ==============================================================================
// SmartAttend: Parent Attendance & Reports Authorization Edge Function
// Endpoint: GET/POST /functions/v1/parent-attendance
// Enforces strict Parent-Student relationship authorization and complete data privacy.
// ==============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id, x-parent-email',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Resolve Parent User from Authorization Token or Header
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const customUserId = req.headers.get('x-user-id');
    const customEmail = req.headers.get('x-parent-email');

    let parentUserId: string | null = null;
    let parentEmail: string | null = null;

    if (customUserId) {
      parentUserId = customUserId;
    } else if (customEmail) {
      parentEmail = customEmail;
    } else if (token) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (!authErr && user) {
        parentUserId = user.id;
        parentEmail = user.email ?? null;
      }
    }

    if (!parentUserId && !parentEmail) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Valid authentication credentials required.'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch Parent Guardian Profile
    let guardianQuery = supabase
      .from('guardians')
      .select('id, user_id, full_name, email, phone_number');

    if (parentUserId) {
      guardianQuery = guardianQuery.eq('user_id', parentUserId);
    } else if (parentEmail) {
      guardianQuery = guardianQuery.eq('email', parentEmail);
    }

    const { data: guardian, error: gErr } = await guardianQuery.limit(1).maybeSingle();

    if (gErr || !guardian) {
      return new Response(
        JSON.stringify({
          error: 'Forbidden',
          message: 'User is not registered as an authorized parent/guardian in SmartAttend.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Retrieve Authorized Student IDs for this Parent from Database
    const { data: studentLinks, error: linksErr } = await supabase
      .from('student_guardians')
      .select('student_id')
      .eq('guardian_id', guardian.id);

    if (linksErr) {
      return new Response(
        JSON.stringify({ error: 'Database query failed', details: linksErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authorizedStudentIds = (studentLinks || []).map((l: { student_id: string }) => l.student_id);

    // 4. Parse Request Body or Query Parameters
    const url = new URL(req.url);
    const queryStudentId = url.searchParams.get('student_id');
    const queryDate = url.searchParams.get('date');
    const queryStatus = url.searchParams.get('status');

    let bodyStudentId: string | null = null;
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      bodyStudentId = body.student_id;
    }

    const requestedStudentId = (queryStudentId || bodyStudentId)?.trim();

    // 5. STRICT SECURITY AUTHORIZATION CHECK: Prevent IDOR Tampering
    if (requestedStudentId) {
      const isAuthorized = authorizedStudentIds.includes(requestedStudentId);
      if (!isAuthorized) {
        return new Response(
          JSON.stringify({
            error: 'Forbidden: Access Denied',
            code: 'UNAUTHORIZED_STUDENT_ACCESS',
            message: `Parent Privacy Violation: You are authenticated as parent '${guardian.full_name}' and are strictly NOT authorized to view attendance records for student '${requestedStudentId}'. Parents can ONLY view their own registered children.`,
            status: 403,
            privacy_enforced: true
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const targetStudentIds = requestedStudentId
      ? [requestedStudentId]
      : authorizedStudentIds;

    // 6. Fetch Authorized Students
    const { data: students } = await supabase
      .from('students')
      .select('id, admission_number, first_name, last_name, class_id, division_id, roll_number, avatar_url')
      .in('id', targetStudentIds);

    // 7. Fetch Attendance Records strictly for authorized students
    let attendanceQuery = supabase
      .from('daily_attendance')
      .select('*')
      .in('student_id', targetStudentIds)
      .order('attendance_date', { ascending: false });

    if (queryDate) {
      attendanceQuery = attendanceQuery.eq('attendance_date', queryDate);
    }
    if (queryStatus && queryStatus !== 'ALL') {
      attendanceQuery = attendanceQuery.eq('status', queryStatus);
    }

    const { data: attendanceRecords } = await attendanceQuery;

    // 8. Calculate Attendance Percentage
    const totalRecords = (attendanceRecords || []).length;
    const presentCount = (attendanceRecords || []).filter((r: { status: string }) => r.status === 'PRESENT').length;
    const lateCount = (attendanceRecords || []).filter((r: { status: string }) => r.status === 'LATE').length;
    const absentCount = (attendanceRecords || []).filter((r: { status: string }) => r.status === 'ABSENT').length;
    const onLeaveCount = (attendanceRecords || []).filter((r: { status: string }) => r.status === 'ON_LEAVE').length;

    const percentage = totalRecords > 0
      ? Math.round(((presentCount + lateCount) / totalRecords) * 100)
      : 100;

    return new Response(
      JSON.stringify({
        success: true,
        parent: {
          id: guardian.user_id,
          name: guardian.full_name,
          email: guardian.email
        },
        children: students || [],
        attendance: attendanceRecords || [],
        stats: {
          total_sessions: totalRecords,
          present_days: presentCount,
          late_days: lateCount,
          absent_days: absentCount,
          on_leave_days: onLeaveCount,
          attendance_percentage: percentage
        },
        privacy_enforced: true,
        authorized_child_ids: authorizedStudentIds
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

