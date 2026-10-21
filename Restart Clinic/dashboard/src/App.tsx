import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { LoginPage } from "./pages/LoginPage";
import { AdminApplications } from "./pages/AdminApplications";
import { AdminPatients } from "./pages/AdminPatients";
import { DoctorPatients } from "./pages/DoctorPatients";
import { DoctorPatientDetail } from "./pages/DoctorPatientDetail";
import { AdminDoctors } from "./pages/AdminDoctors";
import { AdminPushNotifications } from "./pages/AdminPushNotifications";
import { DoctorCalendar } from "./pages/DoctorCalendar";
import { DoctorCalendarDay } from "./pages/DoctorCalendarDay";
import { DoctorPatientVisits } from "./pages/DoctorPatientVisits";

function navClass({ isActive }: { isActive: boolean }) {
  return `block rounded-lg px-3 py-2 text-sm transition ${
    isActive
      ? "bg-white/15 text-white font-medium"
      : "text-white/75 hover:bg-white/10 hover:text-white"
  }`;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      <aside className="w-60 shrink-0 bg-clinic-primary text-white flex flex-col h-full overflow-y-auto">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-bold text-lg leading-tight">Restart Clinic</p>
          <p className="text-sm text-white/70 mt-1">
            {user?.role === "ADMIN" ? "Администратор" : user?.fullName}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {user?.role === "ADMIN" && (
            <>
              <NavLink to="/admin/applications" className={navClass}>
                Заявки
              </NavLink>
              <NavLink to="/admin/patients" className={navClass}>
                Пациенты
              </NavLink>
              <NavLink to="/admin/doctors" className={navClass}>
                Врачи
              </NavLink>
              <NavLink to="/admin/push-notifications" className={navClass}>
                Пуш уведомления
              </NavLink>
            </>
          )}
          {user?.role === "DOCTOR" && (
            <>
              <NavLink to="/doctor/patients" className={navClass}>
                Мои пациенты
              </NavLink>
              <NavLink to="/doctor/calendar" className={navClass}>
                Календарь
              </NavLink>
            </>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full text-left rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white transition"
          >
            Выйти
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-y-auto h-full">
        <main className="min-h-full flex justify-center p-6 md:p-10">
          <div className="w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <Layout>
      <Routes>
        {user.role === "ADMIN" && (
          <>
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/push-notifications" element={<AdminPushNotifications />} />
            <Route path="*" element={<Navigate to="/admin/applications" />} />
          </>
        )}
        {user.role === "DOCTOR" && (
          <>
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/patients/:id" element={<DoctorPatientDetail />} />
            <Route path="/doctor/patients/:id/visits" element={<DoctorPatientVisits />} />
            <Route path="/doctor/calendar" element={<DoctorCalendar />} />
            <Route path="/doctor/calendar/:date" element={<DoctorCalendarDay />} />
            <Route path="*" element={<Navigate to="/doctor/patients" />} />
          </>
        )}
      </Routes>
    </Layout>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
