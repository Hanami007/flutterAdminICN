-- ============================================================
-- SQL Migration: Schema Sync & Compatibility for LearnHub Admin
-- Run this in your Supabase Dashboard -> SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES VIEW
-- ────────────────────────────────────────────────────────────
-- The React app queries the 'profiles' view to get logged-in user data.
CREATE OR REPLACE VIEW profiles AS
SELECT 
  id,
  email,
  full_name,
  profile_image_url AS avatar_url,
  'admin'::text AS role, -- Default role to admin for simplicity in development
  created_at,
  updated_at
FROM users;

-- ────────────────────────────────────────────────────────────
-- 2. COURSES TABLE UPDATES
-- ────────────────────────────────────────────────────────────
-- Add missing columns to make courses table compatible with client app code
ALTER TABLE courses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration_hours INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS teacher_id UUID;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS max_students INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'THB';

-- Migrate and sync existing column values
UPDATE courses SET title = name WHERE title IS NULL;
UPDATE courses SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
UPDATE courses SET duration_hours = duration WHERE duration_hours IS NULL;

-- ────────────────────────────────────────────────────────────
-- 3. TEACHERS TABLE UPDATES
-- ────────────────────────────────────────────────────────────
-- Add instructor profile columns directly to teachers table as expected by app
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Map and sync existing data from users table to teachers table
UPDATE teachers t
SET 
  full_name = u.full_name,
  email = u.email,
  phone = u.phone_number,
  avatar_url = u.profile_image_url
FROM users u
WHERE t.user_id = u.id;

-- Ensure all instructors in courses table have a corresponding teachers record
INSERT INTO teachers (user_id, full_name, email, phone, avatar_url, bio, rating, total_reviews, is_active)
SELECT DISTINCT 
  u.id, 
  u.full_name, 
  u.email, 
  u.phone_number, 
  u.profile_image_url, 
  'Experienced instructor', 
  4.8, 
  10, 
  true
FROM courses c
JOIN users u ON u.id = c.instructor_id
WHERE c.instructor_id NOT IN (SELECT user_id FROM teachers)
ON CONFLICT (user_id) DO NOTHING;

-- Map teacher_id inside courses table to match teachers.id
UPDATE courses c
SET teacher_id = t.id
FROM teachers t
WHERE t.user_id = c.instructor_id AND c.teacher_id IS NULL;

-- Add foreign key constraint for teacher_id -> teachers(id)
ALTER TABLE courses DROP CONSTRAINT IF EXISTS fk_courses_teacher;
ALTER TABLE courses ADD CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────
-- 4. CATEGORIES TABLE UPDATES
-- ────────────────────────────────────────────────────────────
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE categories SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
UPDATE categories SET icon = icon_url WHERE icon IS NULL;

-- ────────────────────────────────────────────────────────────
-- 5. STUDENTS TABLE creation
-- ────────────────────────────────────────────────────────────
-- The React app queries a separate 'students' table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Populate students with existing users who are not teachers
INSERT INTO students (id, full_name, email, phone, avatar_url, address, created_at, updated_at)
SELECT id, full_name, email, phone_number, profile_image_url, address, created_at, updated_at
FROM users
WHERE id NOT IN (SELECT user_id FROM teachers)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 6. BOOKINGS TABLE UPDATES
-- ────────────────────────────────────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS student_id UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;

-- Sync values
UPDATE bookings SET student_id = user_id WHERE student_id IS NULL;
UPDATE bookings SET session_id = class_session_id WHERE session_id IS NULL;

-- Add foreign key constraints
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_student;
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_session;
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_session FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE;

-- ────────────────────────────────────────────────────────────
-- 7. CLASS SESSIONS TABLE UPDATES
-- ────────────────────────────────────────────────────────────
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS meeting_url TEXT;
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE class_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Sync values
UPDATE class_sessions SET title = 'Class Session' WHERE title IS NULL;
UPDATE class_sessions SET type = session_type WHERE type IS NULL;
UPDATE class_sessions SET meeting_url = meeting_link WHERE meeting_url IS NULL;

