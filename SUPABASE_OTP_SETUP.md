# وصال (Wesal) — دليل تفعيل نظام OTP (كود التأكيد على الموبايل)

## 🎯 ملخص سريع

النظام بيتعامل مع Supabase Auth Phone OTP — يعني كود تأكيد حقيقي بيترسل SMS على موبايل المستخدم.

---

## 📋 الخطوات (مقدرش أكثر من 15 دقيقة)

### الخطوة 1: تفعيل Phone Auth في Supabase

1. روح على **Supabase Dashboard** → اختار المشروع بتاعك
2. من القائمة الجانبية، اضغط على **Authentication**
3. اضغط على **Providers**
4. لقي **Phone** → فعّلها (Enable)
5. **خليها زي هي** — ماتعدلش حاجة تانية

> ⚠️ ملاحظة مهمة: Phone Auth في Supabase Free Tier مش متاح بدون SMS Provider مدفوع.

---

### الخطوة 2: إعداد SMS Provider

عندك خيارين:

#### الخيار A: Twilio (مُفضّل — سهل ومجاني للتجربة)

1. روح على https://www.twilio.com/try-twilio واعمل حساب
2. من Twilio Console → اضغط **Get a Trial Number**
3. خد الرقم بتاعك (مثلاً: `+1234567890`)
4. روح على **Messaging → Settings**
5. لقي:
   - **Account SID** (مثلاً: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token** (مثلاً: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

6. ارجع لـ **Supabase Dashboard** → **Authentication** → **Providers** → **Phone**
7. في خانة **Twilio**, حط:
   - **Account SID**: اللي من Twilio
   - **Auth Token**: اللي من Twilio
   - **Messaging Service SID** أو **From Number**: رقم الترايل بتاعك (مثلاً: `+1234567890`)
8. اضغط **Save**

> 💡 Twilio Trial مش بيحتاج بطاقة ائتمان — بس بيقدر يبعت لـ Verified Numbers بس

#### الخيار B: MessageBird (بديل)

1. روح على https://messagebird.com/ واعمل حساب
2. من Dashboard → خد **Access Key**
3. في Supabase → Phone Provider → اختار **MessageBird**
4. حط الـ Access Key و Originator
5. اضغط **Save**

---

### الخطوة 3: تشغيل SQL Migration

1. من Supabase Dashboard → روح **SQL Editor**
2. اضغط **"+ New query"**
3. انسخ كل محتوى ملف **`supabase/otp-setup.sql`** والصقه
4. اضغط **Run** (أو Ctrl+Enter)
5. لو ظهرت رسالة **"Success"** → تمام ✅

**الكود ده بيعمل:**
- Trigger تلقائي لإنشاء profile عند التسجيل
- `users.id = auth.users.id` (عشان RLS يشتغل)
- تشفير رقم الموبايل بـ SHA-256
- كل RLS policies معدّلة

---

### الخطوة 4: التحقق من Environment Variables

في Vercel (أو `.env.local`), تأكد إن عندك:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here  # اختياري — للتحليل الذكي
```

> ملاحظة: `HASH_SALT` مش محتاج تاني — الـ salt بيتحط في Supabase كـ `app.hash_salt`

---

### الخطوة 5: إعداد الـ Hash Salt (اختياري)

لو عايز تغير salt التشفير:

1. Supabase Dashboard → **Database** → **Settings**
2. في **Initialization**, حط:
   ```sql
   SET app.hash_salt = 'your-secret-salt-here';
   ```
3. أو في SQL Editor:
   ```sql
   ALTER DATABASE your_project_name SET app.hash_salt = 'your-secret-salt-here';
   ```

---

### الخطوة 6: تجربة النظام

1. افتح الموقع
2. اضغط **"ابدأ رحلتك"** أو **"تسجيل الدخول"**
3. في تبويب **"حساب جديد"**:
   - اختار اسم مستعار
   - حط رقم الموبايل (مثلاً: `01012345678`)
   - اضغط **"إرسال كود التأكيد"**
4. **هتلاقي SMS على الموبايل فيه 6 أرقام**
5. دخل الأرقام الـ 6
6. وافق على الشروط
7. اضغط **"تأكيد"** → هتدخل للمجتمع تلقائيًا!

> ⚠️ مع Twilio Trial: لازم توثّق رقمك الأول في Twilio (Verified Caller IDs)

---

## 🔧 مفاهيم فنية مهمة

### كيف بيشتغل النظام؟

```
المستخدم                        Supabase Auth                   SMS Provider
   |                                |                                |
   |── 1. أدخل رقم الموبايل ───────>|                                |
   |                                |── 2. أنشئ/تحقق من auth.users ──>|
   |                                |                                |── 3. أرسل SMS
   |                                |<───────────────────────────────|   (كود 6 أرقام)
   |<── 4. "تم إرسال الكود" ───────|                                |
   |                                |                                |
   |── 5. أدخل الكود ─────────────>|                                |
   |                                |── 6. تحقق من الكود ───────────>|
   |                                |<───────────────────────────────|
   |                                |── 7. Trigger → إنشاء profile   |
   |                                |    في جدول users                |
   |<── 8. Session + Token ─────────|                                |
   |                                |                                |
   |── 9. كل API calls بتكون معها ─>|                                |
   |    Authorization: Bearer xxx   |── 10. تحقق من JWT token ───────|
```

### التغييرات الرئيسية عن النظام القديم:

| القديم (Fake OTP) | الجديد (Real OTP) |
|---|---|
| لا يوجد SMS حقيقي | SMS حقيقي عن طريق Twilio/MessageBird |
| Session في الذاكرة (بتتمسح) | Session من Supabase Auth (persistent) |
| userId = crypto.randomUUID() | userId = auth.users.id |
| RLS مش شغال (auth.uid() = null) | RLS شغال (auth.uid() = user.id) |
| API routes ما بتتحققش | كل API routes بتتحقق من الـ JWT |

### هيكل الجلسة:

```
Supabase Auth (auth.users)
  └── id (UUID)
       └── users.id (نفس الـ ID)
            ├── anon_id: "مسافر #1234"
            ├── nickname: "اسم مستعار"
            ├── phone_hash: SHA-256(...)
            ├── user_type: "patient"
            └── ...
```

---

## 🚨 حل المشاكل

### مشكلة: "SMS provider not configured"

**الحل**: تأكد إنك شغّلت SMS Provider في الخطوة 2

### مشكلة: "Invalid phone number"

**الحل**: الرقم لازم يكون بصيغة `+20XXXXXXXXXX` — النظام بيعمل `+20` تلقائياً

### مشكلة: "Rate limit exceeded"

**الحل**: Supabase بتحدد عدد الـ OTP requests (عادة 6 في الساعة). انتظر ساعة.

### مشكلة: الـ RLS مش شغال

**الحل**: تأكد إنك شغّلت `supabase/otp-setup.sql` — الكود بيعدّل كل الـ policies

### مشكلة: الـ profile مش بي إنشأ

**الحل**: افتح Supabase SQL Editor وشغّل:
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
```
لو مفيش بيانات → الترايجر مش شغال. تأكد إنك شغّلت الـ SQL

### مشكلة: Session بتتمسح بعد refresh

**الحل**: النظام الجديد بيحفظ Session في:
1. Supabase cookies (تلقائي)
2. localStorage (كـ backup)
3. لو الاتنين اتمسحوا → `checkAuthSession()` بتحاول تستعيد الجلسة من Supabase Auth

---

## 💰 التكلفة

| Provider | التكلفة لكل SMS | التكلفة الشهرية (1000 مستخدم) |
|---|---|---|
| Twilio Trial | مجاني | مجاني (Verified numbers بس) |
| Twilio PayGo | ~$0.079 | ~$80 |
| MessageBird | ~$0.06 | ~$60 |
| Vonage | ~$0.05 | ~$50 |

> 💡 للمرحلة التجريبية: Twilio Trial كافي ومجاني

---

## ✅ Check-list النهائي

- [ ] Phone Auth مفعّل في Supabase
- [ ] SMS Provider معدّ (Twilio/MessageBird)
- [ ] `supabase/otp-setup.sql` منفّذ
- [ ] Environment Variables موجودة في Vercel
- [ ] جربت تسجيل جديد — SMS وصل
- [ ] جربت تسجيل دخول — Session اتحفظ
- [ ] جربت refresh الصفحة — لسه مسجل
- [ ] جربت إنشاء منشور — اشتغل
