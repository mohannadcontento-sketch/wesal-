'use client';

import { useState } from 'react';
import { Phone, Shield, Heart, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [nickname, setNickname] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showOtpSent, setShowOtpSent] = useState(false);

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setOtpSent(true);
      setShowOtpSent(true);
    }
  };

  const handleVerifyAndRegister = () => {
    if (otp.length === 6 && agreedToTerms) {
      onSuccess();
    }
  };

  const handleLogin = () => {
    if (phone.length >= 10 && otp.length === 6) {
      onSuccess();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setOtpSent(false);
    setOtp('');
    setPhone('');
    setNickname('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card max-w-md mx-4 p-0 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-l from-primary to-[#003638] p-6 text-center">
          <DialogHeader>
            <DialogTitle className="sr-only">تسجيل الدخول</DialogTitle>
            <DialogDescription className="sr-only">تسجيل حساب جديد أو تسجيل الدخول</DialogDescription>
          </DialogHeader>
          <WesalLogo size="lg" variant="light" />
          <p className="text-white/70 text-sm mt-3">
            رفيقك الذكي للصحة النفسية الآمنة
          </p>
        </div>

        <div className="p-6">
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="register" className="text-sm">حساب جديد</TabsTrigger>
              <TabsTrigger value="login" className="text-sm">تسجيل الدخول</TabsTrigger>
            </TabsList>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4 animate-fade-in">
              {/* Anonymous Badge */}
              <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3 mb-2">
                <Shield size={18} className="text-accent flex-shrink-0" />
                <p className="text-xs text-foreground/70">
                  التسجيل مجهول بالكامل — اسمك الحقيقي مش بيظهر لأي حد
                </p>
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">اسم مستعار</label>
                <Input
                  placeholder="اختار اسم مستعار يناسبك..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">رقم الموبايل</label>
                <div className="relative">
                  <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="٠١٠XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    className="pr-10 bg-background border-border text-foreground"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  الرقم بيتشفر فوراً ومش بيُخزّن كنص واضح
                </p>
              </div>

              {/* OTP */}
              {otpSent ? (
                <div className="space-y-2 animate-slide-up">
                  <label className="text-sm font-medium text-foreground">كود التأكيد</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="أدخل الكود الـ ٦ أرقام"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="bg-background border-border text-foreground text-center tracking-[0.5em] text-lg font-bold"
                    />
                  </div>
                  {showOtpSent && (
                    <p className="text-xs text-accent flex items-center gap-1 animate-fade-in">
                      <Check size={14} />
                      تم إرسال الكود — افحص رسائل الموبايل
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleSendOtp}
                  disabled={phone.length < 10}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-40"
                >
                  <Phone size={16} className="ml-2" />
                  إرسال كود التأكيد
                </Button>
              )}

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 accent-primary"
                />
                <label htmlFor="terms" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer">
                  أوافق على{' '}
                  <button className="text-accent underline">سياسة الخصوصية</button>
                  {' '}و{' '}
                  <button className="text-accent underline">شروط الاستخدام</button>
                  {' '}وبروتوكول الطوارئ
                </label>
              </div>

              {/* Submit */}
              <Button
                onClick={handleVerifyAndRegister}
                disabled={!otpSent || otp.length < 6 || !agreedToTerms || !nickname.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 py-5"
              >
                <Heart size={16} className="ml-2" />
                ابدأ رحلتك مع وصال
              </Button>

              <p className="text-center text-[10px] text-muted-foreground">
                مجاني بالكامل — بدون بطاقة ائتمان
              </p>
            </TabsContent>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 animate-fade-in">
              <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3 mb-2">
                <Shield size={18} className="text-accent flex-shrink-0" />
                <p className="text-xs text-foreground/70">
                  تسجيل دخول بأمان باستخدام رقم الموبايل
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">رقم الموبايل</label>
                <div className="relative">
                  <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="٠١٠XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    className="pr-10 bg-background border-border text-foreground"
                  />
                </div>
              </div>

              {/* OTP */}
              {otpSent ? (
                <div className="space-y-2 animate-slide-up">
                  <label className="text-sm font-medium text-foreground">كود التأكيد</label>
                  <Input
                    placeholder="أدخل الكود الـ ٦ أرقام"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="bg-background border-border text-foreground text-center tracking-[0.5em] text-lg font-bold"
                  />
                  {showOtpSent && (
                    <p className="text-xs text-accent flex items-center gap-1">
                      <Check size={14} />
                      تم إرسال الكود
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleSendOtp}
                  disabled={phone.length < 10}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-40"
                >
                  إرسال كود التأكيد
                </Button>
              )}

              <Button
                onClick={handleLogin}
                disabled={!otpSent || otp.length < 6}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 py-5"
              >
                تسجيل الدخول
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
