'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

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
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center gradient-hero overflow-hidden px-4 py-8">
      {/* Decorative gradient circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-accent-light/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-primary-100/20 rounded-full blur-2xl animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
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
            مرحباً بيك
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-body-md mt-1"
          >
            سجل دخول لحسابك
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">الإيميل</label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                  className="input pr-11"
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
                <label className="text-sm font-semibold text-foreground">كلمة المرور</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary-hover font-medium transition-colors">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  className="input pr-11 pl-11"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
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
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full mt-2"
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
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center text-sm text-text-secondary">
            مش عندك حساب؟{' '}
            <Link href="/register" className="text-primary hover:text-primary-hover font-semibold transition-colors inline-flex items-center gap-1">
              سجل دلوقتي
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
