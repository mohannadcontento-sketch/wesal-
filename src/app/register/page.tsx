'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
      router.push('/community');
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
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-6xl bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_0_rgba(0,67,70,0.1)] overflow-hidden flex flex-col md:flex-row min-h-[700px] md:min-h-[800px]">
        {/* Right Side: Branding & Features */}
        <div className="hidden md:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden gradient-primary text-on-primary">
          {/* Abstract background elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-tertiary-fixed rounded-full mix-blend-screen blur-[80px] opacity-20" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-inverse-primary rounded-full mix-blend-screen blur-[100px] opacity-30" />

          <div className="relative z-10">
            <h1 className="text-[40px] font-bold leading-tight tracking-tight mb-6">وصال</h1>
            <p className="text-lg leading-relaxed text-surface-variant max-w-sm">
              منصة متكاملة للصحة النفسية، تجمع بين الاحترافية السريرية والبيئة الداعمة لرحلة تعافيك.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-6 mt-12">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-on-primary/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                <span className="material-symbols-outlined filled text-tertiary-fixed">shield</span>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1">خصوصية تامة</h3>
                <p className="text-sm text-surface-variant opacity-90">بياناتك مشفرة ومحمية بأعلى معايير الأمان العالمية.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-on-primary/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                <span className="material-symbols-outlined filled text-tertiary-fixed">favorite</span>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1">دعم مستمر</h3>
                <p className="text-sm text-surface-variant opacity-90">فريق متخصص متاح للإجابة على استفساراتك وتقديم المساعدة.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-on-primary/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                <span className="material-symbols-outlined filled text-tertiary-fixed">verified_user</span>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1">موثوقية وأمان</h3>
                <p className="text-sm text-surface-variant opacity-90">أطباء معتمدون وبروتوكولات صارمة لضمان جودة الرعاية.</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-6 text-sm text-surface-variant opacity-70">
            © ٢٠٢٤ وصال للصحة النفسية
          </div>
        </div>

        {/* Left Side: Sign Up Form */}
        <div className="w-full md:w-7/12 p-6 md:p-12 lg:p-16 flex flex-col justify-center bg-surface-container-lowest">
          {/* Mobile Logo */}
          <div className="md:hidden mb-6 text-center">
            <div className="w-14 h-14 bg-primary-container rounded-xl flex items-center justify-center shadow-sm mx-auto mb-3">
              <span className="material-symbols-outlined filled text-on-primary text-[28px]">favorite</span>
            </div>
            <h1 className="text-2xl font-bold text-primary-container">Wesal</h1>
          </div>

          <div className="mb-6 text-center md:text-right">
            <h2 className="text-[32px] font-bold text-primary mb-1 leading-tight tracking-tight">إنشاء حساب جديد</h2>
            <p className="text-base text-on-surface-variant">انضم إلى مجتمع وصال وابدأ رحلتك نحو صحة نفسية أفضل.</p>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-error-container border border-error/20 text-error text-sm text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Role Toggle */}
          <div className="flex p-1 bg-surface-container rounded-lg mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('user'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all duration-200
                ${activeTab === 'user'
                  ? 'bg-surface-container-lowest shadow-sm text-primary'
                  : 'text-on-surface-variant opacity-70 hover:opacity-100'
                }
              `}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              مستخدم
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('doctor'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all duration-200
                ${activeTab === 'doctor'
                  ? 'bg-surface-container-lowest shadow-sm text-primary'
                  : 'text-on-surface-variant opacity-70 hover:opacity-100'
                }
              `}
            >
              <span className="material-symbols-outlined text-[20px]">medical_services</span>
              طبيب
            </button>
          </div>

          {/* User Form */}
          {activeTab === 'user' ? (
            <form onSubmit={handleUserRegister} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-on-surface-variant">اسم المستخدم</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">account_circle</span>
                    <input
                      placeholder="أدخل اسم المستخدم"
                      value={userForm.username}
                      onChange={(e) => { setUserForm({ ...userForm, username: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-on-surface-variant">البريد الإلكتروني</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      dir="ltr"
                      value={userForm.email}
                      onChange={(e) => { setUserForm({ ...userForm, email: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-on-surface-variant">رقم الجوال</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">phone_iphone</span>
                    <input
                      type="tel"
                      placeholder="05X XXX XXXX"
                      dir="ltr"
                      value={userForm.phone}
                      onChange={(e) => { setUserForm({ ...userForm, phone: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-on-surface-variant">كلمة المرور</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={userForm.password}
                      onChange={(e) => { setUserForm({ ...userForm, password: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-10 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                      required
                      minLength={6}
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
              </div>

              {/* Privacy note */}
              <div className="flex items-start gap-2 mt-2 bg-tertiary-fixed/20 p-3 rounded-lg border border-tertiary-fixed/30">
                <span className="material-symbols-outlined text-primary-container text-sm mt-0.5 flex-shrink-0">info</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  بإنشاء حساب، أنت توافق على{' '}
                  <Link href="#" className="text-primary font-bold underline decoration-primary/30 underline-offset-4">الشروط والأحكام</Link>
                  {' '}و{' '}
                  <Link href="#" className="text-primary font-bold underline decoration-primary/30 underline-offset-4">سياسة الخصوصية</Link>
                  {' '}الخاصة بمنصة وصال. نحن نلتزم بحماية بياناتك الشخصية.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full py-3 px-6 rounded-lg bg-gradient-to-l from-primary to-primary-container text-on-primary text-sm font-bold shadow-md hover:shadow-lg hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            /* Doctor Form */
            <form onSubmit={handleDoctorRegister} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Real Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-on-surface-variant">الاسم الحقيقي</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">badge</span>
                    <input
                      placeholder="د. أحمد محمود"
                      value={doctorForm.realName}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, realName: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-on-surface-variant">التخصص</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">school</span>
                    <input
                      placeholder="طب نفسي"
                      value={doctorForm.specialty}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, specialty: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-on-surface-variant">البريد الإلكتروني</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                    <input
                      type="email"
                      placeholder="doctor@hospital.com"
                      dir="ltr"
                      value={doctorForm.email}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, email: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-on-surface-variant">رقم الجوال</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">phone_iphone</span>
                    <input
                      type="tel"
                      placeholder="05X XXX XXXX"
                      dir="ltr"
                      value={doctorForm.phone}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, phone: e.target.value }); setErrorMsg(''); }}
                      className="w-full pl-3 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Password (full width) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface-variant">كلمة المرور</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={doctorForm.password}
                    onChange={(e) => { setDoctorForm({ ...doctorForm, password: e.target.value }); setErrorMsg(''); }}
                    className="w-full pl-10 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container text-base outline-none transition-all disabled:opacity-50"
                    required
                    minLength={6}
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

              {/* Doctor note */}
              <div className="flex items-start gap-2 mt-2 bg-tertiary-fixed/20 p-3 rounded-lg border border-tertiary-fixed/30">
                <span className="material-symbols-outlined text-primary-container text-sm mt-0.5 flex-shrink-0">info</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  هنتحقق من مؤهلاتك الطبية قبل ما حسابك يظهر كطبيب موثوق على المنصة.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full py-3 px-6 rounded-lg bg-gradient-to-l from-primary to-primary-container text-on-primary text-sm font-bold shadow-md hover:shadow-lg hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-base text-on-surface-variant">
              لديك حساب؟{' '}
              <Link
                href="/login"
                className="text-primary font-bold hover:text-primary-container underline decoration-primary/30 underline-offset-4 transition-colors"
              >
                سجل دخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
