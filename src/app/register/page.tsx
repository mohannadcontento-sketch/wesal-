'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageTransition } from '@/components/animations/PageTransition';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'user' | 'doctor'>('user');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [userForm, setUserForm] = useState({ username: '', email: '', phone: '', password: '' });
  const [doctorForm, setDoctorForm] = useState({ realName: '', email: '', phone: '', password: '', specialty: '' });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.password.length < 6) {
      setErrorMsg('كلمة المرور لازم تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await register({ ...userForm, type: 'user' });
      setLoading(false);
      if (result.success) {
        toast.success('تم إنشاء الحساب! هنتأكد من إيميلك');
        router.push(`/verify?email=${encodeURIComponent(userForm.email)}`);
      } else {
        setErrorMsg(result.error || 'حصل خطأ في التسجيل');
        toast.error(result.error || 'حصل خطأ في التسجيل');
      }
    } catch {
      setLoading(false);
      setErrorMsg('حصل خطأ، جرب تاني');
      toast.error('حصل خطأ، جرب تاني');
    }
  };

  const handleDoctorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (doctorForm.password.length < 6) {
      setErrorMsg('كلمة المرور لازم تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await register({ ...doctorForm, type: 'doctor' });
      setLoading(false);
      if (result.success) {
        toast.success('تم إنشاء الحساب! هنتأكد من إيميلك');
        router.push(`/verify?email=${encodeURIComponent(doctorForm.email)}`);
      } else {
        setErrorMsg(result.error || 'حصل خطأ في التسجيل');
        toast.error(result.error || 'حصل خطأ في التسجيل');
      }
    } catch {
      setLoading(false);
      setErrorMsg('حصل خطأ، جرب تاني');
      toast.error('حصل خطأ، جرب تاني');
    }
  };

  if (authLoading) {
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
        <div className="absolute top-12 left-6 w-24 h-24 rounded-2xl glass-panel animate-float opacity-50 -rotate-3" />
        <div className="absolute top-56 right-10 w-16 h-16 rounded-full glass-panel animate-float-slow opacity-40 rotate-6" />
        <div className="absolute bottom-48 left-16 w-20 h-20 rounded-3xl glass-panel animate-float opacity-30 rotate-12" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-28 right-6 w-14 h-14 rounded-xl glass-panel animate-float-slow opacity-45 -rotate-9" style={{ animationDelay: '2.5s' }} />

        {/* Decorative blurs */}
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
              <span className="material-symbols-outlined filled text-wesal-ice">shield</span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">خصوصية تامة</h3>
              <p className="text-sm text-white/60">بياناتك مشفرة ومحمية بأعلى معايير الأمان العالمية.</p>
            </div>
          </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.25}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl glass-panel flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined filled text-wesal-ice">favorite</span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">دعم مستمر</h3>
              <p className="text-sm text-white/60">فريق متخصص متاح للإجابة على استفساراتك وتقديم المساعدة.</p>
            </div>
          </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl glass-panel flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined filled text-wesal-ice">verified_user</span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">موثوقية وأمان</h3>
              <p className="text-sm text-white/60">أطباء معتمدون وبروتوكولات صارمة لضمان جودة الرعاية.</p>
            </div>
          </div>
          </ScrollReveal>
        </div>

        {/* Copyright */}
        <div className="relative z-10 mt-auto pt-6 text-sm text-white/40 animate-fade-in-up stagger-4">
          © ٢٠٢٤ وصال للصحة النفسية
        </div>
      </div>

      {/* ── Right Side: Register Form ── */}
      <div className="w-full md:w-7/12 flex flex-col justify-center p-6 md:p-12 lg:p-16 bg-wesal-cream overflow-y-auto">
        <div className="w-full max-w-md mx-auto animate-fade-in-up stagger-1">
          {/* Mobile Logo */}
          <div className="md:hidden mb-6 text-center">
            <div className="relative h-12 w-auto mx-auto mb-3 rounded-lg ring-1 ring-wesal-ice/50">
              <Image src="/logo.png" alt="وصال" width={196} height={67} className="object-contain" />
            </div>
          </div>

          <div className="mb-6 text-center md:text-right">
            <h2 className="text-[32px] font-bold text-wesal-navy mb-1 leading-tight tracking-tight">إنشاء حساب جديد</h2>
            <p className="text-base text-wesal-medium">انضم إلى مجتمع وصال وابدأ رحلتك نحو صحة نفسية أفضل.</p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center font-medium animate-scale-in">
              {errorMsg}
            </div>
          )}

          {/* Role Toggle */}
          <div className="flex p-1 bg-wesal-ice/60 rounded-xl mb-6 border border-wesal-ice">
            <button
              type="button"
              onClick={() => { setActiveTab('user'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300
                ${activeTab === 'user'
                  ? 'bg-white shadow-md text-wesal-dark'
                  : 'text-wesal-medium hover:text-wesal-dark'
                }
              `}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              مستخدم
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('doctor'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300
                ${activeTab === 'doctor'
                  ? 'bg-white shadow-md text-wesal-dark'
                  : 'text-wesal-medium hover:text-wesal-dark'
                }
              `}
            >
              <span className="material-symbols-outlined text-[20px]">medical_services</span>
              طبيب
            </button>
          </div>

          {/* ── User Form ── */}
          {activeTab === 'user' ? (
            <form onSubmit={handleUserRegister} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-wesal-medium">اسم المستخدم</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">account_circle</span>
                    <input
                      placeholder="أدخل اسم المستخدم"
                      value={userForm.username}
                      onChange={(e) => { setUserForm({ ...userForm, username: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-wesal-medium">البريد الإلكتروني</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">mail</span>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      dir="ltr"
                      value={userForm.email}
                      onChange={(e) => { setUserForm({ ...userForm, email: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-wesal-medium">رقم الجوال</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">phone_iphone</span>
                    <input
                      type="tel"
                      placeholder="05X XXX XXXX"
                      dir="ltr"
                      value={userForm.phone}
                      onChange={(e) => { setUserForm({ ...userForm, phone: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-wesal-medium">كلمة المرور</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={userForm.password}
                      onChange={(e) => { setUserForm({ ...userForm, password: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-10 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                      required
                      minLength={6}
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
              </div>

              {/* Privacy note */}
              <div className="flex items-start gap-2 mt-2 bg-wesal-ice/50 p-3.5 rounded-xl border border-wesal-ice">
                <span className="material-symbols-outlined text-wesal-dark text-sm mt-0.5 flex-shrink-0">info</span>
                <p className="text-xs text-wesal-navy/70 leading-relaxed">
                  بإنشاء حساب، أنت توافق على{' '}
                  <Link href="#" className="text-wesal-dark font-bold underline decoration-wesal-medium/30 underline-offset-4">الشروط والأحكام</Link>
                  {' '}و{' '}
                  <Link href="#" className="text-wesal-dark font-bold underline decoration-wesal-medium/30 underline-offset-4">سياسة الخصوصية</Link>
                  {' '}الخاصة بمنصة وصال. نحن نلتزم بحماية بياناتك الشخصية.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full py-3.5 px-6 rounded-xl bg-gradient-to-l from-wesal-dark to-wesal-medium text-white text-sm font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    إنشاء حساب
                    <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ── Doctor Form ── */
            <form onSubmit={handleDoctorRegister} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Real Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-wesal-medium">الاسم الحقيقي</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">badge</span>
                    <input
                      placeholder="د. أحمد محمود"
                      value={doctorForm.realName}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, realName: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-wesal-medium">التخصص</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">school</span>
                    <input
                      placeholder="طب نفسي"
                      value={doctorForm.specialty}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, specialty: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-wesal-medium">البريد الإلكتروني</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">mail</span>
                    <input
                      type="email"
                      placeholder="doctor@hospital.com"
                      dir="ltr"
                      value={doctorForm.email}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, email: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-wesal-medium">رقم الجوال</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">phone_iphone</span>
                    <input
                      type="tel"
                      placeholder="05X XXX XXXX"
                      dir="ltr"
                      value={doctorForm.phone}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, phone: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Password (full width) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-wesal-medium">كلمة المرور</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-wesal-sky text-[20px]">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={doctorForm.password}
                    onChange={(e) => { setDoctorForm({ ...doctorForm, password: e.target.value }); setErrorMsg(''); }}
                    className="w-full pl-10 pr-10 py-3.5 bg-white border border-wesal-ice rounded-xl focus:border-wesal-medium focus:ring-2 focus:ring-wesal-ice text-wesal-navy text-base outline-none transition-all placeholder:text-wesal-sky/50 disabled:opacity-50"
                    required
                    minLength={6}
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

              {/* Doctor note */}
              <div className="flex items-start gap-2 mt-2 bg-wesal-ice/50 p-3.5 rounded-xl border border-wesal-ice">
                <span className="material-symbols-outlined text-wesal-dark text-sm mt-0.5 flex-shrink-0">info</span>
                <p className="text-xs text-wesal-navy/70 leading-relaxed">
                  هنتحقق من مؤهلاتك الطبية قبل ما حسابك يظهر كطبيب موثوق على المنصة.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full py-3.5 px-6 rounded-xl bg-gradient-to-l from-wesal-dark to-wesal-medium text-white text-sm font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    إنشاء حساب دكتور
                    <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-base text-wesal-medium">
              لديك حساب؟{' '}
              <Link
                href="/login"
                className="text-wesal-dark font-bold hover:text-wesal-medium underline decoration-wesal-medium/30 underline-offset-4 transition-colors"
              >
                سجل دخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
