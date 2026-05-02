'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import OTPInput from '@/components/auth/OTPInput';
import { KeyRound, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { verifyOtp, resendOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

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
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden px-4 py-8">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-50 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent-light/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-50/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-sm z-10"
      >
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors group"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-50 transition-all">
              <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
            </div>
            رجوع
          </Link>
        </motion.div>

        {/* Card */}
        <div className="rounded-2xl bg-card border border-border-light shadow-md p-6 sm:p-8">
          {/* Icon header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-white shadow-lg shadow-primary/20"
            >
              <KeyRound className="w-8 h-8" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-h3 text-foreground font-heading"
            >
              أكّد إيميلك
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-body-sm text-text-secondary mt-2 leading-relaxed"
            >
              رمز التأكيد اتبعت لـ{' '}
              <span className="font-semibold text-primary break-all">{email || 'إيميلك'}</span>
            </motion.p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-destructive-light border border-destructive/15 text-destructive text-sm text-center font-medium"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <OTPInput onComplete={handleVerify} disabled={loading || countdown > 0} />
          </div>

          {/* Verify button */}
          <button
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            onClick={() => {
              // Handled by OTPInput onComplete
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              'تأكيد'
            )}
          </button>

          {/* Resend */}
          <div className="mt-4 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-text-tertiary">
                إعادة إرسال الرمز بعد{' '}
                <span className="text-primary font-semibold tabular-nums">{countdown}</span>
                {' '}ثانية
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium transition-colors disabled:opacity-50"
              >
                {resendLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                إعادة إرسال الرمز
              </button>
            )}
          </div>
        </div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center"
        >
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-primary transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
            رجوع للصفحة الرئيسية
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-text-secondary">جاري التحميل...</p>
          </div>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
