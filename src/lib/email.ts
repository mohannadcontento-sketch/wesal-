/**
 * Email Service — sends OTP verification emails.
 *
 * Strategy (in order of preference):
 *   1. Resend API directly (production — requires RESEND_API_KEY)
 *   2. Supabase Edge Function (production — requires Supabase project + deployed function)
 *   3. Console.log — development / unconfigured environments
 *
 * To enable email delivery:
 *
 * Option A — Resend Direct (RECOMMENDED - simplest):
 *   1. Create account at https://resend.com (free tier: 3,000 emails/month)
 *   2. Add your domain or use the free onboarding domain
 *   3. Set in .env.local:
 *      RESEND_API_KEY=re_xxxxxxxxxxxxx
 *      EMAIL_FROM=Wesal <noreply@wesal-omega.vercel.app>
 *
 * Option B — Supabase Edge Function:
 *   1. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *   2. Deploy: npx supabase functions deploy send-email
 *   3. Set RESEND_API_KEY in Supabase Dashboard → Settings → Edge Functions
 */

import { getSupabaseService, isSupabaseConfigured } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendEmailResult {
  success: boolean
  method: 'resend-api' | 'supabase-edge-function' | 'console-fallback'
  error?: string
}

interface EmailPayload {
  to: string
  subject: string
  htmlBody: string
  textBody: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildOtpEmailPayload(email: string, otpCode: string): EmailPayload {
  const subject = 'وصال — رمز التحقق'
  const textBody = `رمز التحقق الخاص بك هو: ${otpCode}\n\nهذا الرمز صالح لمدة 10 دقائق فقط.\nإذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.\n\n— فريق وصال`

  const htmlBody = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>رمز التحقق — وصال</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
    .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #004346, #508992); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px 24px; text-align: center; }
    .body p { color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px; }
    .otp-box { display: inline-block; background: #f0fdfa; border: 2px solid #99f6e4; border-radius: 12px; padding: 16px 40px; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #004346; direction: ltr; }
    .note { font-size: 13px; color: #9ca3af; margin-top: 24px; }
    .footer { background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>وصال</h1>
      <p>مساحتك الآمنة للصحة النفسية</p>
    </div>
    <div class="body">
      <p>مرحباً! رمز التحقق الخاص بك هو:</p>
      <div class="otp-box">${otpCode}</div>
      <p class="note">هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.<br />إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} وصال — فريق الصحة النفسية</p>
    </div>
  </div>
</body>
</html>`

  return { to: email, subject, htmlBody, textBody }
}

// ─── Method 1: Resend API (Direct) ───────────────────────────────────────────

async function sendViaResend(payload: EmailPayload): Promise<SendEmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return { success: false, method: 'resend-api', error: 'RESEND_API_KEY not set' }
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Wesal <onboarding@resend.dev>',
        to: [payload.to],
        subject: payload.subject,
        html: payload.htmlBody,
        text: payload.textBody,
      }),
    })

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text()
      console.error('[Email] Resend API error:', resendResponse.status, errorBody)
      return {
        success: false,
        method: 'resend-api',
        error: `Resend API ${resendResponse.status}: ${errorBody}`,
      }
    }

    const responseData = await resendResponse.json()
    console.log('[Email] Sent via Resend:', responseData.id)
    return { success: true, method: 'resend-api' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown Resend error'
    console.error('[Email] Resend exception:', msg)
    return { success: false, method: 'resend-api', error: msg }
  }
}

// ─── Method 2: Supabase Edge Function ────────────────────────────────────────

async function sendViaEdgeFunction(payload: EmailPayload): Promise<SendEmailResult> {
  if (!isSupabaseConfigured) {
    return { success: false, method: 'supabase-edge-function', error: 'Supabase not configured' }
  }

  try {
    const supabase = getSupabaseService()
    if (!supabase) {
      return { success: false, method: 'supabase-edge-function', error: 'Supabase client creation failed' }
    }

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload,
    })

    if (error) {
      console.error('[Email] Edge function error:', error.message || error)
      return {
        success: false,
        method: 'supabase-edge-function',
        error: typeof error === 'string' ? error : error.message || 'Edge function failed',
      }
    }

    return { success: true, method: 'supabase-edge-function' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown edge function error'
    console.error('[Email] Edge function exception:', msg)
    return { success: false, method: 'supabase-edge-function', error: msg }
  }
}

// ─── Method 3: Console Fallback ──────────────────────────────────────────────

function consoleFallback(email: string, otpCode: string): SendEmailResult {
  console.log('┌──────────────────────────────────────────────────────┐')
  console.log('│  📧 EMAIL FALLBACK — OTP Code (not actually sent)    │')
  console.log('├──────────────────────────────────────────────────────┤')
  console.log(`│  To:      ${email.padEnd(43)}│`)
  console.log(`│  Code:    ${otpCode.padEnd(43)}│`)
  console.log('│  Expiry:  10 minutes                                 │')
  console.log('├──────────────────────────────────────────────────────┤')
  console.log('│  To enable email delivery, set RESEND_API_KEY in     │')
  console.log('│  .env.local (get free key at https://resend.com)     │')
  console.log('└──────────────────────────────────────────────────────┘')

  return { success: true, method: 'console-fallback' }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Send an OTP verification email to the given address.
 *
 * Tries sending methods in order:
 *   1. Resend API (production, requires RESEND_API_KEY)
 *   2. Supabase Edge Function (production, requires Supabase project)
 *   3. Console log (development fallback — always succeeds)
 *
 * @returns {SendEmailResult} indicating which method was used and success status
 */
export async function sendOtpEmail(email: string, otpCode: string): Promise<SendEmailResult> {
  const payload = buildOtpEmailPayload(email, otpCode)

  // Method 1: Try Resend API directly (simplest, recommended)
  const resendResult = await sendViaResend(payload)
  if (resendResult.success) return resendResult

  console.warn(`[Email] Resend failed: ${resendResult.error}. Trying next method...`)

  // Method 2: Try Supabase Edge Function
  const edgeFnResult = await sendViaEdgeFunction(payload)
  if (edgeFnResult.success) return edgeFnResult

  console.warn(`[Email] Edge function failed: ${edgeFnResult.error}. Falling back to console.`)

  // Method 3: Console fallback (always succeeds for development)
  return consoleFallback(email, otpCode)
}