-- ────────────────────────────────────────────────────────────
-- 8. LESSONS (VIDEOS) TABLE creation
-- ────────────────────────────────────────────────────────────
-- React app queries a 'lessons' table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_duration INTEGER,
  sort_order INTEGER,
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  content_type TEXT DEFAULT 'video',
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Copy any existing videos from videos table into lessons table
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, sort_order)
SELECT id, course_id, title, description, video_url, duration, order_index
FROM videos
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 9. PAYMENTS TABLE UPDATES
-- ────────────────────────────────────────────────────────────
ALTER TABLE payments ADD COLUMN IF NOT EXISTS student_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS course_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'THB';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- Sync values
UPDATE payments SET student_id = user_id WHERE student_id IS NULL;

UPDATE payments p
SET course_id = cs.course_id
FROM bookings b
JOIN class_sessions cs ON cs.id = b.class_session_id
WHERE b.id = p.booking_id AND p.course_id IS NULL;

-- Add foreign key constraints
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_student;
ALTER TABLE payments ADD CONSTRAINT fk_payments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_course;
ALTER TABLE payments ADD CONSTRAINT fk_payments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────
-- 10. PLATFORM SETTINGS TABLE creation
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY DEFAULT '1',
  site_name TEXT DEFAULT 'LearnHub',
  site_description TEXT DEFAULT 'Premium Online Learning Platform',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#7C3AED',
  contact_email TEXT DEFAULT 'contact@learnhub.com',
  contact_phone TEXT DEFAULT '+66 2 123 4567',
  address TEXT DEFAULT 'Bangkok, Thailand',
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  line_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default settings row
INSERT INTO platform_settings (id) VALUES ('1') ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 11. ACTIVITIES TABLE creation
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  user_name TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed mock dashboard activities
INSERT INTO activities (type, title, description, user_name, created_at)
VALUES 
  ('enrollment', 'Enrolled in Flutter Masterclass', 'John Smith enrolled in Flutter Mobile Development.', 'John Smith', NOW() - INTERVAL '2 hours'),
  ('payment', 'Successful Payment', 'Received payment of ฿3,500 for Flutter Course.', 'Jane Doe', NOW() - INTERVAL '4 hours'),
  ('booking', 'New Class Session Booked', 'Booked slot in online Q&A Session.', 'Mike Johnson', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 12. RLS & POLICY RESET (FOR EASY DEV ACCESS)
-- ────────────────────────────────────────────────────────────
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_courses" ON courses;
DROP POLICY IF EXISTS "anon_all_teachers" ON teachers;
DROP POLICY IF EXISTS "anon_all_categories" ON categories;
DROP POLICY IF EXISTS "anon_all_students" ON students;
DROP POLICY IF EXISTS "anon_all_lessons" ON lessons;
DROP POLICY IF EXISTS "anon_all_branches" ON branches;
DROP POLICY IF EXISTS "anon_all_settings" ON platform_settings;
DROP POLICY IF EXISTS "anon_all_activities" ON activities;

CREATE POLICY "anon_all_courses" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_lessons" ON lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_branches" ON branches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_settings" ON platform_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_activities" ON activities FOR ALL USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 13. COMPATIBILITY: NOT NULL DROPS & AUTO-SYNC TRIGGERS
-- ────────────────────────────────────────────────────────────

-- Drop NOT NULL constraints to prevent insert failures when columns are renamed in frontend
ALTER TABLE courses ALTER COLUMN name DROP NOT NULL;
ALTER TABLE courses ALTER COLUMN instructor_id DROP NOT NULL;
ALTER TABLE teachers ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN class_session_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN booking_id DROP NOT NULL;
ALTER TABLE class_sessions ALTER COLUMN session_type DROP NOT NULL;

-- A. Courses Name-Title Sync Trigger
CREATE OR REPLACE FUNCTION sync_course_name_title()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_teacher_id UUID;
BEGIN
  -- 1. Sync name and title
  IF NEW.title IS NOT NULL AND NEW.name IS NULL THEN
    NEW.name := NEW.title;
  END IF;
  IF NEW.name IS NOT NULL AND NEW.title IS NULL THEN
    NEW.title := NEW.name;
  END IF;

  -- 2. Sync instructor_id (users table) and teacher_id (teachers table)
  IF NEW.teacher_id IS NOT NULL AND NEW.instructor_id IS NULL THEN
    SELECT user_id INTO v_user_id FROM teachers WHERE id = NEW.teacher_id;
    IF v_user_id IS NOT NULL THEN
      NEW.instructor_id := v_user_id;
    END IF;
  END IF;

  IF NEW.instructor_id IS NOT NULL AND NEW.teacher_id IS NULL THEN
    SELECT id INTO v_teacher_id FROM teachers WHERE user_id = NEW.instructor_id;
    IF v_teacher_id IS NOT NULL THEN
      NEW.teacher_id := v_teacher_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_course_name_title ON courses;
CREATE TRIGGER trg_sync_course_name_title
BEFORE INSERT OR UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION sync_course_name_title();

-- B. Bookings User-Student / Session Sync Trigger
CREATE OR REPLACE FUNCTION sync_booking_ids()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.student_id IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := NEW.student_id;
  END IF;
  IF NEW.user_id IS NOT NULL AND NEW.student_id IS NULL THEN
    NEW.student_id := NEW.user_id;
  END IF;
  IF NEW.session_id IS NOT NULL AND NEW.class_session_id IS NULL THEN
    NEW.class_session_id := NEW.session_id;
  END IF;
  IF NEW.class_session_id IS NOT NULL AND NEW.session_id IS NULL THEN
    NEW.session_id := NEW.class_session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_booking_ids ON bookings;
CREATE TRIGGER trg_sync_booking_ids
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION sync_booking_ids();

-- C. Payments User-Student Sync Trigger
CREATE OR REPLACE FUNCTION sync_payment_ids()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.student_id IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := NEW.student_id;
  END IF;
  IF NEW.user_id IS NOT NULL AND NEW.student_id IS NULL THEN
    NEW.student_id := NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_payment_ids ON payments;
CREATE TRIGGER trg_sync_payment_ids
BEFORE INSERT OR UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION sync_payment_ids();

-- D. Class Sessions Type Sync Trigger
CREATE OR REPLACE FUNCTION sync_session_types()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type IS NOT NULL AND NEW.session_type IS NULL THEN
    NEW.session_type := NEW.type;
  END IF;
  IF NEW.session_type IS NOT NULL AND NEW.type IS NULL THEN
    NEW.type := NEW.session_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_session_types ON class_sessions;
CREATE TRIGGER trg_sync_session_types
BEFORE INSERT OR UPDATE ON class_sessions
FOR EACH ROW EXECUTE FUNCTION sync_session_types();

-- ────────────────────────────────────────────────────────────
-- 14. STORAGE BUCKETS & POLICIES (FOR VIDEO & IMAGE UPLOADS)
-- ────────────────────────────────────────────────────────────

-- Create buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-videos', 'lesson-videos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies for these buckets to avoid conflicts
DROP POLICY IF EXISTS "Public Access lesson-videos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload lesson-videos" ON storage.objects;
DROP POLICY IF EXISTS "Public Update lesson-videos" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete lesson-videos" ON storage.objects;

DROP POLICY IF EXISTS "Public Access course-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload course-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public Update course-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete course-thumbnails" ON storage.objects;

-- Create Policies for lesson-videos
CREATE POLICY "Public Access lesson-videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'lesson-videos');
CREATE POLICY "Public Upload lesson-videos" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'lesson-videos');
CREATE POLICY "Public Update lesson-videos" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'lesson-videos');
CREATE POLICY "Public Delete lesson-videos" ON storage.objects FOR DELETE TO public USING (bucket_id = 'lesson-videos');

-- Create Policies for course-thumbnails
CREATE POLICY "Public Access course-thumbnails" ON storage.objects FOR SELECT TO public USING (bucket_id = 'course-thumbnails');
CREATE POLICY "Public Upload course-thumbnails" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'course-thumbnails');
CREATE POLICY "Public Update course-thumbnails" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'course-thumbnails');
CREATE POLICY "Public Delete course-thumbnails" ON storage.objects FOR DELETE TO public USING (bucket_id = 'course-thumbnails');

-- ────────────────────────────────────────────────────────────
-- 15. ADD COURSE DETAILS COLUMNS (WHAT YOU WILL LEARN & REQUIREMENTS)
-- ────────────────────────────────────────────────────────────
ALTER TABLE courses ADD COLUMN IF NOT EXISTS what_you_will_learn TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS requirements TEXT[];



