import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { Resend } from 'npm:resend@4.0.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const sender = Deno.env.get('CONTACT_FROM_EMAIL') || 'Mon marché futé <contact@monmarchefute.com>';
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    if (!Deno.env.get('RESEND_API_KEY')) {
      return jsonResponse({ error: 'RESEND_API_KEY est absente des secrets Supabase.' }, 500);
    }

    const authorization = request.headers.get('Authorization');
    if (!authorization) return jsonResponse({ error: 'Unauthorized' }, 401);

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') return jsonResponse({ error: 'Forbidden' }, 403);

    const { recipientEmail, recipientName, subject, reply } = await request.json();
    if (!recipientEmail || !reply) {
      return jsonResponse({ error: 'Recipient email and reply are required.' }, 400);
    }

    const { error } = await resend.emails.send({
      from: sender,
      to: recipientEmail,
      subject: `Réponse à votre message : ${subject}`,
      text: `Bonjour ${recipientName || ''},\n\n${reply}\n\nL'équipe Mon marché futé`,
    });

    if (error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Email sending failed.' }, 500);
  }
});
