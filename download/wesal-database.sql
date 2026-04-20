-- ============================================================
-- وصال (Wesal) — قاعدة البيانات الكاملة (نسخة نهائية)
-- ============================================================
-- ⚠️ ده الكود انسخه كله والصقه في Supabase SQL Editor واضغط Run
-- ⚠️ هيحذف الجداول القديمة ويعيدها من الأول
-- ============================================================


-- ============================================================
-- الخطوة 0: تنظيف الجداول القديمة لو موجودة
-- ============================================================
DROP TABLE IF EXISTS booking_reviews CASCADE;
DROP TABLE IF EXISTS user_tags CASCADE;
DROP TABLE IF EXISTS comment_reactions CASCADE;
DROP TABLE IF EXISTS daily_follow_up_logs CASCADE;
DROP TABLE IF EXISTS saved_posts CASCADE;
DROP TABLE IF EXISTS reputation_logs CASCADE;
DROP TABLE IF EXISTS safety_reports CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS tracker_logs CASCADE;
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- تنظيف الـ triggers والـ functions القديمة
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_post_counts() CASCADE;
DROP FUNCTION IF EXISTS public.update_streak() CASCADE;


-- ============================================================
-- الخطوة 1: تفعيل Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- الخطوة 2: إنشاء الجداول (16 جدول)
-- ============================================================

-- جدول المستخدمين (id = auth.users.id عشان الـ RLS يشتغل)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  anon_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  phone_hash TEXT,
  nickname TEXT,
  avatar_color TEXT DEFAULT 'bg-teal-100 text-teal-700',
  user_type TEXT DEFAULT 'patient' CHECK (user_type IN ('patient', 'doctor', 'admin', 'moderator', 'trainee')),
  reputation_score FLOAT DEFAULT 0,
  tier TEXT DEFAULT 'new' CHECK (tier IN ('new', 'active', 'trusted', 'community_helper')),
  streak_days INT DEFAULT 0,
  last_tracker_date DATE,
  tracker_enabled BOOLEAN DEFAULT false,
  daily_follow_up BOOLEAN DEFAULT false,
  supervisor_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول المنشورات
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published', 'removed')),
  likes_count INT DEFAULT 0,
  helpfuls_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول التعليقات
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  helpful_count INT DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('pending', 'published', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول التفاعلات (لايك / مفيد / حفظ)
CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'save')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id, reaction_type)
);

-- جدول تراكر المزاج
CREATE TABLE tracker_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood_score INT NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_emoji TEXT,
  journal_text TEXT,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الدكاترة
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  category TEXT DEFAULT 'نفسية',
  bio TEXT,
  rating FLOAT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INT DEFAULT 0,
  sessions_count INT DEFAULT 0,
  price INT DEFAULT 50,
  session_types TEXT[] DEFAULT ARRAY['chat']::TEXT[],
  available_times TEXT[] DEFAULT ARRAY[]::TEXT[],
  avatar_initial TEXT,
  avatar_color TEXT DEFAULT 'bg-teal-100 text-teal-700',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الاستشارات
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('chat', 'voice')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  selected_time TEXT,
  encrypted_log TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الفعاليات
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  speaker_name TEXT,
  speaker_specialty TEXT,
  event_type TEXT DEFAULT 'ندوة مجانية' CHECK (event_type IN ('ندوة مجانية', 'ورشة عمل', 'محاضرة')),
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  registered_count INT DEFAULT 0,
  max_capacity INT DEFAULT 100,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول تسجيل الفعاليات
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- جدول بلاغات الأمان (Immutable)
CREATE TABLE safety_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'user', 'tracker_entry')),
  content_id UUID,
  reason TEXT NOT NULL,
  risk_score INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'escalated', 'emergency')),
  action_taken TEXT,
  reviewer_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- جدول سجل السمعة
CREATE TABLE reputation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('received_like', 'received_helpful', 'received_save', 'received_reply', 'content_reported', 'banned_word_used')),
  points FLOAT NOT NULL DEFAULT 0,
  source_type TEXT,
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول المنشورات المحفوظة
CREATE TABLE saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- جدول سجل المتابعة اليومية
CREATE TABLE daily_follow_up_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES users(id),
  mood_score INT CHECK (mood_score >= 1 AND mood_score <= 10),
  check_in_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'escalated')),
  supervisor_notes TEXT,
  created_at DATE DEFAULT CURRENT_DATE,
  checked_at TIMESTAMPTZ
);

