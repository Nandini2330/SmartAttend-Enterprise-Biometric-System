// ==============================================================================
// SmartAttend: Parent Attendance Push Notification Service
// Endpoint: POST /functions/v1/push-attendance-notification
// Expo Push API Integration with Automatic Token Lifecycle Management
// ==============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

interface PushRequestPayload {
  student_id: string;
  event_type: 'CHECK_IN' | 'CHECK_OUT' | 'ABSENT' | 'LATE' | 'LEAVE_STATUS';
  time?: string;
  guardian_id?: string;
  language?: 'en' | 'mr';
  custom_title?: string;
  custom_message?: string;
  leave_status?: 'APPROVED' | 'REJECTED';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: PushRequestPayload = await req.json();
    const {
      student_id,
      event_type,
      time,
      guardian_id: targetGuardianId,
      language = 'en',
      custom_title,
      custom_message,
      leave_status
    } = body;

    if (!student_id || !event_type) {
      return new Response(
        JSON.stringify({ error: 'student_id and event_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Resolve Student Record
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id, school_id, first_name, last_name, class_id, division_id')
      .eq('id', student_id)
      .single();

    if (studentErr || !student) {
      return new Response(
        JSON.stringify({ error: 'Student not found', details: studentErr?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const studentFullName = `${student.first_name} ${student.last_name}`;
    const timeFormatted = time || new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 2. Resolve Authorized Guardians for this Student
    let guardiansQuery = supabase
      .from('student_guardians')
      .select('guardian_id, guardians(id, full_name, email, phone_number)')
      .eq('student_id', student.id);

    if (targetGuardianId) {
      guardiansQuery = guardiansQuery.eq('guardian_id', targetGuardianId);
    }

    const { data: guardianLinks, error: linksErr } = await guardiansQuery;

    if (linksErr || !guardianLinks || guardianLinks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No authorized guardians linked to student', student_id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const guardianIds = guardianLinks.map((g: any) => g.guardian_id);

    // 3. Retrieve Active Device Tokens for Authorized Guardians
    const { data: deviceTokens, error: tokensErr } = await supabase
      .from('device_tokens')
      .select('id, guardian_id, expo_push_token, device_type')
      .in('guardian_id', guardianIds)
      .eq('is_active', true);

    if (tokensErr) {
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve device tokens', details: tokensErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Construct Notification Copy (English & Marathi support)
    let title = custom_title;
    let message = custom_message;

    if (!title || !message) {
      if (event_type === 'CHECK_IN') {
        title = language === 'mr' ? 'शाळेत आगमन (Clock In)' : 'Safe Gate Entry Verified (Clock In)';
        message = language === 'mr'
          ? `${studentFullName} सकाळी/दुपारी ${timeFormatted} वाजता शाळेत हजर झाला आहे.`
          : `Your child ${studentFullName} has clocked IN safely at ${timeFormatted} via biometric face scanner.`;
      } else if (event_type === 'CHECK_OUT') {
        title = language === 'mr' ? 'शाळेतून प्रस्थान (Clock Out)' : 'Campus Departure Verified (Clock Out)';
        message = language === 'mr'
          ? `${studentFullName} दुपारी ${timeFormatted} वाजता शाळेतून बाहेर पडला आहे.`
          : `Your child ${studentFullName} has clocked OUT at ${timeFormatted} via Main Gate departure terminal.`;
      } else if (event_type === 'LATE') {
        title = language === 'mr' ? 'उशिरा आगमन इशारा (Late Arrival)' : 'Late Arrival Alert (Past Grace Period)';
        message = language === 'mr'
          ? `${studentFullName} सकाळी ${timeFormatted} वाजता उशिरा शाळेत दाखल झाला आहे.`
          : `Your child ${studentFullName} arrived late at school at ${timeFormatted} (post 08:45 AM cutoff).`;
      } else if (event_type === 'ABSENT') {
        title = language === 'mr' ? 'शाळेत अनुपस्थिती इशारा (Absence Alert)' : 'Urgent: Student Marked Absent Today';
        message = language === 'mr'
          ? `${studentFullName} आज शाळेत गैरहजर नोंदवला गेला आहे (कटऑफ वेळ सकाळी १०:००).`
          : `Your child ${studentFullName} has been marked ABSENT today. No biometric punch recorded before 10:00 AM.`;
      } else if (event_type === 'LEAVE_STATUS') {
        const isApproved = leave_status !== 'REJECTED';
        title = isApproved
          ? (language === 'mr' ? 'रजा मंजूर झाली' : 'Leave Request Approved by School')
          : (language === 'mr' ? 'रजा नामंजूर झाली' : 'Leave Request Rejected by School');
        message = isApproved
          ? (language === 'mr' ? `${studentFullName} ची रजा मंजूर करण्यात आली आहे.` : `The leave application for ${studentFullName} has been approved by the school.`)
          : (language === 'mr' ? `${studentFullName} चा रजेचा अर्ज नामंजूर करण्यात आला आहे.` : `The leave application for ${studentFullName} was reviewed and rejected.`);
      }
    }

    // 5. Store Persistent Notification Records in Supabase
    for (const gid of guardianIds) {
      await supabase.from('parent_notifications').insert({
        school_id: student.school_id,
        guardian_id: gid,
        student_id: student.id,
        title: title!,
        message: message!,
        notification_type: event_type,
        student_name: studentFullName,
        event_timestamp: new Date().toISOString(),
        metadata: {
          time: timeFormatted,
          event_type,
          language
        }
      });
    }

    // If no active push tokens registered yet, return early with recorded notification
    if (!deviceTokens || deviceTokens.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Notification saved to history. No active device tokens currently registered.',
          tokens_count: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Build Expo Push Payloads
    const pushMessages = deviceTokens.map((dt: any) => ({
      to: dt.expo_push_token,
      sound: 'default',
      title,
      body: message,
      channelId: 'attendance-alerts',
      priority: 'high',
      badge: 1,
      data: {
        student_id: student.id,
        student_name: studentFullName,
        type: event_type,
        screen: event_type === 'LEAVE_STATUS' ? 'LEAVE' : 'ATTENDANCE',
        timestamp: new Date().toISOString()
      }
    }));

    // 7. Dispatch to Expo Push API
    const expoResponse = await fetch(EXPO_PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pushMessages)
    });

    const expoResult = await expoResponse.json();

    // 8. Handle Invalid / Expired Tokens (Cleanup)
    const tickets = expoResult.data || [];
    const tokensToDeactivate: string[] = [];

    tickets.forEach((ticket: any, index: number) => {
      if (ticket.status === 'error') {
        console.warn(`[Expo Push Error]:`, ticket.message, ticket.details);
        if (ticket.details?.error === 'DeviceNotRegistered') {
          tokensToDeactivate.push(deviceTokens[index].expo_push_token);
        }
      }
    });

    if (tokensToDeactivate.length > 0) {
      await supabase
        .from('device_tokens')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('expo_push_token', tokensToDeactivate);
    }

    return new Response(
      JSON.stringify({
        success: true,
        delivered_tokens_count: pushMessages.length,
        tickets_count: tickets.length,
        deactivated_tokens_count: tokensToDeactivate.length,
        student_id: student.id,
        event_type
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

