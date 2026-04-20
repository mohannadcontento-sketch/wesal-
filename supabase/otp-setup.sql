-- ============================================================
-- وصال (Wesal) — Email Auth Setup (Migration إضافي)
-- ============================================================
-- 👉 ده كود إضافي لو عندك schema.sql قديم — بس الأفضل تشغل schema.sql
--    الجديد اللي فيه كل حاجة (DROP IF EXISTS)
--
-- 📋 الخطوات:
-- 1. روح Supabase Dashboard → Authentication → Providers
-- 2. فعّل Email provider + Confirm email
-- 3. شغّل الكود ده في SQL Editor (أو شغل schema.sql الأفضل)
-- ============================================================


-- ============================================================
-- 1. إضافة عمود phone (رقم الموبايل الفعلي — للحظر)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;
END $$;


-- ============================================================
-- 2. تعديل الـ Trigger — يدعم Email Auth مع phone من metadata
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- التحقق إن المستخدم عنده email (Email Auth)
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  DECLARE
    anon_id_val TEXT;
    avatar_color_val TEXT;
    nickname_val TEXT;
    phone_val TEXT;
  BEGIN
    anon_id_val := 'مسافر #' || (floor(random() * 9000 + 1000))::int;
    avatar_color_val := (ARRAY['bg-teal-100 text-teal-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-blue-100 text-blue-700'])[floor(random() * 5 + 1)::int];
    nickname_val := COALESCE(NEW.raw_user_meta_data ->> 'username', anon_id_val);
    phone_val := NEW.raw_user_meta_data ->> 'phone';

    INSERT INTO public.users (
      id, anon_id, email, phone, phone_hash, nickname, avatar_color,
      user_type, reputation_score, tier, streak_days, is_active
    ) VALUES (
      NEW.id, anon_id_val, NEW.email, phone_val,
      CASE WHEN phone_val IS NOT NULL THEN encode(digest(phone_val, 'sha256'), 'hex') END,
      nickname_val, avatar_color_val,
      'patient', 0, 'new', 0, true
    )
    ON CONFLICT DO NOTHING;
  END;

  RETURN NEW;
END;
$$;

-- حذف الترايجر القديم لو موجود
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- إنشاء الترايجر الجديد
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 3. Indexes للبحث السريع عند الحظر
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(is_banned);


-- ============================================================
-- 4. RLS Policies
-- ============================================================
DROP POLICY IF EXISTS "insert_own_user" ON users;
CREATE POLICY "insert_own_user" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_user" ON users;
CREATE POLICY "update_own_user" ON users FOR UPDATE USING (auth.uid() = id);


-- ============================================================
-- ✅ تم! النظام جاهز لاستقبال التسجيلات
--
-- ملخص التغييرات:
-- 1. ✅ Trigger يدعم Email Auth مع phone من user_metadata
-- 2. ✅ عمود phone (للحظر) + phone_hash (للحماية)
-- 3. ✅ users.id = auth.users.id (بيخلي RLS يشتغل)
-- 4. ✅ Indexes للبحث السريع
-- 5. ✅ RLS policies معدّلة
-- ============================================================
