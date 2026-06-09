export type UserRole = 'admin' | 'staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  thumbnail_url: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  duration_hours: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  max_students: number | null;
  category_id: string | null;
  teacher_id: string | null;
  what_you_will_learn: string[] | null;
  requirements: string[] | null;
  category?: Category;
  teacher?: Teacher;
  lessons_count?: number;
  students_count?: number;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  courses_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  specialization: string | null;
  experience_years: number | null;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  courses_count?: number;
  students_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  address: string | null;
  is_active: boolean;
  enrollments_count?: number;
  total_spent?: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  student?: Student;
  course?: Course;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration: number | null;
  sort_order: number;
  is_free: boolean;
  is_published: boolean;
  content_type: 'video' | 'text' | 'quiz' | 'assignment';
  content: string | null;
  course?: Course;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  student_id: string;
  session_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  notes: string | null;
  student?: Student;
  session?: ClassSession;
  created_at: string;
  updated_at: string;
}

export interface ClassSession {
  id: string;
  title: string;
  course_id: string | null;
  teacher_id: string | null;
  branch_id: string | null;
  start_time: string;
  end_time: string;
  capacity: number;
  enrolled_count: number;
  type: 'online' | 'onsite' | 'hybrid';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meeting_url: string | null;
  notes: string | null;
  course?: Course;
  teacher?: Teacher;
  branch?: Branch;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  course_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  payment_method: string | null;
  transaction_id: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  student?: Student;
  course?: Course;
  created_at: string;
  updated_at: string;
}

export interface PlatformSettings {
  id: string;
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  line_url: string | null;
  updated_at: string;
}

export interface Activity {
  id: string;
  type: 'enrollment' | 'payment' | 'course_created' | 'booking' | 'review' | 'session';
  title: string;
  description: string;
  user_name: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_revenue: number;
  total_students: number;
  total_courses: number;
  total_enrollments: number;
  total_teachers: number;
  upcoming_classes: number;
  revenue_change: number;
  students_change: number;
  courses_change: number;
  enrollments_change: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface EnrollmentDataPoint {
  date: string;
  enrollments: number;
}

// Analytics
export interface AnalyticsData {
  revenue_trends: RevenueDataPoint[];
  student_growth: { date: string; students: number }[];
  top_courses: { name: string; enrollments: number; revenue: number }[];
  top_teachers: { name: string; students: number; rating: number }[];
  completion_rates: { name: string; rate: number }[];
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  category_id?: string;
  teacher_id?: string;
  level?: string;
  date_from?: string;
  date_to?: string;
}
