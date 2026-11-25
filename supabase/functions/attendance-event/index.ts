// ==============================================================================
// SmartAttend: Attendance Event Ingestion Edge Function
// Endpoint: POST /functions/v1/attendance-event
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

    const body = await req.json();
    const {
      device_serial,
      student_identifier, // admission_number e.g. "DPS-2026-1001" or UUID
      punch_time,
      punch_type = 'CHECK_IN',
      verification_method = 'FACE',
      confidence_score = 0.95,
      is_offline_sync = false,
      raw_payload
    } = body;

    if (!student_identifier) {
      return new Response(JSON.stringify({ error: 'Missing student_identifier' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Resolve Student Record
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id, school_id, admission_number, first_name, last_name, class_id, division_id')
      .or(`admission_number.eq.${student_identifier},id.eq.${student_identifier}`)
      .limit(1)
      .single();

    if (studentErr || !student) {
      return new Response(JSON.stringify({ error: 'Student not found for identifier: ' + student_identifier }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Resolve Active School & Today's Attendance Session
    const { data: school } = await supabase
      .from('schools')
      .select('*')
      .eq('id', student.school_id)
      .single();

    const todayStr = new Date().toISOString().split('T')[0];
    let { data: session } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('school_id', student.school_id)
      .eq('session_date', todayStr)
      .limit(1)
      .maybeSingle();

    if (!session) {
      // Auto-create today's session if not exists
      const { data: newSession } = await supabase
        .from('attendance_sessions')
        .insert({
          school_id: student.school_id,
          academic_year_id: '22222222-2222-2222-2222-222222222222',
          session_date: todayStr,
          name: 'Morning Attendance Session',
          opening_time: school?.opening_time || '08:30:00',
          grace_cutoff_time: '08:45:00',
          final_cutoff_time: school?.cutoff_time || '10:00:00'
        })
        .select()
        .single();
      session = newSession;
    }

    // 3. Resolve Device ID (if serial provided)
    let deviceId: string | null = null;
    if (device_serial) {
      const { data: dev } = await supabase
        .from('biometric_devices')
        .select('id')
        .eq('serial_number', device_serial)
        .maybeSingle();
      if (dev) deviceId = dev.id;
    }

    // 4. Calculate Timings & Late Arrival
    const eventDate = punch_time ? new Date(punch_time) : new Date();
    // Asia/Kolkata local time representation
    const localTimeStr = eventDate.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
    
    const openingTime = school?.opening_time || '08:30:00';
    const graceMinutes = school?.grace_period_minutes || 15;
    
    const [openH, openM] = openingTime.split(':').map(Number);
    const [localH, localM] = localTimeStr.split(':').map(Number);
    const diffMinutes = (localH * 60 + localM) - (openH * 60 + openM);
    
    const isLate = diffMinutes > graceMinutes;
    const minutesLate = isLate ? diffMinutes : 0;
    const attendanceStatus = isLate ? 'LATE' : 'PRESENT';

    // 5. Record Immutable Attendance Event
    const { data: eventRecord, error: eventErr } = await supabase
      .from('attendance_events')
      .insert({
        school_id: student.school_id,
        student_id: student.id,
        session_id: session.id,
        event_type: punch_type,
        event_timestamp: eventDate.toISOString(),
        local_timestamp: localTimeStr,
        verification_method,
        device_id: deviceId,
        confidence_score,
        liveness_verified: verification_method === 'FACE',
        is_duplicate_ignored: false,
        raw_payload
      })
      .select()
      .single();

    if (eventErr) throw eventErr;

    // 6. Upsert Daily Attendance Record
    const { data: dailyRecord, error: dailyErr } = await supabase
      .from('daily_attendance')
      .upsert({
        school_id: student.school_id,
        student_id: student.id,
        attendance_date: todayStr,
        session_id: session.id,
        status: attendanceStatus,
        first_arrival_time: localTimeStr,
        first_verification_method: verification_method,
        is_late: isLate,
        minutes_late: minutesLate,
        remarks: `Arrival verified via ${verification_method} at ${localTimeStr}`,
        reconciled_at: new Date().toISOString()
      }, { onConflict: 'student_id,attendance_date,session_id' })
      .select()
      .single();

    if (dailyErr) throw dailyErr;

    // 7. Find Primary Guardian and Queue WhatsApp Notification Job
    const { data: guardianLinks } = await supabase
      .from('student_guardians')
      .select('guardian_id, guardians(id, full_name, phone_number, whatsapp_opt_in)')
      .eq('student_id', student.id)
      .eq('is_primary_contact', true)
      .limit(1);

    if (guardianLinks && guardianLinks.length > 0 && school?.whatsapp_enabled) {
      const g = (guardianLinks[0] as any).guardians;
      if (g && g.whatsapp_opt_in && g.phone_number) {
        // Resolve Arrival Template
        const { data: template } = await supabase
          .from('notification_templates')
          .select('id')
          .eq('school_id', student.school_id)
          .eq('template_name', 'attendance_arrival_v1')
          .limit(1)
          .maybeSingle();

        if (template) {
          const studentFullName = `${student.first_name} ${student.last_name}`;
          await supabase.from('notification_jobs').insert({
            school_id: student.school_id,
            student_id: student.id,
            guardian_id: g.id,
            template_id: template.id,
            notification_type: 'ARRIVAL',
            recipient_phone: g.phone_number,
            template_parameters: [
              studentFullName,
              localTimeStr,
              todayStr,
              verification_method === 'FACE' ? 'Face Recognition' : 'Fingerprint'
            ],
            status: 'QUEUED',
            scheduled_for: new Date().toISOString()
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_id: eventRecord.id,
        daily_id: dailyRecord?.id,
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        status: attendanceStatus,
        local_time: localTimeStr,
        is_late: isLate,
        minutes_late: minutesLate
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
