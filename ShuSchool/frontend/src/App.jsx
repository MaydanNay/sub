import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, getDashboardPath } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { useTelegramInit } from './hooks/useTelegramInit';
import { useState, useEffect } from 'react';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import AdminLayout from './layouts/AdminLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import ParentLayout from './layouts/ParentLayout';

// Pages
import Dashboard from './pages/Dashboard';
import HomeworkList from './pages/HomeworkList';
import QRScanner from './pages/QRScanner';
import TeacherPanel from './pages/TeacherPanel';
import TeacherDashboard from './pages/TeacherDashboard';
import Classes from './pages/Classes';
import CreateHomework from './pages/CreateHomework';
import CreateInternship from './pages/CreateInternship';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import MascotRoom from './pages/MascotRoom';
import AdminOverview from './pages/AdminOverview';
import AdminStaff from './pages/AdminStaff';
import AdminSettings from './pages/AdminSettings';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard'; // For superadmin reuse
import Schools from './pages/Schools';
import ParentDashboard from './pages/ParentDashboard';
import ParentMonitoring from './pages/ParentMonitoring';
import PendingApproval from './pages/PendingApproval';
import Reception from './pages/Reception';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import Notifications from './pages/Notifications';
import AdminClasses from './pages/AdminClasses';

// Auth
import StudentLogin from './pages/auth/StudentLogin';
import StaffLogin from './pages/auth/StaffLogin';
import OwnerLogin from './pages/auth/OwnerLogin';
import Register from './pages/Register';

import './App.css';

// ─── Guard: requires login & approval ─────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            ShuSchool Loading...
        </div>
    );

    if (!user) return <Navigate to="/login" replace />;
    if (!user.is_approved) return <PendingApproval />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Wrong role – redirect to their own dashboard
        return <Navigate to={getDashboardPath(user.role)} replace />;
    }

    return children;
};

// ─── Layout wrappers ──────────────────────────────────────────────────────────
const StudentRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['student']}>
        <StudentLayout>{children}</StudentLayout>
    </ProtectedRoute>
);

const TeacherRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['teacher']}>
        <TeacherLayout>{children}</TeacherLayout>
    </ProtectedRoute>
);

const AdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['admin', 'owner']}>
        <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
);

const SuperAdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['super_admin', 'super_super_admin']}>
        <SuperAdminLayout>{children}</SuperAdminLayout>
    </ProtectedRoute>
);

const ParentRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={['parent']}>
        <ParentLayout>{children}</ParentLayout>
    </ProtectedRoute>
);

// Internship creators: super_admin OR can_create_internships flag
const InternRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    
    const staffRoles = ['teacher', 'admin', 'owner', 'super_admin', 'super_super_admin'];
    if (staffRoles.includes(user.role)) {
        // Wrap in appropriate layout based on role
        if (user.role === 'super_admin' || user.role === 'super_super_admin') return <SuperAdminLayout>{children}</SuperAdminLayout>;
        if (user.role === 'teacher') return <TeacherLayout>{children}</TeacherLayout>;
        if (user.role === 'admin' || user.role === 'owner') return <AdminLayout>{children}</AdminLayout>;
    }
    return <Navigate to={getDashboardPath(user.role)} replace />;
};

