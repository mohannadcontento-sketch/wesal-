/**
 * Email Service — sends OTP verification emails via Supabase Edge Function.
 *
 * Architecture:
 *   Our Next.js app → calls Supabase Edge Function → which calls Resend API
 *
 * This way the Resend API key stays secure inside Supabase, not in our code.
 *
 * Setup:
 *   1. Go to your Supabase Dashboard
 *   2. Settings → API → copy the "anon public" key
 *   3. Set it in .env.local: NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 *   4. In Supabase Dashboard → Edge Functions → set secret: RESEND_API_KEY=re_xxx
 *      (get free Resend key from https://resend.com)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendEmailResult {
  success: boolean
  method: 'supabase' | 'console-fallback'
  error?: string
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
    .note strong { color: #6b7280; }
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

// ─── Send via Supabase Edge Function ──────────────────────────────────────────

async function sendViaSupabase(
  email: string,
  otpCode: string,
): Promise<SendEmailResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return {
      success: false,
      method: 'supabase',
      error: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set',
    }
  }

  try {
    const functionUrl = `${supabaseUrl}/functions/v1/send-email`

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        to: email,
        subject: 'وصال — رمز التحقق ✨',
        htmlBody: buildOtpHtml(otpCode),
        textBody: buildOtpText(otpCode),
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(
        `[Email] Supabase Edge Function error: ${response.status}`,
        errorBody,
      )
      return {
        success: false,
        method: 'supabase',
        error: `Edge Function ${response.status}: ${errorBody}`,
      }
    }

    const data = await response.json()
    console.log(`[Email] Sent via Supabase Edge Function: ${data.id} → ${email}`)
    return { success: true, method: 'supabase' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown Supabase error'
    console.error('[Email] Supabase exception:', msg)
    return { success: false, method: 'supabase', error: msg }
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
  console.log('│  ⚠️  Supabase Anon Key not set — email not sent       │')
  console.log('│  Get it from: Supabase Dashboard → Settings → API     │')
  console.log('└────────────────────────────────────────────────────────┘')
  console.log('')

  return { success: true, method: 'console-fallback' }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Send an OTP verification email via Supabase Edge Function.
 *
 * Flow: Next.js → Supabase Edge Function → Resend API
 *
 * The Resend API key is stored securely in Supabase secrets,
 * not exposed in our application code.
 *
 * @returns {SendEmailResult} indicating which method was used and success status
 */
export async function sendOtpEmail(
  email: string,
  otpCode: string,
): Promise<SendEmailResult> {
  // Try Supabase Edge Function first (production)
  const supabaseResult = await sendViaSupabase(email, otpCode)
  if (supabaseResult.success) return supabaseResult

  console.warn(
    `[Email] Supabase failed: ${supabaseResult.error}. Falling back to console.`,
  )

  // Console fallback for development
  return consoleFallback(email, otpCode)
}
