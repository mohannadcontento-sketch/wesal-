'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import OTPInput from '@/components/auth/OTPInput';
import { KeyRound, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors group"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all">
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
            </div>
            رجوع
          </Link>
        </div>

        {/* Card */}
        <Card className="rounded-2xl shadow-lg border-0 p-6 sm:p-8">
          <CardContent className="p-0">
            {/* Icon header */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-white">
                <KeyRound className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                أكّد إيميلك
              </h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                رمز التأكيد اتبعت لـ{' '}
                <span className="font-semibold text-teal-600 break-all">{email || 'إيميلك'}</span>
              </p>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            {/* OTP Input */}
            <div className="mb-6">
              <OTPInput onComplete={handleVerify} disabled={loading || countdown > 0} />
            </div>

            {/* Verify button */}
            <Button
              className="w-full h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                'تأكيد'
              )}
            </Button>

            {/* Resend */}
            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-400">
                  إعادة إرسال الرمز بعد{' '}
                  <span className="text-teal-600 font-semibold tabular-nums">{countdown}</span>
                  {' '}ثانية
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors disabled:opacity-50"
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
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="mt-5 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-teal-600 transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
            رجوع للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-gray-100">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">جاري التحميل...</p>
          </div>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
