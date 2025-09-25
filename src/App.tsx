import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./components/Auth/AuthProvider";
import { useAuth } from "../src/context/AuthContext";
import { App as AntdApp } from "antd";
import { lazy, Suspense } from "react";
import "antd/dist/reset.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
// Tải động các trang để tối ưu hóa hiệu suất
const LoginPage = lazy(() => import("./pages/LoginPage"));
const MainLayout = lazy(() => import("./components/Layout/MainLayout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UserManagementPage = lazy(() => import("./pages/UserManagementPage"));
const ClassManagementPage = lazy(() => import("./pages/ClassManagementPage"));
const AssignmentManagementPage = lazy(() => import("./pages/AssignmentManagementPage"));
const SubmissionManagementPage = lazy(() => import("./pages/SubmissionManagementPage"));
const QuizManagementPage = lazy(() => import("./pages/QuizManagementPage"));
const AttendanceManagementPage = lazy(() => import("./pages/AttendanceManagementPage"));
const ActivityLogPage = lazy(() => import("./pages/ActivityLogPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const MaterialsPage = lazy(() => import("./pages/MaterialsPage"));
const SubjectManagementPage = lazy(() => import("./pages/SubjectManagementPage"));

const ProtectedRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();

  

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Router>
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/subjects" element={<SubjectManagementPage />} />
            <Route path="/classes" element={<ClassManagementPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/assignments" element={<AssignmentManagementPage />} />
            <Route path="/quizzes" element={<QuizManagementPage />} />
            <Route path="/submissions" element={<SubmissionManagementPage />} />
            <Route path="/attendance" element={<AttendanceManagementPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/logs" element={<ActivityLogPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  </Router>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <AuthProvider>
      <AntdApp>
        <AppRoutes />
      </AntdApp>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;