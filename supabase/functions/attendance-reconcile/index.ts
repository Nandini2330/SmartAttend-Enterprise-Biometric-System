// ==============================================================================
// SmartAttend: Automated Absence Reconciliation Engine Edge Function
// Endpoint: POST /functions/v1/attendance-reconcile
// ==============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const schoolId = body.school_id || '11111111-1111-1111-1111-111111111111';
    const todayStr = body.date || new Date().toISOString().split('T')[0];

    // 1. Fetch School Config
    const { data: school } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (!school) {
      return new Response(JSON.stringify({ error: 'School not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // 2. Check if Today is a School Holiday
    const { data: holiday } = await supabase
      .from('school_holidays')
      .select('*')
      .eq('school_id', schoolId)
      .eq('holiday_date', todayStr)
      .maybeSingle();

    if (holiday) {
      return new Response(
        JSON.stringify({
          message: `Today (${todayStr}) is declared a holiday: ${holiday.name}. No absence records processed.`,
          is_holiday: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 3. Find or Create Active Session
    let { data: session } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('school_id', schoolId)
      .eq('session_date', todayStr)
      .maybeSingle();

    if (!session) {
      const { data: newSession } = await supabase
        .from('attendance_sessions')
        .insert({
          school_id: schoolId,
          academic_year_id: '22222222-2222-2222-2222-222222222222',
          session_date: todayStr,
          name: 'Morning Attendance Session',
          opening_time: school.opening_time || '08:30:00',
          cutoff_time: school.cutoff_time || '10:00:00'
        })
        .select()
        .single();
      session = newSession;
    }

    // 4. Fetch All Active Students in School
    const { data: allStudents } = await supabase
      .from('students')
      .select('id, admission_number, first_name, last_name, class_id, division_id')
      .eq('school_id', schoolId)
      .eq('is_active', true);

    // 5. Fetch Existing Attendance Records for Today
    const { data: existingRecords } = await supabase
      .from('daily_attendance')
      .select('student_id, status')
      .eq('school_id', schoolId)
      .eq('attendance_date', todayStr);

    const attendedStudentIds = new Set((existingRecords || []).map((r) => r.student_id));

    // 6. Fetch Approved Leaves for Today
    const { data: approvedLeaves } = await supabase
      .from('leave_requests')
      .select('student_id')
      .eq('school_id', schoolId)
      .eq('status', 'APPROVED')
      .lte('start_date', todayStr)
      .gte('end_date', todayStr);

    const leaveStudentIds = new Set((approvedLeaves || []).map((l) => l.student_id));

    // 7. Resolve Absence Template
    const { data: absenceTemplate } = await supabase
      .from('notification_templates')
      .select('id')
      .eq('school_id', schoolId)
      .eq('template_name', 'attendance_absence_v1')
      .maybeSingle();

    let absentCount = 0;
    let onLeaveCount = 0;
    let whatsappQueued = 0;

    for (const student of allStudents || []) {
      if (attendedStudentIds.has(student.id)) {
        continue; // Already verified or marked
      }

      const isLeave = leaveStudentIds.has(student.id);
      const status = isLeave ? 'ON_LEAVE' : 'ABSENT';

      if (isLeave) {
        onLeaveCount++;
      } else {
        absentCount++;
      }

      // Insert Daily Attendance Record
      await supabase.from('daily_attendance').insert({
        school_id: schoolId,
        student_id: student.id,
        attendance_date: todayStr,
        session_id: session.id,
        status,
        remarks: isLeave ? 'Approved leave request' : `Auto-reconciled absent after ${school.cutoff_time} cutoff`,
        reconciled_at: new Date().toISOString()
      });

      // If absent and WhatsApp enabled, queue absence alert
      if (!isLeave && school.whatsapp_enabled && absenceTemplate) {
        const { data: guardianLinks } = await supabase
          .from('student_guardians')
          .select('guardian_id, guardians(id, full_name, phone_number, whatsapp_opt_in)')
          .eq('student_id', student.id)
          .eq('is_primary_contact', true)
          .limit(1);

        if (guardianLinks && guardianLinks.length > 0) {
          const g = (guardianLinks[0] as any).guardians;
          if (g && g.whatsapp_opt_in && g.phone_number) {
            await supabase.from('notification_jobs').insert({
              school_id: schoolId,
              student_id: student.id,
              guardian_id: g.id,
              template_id: absenceTemplate.id,
              notification_type: 'ABSENCE',
              recipient_phone: g.phone_number,
              template_parameters: [
                `${student.first_name} ${student.last_name}`,
                todayStr,
                school.cutoff_time || '10:00 AM'
              ],
              status: 'QUEUED',
              scheduled_for: new Date().toISOString()
            });
            whatsappQueued++;
          }
        }
      }
    }

    // Mark session as reconciled
    await supabase
      .from('attendance_sessions')
      .update({
        is_reconciled: true,
        reconciled_at: new Date().toISOString()
      })
      .eq('id', session.id);

    // Audit log
    await supabase.from('audit_logs').insert({
      school_id: schoolId,
      action: 'RECONCILIATION_RUN',
      entity_type: 'attendance_sessions',
      entity_id: session.id,
      new_value: {
        absent_count: absentCount,
        on_leave_count: onLeaveCount,
        whatsapp_queued: whatsappQueued,
        reconciled_at: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        session_date: todayStr,
        absent_marked: absentCount,
        on_leave_marked: onLeaveCount,
        whatsapp_notifications_queued: whatsappQueued,
        total_students_evaluated: allStudents?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
