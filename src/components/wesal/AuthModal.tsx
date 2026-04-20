'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Shield, Heart, Check, Loader2, AlertCircle, ArrowRight, User, X, Mail, Lock, Eye, EyeOff, Phone, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WesalLogo } from './WesalLogo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────
interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type ActiveTab = 'register' | 'login';
type AuthStep = 'form' | 'otp';

// ─── Component ────────────────────────────────────────────────
export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  // ── Form state ──
  const [activeTab, setActiveTab] = useState<ActiveTab>('register');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // ── Flow state ──
  const [step, setStep] = useState<AuthStep>('form');
  const [countdown, setCountdown] = useState(0);

  // ── Loading state ──
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // ── Error state ──
  const [usernameError, setUsernameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // ── Success message ──
  const [successMessage, setSuccessMessage] = useState('');

  // ── OTP Input Refs ──
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Countdown timer ──
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Helpers ──
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidPassword = (p: string) => p.length >= 8;
  const isValidPhone = (p: string) => /^01[0-2,5]{1}[0-9]{8}$/.test(p.replace(/\s/g, ''));

  const formatPhoneDisplay = (p: string) => {
    const clean = p.replace(/\s/g, '');
    if (clean.length <= 4) return clean;
    if (clean.length <= 8) return clean.slice(0, 4) + ' ' + clean.slice(4);
    return clean.slice(0, 4) + ' ' + clean.slice(4, 8) + ' ' + clean.slice(8, 11);
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    setPhone(digits);
    setPhoneError('');
  };

  const resetState = useCallback(() => {
    setUsername('');
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setOtp('');
    setStep('form');
    setLoading(false);
    setVerifying(false);
    setUsernameError('');
    setPhoneError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setOtpError('');
    setGeneralError('');
    setSuccessMessage('');
    setAgreedToTerms(false);
    setCountdown(0);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    resetState();
  }, [onOpenChange, resetState]);

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ════════════════════════════════════════════════════════════
  //  REGISTER: إنشاء حساب جديد
  // ════════════════════════════════════════════════════════════
  const handleRegister = async () => {
    setUsernameError('');
    setPhoneError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    if (!isSupabaseConfigured()) {
      setGeneralError('النظام مش متوصل بقاعدة البيانات بعد — تواصل مع الدعم');
      return;
    }

    // Validation
    let hasError = false;
    if (!username.trim() || username.trim().length < 3) {
      setUsernameError('الاسم المستعار لازم 3 حروف على الأقل');
      hasError = true;
    }
    if (!isValidPhone(phone)) {
      setPhoneError('رقم الموبايل مش صحيح — لازم يبدأ بـ 01');
      hasError = true;
    }
    if (!isValidEmail(email)) {
      setEmailError('البريد الإلكتروني مش صحيح');
      hasError = true;
    }
    if (!isValidPassword(password)) {
      setPasswordError('كلمة المرور لازم 8 حروف على الأقل');
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('كلمتي المرور مش متطابقين');
      hasError = true;
    }
    if (!agreedToTerms) {
      setGeneralError('لازم توافق على الشروط والسياسات عشان تكمل');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      // أول حاجة: نتأكد إن الموبايل مش محظور
      const checkRes = await fetch('/api/auth/check-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\s/g, ''), email: email.trim() }),
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.blocked) {
          setGeneralError('حسابك محظور — لو حاسس إن ده غلط، تواصل مع فريق الدعم');
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim(),
            phone: phone.replace(/\s/g, ''),
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already in use')) {
          setEmailError('البريد ده مسجل بالفعل — سجّل دخول');
        } else if (error.message.includes('password')) {
          setPasswordError('كلمة المرور ضعيفة — لازم 8 حروف على الأقل');
        } else {
          setGeneralError('حصل مشكلة: ' + error.message);
        }
        return;
      }

      // لو Supabase اشتغل بنجاح
      if (data.user && !data.session) {
        // Email confirmation مطلوب — نتقل لخطوة الـ OTP
        // نحفظ الموبايل عشان نستخدمه لما نحدث الـ profile بعد التأكيد
        setStep('otp');
        setCountdown(60);
        setOtp('');
        setSuccessMessage('تم إرسال كود التأكيد على بريدك الإلكتروني');
      } else if (data.session) {
        // حساب مفعل تلقائياً (auto-confirm) — نحدث الـ phone في الـ profile
        try {
          await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({ nickname: username.trim(), phone: phone.replace(/\s/g, '') }),
          });
        } catch { /* ignore */ }
        onSuccess();
      }
    } catch {
      setGeneralError('مش قادر نوصل للسيرفر — تأكد إن الإنترنت شغال');
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  //  LOGIN: تسجيل دخول بالإيميل + الباسورد
  // ════════════════════════════════════════════════════════════
  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!isSupabaseConfigured()) {
      setGeneralError('النظام مش متوصل بقاعدة البيانات بعد');
      return;
    }

    let hasError = false;
    if (!isValidEmail(email)) {
      setEmailError('البريد الإلكتروني مش صحيح');
      hasError = true;
    }
    if (!password) {
      setPasswordError('كلمة المرور مطلوبة');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      // بعد تسجيل الدخول — نتأكد إن المستخدم مش محظور
      if (data.user && !error) {
        const blockRes = await fetch('/api/auth/check-block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: data.user.id }),
        });
        if (blockRes.ok) {
          const blockData = await blockRes.json();
          if (blockData.blocked) {
            // نطلعه بره علشان محظور
            await supabase.auth.signOut();
            setGeneralError('حسابك محظور — لو حاسس إن ده غلط، تواصل مع فريق الدعم');
            setLoading(false);
            return;
          }
        }
      }

      if (error) {
        if (error.message.includes('Invalid login') || error.message.includes('invalid credentials')) {
          setGeneralError('البريد أو كلمة المرور غلط');
        } else if (error.message.includes('Email not confirmed')) {
          // البريد مش متأكد — نتقل لخطوة الـ OTP
          setStep('otp');
          setCountdown(0);
          setOtp('');
          setSuccessMessage('لازم تؤكد بريدك الإلكتروني الأول — كود التأكيد أُرسل مرة أخرى');
          // نعيد إرسال التأكيد
          await supabase.auth.resend({
            type: 'signup',
            email: email.trim(),
          });
        } else {
          setGeneralError('حصل مشكلة: ' + error.message);
        }
        return;
      }

      onSuccess();
    } catch {
      setGeneralError('مش قادر نوصل للسيرفر');
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  //  VERIFY OTP — تأكيد الكود اللي وصل على الإيميل
  // ════════════════════════════════════════════════════════════
  const handleVerifyOtp = async () => {
    setOtpError('');
    setGeneralError('');

    if (otp.length !== 6) {
      setOtpError('ادخل الكود كامل — 6 أرقام');
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: 'email',
      });

      if (error) {
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setOtpError('الكود غلط أو انتهت صلاحيته — أعد الإرسال');
        } else {
          setOtpError('حصل مشكلة في التحقق — حاول تاني');
        }
        return;
      }

      // نجاح — تحديث الـ nickname و phone في الـ profile
      if (data.session && username.trim()) {
        try {
          await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({ nickname: username.trim(), phone: phone.replace(/\s/g, '') }),
          });
        } catch { /* ignore */ }
      }

      onSuccess();
    } catch {
      setGeneralError('حصل مشكلة — حاول تاني');
    } finally {
      setVerifying(false);
    }
  };

  // ── OTP digit input handler ──
  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '');
    const newOtp = otp.padEnd(6, '').split('');
    for (let i = 0; i < digits.length && (index + i) < 6; i++) {
      newOtp[index + i] = digits[i];
    }
    const result = newOtp.join('').slice(0, 6);
    setOtp(result);
    setOtpError('');
    const nextIndex = Math.min(index + digits.length, 5);
    if (digits.length > 0 && nextIndex < 6) {
      otpRefs.current[nextIndex]?.focus();
    }
    if (result.length === 6) {
      setTimeout(() => otpRefs.current[5]?.blur(), 100);
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtp('');
    setOtpError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (error) {
        setGeneralError('مش قادر نعيد إرسال الكود — حاول بعد شوية');
        return;
      }

      setCountdown(60);
      setSuccessMessage('تم إعادة إرسال كود التأكيد على بريدك');
    } catch {
      setGeneralError('حصل مشكلة');
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="bg-card sm:max-w-[440px] w-[calc(100%-1.5rem)] sm:w-full mx-auto p-0 overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-2xl"
        dir="rtl"
        showCloseButton={false}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-l from-[#004346] to-[#172A3A] px-5 py-5 sm:px-8 sm:py-6 text-center flex-shrink-0 relative">
          <button
            onClick={handleClose}
            className="absolute left-3 top-3 sm:left-4 sm:top-4 text-white/60 hover:text-white transition-colors p-1"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>

          <DialogHeader>
            <DialogTitle className="sr-only">تسجيل الدخول أو إنشاء حساب</DialogTitle>
            <DialogDescription className="sr-only">وصال — منصتك للصحة النفسية الآمنة</DialogDescription>
          </DialogHeader>

          {step === 'otp' ? (
            <>
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                <Mail size={22} className="text-white/90" />
              </div>
              <p className="text-white/80 text-sm font-medium">تأكيد البريد الإلكتروني</p>
              <p className="text-white/50 text-xs mt-1" dir="ltr">{email}</p>
            </>
          ) : (
            <>
              <WesalLogo size="md" variant="light" />
              <p className="text-white/70 text-sm mt-2">رفيقك الذكي للصحة النفسية الآمنة</p>
            </>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* ═══════════ OTP Verification Step ═══════════ */}
          {step === 'otp' ? (
            <div className="space-y-5 animate-fade-in">
              {/* Success message */}
              {successMessage && !generalError && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-700 leading-relaxed">{successMessage}</p>
                </div>
              )}

              {/* Info badge */}
              <div className="bg-[#508991]/10 border border-[#508991]/20 rounded-xl p-3.5 flex items-start gap-3">
                <Shield size={16} className="text-[#508991] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/70 leading-relaxed">
                  دخلنا كود تأكيد على بريدك الإلكتروني. لو مكانتش لاقيه، افحص مجلد الـ Spam أو Junk
                </p>
              </div>

              {/* Error */}
              {generalError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 leading-relaxed">{generalError}</p>
                </div>
              )}

              {/* OTP Digits */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block text-center">كود التأكيد</label>
                <div className="flex justify-center gap-2.5 sm:gap-3" dir="ltr">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp[i] || ''}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      onFocus={(e) => e.target.select()}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-background border-2 border-border rounded-xl focus:border-[#508991] focus:ring-2 focus:ring-[#508991]/20 outline-none transition-all text-foreground"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-xs text-red-500 flex items-center justify-center gap-1 animate-fade-in mt-2">
                    <AlertCircle size={13} className="flex-shrink-0" />
                    {otpError}
                  </p>
                )}
              </div>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    ممكن تعيد الإرسال بعد{' '}
                    <span className="text-[#508991] font-medium tabular-nums">{formatCountdown(countdown)}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-[#508991] hover:text-primary transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? 'جاري الإرسال...' : 'إعادة إرسال الكود'}
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || verifying}
                className="w-full bg-[#004346] hover:bg-[#004346]/90 text-white disabled:opacity-40 h-12 rounded-xl text-sm font-medium"
              >
                {verifying ? (
                  <><Loader2 size={18} className="animate-spin ml-2" />جاري التحقق...</>
                ) : (
                  <><Check size={16} className="ml-2" />تأكيد البريد الإلكتروني</>
                )}
              </Button>

              {/* Back */}
              <button
                type="button"
                onClick={() => { setStep('form'); setOtp(''); setOtpError(''); setGeneralError(''); setSuccessMessage(''); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 py-1"
              >
                <ArrowRight size={14} className="rotate-180" />
                رجوع
              </button>
            </div>
          ) : (
            /* ═══════════ Form Step (Register + Login) ═══════════ */
            <Tabs
              value={activeTab}
              onValueChange={(v) => { setActiveTab(v as ActiveTab); resetState(); }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-5 h-11 rounded-xl">
                <TabsTrigger value="register" className="text-sm rounded-lg">حساب جديد</TabsTrigger>
                <TabsTrigger value="login" className="text-sm rounded-lg">تسجيل الدخول</TabsTrigger>
              </TabsList>

              {/* ════════════ REGISTER TAB ════════════ */}
              <TabsContent value="register" className="space-y-3.5 animate-fade-in mt-0">
                <div className="bg-[#508991]/10 border border-[#508991]/20 rounded-xl p-3 flex items-center gap-3">
                  <Shield size={16} className="text-[#508991] flex-shrink-0" />
                  <p className="text-[11px] text-foreground/70 leading-relaxed">
                    بياناتك آمنة ومشفرة — هويتك بتكون مجهولة في المجتمع
                  </p>
                </div>

                {generalError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 leading-relaxed">{generalError}</p>
                  </div>
                )}

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">اسم مستعار</label>
                  <div className="relative">
                    <User size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="اختار اسم مستعار..."
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }}
                      autoComplete="username"
                      className="pr-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
                    />
                  </div>
                  {usernameError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle size={13} className="flex-shrink-0" />{usernameError}
                    </p>
                  )}
                </div>

                {/* Phone (required) */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    رقم الموبايل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="0101 234 5678"
                      value={formatPhoneDisplay(phone)}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      className="pr-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle size={13} className="flex-shrink-0" />{phoneError}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      type="email"
                      autoComplete="email"
                      className="pr-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle size={13} className="flex-shrink-0" />{emailError}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">كلمة المرور</label>
                  <div className="relative">
                    <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="٨ حروف على الأقل"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="pr-11 pl-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle size={13} className="flex-shrink-0" />{passwordError}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="أعد كتابة كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(''); }}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="pr-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
                    />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle size={13} className="flex-shrink-0" />{confirmPasswordError}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="terms-reg"
                    checked={agreedToTerms}
                    onChange={(e) => { setAgreedToTerms(e.target.checked); setGeneralError(''); }}
                    className="mt-0.5 accent-[#004346] h-4 w-4 rounded"
                  />
                  <label htmlFor="terms-reg" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer">
                    أوافق على{' '}
                    <span className="text-[#508991] underline underline-offset-2">سياسة الخصوصية</span>{' '}
                    و{' '}
                    <span className="text-[#508991] underline underline-offset-2">شروط الاستخدام</span>
                  </label>
                </div>

                {/* Register Button */}
                <Button
                  onClick={handleRegister}
                  disabled={loading || !username.trim() || !phone.trim() || !email.trim() || !password || !confirmPassword || !agreedToTerms}
                  className="w-full bg-[#508991] hover:bg-[#508991]/90 text-white disabled:opacity-40 h-12 rounded-xl text-sm font-medium"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin ml-2" />جاري إنشاء الحساب...</>
                  ) : (
                    <><Heart size={16} className="ml-2" />إنشاء حساب جديد</>
                  )}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground pt-0.5">
                  هتبعتلك كود تأكيد على بريدك الإلكتروني
                </p>
              </TabsContent>

              {/* ════════════ LOGIN TAB ════════════ */}
              <TabsContent value="login" className="space-y-4 animate-fade-in mt-0">
                <div className="bg-[#508991]/10 border border-[#508991]/20 rounded-xl p-3 flex items-center gap-3">
                  <Shield size={16} className="text-[#508991] flex-shrink-0" />
                  <p className="text-[11px] text-foreground/70 leading-relaxed">
                    تسجيل دخول بأمان باستخدام البريد وكلمة المرور
                  </p>
                </div>

                {generalError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 leading-relaxed">{generalError}</p>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      type="email"
                      autoComplete="email"
                      className="pr-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle size={13} className="flex-shrink-0" />{emailError}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">كلمة المرور</label>
                  <div className="relative">
                    <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="كلمة المرور بتاعتك"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="pr-11 pl-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle size={13} className="flex-shrink-0" />{passwordError}
                    </p>
                  )}
                </div>

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={loading || !email.trim() || !password}
                  className="w-full bg-[#004346] hover:bg-[#004346]/90 text-white disabled:opacity-40 h-12 rounded-xl text-sm font-medium"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin ml-2" />جاري تسجيل الدخول...</>
                  ) : (
                    <><Shield size={16} className="ml-2" />تسجيل الدخول</>
                  )}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground pt-0.5">
                  مجاني بالكامل — بدون بطاقة ائتمان
                </p>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
