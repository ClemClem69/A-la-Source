import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, serviceRoleKey);
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

function errorResponse(message: string) {
  return jsonResponse({ error: message });
}

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return errorResponse('Method not allowed');

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return errorResponse('Unauthorized');

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return errorResponse('Unauthorized');

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (adminProfile?.role !== 'admin') return errorResponse('Forbidden');

    const {
      email,
      password,
      fullName,
      companyName,
      siret,
      description,
      address,
      city,
      region,
      postalCode,
    } = await request.json();

    if (!email || !password || !fullName || !companyName || !siret) {
      return errorResponse('Nom, email, mot de passe, exploitation et SIRET sont obligatoires.');
    }
    if (password.length < 6) {
      return errorResponse('Le mot de passe doit contenir au moins 6 caractères.');
    }

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: String(email).trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'producer' },
    });
    if (createError || !created.user) {
      return errorResponse(createError?.message || 'Impossible de créer le compte producteur.');
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: created.user.id,
      email: created.user.email || String(email).trim().toLowerCase(),
      full_name: fullName,
      role: 'producer',
    }, { onConflict: 'id' });

    if (profileError) {
      await supabase.auth.admin.deleteUser(created.user.id);
      return errorResponse(profileError.message);
    }

    const { error: producerError } = await supabase.from('producers').insert({
      user_id: created.user.id,
      company_name: companyName,
      siret,
      description: description || null,
      address: address || null,
      city: city || null,
      region: region || null,
      postal_code: postalCode || null,
      certifications: [],
      status: 'active',
      logo_url: null,
      cover_url: null,
      farming_methods: null,
      delivery_zones: [],
    });

    if (producerError) {
      await supabase.auth.admin.deleteUser(created.user.id);
      return errorResponse(producerError.message);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Account creation failed.');
  }
});