// ─── Telegram Wrapper ─────────────────────────────────────────────────────────
const TelegramWrapper = ({ children }) => {
    const { initData } = useTelegramInit();
    const { user, loading, telegramLogin, telegramLink } = useAuth();
    const [tgLoading, setTgLoading] = useState(false);
    const [tgError, setTgError] = useState(null);
    const [linked, setLinked] = useState(false);

    useEffect(() => {
        if (!initData) return;
        const botType = window.location.pathname.includes('/staff') || window.location.pathname.includes('/admin') || window.location.pathname.includes('/owner') ? 'staff' : 'student';

        // If user is already logged in, link telegram
        if (user && !linked) {
            telegramLink(initData, botType).then(() => setLinked(true)).catch(console.error);
            return;
        }

        // If user is not logged in and not loading, try to login
        if (!user && !loading && !tgLoading && !tgError) {
            setTgLoading(true);
            telegramLogin(initData, botType)
                .catch((e) => {
                    setTgError("Аккаунт Telegram еще не привязан. Войдите по паролю, чтобы привязать.");
                })
                .finally(() => setTgLoading(false));
        }
    }, [initData, user, loading]);

    if (tgLoading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#111' }}><h3>Загрузка из Telegram...</h3></div>;
    }

    return (
        <>
            {tgError && !user && (
                <div style={{ background: '#d32f2f', color: 'white', padding: '10px', textAlign: 'center', zIndex: 9999, position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
                    {tgError}
                </div>
            )}
            {children}
        </>
    );
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <TelegramWrapper>
                    <Router>
                    <Routes>
                        {/* ── Public / Auth ── */}
                        <Route path="/login"    element={<StudentLogin />} />
                        <Route path="/staff"    element={<StaffLogin />} />
                        <Route path="/core"     element={<OwnerLogin />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/reception" element={<Reception />} />

                        {/* ── Student ── */}
                        <Route path="/student/dashboard" element={<StudentRoute><Dashboard /></StudentRoute>} />
                        <Route path="/student/homework"  element={<StudentRoute><HomeworkList /></StudentRoute>} />
                        <Route path="/student/scan"      element={<StudentRoute><QRScanner /></StudentRoute>} />
                        <Route path="/student/leaderboard" element={<StudentRoute><Leaderboard /></StudentRoute>} />
                        <Route path="/student/profile"   element={<StudentRoute><Profile /></StudentRoute>} />
                        <Route path="/student/profile/:userId" element={<StudentRoute><Profile /></StudentRoute>} />
                        <Route path="/student/history"   element={<StudentRoute><History /></StudentRoute>} />
                        <Route path="/student/notifications" element={<StudentRoute><Notifications /></StudentRoute>} />
                        <Route path="/marketplace"       element={<StudentRoute><Marketplace /></StudentRoute>} />
                        <Route path="/mascot-room"      element={<StudentRoute><MascotRoom /></StudentRoute>} />

                        {/* ── Teacher ── */}
                        <Route path="/teacher/dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
                        <Route path="/teacher/classes"   element={<TeacherRoute><Classes /></TeacherRoute>} />
                        <Route path="/teacher/panel"     element={<TeacherRoute><TeacherPanel /></TeacherRoute>} />
                        <Route path="/teacher/create-hw"  element={<TeacherRoute><CreateHomework /></TeacherRoute>} />
                        <Route path="/teacher/leaderboard" element={<TeacherRoute><Leaderboard /></TeacherRoute>} />
                        <Route path="/teacher/profile"   element={<TeacherRoute><Profile /></TeacherRoute>} />
                        <Route path="/teacher/profile/:userId" element={<TeacherRoute><Profile /></TeacherRoute>} />
                        <Route path="/teacher/notifications" element={<TeacherRoute><Notifications /></TeacherRoute>} />

                        {/* ── Admin ── */}
                        <Route path="/admin/dashboard"   element={<AdminRoute><AdminOverview /></AdminRoute>} />
                        <Route path="/admin/users"       element={<AdminRoute><AdminStaff /></AdminRoute>} />
                        <Route path="/admin/settings"    element={<AdminRoute><AdminSettings /></AdminRoute>} />
                        <Route path="/admin/classes"     element={<AdminRoute><AdminClasses /></AdminRoute>} />
                        <Route path="/admin/profile"     element={<AdminRoute><Profile /></AdminRoute>} />

                        <Route path="/superadmin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
                        <Route path="/superadmin/users"     element={<SuperAdminRoute><AdminDashboard /></SuperAdminRoute>} />
                        <Route path="/superadmin/schools"   element={<SuperAdminRoute><Schools /></SuperAdminRoute>} />
                        <Route path="/superadmin/profile"   element={<SuperAdminRoute><Profile /></SuperAdminRoute>} />

                        {/* ── Parent ── */}
                        <Route path="/parent/dashboard"    element={<ParentRoute><ParentDashboard /></ParentRoute>} />
                        <Route path="/parent/monitoring"   element={<ParentRoute><ParentMonitoring /></ParentRoute>} />
                        <Route path="/parent/leaderboard"  element={<ParentRoute><Leaderboard /></ParentRoute>} />
                        <Route path="/parent/profile"      element={<ParentRoute><Profile /></ParentRoute>} />

                        {/* ── Internship (super_admin + mini-mentors) ── */}
                        <Route path="/internships/create"  element={<InternRoute><CreateInternship /></InternRoute>} />

                        {/* ── Fallback: redirect to role dashboard ── */}
                        <Route path="*" element={<RoleRedirect />} />
                    </Routes>
                </Router>
                </TelegramWrapper>
            </AuthProvider>
        </LanguageProvider>
    );
}

// Redirects unauthenticated users to /login, authenticated to their own dashboard
const RoleRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to={getDashboardPath(user.role)} replace />;
};

export default App;