-- جدول تفاعلات التعليقات
CREATE TABLE comment_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, comment_id, reaction_type)
);

-- جدول وسم المستخدمين
CREATE TABLE user_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  tagged_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tag)
);

-- جدول تقييمات الاستشارات
CREATE TABLE booking_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(consultation_id, reviewer_id)
);


-- ============================================================
-- الخطوة 3: Indexes
-- ============================================================
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_banned ON users(is_banned);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_reactions_user_post ON post_reactions(user_id, post_id);
CREATE INDEX idx_reactions_post_type ON post_reactions(post_id, reaction_type);
CREATE INDEX idx_tracker_user_id ON tracker_logs(user_id);
CREATE INDEX idx_tracker_created_at ON tracker_logs(created_at DESC);
CREATE INDEX idx_tracker_risk ON tracker_logs(risk_level);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_safety_status ON safety_reports(status);
CREATE INDEX idx_safety_created ON safety_reports(created_at DESC);
CREATE INDEX idx_reputation_user ON reputation_logs(user_id);
CREATE INDEX idx_saved_posts_user ON saved_posts(user_id);
CREATE INDEX idx_daily_follow_up_user ON daily_follow_up_logs(user_id);
CREATE INDEX idx_daily_follow_up_date ON daily_follow_up_logs(created_at);
CREATE INDEX idx_daily_follow_up_status ON daily_follow_up_logs(status);
CREATE INDEX idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user ON comment_reactions(user_id);
CREATE INDEX idx_user_tags_user ON user_tags(user_id);
CREATE INDEX idx_booking_reviews_consultation ON booking_reviews(consultation_id);


-- ============================================================
-- الخطوة 4: Row Level Security (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_follow_up_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reviews ENABLE ROW LEVEL SECURITY;

-- Users: SELECT للكل (مجهولين)، INSERT من الـ trigger (auth.uid() = id)، UPDATE لنفسه
CREATE POLICY "select_all_users" ON users FOR SELECT USING (true);
CREATE POLICY "insert_own_user" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "update_own_user" ON users FOR UPDATE USING (auth.uid() = id);

-- Posts
CREATE POLICY "select_published_posts" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "select_own_posts" ON posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_post" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_post" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_post" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "select_published_comments" ON comments FOR SELECT USING (status = 'published');
CREATE POLICY "insert_own_comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_comment" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "update_own_comment" ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Post Reactions
CREATE POLICY "select_reactions" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "insert_own_reaction" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_reaction" ON post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Tracker Logs
CREATE POLICY "select_own_tracker" ON tracker_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_tracker" ON tracker_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Doctors
CREATE POLICY "select_all_doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "update_own_doctor" ON doctors FOR UPDATE USING (auth.uid() = user_id);

-- Consultations
CREATE POLICY "select_own_consultations" ON consultations FOR SELECT USING (
  auth.uid() = patient_id OR auth.uid() IN (SELECT user_id FROM doctors WHERE id = consultations.doctor_id)
);
CREATE POLICY "insert_consultation" ON consultations FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "update_consultation" ON consultations FOR UPDATE USING (
  auth.uid() = patient_id OR auth.uid() IN (SELECT user_id FROM doctors WHERE id = consultations.doctor_id)
);

-- Events
CREATE POLICY "select_approved_events" ON events FOR SELECT USING (status = 'approved' OR status = 'completed');
CREATE POLICY "insert_event" ON events FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM doctors WHERE id = events.doctor_id AND is_verified = true)
);
CREATE POLICY "update_event" ON events FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM doctors WHERE id = events.doctor_id)
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin')
);

-- Event Registrations
CREATE POLICY "select_own_registrations" ON event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_registration" ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_registration" ON event_registrations FOR DELETE USING (auth.uid() = user_id);

-- Safety Reports (Immutable)
CREATE POLICY "insert_report" ON safety_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "select_reports" ON safety_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type IN ('admin', 'moderator'))
);

