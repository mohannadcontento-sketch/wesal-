-- ============================================================
-- وصال (Wesal) — إصلاح ترايجر التسجيل + إضافة عمود phone
-- ============================================================
-- ⚠️ ده كود إصلاح — انسخه كله والصقه في Supabase SQL Editor واضغط Run
-- ⚠️ مش هيحذف بياناتك الحالية — ده كود آمن
-- ============================================================


-- ============================================================
-- 1. إضافة عمود phone لو مش موجود
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.users ADD COLUMN phone TEXT;
  END IF;
END $$;


-- ============================================================
-- 2. حذف الترايجر القديم والفانكشن القديمة
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;


-- ============================================================
-- 3. إنشاء ترايجر جديد نظيف — بيشتغل مع Email Auth
--    وبيتعامل مع phone من user_metadata
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  anon_id_val TEXT;
  avatar_color_val TEXT;
  nickname_val TEXT;
  phone_val TEXT;
  phone_hash_val TEXT;
BEGIN
  -- نتحقق بس إن في إيميل (Email Auth)
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  -- بيانات عشوائية
  anon_id_val := 'مسافر #' || (floor(random() * 9000 + 1000))::int;
  avatar_color_val := (ARRAY[
    'bg-teal-100 text-teal-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-blue-100 text-blue-700'
  ])[floor(random() * 5 + 1)::int];

  -- الاسم المستعار من الـ metadata أو عشوائي
  nickname_val := COALESCE(
    NEW.raw_user_meta_data ->> 'username',
    anon_id_val
  );

  -- الموبايل من الـ metadata (لو موجود)
  phone_val := COALESCE(
    NEW.raw_user_meta_data ->> 'phone',
    NULL
  );

  -- تشفير الموبايل بـ SHA-256 (لو الموبايل موجود)
  IF phone_val IS NOT NULL AND length(phone_val) >= 10 THEN
    phone_hash_val := encode(digest(phone_val, 'sha256'), 'hex');
  ELSE
    phone_hash_val := NULL;
    phone_val := NULL;
  END IF;

  -- إنشاء الـ profile
  -- نستخدم الدوال من public schema علشان نتجنب مشاكل search_path
  INSERT INTO public.users (
    id,
    anon_id,
    email,
    phone,
    phone_hash,
    nickname,
    avatar_color,
    user_type,
    reputation_score,
    tier,
    streak_days,
    is_active
  ) VALUES (
    NEW.id,
    anon_id_val,
    NEW.email,
    phone_val,
    phone_hash_val,
    nickname_val,
    avatar_color_val,
    'patient',
    0,
    'new',
    0,
    true
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION
  -- لو حصل أي خطأ — نمنع الـ crash ونسمح بإنشاء الحساب
  WHEN OTHERS THEN
    RAISE LOG 'Wesal handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$;


-- ============================================================
-- 4. إنشاء الترايجر
-- ============================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 5. Indexes للبحث السريع (لو مش موجودة)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_banned ON public.users(is_banned);


-- ============================================================
-- ✅ تم الإصلاح!
--
-- اللي اتعمل:
-- 1. ✅ إضافة عمود phone (لو مش كان موجود)
-- 2. ✅ حذف الترايجر القديم تماماً
-- 3. ✅ إنشاء ترايجر جديد بيشتغل مع Email Auth
-- 4. ✅ يدعم phone من user_metadata
-- 5. ✅ تشفير الموبايل بـ SHA-256
-- 6. ✅ Exception handling — لو حصل خطأ مش هيمنع التسجيل
-- 7. ✅ Indexes للبحث السريع
--
-- جرّب تسجيل حساب جديد دلوقتي!
-- ============================================================
