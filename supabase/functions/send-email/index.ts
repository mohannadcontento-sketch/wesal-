/**
 * Supabase Edge Function: send-email
 *
 * This function handles outgoing email delivery for the Wesal platform.
 * Deploy it to your Supabase project via:
 *
 *   supabase functions deploy send-email
 *
 * Required environment variables in Supabase Dashboard → Settings → Edge Functions:
 *   RESEND_API_KEY  — Your Resend.com API key
 *   EMAIL_FROM      — Sender address (e.g. "Wesal <noreply@wesal.app>")
 *
 * The function expects a JSON body:
 *   { to: string, subject: string, htmlBody: string, textBody: string }
 *
 * Uses Deno's native fetch — no external dependencies needed.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, htmlBody, textBody } = await req.json()

    if (!to || !subject || !htmlBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, htmlBody' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured in Edge Function env' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Wesal <noreply@wesal.app>'

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [to],
        subject,
        html: htmlBody,
        text: textBody || '',
      }),
    })

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text()
      console.error('Resend API error:', resendResponse.status, errorBody)
      return new Response(
        JSON.stringify({ error: `Resend API error: ${errorBody}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await resendResponse.json()
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
