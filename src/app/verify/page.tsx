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
    <div className="bg-surface relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-fixed/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-tertiary-fixed/30 blur-[150px]" />
      </div>

      {/* Verification Card */}
      <main className="relative z-10 w-full max-w-[480px] px-6">
        <div className="bg-surface-container-lowest/60 backdrop-blur-[24px] border border-white/50 rounded-3xl p-8 md:p-10 shadow-[0_16px_48px_-12px_rgba(0,43,45,0.08)] flex flex-col items-center text-center">
          {/* Key Icon Container */}
          <div className="w-20 h-20 rounded-full bg-secondary-container/40 border border-secondary-fixed/50 flex items-center justify-center mb-6 shadow-inner">
            <span className="material-symbols-outlined text-[36px] text-primary">key</span>
          </div>

          {/* Header */}
          <h1 className="text-[32px] font-bold text-on-surface mb-2 leading-tight tracking-tight">
            تأكيد البريد الإلكتروني
          </h1>
          <p className="text-base text-on-surface-variant mb-8 px-2 leading-relaxed">
            لقد أرسلنا رمزاً مكوناً من 6 أرقام إلى بريدك الإلكتروني{' '}
            <span className="font-semibold text-primary-container break-all">
              {email || 'إيميلك'}
            </span>
            . يرجى إدخاله أدناه لتأكيد حسابك.
          </p>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-5 w-full p-3.5 rounded-xl bg-error-container border border-error/20 text-error text-sm text-center font-medium">
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
                className="bg-gradient-to-l from-primary to-primary-container text-on-primary rounded-xl text-sm font-bold py-3.5 px-6 w-full hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(0,67,70,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <p className="text-sm text-on-surface-variant py-3.5 text-center">
                  إعادة إرسال الرمز بعد{' '}
                  <span className="text-primary-container font-semibold tabular-nums">{countdown}</span>
                  {' '}ثانية
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="border border-tertiary-fixed/80 bg-surface-container-lowest/30 text-on-surface rounded-xl text-sm font-bold py-3.5 px-6 w-full flex items-center justify-center gap-2 hover:bg-tertiary-fixed/10 transition-colors disabled:opacity-50"
                >
                  {resendLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                  )}
                  إعادة إرسال الرمز
                </button>
              )}
            </div>
          </form>

          {/* Back to Login Link */}
          <Link
            href="/login"
            className="mt-8 text-xs text-primary-container hover:text-primary transition-colors flex items-center gap-1.5"
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
        <div className="bg-surface relative min-h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary mb-3 block">progress_activity</span>
            <p className="text-sm text-on-surface-variant">جاري التحميل...</p>
          </div>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
