'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Mail, Lock, Eye, EyeOff, User, Stethoscope, Phone, Shield,
  Loader2, ArrowLeft, UserCircle, GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-600 to-teal-700">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            انضم لوصال
          </h1>
          <p className="text-white/60 mt-1">
            اعمل حساب جديد في ثواني
          </p>
        </div>

        {/* Card */}
        <Card className="rounded-2xl shadow-lg border-0 p-6 sm:p-8">
          <CardContent className="p-0">
            {/* Error message */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            {/* Tab switch */}
            <div className="flex gap-1 p-1 rounded-xl bg-gray-100 mb-6">
              <button
                type="button"
                onClick={() => { setActiveTab('user'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                  ${activeTab === 'user'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Stethoscope className="w-4 h-4" />
                طبيب
              </button>
            </div>

            {/* User form */}
            {activeTab === 'user' ? (
              <form onSubmit={handleUserRegister} className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">اسم المستخدم</Label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="cool_user23"
                      value={userForm.username}
                      onChange={(e) => { setUserForm({ ...userForm, username: e.target.value }); setErrorMsg(''); }}
                      className="h-12 rounded-lg border-gray-200 pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">الإيميل</Label>
                  <div className="relative">
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={userForm.email}
                      onChange={(e) => { setUserForm({ ...userForm, email: e.target.value }); setErrorMsg(''); }}
                      className="h-12 rounded-lg border-gray-200 pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">رقم الموبايل</Label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={userForm.phone}
                      onChange={(e) => { setUserForm({ ...userForm, phone: e.target.value }); setErrorMsg(''); }}
                      className="h-12 rounded-lg border-gray-200 pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="6 أحرف على الأقل"
                      value={userForm.password}
                      onChange={(e) => { setUserForm({ ...userForm, password: e.target.value }); setErrorMsg(''); }}
                      className="h-12 rounded-lg border-gray-200 pr-11 pl-11"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                {/* Privacy note */}
                <div className="flex items-start gap-3 rounded-xl bg-teal-50 p-4 border border-teal-100">
                  <Shield className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    اسمك الحقيقي مش هيظهر لأي حد. اختار اسم مستعار وشارك براحتك.
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base"
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
                </Button>
              </form>
            ) : (
              <form onSubmit={handleDoctorRegister} className="space-y-4">
                {/* Real Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">الاسم الحقيقي</Label>
                  <div className="relative">
                    <UserCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="د. أحمد محمود"
                      value={doctorForm.realName}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, realName: e.target.value }); setErrorMsg(''); }}
                      className="h-12 rounded-lg border-gray-200 pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">التخصص</Label>
                  <div className="relative">
                    <GraduationCap className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="طب نفسي"
                      value={doctorForm.specialty}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, specialty: e.target.value }); setErrorMsg(''); }}
                      className="h-12 rounded-lg border-gray-200 pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">الإيميل</Label>
                  <div className="relative">
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="doctor@hospital.com"
                      value={doctorForm.email}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, email: e.target.value }); setErrorMsg(''); }}
                      className="h-12 rounded-lg border-gray-200 pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">رقم الموبايل</Label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={doctorForm.phone}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, phone: e.target.value }); setErrorMsg(''); }}
                      className="h-12 rounded-lg border-gray-200 pr-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="6 أحرف على الأقل"
                      value={doctorForm.password}
                      onChange={(e) => { setDoctorForm({ ...doctorForm, password: e.target.value }); setErrorMsg(''); }}
                      className="h-12 rounded-lg border-gray-200 pr-11 pl-11"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                {/* Doctor note */}
                <div className="flex items-start gap-3 rounded-xl bg-teal-50 p-4 border border-teal-100">
                  <Stethoscope className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    هنتحقق من مؤهلاتك الطبية قبل ما حسابك يظهر كطبيب موثوق.
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base"
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
                </Button>
              </form>
            )}

            {/* Login link */}
            <div className="mt-6 text-center text-sm text-gray-500">
              عندك حساب؟{' '}
              <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors inline-flex items-center gap-1">
                سجل دخول
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back link */}
        <div className="mt-5 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            رجوع للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
