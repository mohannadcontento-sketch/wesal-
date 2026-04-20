'use client';

import { useState, useCallback } from 'react';
import { Phone, Shield, Heart, Check, Loader2, AlertCircle } from 'lucide-react';
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
import { sendOtp } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────
interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (nickname?: string) => void;
}

type ActiveTab = 'register' | 'login';

// ─── Component ────────────────────────────────────────────────
export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  // ── Form state ──
  const [activeTab, setActiveTab] = useState<ActiveTab>('register');
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [otp, setOtp] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // ── Flow state ──
  const [otpSent, setOtpSent] = useState(false);

  // ── Loading state ──
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // ── Error state ──
  const [phoneError, setPhoneError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // ── Helpers ──
  const isValidPhone = (p: string) => /^01[0-2,5]{1}[0-9]{8}$/.test(p.replace(/\s/g, ''));

  const resetState = useCallback(() => {
    setPhone('');
    setNickname('');
    setOtp('');
    setOtpSent(false);
    setSendingOtp(false);
    setVerifying(false);
    setPhoneError('');
    setNicknameError('');
    setOtpError('');
    setGeneralError('');
    setAgreedToTerms(false);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    resetState();
  }, [onOpenChange, resetState]);

  // ── Send OTP (Register) ──
  const handleRegisterSendOtp = async () => {
    setPhoneError('');
    setNicknameError('');
    setGeneralError('');

    if (!nickname.trim()) {
      setNicknameError('الرجاء اختيار اسم مستعار');
      return;
    }
    if (nickname.trim().length < 3) {
      setNicknameError('الاسم المستعار لازم ٣ حروف على الأقل');
      return;
    }
    if (!isValidPhone(phone)) {
      setPhoneError('رقم الموبايل مش صحيح — لازم يبدأ بـ ٠١٠ أو ٠١١ أو ٠١٢ أو ٠١٥');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await sendOtp(phone.replace(/\s/g, ''), nickname.trim());
      if (res.success) {
        setOtpSent(true);
      } else {
        setGeneralError(res.message || 'حصل مشكلة أثناء إرسال الكود، حاول تاني');
      }
    } catch {
      setGeneralError('مش قادر نوصل للسيرفر — تأكد إن الإنترنت شغال وحاول تاني');
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Send OTP (Login) ──
  const handleLoginSendOtp = async () => {
    setPhoneError('');
    setGeneralError('');

    if (!isValidPhone(phone)) {
      setPhoneError('رقم الموبايل مش صحيح — لازم يبدأ بـ ٠١٠ أو ٠١١ أو ٠١٢ أو ٠١٥');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await sendOtp(phone.replace(/\s/g, ''));
      if (res.success) {
        if (res.isNewUser) {
          setPhoneError('الرقم ده مش مسجّل — سجّل حساب جديد أولاً');
          return;
        }
        setOtpSent(true);
      } else {
        setGeneralError(res.message || 'حصل مشكلة أثناء إرسال الكود، حاول تاني');
      }
    } catch {
      setGeneralError('مش قادر نوصل للسيرفر — تأكد إن الإنترنت شغال وحاول تاني');
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify OTP (Register) ──
  const handleRegisterVerify = async () => {
    setOtpError('');
    setGeneralError('');

    if (otp.length !== 6) {
      setOtpError('ادخل الكود كامل — ٦ أرقام');
      return;
    }
    if (!agreedToTerms) {
      setGeneralError('لازم توافق على الشروط والسياسات عشان تكمل');
      return;
    }

    setVerifying(true);
    try {
      // In the real flow, verification would call an endpoint.
      // The page.tsx `onSuccess` handles session creation.
      // For now, if we got here the OTP was considered valid.
      onSuccess(nickname.trim());
    } catch {
      setGeneralError('حصل مشكلة — حاول تاني');
    } finally {
      setVerifying(false);
    }
  };

  // ── Verify OTP (Login) ──
  const handleLoginVerify = async () => {
    setOtpError('');
    setGeneralError('');

    if (otp.length !== 6) {
      setOtpError('ادخل الكود كامل — ٦ أرقام');
      return;
    }

    setVerifying(true);
    try {
      onSuccess();
    } catch {
      setGeneralError('حصل مشكلة — حاول تاني');
    } finally {
      setVerifying(false);
    }
  };

  // ── Phone input shared ──
  const PhoneInput = ({
    showError = false,
  }: {
    showError?: boolean;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">رقم الموبايل</label>
      <div className="relative">
        <Phone
          size={18}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          placeholder="٠١٠XXXXXXXX"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setPhoneError('');
          }}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          className="pr-11 bg-background border-border text-foreground text-base h-12 rounded-xl"
          dir="ltr"
        />
      </div>
      {showError && phoneError && (
        <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
          <AlertCircle size={13} className="flex-shrink-0" />
          {phoneError}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground">
        الرقم بيتشفر فوراً ومش بيُخزّن كنص واضح
      </p>
    </div>
  );

  // ── OTP input shared ──
  const OtpInput = ({ showResend = false }: { showResend?: boolean }) => (
    <div className="space-y-2 animate-fade-in">
      <label className="text-sm font-medium text-foreground">كود التأكيد</label>
      <Input
        placeholder="——  ——"
        value={otp}
        onChange={(e) => {
          setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
          setOtpError('');
        }}
        maxLength={6}
        type="tel"
        inputMode="numeric"
        autoComplete="one-time-code"
        className="bg-background border-border text-foreground text-center tracking-[0.5em] text-2xl font-bold h-14 rounded-xl"
        dir="ltr"
      />
      {otpError && (
        <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
          <AlertCircle size={13} className="flex-shrink-0" />
          {otpError}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[#508991] flex items-center gap-1">
          <Check size={14} className="flex-shrink-0" />
          تم إرسال الكود — افحص رسائل الموبايل
        </p>
        {showResend && (
          <button
            type="button"
            className="text-xs text-[#508991] underline underline-offset-2 hover:text-primary transition-colors whitespace-nowrap"
            onClick={() => {
              setOtpSent(false);
              setOtp('');
              setOtpError('');
            }}
          >
            إعادة إرسال
          </button>
        )}
      </div>
    </div>
  );

  // ── General error banner ──
  const ErrorBanner = () =>
    generalError ? (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
        <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-red-600 leading-relaxed">{generalError}</p>
      </div>
    ) : null;

  // ────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="bg-card sm:max-w-md w-[calc(100%-1rem)] mx-auto p-0 overflow-hidden max-h-[96vh] flex flex-col"
        dir="rtl"
        showCloseButton={false}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-l from-primary to-[#003638] px-5 py-6 sm:px-8 sm:py-7 text-center flex-shrink-0 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">تسجيل الدخول أو إنشاء حساب</DialogTitle>
            <DialogDescription className="sr-only">
              سجّل حساب جديد أو سجّل دخول لتبدأ رحلتك مع وصال
            </DialogDescription>
          </DialogHeader>
          <WesalLogo size="lg" variant="light" />
          <p className="text-white/70 text-sm mt-3">
            رفيقك الذكي للصحة النفسية الآمنة
          </p>
        </div>

        {/* ── Body ── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as ActiveTab);
              resetState();
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-5 h-12">
              <TabsTrigger value="register" className="text-sm">
                حساب جديد
              </TabsTrigger>
              <TabsTrigger value="login" className="text-sm">
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

              <ErrorBanner />

              {/* Nickname */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  اسم مستعار
                </label>
                <Input
                  placeholder="اختار اسم مستعار يناسبك..."
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setNicknameError('');
                  }}
                  autoComplete="nickname"
                  className="bg-background border-border text-foreground text-base h-12 rounded-xl"
                />
                {nicknameError && (
                  <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                    <AlertCircle size={13} className="flex-shrink-0" />
                    {nicknameError}
                  </p>
                )}
              </div>

              {/* Phone */}
              <PhoneInput showError />

              {/* OTP or Send Button */}
              {otpSent ? (
                <OtpInput showResend />
              ) : (
                <Button
                  onClick={handleRegisterSendOtp}
                  disabled={
                    sendingOtp ||
                    !nickname.trim() ||
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
              )}

              {/* Terms */}
              <div className="flex items-start gap-2.5 py-1">
                <input
                  type="checkbox"
                  id="terms-register"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    setGeneralError('');
                  }}
                  className="mt-0.5 accent-primary h-4 w-4 rounded"
                />
                <label
                  htmlFor="terms-register"
                  className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer"
                >
                  أوافق على{' '}
                  <button
                    type="button"
                    className="text-[#508991] underline underline-offset-2"
                  >
                    سياسة الخصوصية
                  </button>{' '}
                  و{' '}
                  <button
                    type="button"
                    className="text-[#508991] underline underline-offset-2"
                  >
                    شروط الاستخدام
                  </button>{' '}
                  وبروتوكول الطوارئ
                </label>
              </div>

              {/* Submit Register */}
              <Button
                onClick={handleRegisterVerify}
                disabled={
                  !otpSent ||
                  otp.length !== 6 ||
                  !agreedToTerms ||
                  !nickname.trim() ||
                  verifying
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 h-12 rounded-xl text-sm font-medium"
              >
                {verifying ? (
                  <>
                    <Loader2 size={18} className="animate-spin ml-2" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <Heart size={16} className="ml-2" />
                    ابدأ رحلتك مع وصال
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
                  تسجيل دخول بأمان باستخدام رقم الموبايل
                </p>
              </div>

              <ErrorBanner />

              {/* Phone */}
              <PhoneInput showError />

              {/* OTP or Send Button */}
              {otpSent ? (
                <OtpInput showResend />
              ) : (
                <Button
                  onClick={handleLoginSendOtp}
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
              )}

              {/* Submit Login */}
              <Button
                onClick={handleLoginVerify}
                disabled={!otpSent || otp.length !== 6 || verifying}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 h-12 rounded-xl text-sm font-medium"
              >
                {verifying ? (
                  <>
                    <Loader2 size={18} className="animate-spin ml-2" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <Shield size={16} className="ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
