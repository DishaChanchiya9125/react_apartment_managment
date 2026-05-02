import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ApartmentsPage } from './pages/ApartmentsPage';
import { TenantsPage } from './pages/TenantsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportIssuesPage } from './pages/ReportIssuesPage';
import { BookAmenitiesPage } from './pages/BookAmenitiesPage';
import { CommunityPollsPage } from './pages/CommunityPollsPage';
import { MaintenanceFeesPage } from './pages/MaintenanceFeesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminSetupPage } from './pages/AdminSetupPage';
import { RequireAuth } from './auth/RequireAuth';
import { AuthProvider } from './auth/FirebaseAuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-setup" element={<AdminSetupPage />} />
        
        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/apartments" element={<ApartmentsPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/report-issues" element={<ReportIssuesPage />} />
          <Route path="/book-amenities" element={<BookAmenitiesPage />} />
          <Route path="/maintenance-fees" element={<MaintenanceFeesPage />} />
          <Route path="/community-polls" element={<CommunityPollsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