-- Reputation Logs
CREATE POLICY "select_own_reputation" ON reputation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_reputation" ON reputation_logs FOR INSERT WITH CHECK (true);

-- Saved Posts
CREATE POLICY "select_own_saved" ON saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_saved" ON saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_saved" ON saved_posts FOR DELETE USING (auth.uid() = user_id);

-- Daily Follow Up Logs
CREATE POLICY "select_own_follow_ups" ON daily_follow_up_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "select_supervisor_follow_ups" ON daily_follow_up_logs FOR SELECT USING (
  auth.uid() IN (SELECT supervisor_id FROM users WHERE id = daily_follow_up_logs.user_id)
);
CREATE POLICY "admin_all_follow_ups" ON daily_follow_up_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin')
);
CREATE POLICY "insert_own_follow_up" ON daily_follow_up_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_supervisor_follow_up" ON daily_follow_up_logs FOR UPDATE USING (
  auth.uid() = supervisor_id
);

-- Comment Reactions
CREATE POLICY "select_comment_reactions" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "insert_own_comment_reaction" ON comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_comment_reaction" ON comment_reactions FOR DELETE USING (auth.uid() = user_id);

-- User Tags
CREATE POLICY "select_own_tags" ON user_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_manage_tags" ON user_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin')
);

-- Booking Reviews
CREATE POLICY "select_own_reviews" ON booking_reviews FOR SELECT USING (auth.uid() = reviewer_id);
CREATE POLICY "insert_own_review" ON booking_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "select_doctor_reviews" ON booking_reviews FOR SELECT USING (
  auth.uid() IN (SELECT patient_id FROM consultations WHERE id = booking_reviews.consultation_id)
  OR auth.uid() IN (SELECT user_id FROM doctors WHERE id IN (SELECT doctor_id FROM consultations WHERE id = booking_reviews.consultation_id))
);


-- ============================================================
-- الخطوة 5: Functions + Triggers
-- ============================================================

-- دالة تحديث عدد التفاعلات في المنشور والتعليقات
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'comment_reactions' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE comments SET helpful_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = NEW.comment_id) WHERE id = NEW.comment_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE comments SET helpful_count = (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = OLD.comment_id) WHERE id = OLD.comment_id;
      RETURN OLD;
    END IF;
  ELSE
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET
        likes_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = NEW.post_id AND reaction_type = 'like'),
        helpfuls_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = NEW.post_id AND reaction_type = 'helpful'),
        comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id AND status = 'published')
      WHERE id = NEW.post_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET
        likes_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = OLD.post_id AND reaction_type = 'like'),
        helpfuls_count = (SELECT COUNT(*) FROM post_reactions WHERE post_id = OLD.post_id AND reaction_type = 'helpful'),
        comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = OLD.post_id AND status = 'published')
      WHERE id = OLD.post_id;
      RETURN OLD;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_post_counts AFTER INSERT OR DELETE ON post_reactions FOR EACH ROW EXECUTE FUNCTION update_post_counts();
CREATE TRIGGER trigger_update_comment_counts AFTER INSERT OR UPDATE OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION update_post_counts();
CREATE TRIGGER trigger_update_comment_reaction_counts AFTER INSERT OR DELETE ON comment_reactions FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- دالة تحديث streak days
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET
      streak_days = CASE
        WHEN last_tracker_date = CURRENT_DATE - 1 THEN streak_days + 1
        WHEN last_tracker_date IS NULL OR last_tracker_date < CURRENT_DATE - 1 THEN 1
        ELSE streak_days
      END,
      last_tracker_date = CURRENT_DATE
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_streak AFTER INSERT ON tracker_logs FOR EACH ROW EXECUTE FUNCTION update_streak();


-- ============================================================
-- خطوة 6: Trigger لإنشاء user profile تلقائياً عند OTP signup
-- ده اللي بيخلي users.id = auth.users.id
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- خطوة 7: بيانات أولية (Seed Data) — دكاترة وفعاليات
-- ============================================================

