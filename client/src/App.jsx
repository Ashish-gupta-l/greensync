import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Spinner from './components/ui/Spinner';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// Lazy-load portals for code splitting
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentSubjectView = lazy(() => import('./pages/student/SubjectView'));
const MySubmissions = lazy(() => import('./pages/student/MySubmissions'));
const SubmitAssignment = lazy(() => import('./pages/student/SubmitAssignment'));
const AssignmentView = lazy(() => import('./pages/student/AssignmentView'));
const StudentAssignments = lazy(() => import('./pages/student/Assignments'));
const StudentCalendar = lazy(() => import('./pages/student/CalendarPage'));

const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'));
const TeacherSubjectView = lazy(() => import('./pages/teacher/SubjectView'));
const SubmissionsList = lazy(() => import('./pages/teacher/SubmissionsList'));
const GradeSubmission = lazy(() => import('./pages/teacher/GradeSubmission'));
const CreateAssignment = lazy(() => import('./pages/teacher/CreateAssignment'));
const TeacherAssignments = lazy(() => import('./pages/teacher/Assignments'));
const TeacherCalendar = lazy(() => import('./pages/teacher/CalendarPage'));
const AllSubmissions = lazy(() => import('./pages/teacher/AllSubmissions'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageStudents = lazy(() => import('./pages/admin/ManageStudents'));
const ManageTeachers = lazy(() => import('./pages/admin/ManageTeachers'));
const ManageSubjects = lazy(() => import('./pages/admin/ManageSubjects'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));

const Settings = lazy(() => import('./pages/Settings'));

// ── ProtectedRoute ──────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login/student" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={`/${user?.role}`} replace />;
  }
  return children;
};

// ── Loading fallback ─────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
);

// ── App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login/student" replace />} />

        {/* Auth routes */}
        <Route path="/login/student" element={<LoginPage role="student" />} />
        <Route path="/login/teacher" element={<LoginPage role="teacher" />} />
        <Route path="/login/admin" element={<LoginPage role="admin" />} />

        {/* ── Student portal ── */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="subjects/:subjectId" element={<StudentSubjectView />} />
          <Route path="subjects/:subjectId/assignments/:assignmentId" element={<AssignmentView />} />
          <Route path="assignments/:assignmentId/submit" element={<SubmitAssignment />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="submissions" element={<MySubmissions />} />
          <Route path="calendar" element={<StudentCalendar />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Teacher portal ── */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="subjects/:subjectId" element={<TeacherSubjectView />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="assignments/create" element={<CreateAssignment />} />
          <Route path="assignments/:assignmentId/submissions" element={<SubmissionsList />} />
          <Route path="submissions/:submissionId/grade" element={<GradeSubmission />} />
          <Route path="submissions" element={<AllSubmissions />} />
          <Route path="calendar" element={<TeacherCalendar />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Admin portal ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="teachers" element={<ManageTeachers />} />
          <Route path="subjects" element={<ManageSubjects />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login/student" replace />} />
      </Routes>
    </Suspense>
  );
}
