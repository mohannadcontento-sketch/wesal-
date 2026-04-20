# وصال (Wesal) — دليل التوصيل بـ Supabase

## خطوات التوصيل (١٠ دقائق بس)

### الخطوة ١: إنشاء مشروع Supabase
1. روح على https://supabase.com واعمل حساب مجاني
2. اضغط **"New Project"**
3. اختار اسم المشروع: `wesal`
4. اختار المنطقة الأقرب ليك (افتراضي: Frankfurt)
5. اختار كلمة سر قوية للحصول على الـ Database
6. اضغط **"Create new project"** — استنى لحد ما يخلص (حوالي دقيقة)

---

### الخطوة ٢: تشغيل SQL Schema
1. من Supabase Dashboard → روح **"SQL Editor"** (من القائمة الجانبية)
2. اضغط **"+ New query"**
3. انسخ كل محتوى ملف `supabase/schema.sql` والصقه هناك
4. اضغط **"Run"** (أو Ctrl+Enter)
5. لو ظهرت رسالة **"Success"** → يبقى كل الجداول اتعملت ✅

**الجداول اللي اتعملت:**
| اسم الجدول | الوظيفة |
|---|---|
| `users` | بيانات المستخدمين (مجهولين) |
| `posts` | منشورات المجتمع |
| `comments` | تعليقات متداخلة |
| `post_reactions` | تفاعلات (لايك/مفيد/حفظ) |
| `tracker_logs` | سجل المزاج اليومي |
| `doctors` | بيانات الدكاترة المعتمدين |
| `consultations` | حجز الجلسات |
| `events` | الفعاليات والندوات |
| `event_registrations` | تسجيلات الفعاليات |
| `safety_reports` | بلاغات الأمان (immutable) |
| `reputation_logs` | سجل السمعة |
| `saved_posts` | المنشورات المحفوظة |

---

### الخطوة ٣: أخذ API Keys
1. من Supabase Dashboard → روح **"Settings"** (أيقونة الترس)
2. اضغط **"API"** من القائمة
3. هتلاقي:
   - **Project URL** (مثل: `https://abcdefgh.supabase.co`)
   - **anon public** key (مثل: `eyJhbGciOiJIUzI1NiIs...`)

---

### الخطوة ٤: إعداد Environment Variables
1. في جهازك (أو في Vercel)، أنشئ ملف `.env.local`
2. حط القيم دي:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-key-here  # اختياري
```

> لـ Gemini API Key (اختياري — للتحليل الذكي):
> 1. روح على https://aistudio.google.com/apikey
> 2. اعمل API Key مجاني
> 3. حطه في الـ `.env.local`

---

### الخطوة ٥: Deploy على Vercel (مجاني)
1. روح على https://vercel.com
2. اضغط **"Add New Project"**
3. اختار الـ GitHub repo: `mohannadcontento-sketch/wesal-`
4. في **"Environment Variables"** → أضف:
   - `NEXT_PUBLIC_SUPABASE_URL` = الـ URL من الخطوة ٣
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = الـ anon key من الخطوة ٣
   - `GEMINI_API_KEY` = (اختياري) الـ Gemini key
5. اضغط **"Deploy"** — وخلّيه يشتغل

---

## التوثيق

### الـ API Routes المتاحة:

| الـ Route | الطريقة | الوظيفة |
|---|---|---|
| `/api/auth` | POST | إرسال OTP + إنشاء حساب |
| `/api/posts` | GET | جلب المنشورات |
| `/api/posts` | POST | إنشاء منشور |
| `/api/posts/[id]` | POST | تفاعل (لايك/مفيد/حفظ) |
| `/api/posts/[id]/comments` | GET | جلب التعليقات |
| `/api/posts/[id]/comments` | POST | إضافة تعليق |
| `/api/tracker` | GET | جلب سجل المزاج |
| `/api/tracker` | POST | تسجيل مزاج |
| `/api/tracker/analyze` | POST | تحليل Gemini AI |
| `/api/consultations` | GET | جلب الدكاترة |
| `/api/consultations` | POST | حجز جلسة |
| `/api/events` | GET | جلب الفعاليات |
| `/api/events` | POST | تسجيل في فعالية |
| `/api/events` | DELETE | إلغاء تسجيل |
| `/api/safety` | POST | بلاغ أمان |

---

## ملاحظات مهمة

1. **الـ Free Tier في Supabase كافي لـ 1,000-2,000 مستخدم**
2. **لو Gemini API Key مش متوفر** → التراكر هيشتغل بتحليل Mock (بدون AI)
3. **كل البيانات محمية بـ RLS** — المستخدم يشوف بياناته بس
4. **بلاغات الأمان immutable** — حتى الأدمن ما يقدر يحذفها
5. **الدكاترة والفعاليات مدخلين كـ Seed Data** — تقدر تعدلهم من Supabase Dashboard