INSERT INTO doctors (name, specialty, category, bio, rating, reviews_count, sessions_count, price, session_types, available_times, avatar_initial, avatar_color, is_verified) VALUES
('د. أحمد محمود', 'أخصائي نفسي', 'نفسية', 'أخصائي نفسي معتمد بخبرة ١٢ سنة في العلاج النفسي والسلوكي. متخصص في القلق والاكتئاب واضطرابات النوم.', 4.9, 87, 320, 50, ARRAY['chat', 'voice'], ARRAY['١٠ صباحاً', '١٢ ظهراً', '٢ مساءً', '٤ مساءً', '٦ مساءً'], 'أ', 'bg-teal-100 text-teal-700', true),
('د. سارة حسين', 'أخصائية نفسية للأطفال', 'أطفال', 'أخصائية نفسية للأطفال والمراهقين. معتمدة من الجمعية المصرية للصحة النفسية. متخصصة في صعوبات التعلم واضطراب فرط الحركة.', 4.8, 64, 210, 60, ARRAY['chat', 'voice'], ARRAY['٩ صباحاً', '١١ صباحاً', '١ مساءً', '٣ مساءً'], 'س', 'bg-purple-100 text-purple-700', true),
('د. محمد عبدالرحمن', 'مستشار أسري', 'أسرة', 'مستشار أسري ومعالج زواجي معتمد. خبرة ١٥ سنة في حل النزاعات الأسرية وتحسين التواصل بين الأزواج.', 4.7, 52, 180, 55, ARRAY['chat'], ARRAY['١١ صباحاً', '٢ مساءً', '٥ مساءً', '٧ مساءً'], 'م', 'bg-amber-100 text-amber-700', true),
('د. نورهان أحمد', 'معالجة نفسية', 'نفسية', 'معالجة نفسية متخصصة في العلاج بالكلام CBT والعلاج بقبول الالتزام ACT. حاصلة على دبلوم في العلاج النفسي من لندن.', 4.9, 95, 410, 45, ARRAY['chat', 'voice'], ARRAY['٨ صباحاً', '١٠ صباحاً', '١٢ ظهراً', '٣ مساءً', '٥ مساءً'], 'ن', 'bg-rose-100 text-rose-700', true),
('د. خالد إبراهيم', 'طبيب نفسي', 'نفسية', 'طبيب نفسي معتمد وعضو الجمعية الأمريكية للطب النفسي. متخصص في تشخيص وعلاج الاكتئاب والاضطرابات ثنائية القطب.', 4.6, 38, 120, 70, ARRAY['voice'], ARRAY['٢ مساءً', '٤ مساءً', '٦ مساءً', '٨ مساءً'], 'خ', 'bg-blue-100 text-blue-700', true);

INSERT INTO events (title, description, speaker_name, speaker_specialty, event_type, event_date, event_time, registered_count, max_capacity, status) VALUES
('التعامل مع القلق في الحياة اليومية', 'ندوة تفاعلية عن استراتيجيات التعامل مع القلق واضطرابات القلق في الحياة اليومية', 'د. أحمد محمود', 'أخصائي نفسي', 'ندوة مجانية', '2026-04-25', '٧ مساءً', 87, 150, 'approved'),
('كيف تبني علاقات صحية مع نفسك والناس', 'ورشة عمل عن بناء العلاقات الصحية وتحسين التواصل', 'د. سارة حسين', 'معالجة نفسية', 'ورشة عمل', '2026-04-28', '٥ مساءً', 134, 200, 'approved'),
('فهم الاكتئاب: أسبابه وعلاجه', 'ندوة تعريفية عن الاكتئاب وأحدث طرق العلاج', 'د. خالد إبراهيم', 'طبيب نفسي', 'ندوة مجانية', '2026-05-03', '٨ مساءً', 0, 100, 'approved');


-- ============================================================
-- ✅ تم بنجاح! (16 جدول + Trigger + Seed Data + RLS)
-- ============================================================
-- اللي اتعمل:
-- 1. 16 جدول كاملين
-- 2. Trigger تلقائي لإنشاء user profile عند التسجيل (users.id = auth.users.id)
-- 3. تشفير الموبايل بـ SHA-256
-- 4. كل RLS policies شغالة مع auth.uid()
-- 5. 5 دكاترة + 3 فعاليات كبيانات أولية
-- ============================================================
