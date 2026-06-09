-- Initialize LearnHub DB schema
-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Contents copied from repository root database_schema.sql

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  address TEXT,
  profile_image_url TEXT,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES users(id),
  thumbnail_url TEXT,
  price DECIMAL(10, 2),
  duration INTEGER,
  level TEXT,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_students INTEGER DEFAULT 0,
  what_you_will_learn TEXT[],
  requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Branches Table (Physical Locations)
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  phone TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  qualifications TEXT,
  experience_years INTEGER,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Class Sessions (Online & Onsite)
CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  session_type TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER,
  enrolled_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  recording_url TEXT,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'confirmed',
  attendance_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, class_session_id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Videos Table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_questions INTEGER,
  passing_score DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Answers Table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Quiz Attempts Table
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score DECIMAL(5, 2),
  attempt_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course Progress Table
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  videos_watched INTEGER DEFAULT 0,
  videos_total INTEGER,
  progress_percentage DECIMAL(5, 2) DEFAULT 0.0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating DECIMAL(3, 2) NOT NULL,
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Create Indexes for Better Performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_course ON class_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_branch ON class_sessions(branch_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(class_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_videos_course ON videos(course_id);
CREATE INDEX IF NOT EXISTS idx_documents_course ON documents(course_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_course ON ratings(course_id);

-- Enable Row Level Security (enable only if tables exist)
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (guards added so they don't fail if RLS not enabled)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON users
        FOR SELECT USING (auth.uid()::text = id::text);
    $$;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Anyone can view courses" ON courses
        FOR SELECT USING (true);
    $$;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Users can view their own bookings" ON bookings
        FOR SELECT USING (auth.uid()::text = user_id::text);
    $$;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Users can view their own payments" ON payments
        FOR SELECT USING (auth.uid()::text = user_id::text);
    $$;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Users can view their own notifications" ON notifications
        FOR SELECT USING (auth.uid()::text = user_id::text);
    $$;
  END IF;
END$$;
-- ============================================================
-- Migration: Add Enrollments, Certificates, Favorite Courses
-- Created: 2026-06-04
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. ENROLLMENTS TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  payment_status   TEXT NOT NULL DEFAULT 'completed',  -- pending | completed | refunded
  enrolled_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user    ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course  ON enrollments(course_id);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments" ON enrollments
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert their own enrollments
CREATE POLICY "Users can create their own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own enrollments (e.g. last_accessed_at)
CREATE POLICY "Users can update their own enrollments" ON enrollments
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- ─────────────────────────────────────────────
-- 2. CERTIFICATES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_url TEXT,
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certificates" ON certificates
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own certificates" ON certificates
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- ─────────────────────────────────────────────
-- 3. FAVORITE COURSES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorite_courses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorite_courses(user_id);

ALTER TABLE favorite_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" ON favorite_courses
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own favorites" ON favorite_courses
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ─────────────────────────────────────────────
-- 4. SEED: Enroll the mock student into courses
--    that already have course_progress rows
-- ─────────────────────────────────────────────
INSERT INTO enrollments (user_id, course_id, payment_status, enrolled_at)
VALUES
  ('9999ee9d-ff46-4cb4-972c-f68482bf4f17', '1121ee2e-fa46-4bb4-952c-f68482bf4f22', 'completed', NOW() - INTERVAL '10 days'),
  ('9999ee9d-ff46-4cb4-972c-f68482bf4f17', '2232ff3f-ab57-4cc5-a63d-a79493cf5a33', 'completed', NOW() - INTERVAL '5 days')
ON CONFLICT (user_id, course_id) DO NOTHING;
-- ════════════════════════════════════════════════════════════════
-- Migration: Enable anon-key enrollment flow (supabase_flutter 1.x)
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ════════════════════════════════════════════════════════════════

-- ─── Step 1: Drop FK constraint on enrollments → users ────────
-- The app uses anonymous UUID (no login) so there is no row in
-- the users table. Dropping this FK lets us insert enrollments
-- directly without needing a matching user row first.
ALTER TABLE enrollments
  DROP CONSTRAINT IF EXISTS enrollments_user_id_fkey;

-- Also drop FK on course_progress → users (same reason)
ALTER TABLE course_progress
  DROP CONSTRAINT IF EXISTS course_progress_user_id_fkey;

-- ─── Step 2: enrollments RLS ──────────────────────────────────
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own enrollments"  ON enrollments;
DROP POLICY IF EXISTS "Users can create their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "anon_select_enrollments" ON enrollments;
DROP POLICY IF EXISTS "anon_insert_enrollments"  ON enrollments;
DROP POLICY IF EXISTS "anon_update_enrollments"  ON enrollments;

CREATE POLICY "anon_select_enrollments" ON enrollments FOR SELECT USING (true);
CREATE POLICY "anon_insert_enrollments"  ON enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_enrollments"  ON enrollments FOR UPDATE USING (true);

-- ─── Step 3: course_progress RLS ──────────────────────────────
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own progress"   ON course_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON course_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON course_progress;
DROP POLICY IF EXISTS "anon_select_progress" ON course_progress;
DROP POLICY IF EXISTS "anon_insert_progress" ON course_progress;
DROP POLICY IF EXISTS "anon_upsert_progress" ON course_progress;

CREATE POLICY "anon_select_progress" ON course_progress FOR SELECT USING (true);
CREATE POLICY "anon_insert_progress" ON course_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_upsert_progress"  ON course_progress FOR UPDATE USING (true);

-- ─── Step 4: favorite_courses RLS ─────────────────────────────
ALTER TABLE favorite_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorite_courses;
DROP POLICY IF EXISTS "anon_all_favorites" ON favorite_courses;

CREATE POLICY "anon_all_favorites" ON favorite_courses
  FOR ALL USING (true) WITH CHECK (true);

-- ─── Step 5: certificates (create if missing + RLS) ───────────
CREATE TABLE IF NOT EXISTS certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  course_id       UUID NOT NULL,
  issued_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_url TEXT,
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own certificates"  ON certificates;
DROP POLICY IF EXISTS "Users can create their own certificates" ON certificates;
DROP POLICY IF EXISTS "anon_select_certificates" ON certificates;
DROP POLICY IF EXISTS "anon_insert_certificates" ON certificates;

CREATE POLICY "anon_select_certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "anon_insert_certificates"  ON certificates FOR INSERT WITH CHECK (true);

-- ─── Step 6: users RLS ─────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "anon_select_users" ON users;
DROP POLICY IF EXISTS "anon_insert_users" ON users;
DROP POLICY IF EXISTS "anon_update_users" ON users;

CREATE POLICY "anon_select_users" ON users FOR SELECT USING (true);
CREATE POLICY "anon_insert_users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_users" ON users FOR UPDATE USING (true);

-- ─── Step 7: bookings, payments, and class_sessions RLS ────────
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "anon_all_bookings" ON bookings;
CREATE POLICY "anon_all_bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "anon_all_payments" ON payments;
CREATE POLICY "anon_all_payments" ON payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_sessions" ON class_sessions;
CREATE POLICY "anon_all_sessions" ON class_sessions FOR ALL USING (true) WITH CHECK (true);


