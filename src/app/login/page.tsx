'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
      } else {
        setErrorMsg(result.error || 'الإيميل أو كلمة المرور غلط');
        toast.error(result.error || 'الإيميل أو كلمة المرور غلط');
      }
    } catch {
      setLoading(false);
      const msg = 'حصل خطأ، جرب تاني';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Right Side: Branding Panel (hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden gradient-primary text-on-primary">
        {/* Abstract background elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-tertiary-fixed rounded-full mix-blend-screen blur-[80px] opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-inverse-primary rounded-full mix-blend-screen blur-[100px] opacity-30" />

        {/* Logo & Description */}
        <div className="relative z-10">
          <h1 className="text-[40px] font-bold leading-tight tracking-tight mb-6">وصال</h1>
          <p className="text-lg leading-relaxed text-surface-variant max-w-sm">
            منصة متكاملة للصحة النفسية، تجمع بين الاحترافية السريرية والبيئة الداعمة لرحلة تعافيك.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="relative z-10 flex flex-col gap-6 mt-12">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-on-primary/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <span className="material-symbols-outlined filled text-tertiary-fixed">lock</span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">حماية بياناتك</h3>
              <p className="text-sm text-surface-variant opacity-90">بياناتك مشفرة ومحمية بأعلى معايير الأمان العالمية.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-on-primary/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <span className="material-symbols-outlined filled text-tertiary-fixed">verified_user</span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">تواصل آمن</h3>
              <p className="text-sm text-surface-variant opacity-90">جميع المحادثات والاستشارات مشفرة بالكامل.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-on-primary/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <span className="material-symbols-outlined filled text-tertiary-fixed">support_agent</span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">دعم متواصل</h3>
              <p className="text-sm text-surface-variant opacity-90">فريق متخصص متاح على مدار الساعة لمساعدتك.</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="relative z-10 mt-auto pt-6 text-sm text-surface-variant opacity-70">
          © ٢٠٢٤ وصال للصحة النفسية
        </div>
      </div>

      {/* Left Side: Login Form */}
      <div className="w-full md:w-7/12 flex flex-col justify-center p-6 md:p-12 lg:p-16 bg-surface-container-lowest">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="md:hidden mb-8 text-center">
            <div className="w-16 h-16 bg-primary-container rounded-xl flex items-center justify-center shadow-sm mx-auto mb-4">
              <span className="material-symbols-outlined filled text-on-primary text-[32px]">favorite</span>
            </div>
            <h1 className="text-[32px] font-bold text-primary-container">Wesal</h1>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block mb-8">
            <h2 className="text-[32px] font-bold text-primary mb-2">مرحباً بيك مجدداً</h2>
            <p className="text-base text-on-surface-variant">سجل دخول لحسابك وواصل رحلتك نحو صحة نفسية أفضل.</p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-error-container border border-error/20 text-error text-sm text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">البريد الإلكتروني</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                <input
                  type="email"
                  placeholder="example@email.com"
                  dir="ltr"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                  className="w-full pl-3 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-on-surface-variant">كلمة المرور</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary-container hover:text-primary transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  className="w-full pl-10 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-2 w-full py-3.5 px-6 rounded-lg bg-gradient-to-l from-primary to-primary-container text-on-primary text-sm font-bold shadow-md hover:shadow-lg hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  جاري الدخول...
                </>
              ) : (
                'دخول'
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-base text-on-surface-variant">
              مش عندك حساب؟{' '}
              <Link
                href="/register"
                className="text-primary font-bold hover:text-primary-container transition-colors underline decoration-primary/30 underline-offset-4"
              >
                سجل دلوقتي
              </Link>
            </p>
          </div>

          {/* Back link */}
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
