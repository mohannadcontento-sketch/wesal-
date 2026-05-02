'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Mail, Lock, Eye, EyeOff, User, Stethoscope, Phone, Shield,
  Loader2, ArrowLeft, UserCircle, GraduationCap,
} from 'lucide-react';

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
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center gradient-hero overflow-hidden px-4 py-8">
      {/* Decorative gradient circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/4 right-1/4 w-56 h-56 bg-primary-100/25 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '0.8s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-accent-light/30 rounded-full blur-2xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-3 mb-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8C14 8 10 12 10 16C10 20 14 22 20 28C26 22 30 20 30 16C30 12 26 8 20 8Z" fill="#73b3ce" opacity="0.9"/>
                <path d="M12 18C12 14 16 12 20 16C24 12 28 14 28 18C28 22 24 24 20 28C16 24 12 22 12 18Z" fill="#d6f3f4" opacity="0.7"/>
              </svg>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-extrabold text-white font-heading"
          >
            انضم لوصال
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-body-md mt-1"
          >
            اعمل حساب جديد في ثواني
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl bg-card border border-border-light shadow-md p-6 sm:p-8"
        >
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

          {/* Tab switch */}
          <div className="flex gap-1 p-1 rounded-xl bg-surface-container mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('user'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${activeTab === 'user'
                  ? 'gradient-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <User className="w-4 h-4" />
              مستخدم
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('doctor'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${activeTab === 'doctor'
                  ? 'gradient-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <Stethoscope className="w-4 h-4" />
              طبيب
            </button>
          </div>

          {/* Form content with animation */}
          <AnimatePresence mode="wait">
            {activeTab === 'user' ? (
              <motion.form
                key="user-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleUserRegister}
                className="space-y-4"
              >
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">اسم المستخدم</label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                    <input
                      placeholder="cool_user23"
                      value={userForm.username}
                      onChange={(e) => { setUserForm({ ...userForm, username: e.target.value }); setErrorMsg(''); }}
                      className="input pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">الإيميل</label>
                  <div className="relative">
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={userForm.email}
                      onChange={(e) => { setUserForm({ ...userForm, email: e.target.value }); setErrorMsg(''); }}
                      className="input pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">رقم الموبايل</label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={userForm.phone}
                      onChange={(e) => { setUserForm({ ...userForm, phone: e.target.value }); setErrorMsg(''); }}
                      className="input pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="6 أحرف على الأقل"
                      value={userForm.password}
                      onChange={(e) => { setUserForm({ ...userForm, password: e.target.value }); setErrorMsg(''); }}
                      className="input pr-11 pl-11"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                {/* Privacy note */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-50 p-4 border border-primary/10">
                  <Shield className="w-4.5 h-4.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    اسمك الحقيقي مش هيظهر لأي حد. اختار اسم مستعار وشارك براحتك.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    'إنشاء حساب'
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="doctor-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleDoctorRegister}
                className="space-y-4"
              >
                {/* Real Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">الاسم الحقيقي</label>
                  <div className="relative">
                    <UserCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                    <input
                      placeholder="د. أحمد محمود"
                      value={doctorForm.realName}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, realName: e.target.value }); setErrorMsg(''); }}
                      className="input pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">التخصص</label>
                  <div className="relative">
                    <GraduationCap className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                    <input
                      placeholder="طب نفسي"
                      value={doctorForm.specialty}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, specialty: e.target.value }); setErrorMsg(''); }}
                      className="input pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">الإيميل</label>
                  <div className="relative">
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                    <input
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={doctorForm.email}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, email: e.target.value }); setErrorMsg(''); }}
                      className="input pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">رقم الموبايل</label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={doctorForm.phone}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, phone: e.target.value }); setErrorMsg(''); }}
                      className="input pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="6 أحرف على الأقل"
                      value={doctorForm.password}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, password: e.target.value }); setErrorMsg(''); }}
                      className="input pr-11 pl-11"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                {/* Doctor note */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-50 p-4 border border-primary/10">
                  <Stethoscope className="w-4.5 h-4.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    هنتحقق من مؤهلاتك الطبية قبل ما حسابك يظهر كطبيب موثوق.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    'إنشاء حساب دكتور'
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Login link */}
          <div className="mt-6 text-center text-sm text-text-secondary">
            عندك حساب؟{' '}
            <Link href="/login" className="text-primary hover:text-primary-hover font-semibold transition-colors inline-flex items-center gap-1">
              سجل دخول
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center"
        >
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            رجوع للصفحة الرئيسية
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
