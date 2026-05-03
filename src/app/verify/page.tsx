'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import OTPInput from '@/components/auth/OTPInput';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { verifyOtp, resendOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpCode, setOtpCode] = useState('');

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = useCallback(async (code: string) => {
    if (code.length !== 6) {
      setErrorMsg('الرمز لازم 6 أرقام');
      return;
    }

    if (!email) {
      setErrorMsg('الإيميل مفقود، رجوع لصفحة التسجيل');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await verifyOtp(email, code);
      setLoading(false);

      if (result.success) {
        toast.success('تم تأكيد الإيميل! أهلاً بيك');
        router.push('/community');
      } else {
        setErrorMsg(result.error || 'الرمز غلط أو انتهى');
        toast.error(result.error || 'الرمز غلط أو انتهى');
      }
    } catch {
      setLoading(false);
      setErrorMsg('حصل خطأ، جرب تاني');
      toast.error('حصل خطأ، جرب تاني');
    }
  }, [email, verifyOtp, router]);

  const handleOTPChange = useCallback((code: string) => {
    setOtpCode(code);
  }, []);

  const handleConfirmClick = () => {
    if (otpCode.length === 6 && !loading) {
      handleVerify(otpCode);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('الإيميل مفقود');
      return;
    }
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      const result = await resendOtp(email);
      setResendLoading(false);

      if (result.success) {
        toast.success('تم إرسال رمز جديد لإيميلك');
        setCountdown(60);
      } else {
        toast.error((result as any).error || 'حصل خطأ في إرسال الرمز');
      }
    } catch {
      setResendLoading(false);
      toast.error('حصل خطأ');
    }
  };

  return (
    <div className="bg-wesal-cream relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Ambient Background Gradients ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-wesal-dark/10 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-wesal-sky/15 blur-[150px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[50%] w-[30vw] h-[30vw] rounded-full bg-wesal-ice/40 blur-[100px]" />
      </div>

      {/* ── Verification Card ── */}
      <main className="relative z-10 w-full max-w-[480px] px-6 animate-fade-in-up">
        <div className="glass-card rounded-3xl p-8 md:p-10 shadow-[0_16px_48px_-12px_rgba(0,67,70,0.1)] flex flex-col items-center text-center">
          {/* Key Icon Container */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-wesal-ice to-white border border-wesal-ice flex items-center justify-center mb-6 shadow-lg animate-pulse-glow">
            <span className="material-symbols-outlined text-[36px] text-wesal-dark">key</span>
          </div>

          {/* Header */}
          <h1 className="text-[28px] md:text-[32px] font-bold text-wesal-navy mb-2 leading-tight tracking-tight">
            تأكيد البريد الإلكتروني
          </h1>
          <p className="text-base text-wesal-medium mb-8 px-2 leading-relaxed">
            لقد أرسلنا رمزاً مكوناً من 6 أرقام إلى بريدك الإلكتروني{' '}
            <span className="font-semibold text-wesal-dark break-all">
              {email || 'إيميلك'}
            </span>
            . يرجى إدخاله أدناه لتأكيد حسابك.
          </p>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-5 w-full p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center font-medium animate-scale-in">
              {errorMsg}
            </div>
          )}

          {/* OTP Input Form */}
          <form className="w-full flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleConfirmClick(); }}>
            {/* 6-Digit Inputs (forced LTR for numbers) */}
            <div className="mb-1">
              <OTPInput
                onComplete={handleVerify}
                onChange={handleOTPChange}
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full mt-2">
              {/* Primary Button (Gradient) */}
              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="bg-gradient-to-l from-wesal-dark to-wesal-medium text-white rounded-xl text-sm font-bold py-3.5 px-6 w-full hover:brightness-110 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    جاري التحقق...
                  </>
                ) : (
                  'تأكيد'
                )}
              </button>

              {/* Secondary Button (Ghost) */}
              {countdown > 0 ? (
                <p className="text-sm text-wesal-medium py-3.5 text-center">
                  إعادة إرسال الرمز بعد{' '}
                  <span className="text-wesal-dark font-semibold tabular-nums">{countdown}</span>
                  {' '}ثانية
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="border border-wesal-ice bg-white/60 text-wesal-navy rounded-xl text-sm font-bold py-3.5 px-6 w-full flex items-center justify-center gap-2 hover:bg-wesal-ice/50 transition-colors disabled:opacity-50"
                >
                  {resendLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px] text-wesal-medium">refresh</span>
                  )}
                  إعادة إرسال الرمز
                </button>
              )}
            </div>
          </form>

          {/* Back to Login Link */}
          <Link
            href="/login"
            className="mt-8 text-xs text-wesal-dark hover:text-wesal-medium transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            رجوع لتسجيل الدخول
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-wesal-cream relative min-h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined animate-spin text-[32px] text-wesal-dark mb-3 block">progress_activity</span>
            <p className="text-sm text-wesal-medium">جاري التحميل...</p>
          </div>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
