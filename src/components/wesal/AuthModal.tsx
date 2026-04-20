'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Phone, Shield, Heart, Check, Loader2, AlertCircle, ArrowRight, User, X } from 'lucide-react';
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
type AuthStep = 'phone' | 'otp' | 'nickname';

// ─── Component ────────────────────────────────────────────────
export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  // ── Form state ──
  const [activeTab, setActiveTab] = useState<ActiveTab>('register');
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [otp, setOtp] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // ── Flow state ──
  const [step, setStep] = useState<AuthStep>('phone');
  const [countdown, setCountdown] = useState(0);

  // ── Loading state ──
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // ── Error state ──
  const [phoneError, setPhoneError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // ── OTP Input Refs ──
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Countdown timer ──
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Helpers ──
  const isValidPhone = (p: string) => /^01[0-2,5]{1}[0-9]{8}$/.test(p.replace(/\s/g, ''));
  const cleanPhone = (p: string) => p.replace(/\s/g, '');

  const resetState = useCallback(() => {
    setPhone('');
    setNickname('');
    setOtp('');
    setStep('phone');
    setSendingOtp(false);
    setVerifying(false);
    setPhoneError('');
    setNicknameError('');
    setOtpError('');
    setGeneralError('');
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

  // ── Send OTP ──
  const handleSendOtp = async () => {
    setPhoneError('');
    setGeneralError('');

    // فحص Supabase
    if (!isSupabaseConfigured()) {
      setGeneralError('النظام مش متوصل بقاعدة البيانات بعد — تواصل مع الدعم');
      return;
    }

    // فحص الـ phone
    if (!isValidPhone(phone)) {
      setPhoneError('رقم الموبايل مش صحيح — لازم يبدأ بـ 010 أو 011 أو 012 أو 015');
      return;
    }

    // فحص الـ nickname للتسجيل
    if (activeTab === 'register') {
      if (!nickname.trim()) {
        setNicknameError('الرجاء اختيار اسم مستعار');
        return;
      }
      if (nickname.trim().length < 3) {
        setNicknameError('الاسم المستعار لازم 3 حروف على الأقل');
        return;
      }
    }

    setSendingOtp(true);
    try {
      const formattedPhone = '+20' + cleanPhone(phone);

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: activeTab === 'register' ? { nickname: nickname.trim() } : {},
        },
      });

      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          setGeneralError('انت محاول كتير — استنى دقيقتين وحاول تاني');
        } else if (error.message.includes('Invalid') || error.message.includes('format')) {
          setPhoneError('رقم الموبايل مش صحيح');
        } else {
          setGeneralError('حصل مشكلة أثناء إرسال الكود: ' + error.message);
        }
        return;
      }

      // نجاح — نتقل لخطوة إدخال الكود
      setStep('otp');
      setCountdown(60);
      setOtp('');
      setOtpError('');
    } catch {
      setGeneralError('مش قادر نوصل للسيرفر — تأكد إن الإنترنت شغال');
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async () => {
    setOtpError('');
    setGeneralError('');

    // فحص الـ OTP
    if (otp.length !== 6) {
      setOtpError('ادخل الكود كامل — 6 أرقام');
      return;
    }

    // فحص الشروط للتسجيل
    if (activeTab === 'register' && !agreedToTerms) {
      setGeneralError('لازم توافق على الشروط والسياسات عشان تكمل');
      return;
    }

    setVerifying(true);
    try {
      const formattedPhone = '+20' + cleanPhone(phone);

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setOtpError('الكود غلط أو انتهت صلاحيته — أعد إرسال كود جديد');
        } else {
          setOtpError('حصل مشكلة في التحقق — حاول تاني');
        }
        return;
      }

      // نجاح — المستخدم دخل
      // تحديث النickname في الـ profile لو التسجيل
      if (activeTab === 'register' && nickname.trim() && data.session) {
        try {
          await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({ nickname: nickname.trim() }),
          });
        } catch {
          // لو تحديث النickname فشل، مش مشكلة كبيرة
        }
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

    // Transfer focus to next input
    const nextIndex = Math.min(index + digits.length, 5);
    if (digits.length > 0 && nextIndex < 6) {
      otpRefs.current[nextIndex]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (result.length === 6) {
      setTimeout(() => {
        otpRefs.current[5]?.blur();
      }, 100);
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
    setSendingOtp(true);

    try {
      const formattedPhone = '+20' + cleanPhone(phone);
      const { error } = await supabase.auth.resend({
        type: 'sms',
        phone: formattedPhone,
      });

      if (error) {
        setGeneralError('مش قادر نعيد إرسال الكود — حاول بعد شوية');
        return;
      }

      setCountdown(60);
    } catch {
      setGeneralError('حصل مشكلة — حاول تاني');
    } finally {
      setSendingOtp(false);
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
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute left-3 top-3 sm:left-4 sm:top-4 text-white/60 hover:text-white transition-colors p-1"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>

          <DialogHeader>
            <DialogTitle className="sr-only">
              {step === 'otp' ? 'تأكيد رقم الموبايل' : 'تسجيل الدخول أو إنشاء حساب'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              وصال — منصتك للصحة النفسية الآمنة
            </DialogDescription>
          </DialogHeader>

          {step === 'otp' ? (
            <>
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                <Phone size={22} className="text-white/90" />
              </div>
              <p className="text-white/80 text-sm font-medium">
                تأكيد رقم الموبايل
              </p>
              <p className="text-white/50 text-xs mt-1" dir="ltr">
                +20 {cleanPhone(phone)}
              </p>
            </>
          ) : (
            <>
              <WesalLogo size="md" variant="light" />
              <p className="text-white/70 text-sm mt-2">
                رفيقك الذكي للصحة النفسية الآمنة
              </p>
            </>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* ═══════ OTP Step ═══════ */}
          {step === 'otp' ? (
            <div className="space-y-5 animate-fade-in">
              {/* Info badge */}
              <div className="bg-[#508991]/10 border border-[#508991]/20 rounded-xl p-3.5 flex items-start gap-3">
                <Shield size={16} className="text-[#508991] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/70 leading-relaxed">
                  دخلنا كود تأكيد على رقم الموبايل بتاعك. لو مكانتش لاقيه، افحص رسائل الـ Spam
                </p>
              </div>

              {/* Error banner */}
              {generalError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 leading-relaxed">{generalError}</p>
                </div>
              )}

              {/* OTP Digits Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block text-center">
                  كود التأكيد
                </label>
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
              <div className="text-center space-y-2">
                {countdown > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    ممكن تعيد الإرسال بعد{' '}
                    <span className="text-[#508991] font-medium tabular-nums">
                      {formatCountdown(countdown)}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={sendingOtp}
                    className="text-sm text-[#508991] hover:text-primary transition-colors font-medium disabled:opacity-50"
                  >
                    {sendingOtp ? 'جاري الإرسال...' : 'إعادة إرسال الكود'}
                  </button>
                )}
              </div>

              {/* Terms (register only) */}
              {activeTab === 'register' && (
                <div className="flex items-start gap-2.5 py-1">
                  <input
                    type="checkbox"
                    id="terms-verify"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      setGeneralError('');
                    }}
                    className="mt-0.5 accent-[#004346] h-4 w-4 rounded"
                  />
                  <label
                    htmlFor="terms-verify"
                    className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    أوافق على{' '}
                    <span className="text-[#508991] underline underline-offset-2">
                      سياسة الخصوصية
                    </span>{' '}
                    و{' '}
                    <span className="text-[#508991] underline underline-offset-2">
                      شروط الاستخدام
                    </span>
                  </label>
                </div>
              )}

              {/* Verify Button */}
              <Button
                onClick={handleVerifyOtp}
                disabled={
                  otp.length !== 6 ||
                  verifying ||
                  (activeTab === 'register' && !agreedToTerms)
                }
                className="w-full bg-[#004346] hover:bg-[#004346]/90 text-white disabled:opacity-40 h-12 rounded-xl text-sm font-medium"
              >
                {verifying ? (
                  <>
                    <Loader2 size={18} className="animate-spin ml-2" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <Check size={16} className="ml-2" />
                    تأكيد
                  </>
                )}
              </Button>

              {/* Back button */}
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setOtpError('');
                  setGeneralError('');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 py-1"
              >
                <ArrowRight size={14} className="rotate-180" />
                رجوع وتغيير الرقم
              </button>
            </div>
          ) : (
            /* ═══════ Phone + Register/Login Step ═══════ */
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as ActiveTab);
                resetState();
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-5 h-11 rounded-xl">
                <TabsTrigger value="register" className="text-sm rounded-lg">
                  حساب جديد
                </TabsTrigger>
                <TabsTrigger value="login" className="text-sm rounded-lg">
                  تسجيل الدخول
                </TabsTrigger>
              </TabsList>

              {/* ════════════════ Register Tab ════════════════ */}
              <TabsContent value="register" className="space-y-4 animate-fade-in mt-0">
                {/* Anonymous Badge */}
                <div className="bg-[#508991]/10 border border-[#508991]/20 rounded-xl p-3.5 flex items-center gap-3">
                  <Shield size={18} className="text-[#508991] flex-shrink-0" />
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    التسجيل مجهول بالكامل — اسمك الحقيقي مش بيظهر لأي حد
                  </p>
                </div>

                {/* Error banner */}
                {generalError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 leading-relaxed">{generalError}</p>
                  </div>
                )}

                {/* Nickname */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    اسم مستعار
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      placeholder="اختار اسم مستعار يناسبك..."
                      value={nickname}
                      onChange={(e) => {
                        setNickname(e.target.value);
                        setNicknameError('');
                      }}
                      autoComplete="nickname"
                      className="pr-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
                    />
                  </div>
                  {nicknameError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle size={13} className="flex-shrink-0" />
                      {nicknameError}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">رقم الموبايل</label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      placeholder="010XXXXXXXX"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 11));
                        setPhoneError('');
                      }}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      className="pr-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
                      dir="ltr"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      +20
                    </span>
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle size={13} className="flex-shrink-0" />
                      {phoneError}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Check size={12} className="text-[#508991]" />
                    الرقم بيتشفر فوراً ومش بيُخزّن كنص واضح
                  </p>
                </div>

                {/* Send OTP Button */}
                <Button
                  onClick={handleSendOtp}
                  disabled={
                    sendingOtp ||
                    !nickname.trim() ||
                    nickname.trim().length < 3 ||
                    !isValidPhone(phone)
                  }
                  className="w-full bg-[#508991] hover:bg-[#508991]/90 text-white disabled:opacity-40 h-12 rounded-xl text-sm font-medium"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 size={18} className="animate-spin ml-2" />
                      جاري إرسال الكود...
                    </>
                  ) : (
                    <>
                      <Phone size={16} className="ml-2" />
                      إرسال كود التأكيد
                    </>
                  )}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground pt-1">
                  مجاني بالكامل — بدون بطاقة ائتمان
                </p>
              </TabsContent>

              {/* ════════════════ Login Tab ════════════════ */}
              <TabsContent value="login" className="space-y-4 animate-fade-in mt-0">
                {/* Shield Badge */}
                <div className="bg-[#508991]/10 border border-[#508991]/20 rounded-xl p-3.5 flex items-center gap-3">
                  <Shield size={18} className="text-[#508991] flex-shrink-0" />
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    تسجيل دخول بأمان باستخدام كود على الموبايل
                  </p>
                </div>

                {/* Error banner */}
                {generalError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 leading-relaxed">{generalError}</p>
                  </div>
                )}

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">رقم الموبايل</label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      placeholder="010XXXXXXXX"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 11));
                        setPhoneError('');
                      }}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      className="pr-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
                      dir="ltr"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      +20
                    </span>
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                      <AlertCircle size={13} className="flex-shrink-0" />
                      {phoneError}
                    </p>
                  )}
                </div>

                {/* Send OTP Button */}
                <Button
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !isValidPhone(phone)}
                  className="w-full bg-[#508991] hover:bg-[#508991]/90 text-white disabled:opacity-40 h-12 rounded-xl text-sm font-medium"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 size={18} className="animate-spin ml-2" />
                      جاري إرسال الكود...
                    </>
                  ) : (
                    <>
                      <Phone size={16} className="ml-2" />
                      إرسال كود التأكيد
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
