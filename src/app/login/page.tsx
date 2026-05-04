'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageTransition } from '@/components/animations/PageTransition';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

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
      router.push('/');
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
        router.push('/');
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

  if (authLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wesal-cream">
        <span className="material-symbols-outlined animate-spin text-[32px] text-wesal-dark">progress_activity</span>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen flex bg-wesal-cream">
      {/* ── Left Branding Panel (hidden on mobile) ── */}
      <div className="hidden md:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden gradient-hero text-white">
        {/* Floating glass elements */}
        <div className="absolute top-16 left-8 w-28 h-28 rounded-2xl glass-panel animate-float opacity-60 rotate-6" />
        <div className="absolute top-48 right-12 w-20 h-20 rounded-full glass-panel animate-float-slow opacity-40 -rotate-12" />
        <div className="absolute bottom-40 left-20 w-24 h-24 rounded-3xl glass-panel animate-float opacity-30 rotate-3" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-8 w-16 h-16 rounded-xl glass-panel animate-float-slow opacity-50 -rotate-6" style={{ animationDelay: '2s' }} />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-wesal-sky/10 rounded-full blur-[100px]" />

        {/* Logo & Description */}
        <div className="relative z-10 animate-fade-in-up">
          <div className="relative h-12 w-auto mb-6">
            <Image src="/logo.png" alt="وصال" width={196} height={67} className="object-contain" />
          </div>
          <p className="text-lg leading-relaxed text-white/75 max-w-sm">
            منصة متكاملة للصحة النفسية، تجمع بين الاحترافية السريرية والبيئة الداعمة لرحلة تعافيك.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="relative z-10 flex flex-col gap-6 mt-12 animate-fade-in-up stagger-2">
          <ScrollReveal direction="up" delay={0.2}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl glass-panel flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined filled text-wesal-ice">lock</span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">حماية بياناتك</h3>
              <p className="text-sm text-white/60">بياناتك مشفرة ومحمية بأعلى معايير الأمان العالمية.</p>
            </div>
          </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.25}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl glass-panel flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined filled text-wesal-ice">verified_user</span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">تواصل آمن</h3>
              <p className="text-sm text-white/60">جميع المحادثات والاستشارات مشفرة بالكامل.</p>
            </div>
          </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl glass-panel flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined filled text-wesal-ice">support_agent</span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">دعم متواصل</h3>
              <p className="text-sm text-white/60">فريق متخصص متاح على مدار الساعة لمساعدتك.</p>
            </div>
          </div>
          </ScrollReveal>
        </div>

        {/* Copyright */}
        <div className="relative z-10 mt-auto pt-6 text-sm text-white/40 animate-fade-in-up stagger-4">
          © ٢٠٢٤ وصال للصحة النفسية
        </div>
      </div>

      {/* ── Right Side: Login Form ── */}
      <div className="w-full md:w-7/12 flex flex-col justify-center p-6 md:p-12 lg:p-16 bg-wesal-cream">
        <div className="w-full max-w-md mx-auto animate-fade-in-up stagger-1">
          {/* Mobile Logo */}
          <div className="md:hidden mb-8 text-center">
            <div className="relative h-14 w-auto mx-auto mb-4 rounded-lg ring-1 ring-wesal-ice/50">
              <Image src="/logo.png" alt="وصال" width={196} height={67} className="object-contain" />
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block mb-8">
            <h2 className="text-[32px] font-bold text-wesal-navy mb-2">مرحباً بيك مجدداً</h2>
            <p className="text-base text-wesal-medium">سجل دخول لحسابك وواصل رحلتك نحو صحة نفسية أفضل.</p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center font-medium animate-scale-in">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-wesal-medium">البريد الإلكتروني</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">mail</span>
                <input
                  type="email"
                  placeholder="example@email.com"
                  dir="ltr"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                  className="w-full pl-3 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-wesal-medium">كلمة المرور</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-wesal-dark hover:text-wesal-medium transition-colors font-medium"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  className="w-full pl-10 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wesal-sky hover:text-wesal-medium transition-colors"
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
              className="mt-2 w-full py-3.5 px-6 rounded-xl bg-gradient-to-l from-wesal-dark to-wesal-medium text-white text-sm font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-base text-wesal-medium">
              مش عندك حساب؟{' '}
              <Link
                href="/register"
                className="text-wesal-dark font-bold hover:text-wesal-medium transition-colors underline decoration-wesal-medium/30 underline-offset-4"
              >
                سجل دلوقتي
              </Link>
            </p>
          </div>

          {/* Back link */}
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-wesal-medium hover:text-wesal-dark transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
