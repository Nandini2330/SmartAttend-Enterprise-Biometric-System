// ==============================================================================
// SmartAttend: Meta WhatsApp Webhook Inbound Edge Function
// Endpoint: GET/POST /functions/v1/whatsapp-webhook
// ==============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const url = new URL(req.url);

  // 1. Handle Meta Webhook Verification Challenge (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const expectedToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'smartattend_meta_webhook_verify_token_secure';

    if (mode === 'subscribe' && token === expectedToken) {
      return new Response(challenge, { status: 200 });
    } else {
      return new Response('Forbidden', { status: 403 });
    }
  }

  // 2. Handle Inbound Delivery Status Callback (POST)
  if (req.method === 'POST') {
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const payload = await req.json();

      // Extract Meta statuses array
      const entries = payload.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const statuses = change.value?.statuses || [];
          for (const s of statuses) {
            const wamid = s.id;
            const status = s.status?.toUpperCase(); // 'DELIVERED', 'READ', 'FAILED'
            const timestamp = s.timestamp ? new Date(Number(s.timestamp) * 1000).toISOString() : new Date().toISOString();

            if (wamid && status) {
              const updates: Record<string, unknown> = {
                status,
                raw_webhook_payload: s
              };
              if (status === 'DELIVERED') updates.delivered_at = timestamp;
              if (status === 'READ') updates.read_at = timestamp;

              // Update delivery logs
              await supabase
                .from('notification_delivery_logs')
                .update(updates)
                .eq('whatsapp_message_id', wamid);

              // Also update parent job status if read/delivered
              const { data: logRecord } = await supabase
                .from('notification_delivery_logs')
                .select('job_id')
                .eq('whatsapp_message_id', wamid)
                .maybeSingle();

              if (logRecord?.job_id) {
                await supabase
                  .from('notification_jobs')
                  .update({ status, updated_at: timestamp })
                  .eq('id', logRecord.job_id);
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ status: 'EVENT_RECEIVED' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
});
