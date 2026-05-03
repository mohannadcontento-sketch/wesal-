'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/community');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('لازم تكتب الإيميل وكلمة المرور');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await login(email, password);
      setLoading(false);

      if (result.success) {
        toast.success('أهلاً بيك!');
        router.push('/community');
      } else if ((result as any).needsVerification) {
        toast.error('لازم تأكد إيميلك الأول');
        router.push(`/verify?email=${encodeURIComponent((result as any).email || email)}`);
      } else {
        setErrorMsg(result.error || 'الإيميل أو كلمة المرور غلط');
        toast.error(result.error || 'الإيميل أو كلمة المرور غلط');
      }
    } catch (err) {
      setLoading(false);
      const msg = 'حصل خطأ، جرب تاني';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-600 to-teal-700">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            مرحباً بيك
          </h1>
          <p className="text-white/60 mt-1">
            سجل دخول لحسابك
          </p>
        </div>

        {/* Card */}
        <Card className="rounded-2xl shadow-lg border-0 p-6 sm:p-8">
          <CardContent className="p-0">
            {/* Error message */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">الإيميل</Label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                    className="h-12 rounded-lg border-gray-200 pr-11"
                    required
                    autoComplete="email"
                    inputMode="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-900">كلمة المرور</Label>
                  <Link href="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                    className="h-12 rounded-lg border-gray-200 pr-11 pl-11"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base mt-2"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الدخول...
                  </>
                ) : (
                  'دخول'
                )}
              </Button>
            </form>

            {/* Register link */}
            <div className="mt-6 text-center text-sm text-gray-500">
              مش عندك حساب؟{' '}
              <Link href="/register" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors inline-flex items-center gap-1">
                سجل دلوقتي
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back link */}
        <div className="mt-5 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            رجوع للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
