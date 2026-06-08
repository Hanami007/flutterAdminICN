import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import CoursesPage from '@/pages/courses/CoursesPage';
import CourseFormPage from '@/pages/courses/CourseFormPage';
import CategoriesPage from '@/pages/categories/CategoriesPage';
import TeachersPage from '@/pages/teachers/TeachersPage';
import TeacherFormPage from '@/pages/teachers/TeacherFormPage';
import StudentsPage from '@/pages/students/StudentsPage';
import BookingsPage from '@/pages/bookings/BookingsPage';
import SessionsPage from '@/pages/sessions/SessionsPage';
import BranchesPage from '@/pages/branches/BranchesPage';
import VideosPage from '@/pages/videos/VideosPage';
import PaymentsPage from '@/pages/payments/PaymentsPage';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import SettingsPage from '@/pages/settings/SettingsPage';

// Initialize query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="courses" element={<CoursesPage />} />
                  <Route path="courses/create" element={<CourseFormPage />} />
                  <Route path="courses/:id/edit" element={<CourseFormPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="teachers" element={<TeachersPage />} />
                  <Route path="teachers/create" element={<TeacherFormPage />} />
                  <Route path="teachers/:id/edit" element={<TeacherFormPage />} />
                  <Route path="students" element={<StudentsPage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="sessions" element={<SessionsPage />} />
                  <Route path="branches" element={<BranchesPage />} />
                  <Route path="videos" element={<VideosPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
