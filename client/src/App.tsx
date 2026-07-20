import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Portal
import PortalHomePage from './pages/portal/PortalHomePage';

// NMPA
import NmpaDashboard from './pages/nmpa/NmpaDashboard';
import NmpaAppCreateWizard from './pages/nmpa/applications/NmpaAppCreateWizard';

// FDA
import FdaDashboard from './pages/fda/FdaDashboard';
import FdaAppCreateWizard from './pages/fda/applications/FdaAppCreateWizard';

// EMA
import EmaDashboard from './pages/ema/EmaDashboard';
import EmaAppCreateWizard from './pages/ema/applications/EmaAppCreateWizard';

// Old pages (keep for backward compat)
import DashboardPage from './pages/dashboard/DashboardPage';
import ApplicationListPage from './pages/applications/ApplicationListPage';
import ApplicationCreatePage from './pages/applications/ApplicationCreatePage';
import ApplicationDetailPage from './pages/applications/ApplicationDetailPage';
import ReviewTaskListPage from './pages/review/ReviewTaskListPage';
import ReviewTaskPage from './pages/review/ReviewTaskPage';
import UserManagementPage from './pages/admin/UserManagementPage';

function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1A5C9E',
          borderRadius: 2,
          colorError: '#E54545',
          fontFamily: '"Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        components: {
          Form: {
            labelColor: '#333',
            labelFontSize: 14,
          },
          Input: {
            borderRadius: 2,
          },
          Select: {
            borderRadius: 2,
          },
          Button: {
            borderRadius: 2,
            primaryShadow: 'none',
          },
          Card: {
            borderRadius: 2,
          },
          Table: {
            headerBg: '#1A5C9E',
            headerColor: '#fff',
            borderRadius: 2,
          },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <Routes>
            {/* Auth routes (public) */}
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/nmpa" replace /> : <LoginPage />
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to="/nmpa" replace /> : <RegisterPage />
            } />

            {/* Portal Home Page (public) */}
            <Route path="/" element={<PortalHomePage />} />

            {/* Protected routes under AppLayout */}
            <Route path="/nmpa" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<NmpaDashboard />} />
              <Route path="applications" element={<ApplicationListPage />} />
              <Route path="applications/new" element={<NmpaAppCreateWizard />} />
              <Route path="applications/:id" element={<ApplicationDetailPage />} />
            </Route>

            <Route path="/fda" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<FdaDashboard />} />
              <Route path="applications" element={<ApplicationListPage />} />
              <Route path="applications/new" element={<FdaAppCreateWizard />} />
              <Route path="applications/:id" element={<ApplicationDetailPage />} />
            </Route>

            <Route path="/ema" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<EmaDashboard />} />
              <Route path="applications" element={<ApplicationListPage />} />
              <Route path="applications/new" element={<EmaAppCreateWizard />} />
              <Route path="applications/:id" element={<ApplicationDetailPage />} />
            </Route>

            {/* Backward-compatible protected routes */}
            <Route path="/home" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
            </Route>
            <Route path="/applications" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ApplicationListPage />} />
            </Route>
            <Route path="/applications/new" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ApplicationCreatePage />} />
            </Route>
            <Route path="/applications/:id" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ApplicationDetailPage />} />
            </Route>
            <Route path="/reviewer" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="tasks" element={<ReviewTaskListPage />} />
              <Route path="tasks/:appId" element={<ReviewTaskPage />} />
            </Route>
            <Route path="/admin" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="users" element={<UserManagementPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
