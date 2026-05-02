import { z } from 'zod/v4';

export const registerUserSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم لازم 3 أحرف على الأقل').max(30).optional(),
  email: z.email('إيميل غير صحيح'),
  phone: z.string().min(10, 'رقم موبايل غير صحيح'),
  password: z.string().min(6, 'كلمة المرور لازم 6 أحرف على الأقل'),
  type: z.enum(['user', 'doctor']),
  realName: z.string().min(2, 'الاسم لازم حرفين على الأقل').optional(),
  specialty: z.string().min(2, 'التخصص مطلوب').optional(),
}).refine((data) => {
  if (data.type === 'user') return !!data.username;
  if (data.type === 'doctor') return !!data.realName && !!data.specialty;
  return false;
}, {
  message: 'بيانات ناقصة',
});

export const loginSchema = z.object({
  email: z.email('إيميل غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export const otpSchema = z.object({
  email: z.email('إيميل غير صحيح'),
  code: z.string().length(6, 'الرمز لازم 6 أرقام'),
});

export const postSchema = z.object({
  content: z.string().min(1, 'اكتب شي').max(2000, 'الحد الأقصى 2000 حرف'),
  moods: z.string().default(''),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'اكتب تعليق').max(1000, 'الحد الأقصى 1000 حرف'),
  parentId: z.string().optional(),
});

export const appointmentSchema = z.object({
  doctorId: z.string().min(1),
  appointmentDate: z.string().min(1, 'اختار التاريخ'),
  reason: z.string().min(5, 'اكتب السبب').max(500),
});
