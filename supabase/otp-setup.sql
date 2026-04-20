-- ============================================================
-- وصال (Wesal) — OTP Auth Setup (Supabase Phone Auth)
-- ============================================================
-- 👉 ده كود إضافي للـ schema.sql الأساسي — شغّله بعد ما تشغل الـ schema الأساسي
--
-- 📋 الخطوات:
-- 1. روح Supabase Dashboard → Authentication → Providers
-- 2. فعّل Phone provider
-- 3. أعد SMS Provider (Twilio أو MessageBird)
-- 4. شغّل الكود ده في SQL Editor
-- ============================================================


-- ============================================================
-- 1. تعديل جدول users — إزالة UNIQUE constraint من phone_hash
--    (علشان الـ trigger يحتاج يضيف بدون مشاكل)
-- ============================================================

-- إزالة الـ constraint القديم لو موجود
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_hash_key;

-- السماح بقيم null في phone_hash للـ trigger
ALTER TABLE users ALTER COLUMN phone_hash DROP NOT NULL;


-- ============================================================
-- 2. Trigger: إنشاء user profile تلقائياً عند التسجيل
--    لما مستخدم جديد يسجل عن طريق Supabase Phone Auth
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- التحقق إن المستخدم عنده رقم موبايل
  IF NEW.phone IS NULL THEN
    RETURN NEW;
  END IF;

  -- تشفير رقم الموبايل
  DECLARE
    phone_hash_val TEXT;
    anon_id_val TEXT;
    avatar_color_val TEXT;
    nickname_val TEXT;
  BEGIN
    phone_hash_val := encode(digest(NEW.phone::text || COALESCE(current_setting('app.hash_salt', true), 'wesal-salt'), 'sha256'), 'hex');
    anon_id_val := 'مسافر #' || (floor(random() * 9000 + 1000))::int;
    avatar_color_val := (ARRAY['bg-teal-100 text-teal-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-blue-100 text-blue-700'])[floor(random() * 5 + 1)::int];
    nickname_val := COALESCE(
      NEW.raw_user_meta_data ->> 'nickname',
      anon_id_val
    );

    -- إنشاء الـ profile
    -- NOTE: users.id = auth.users.id (ده اللي بيخلي RLS يشتغل)
    INSERT INTO public.users (
      id,
      anon_id,
      phone_hash,
      nickname,
      avatar_color,
      user_type,
      reputation_score,
      tier,
      streak_days,
      is_active
    ) VALUES (
      NEW.id,           -- نفس الـ auth.users.id
      anon_id_val,
      phone_hash_val,
      nickname_val,
      avatar_color_val,
      'patient',        -- الدور الافتراضي
      0,
      'new',
      0,
      true
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
-- 3. تعديل RLS Policies — السماح بالـ INSERT عن طريق الـ Trigger
-- ============================================================

-- Users: السماح بالـ INSERT من الـ trigger (SECURITY DEFINER)
DROP POLICY IF EXISTS "insert_own_user" ON users;
CREATE POLICY "insert_own_user" ON users FOR INSERT WITH CHECK (true);

-- Users: السماح بالـ UPDATE عن طريق الـ API routes
DROP POLICY IF EXISTS "update_own_user" ON users;
CREATE POLICY "update_own_user" ON users FOR UPDATE USING (auth.uid() = id);


-- ============================================================
-- 4. تعديل RLS Policies لكل الجداول — استخدام auth.uid() صح
--    كل الـ policies دي بتعتمد على إن users.id = auth.users.id
-- ============================================================

-- Posts
DROP POLICY IF EXISTS "insert_own_post" ON posts;
CREATE POLICY "insert_own_post" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_post" ON posts;
CREATE POLICY "update_own_post" ON posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_post" ON posts;
CREATE POLICY "delete_own_post" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Comments
DROP POLICY IF EXISTS "insert_own_comment" ON comments;
CREATE POLICY "insert_own_comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_comment" ON comments;
CREATE POLICY "delete_own_comment" ON comments FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_comment" ON comments;
CREATE POLICY "update_own_comment" ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Post Reactions
DROP POLICY IF EXISTS "insert_own_reaction" ON post_reactions;
CREATE POLICY "insert_own_reaction" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reaction" ON post_reactions;
CREATE POLICY "delete_own_reaction" ON post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Tracker Logs
DROP POLICY IF EXISTS "select_own_tracker" ON tracker_logs;
CREATE POLICY "select_own_tracker" ON tracker_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tracker" ON tracker_logs;
CREATE POLICY "insert_own_tracker" ON tracker_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Consultations
DROP POLICY IF EXISTS "insert_consultation" ON consultations;
CREATE POLICY "insert_consultation" ON consultations FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Event Registrations
DROP POLICY IF EXISTS "insert_registration" ON event_registrations;
CREATE POLICY "insert_registration" ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_registration" ON event_registrations;
CREATE POLICY "delete_registration" ON event_registrations FOR DELETE USING (auth.uid() = user_id);

-- Safety Reports
DROP POLICY IF EXISTS "insert_report" ON safety_reports;
CREATE POLICY "insert_report" ON safety_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Saved Posts
DROP POLICY IF EXISTS "insert_saved" ON saved_posts;
CREATE POLICY "insert_saved" ON saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_saved" ON saved_posts;
CREATE POLICY "delete_saved" ON saved_posts FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- ✅ تم! النظام جاهز لاستقبال التسجيلات عن طريق Phone OTP
--
-- ملخص التغييرات:
-- 1. ✅ Trigger تلقائي لإنشاء user profile عند التسجيل
-- 2. ✅ users.id = auth.users.id (بيخلي RLS يشتغل)
-- 3. ✅ تشفير الموبايل بـ SHA-256
-- 4. ✅ nickname من الـ user_metadata أو تلقائي
-- 5. ✅ كل RLS policies معدّلة
-- ============================================================
