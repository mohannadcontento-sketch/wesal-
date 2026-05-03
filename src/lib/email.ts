/**
 * Email Service — sends OTP verification emails via Resend.
 *
 * Resend is the same email provider that Supabase Edge Functions use under the hood.
 *
 * Setup:
 *   1. Create a free account at https://resend.com (100 emails/day free)
 *   2. Get your API key from the dashboard
 *   3. Set in .env.local:
 *      RESEND_API_KEY=re_xxxxxxxxxxxxx
 *      EMAIL_FROM=Wesal <noreply@wesal-omega.vercel.app>
 */

import { Resend } from 'resend'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendEmailResult {
  success: boolean
  method: 'resend' | 'console-fallback'
  error?: string
}

// ─── Resend Client (lazy init) ───────────────────────────────────────────────

let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  if (resendClient) return resendClient

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null

  resendClient = new Resend(apiKey)
  return resendClient
}

// ─── Email Template ──────────────────────────────────────────────────────────

function buildOtpHtml(otpCode: string): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>رمز التحقق — وصال</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #f0f5f4;
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      direction: rtl;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 460px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 67, 70, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #004346 0%, #006b70 50%, #508992 100%);
      padding: 40px 28px;
      text-align: center;
    }
    .logo {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      border-radius: 50%;
      width: 64px;
      height: 64px;
      line-height: 64px;
      margin-bottom: 12px;
      font-size: 28px;
    }
    .header h1 {
      color: #ffffff;
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .header p {
      color: rgba(255,255,255,0.8);
      font-size: 14px;
    }
    .body {
      padding: 36px 28px;
      text-align: center;
    }
    .greeting {
      color: #374151;
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 28px;
    }
    .otp-wrapper {
      display: inline-block;
      background: linear-gradient(135deg, #f0fdfa, #e6f7f5);
      border: 2px solid #99f6e4;
      border-radius: 16px;
      padding: 20px 48px;
      position: relative;
    }
    .otp-label {
      display: block;
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .otp-code {
      display: block;
      font-size: 40px;
      font-weight: 800;
      letter-spacing: 12px;
      color: #004346;
      direction: ltr;
      font-family: 'Courier New', monospace;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
      margin: 28px 0;
    }
    .note {
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.8;
    }
    .note strong {
      color: #6b7280;
    }
    .security-note {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fefce8;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 10px 16px;
      margin-top: 16px;
      font-size: 12px;
      color: #92400e;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 28px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-brand {
      font-size: 14px;
      font-weight: 600;
      color: #004346;
      margin-bottom: 4px;
    }
    .footer-copy {
      font-size: 11px;
      color: #9ca3af;
    }
    .footer-links {
      margin-top: 8px;
    }
    .footer-links a {
      font-size: 11px;
      color: #508992;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌿</div>
      <h1>وصال</h1>
      <p>مساحتك الآمنة للصحة النفسية</p>
    </div>
    <div class="body">
      <p class="greeting">
        أهلاً بيك في <strong>وصال</strong>!<br />
        استخدم الكود ده عشان تفعّل حسابك:
      </p>
      <div class="otp-wrapper">
        <span class="otp-label">رمز التحقق</span>
        <span class="otp-code">${otpCode}</span>
      </div>
      <div class="divider"></div>
      <p class="note">
        الكود صالح لمدة <strong>10 دقائق</strong> بس.<br />
        لو مش إنت اللي طلبه، تجاهل الرسالة دي.
      </p>
      <div class="security-note">
        🔒 لا تشارك الكود ده مع حد
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">وصال — فريق الصحة النفسية</div>
      <div class="footer-copy">© ${new Date().getFullYear()} جميع الحقوق محفوظة</div>
    </div>
  </div>
</body>
</html>`
}

function buildOtpText(otpCode: string): string {
  return `وصال — رمز التحقق

رمز التحقق الخاص بك هو: ${otpCode}

هذا الرمز صالح لمدة 10 دقائق فقط.
إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.

— فريق وصال`
}

// ─── Send via Resend ──────────────────────────────────────────────────────────

async function sendViaResend(email: string, otpCode: string): Promise<SendEmailResult> {
  const resend = getResendClient()
  if (!resend) {
    return { success: false, method: 'resend', error: 'RESEND_API_KEY not set' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Wesal <onboarding@resend.dev>',
      to: [email],
      subject: 'وصال — رمز التحقق ✨',
      html: buildOtpHtml(otpCode),
      text: buildOtpText(otpCode),
    })

    if (error) {
      console.error('[Email] Resend error:', error.message)
      return { success: false, method: 'resend', error: error.message }
    }

    console.log(`[Email] Sent via Resend: ${data?.id} → ${email}`)
    return { success: true, method: 'resend' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown Resend error'
    console.error('[Email] Resend exception:', msg)
    return { success: false, method: 'resend', error: msg }
  }
}

// ─── Console Fallback ─────────────────────────────────────────────────────────

function consoleFallback(email: string, otpCode: string): SendEmailResult {
  console.log('')
  console.log('┌────────────────────────────────────────────────────────┐')
  console.log('│  📧 EMAIL FALLBACK — OTP Code (not actually sent)      │')
  console.log('├────────────────────────────────────────────────────────┤')
  console.log(`│  To:       ${email.padEnd(47)}│`)
  console.log(`│  Code:     ${otpCode.padEnd(47)}│`)
  console.log('│  Expiry:   10 minutes                                    │')
  console.log('├────────────────────────────────────────────────────────┤')
  console.log('│  ⚠️  RESEND_API_KEY not set — email not sent          │')
  console.log('│  Get a free key: https://resend.com                     │')
  console.log('│  Then add to .env.local: RESEND_API_KEY=re_xxx         │')
  console.log('└────────────────────────────────────────────────────────┘')
  console.log('')

  return { success: true, method: 'console-fallback' }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Send an OTP verification email to the given address.
 *
 * Uses Resend (same provider as Supabase Edge Functions) with console fallback.
 *
 * @returns {SendEmailResult} indicating which method was used and success status
 */
export async function sendOtpEmail(email: string, otpCode: string): Promise<SendEmailResult> {
  // Try Resend first (production)
  const resendResult = await sendViaResend(email, otpCode)
  if (resendResult.success) return resendResult

  console.warn(`[Email] Resend failed: ${resendResult.error}. Falling back to console.`)

  // Console fallback for development
  return consoleFallback(email, otpCode)
}
