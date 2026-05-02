import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Users,
  Wrench,
  CreditCard,
} from 'lucide-react';
import { property } from '../../data/firebaseData';
import styles from './Sidebar.module.css';
import { useAuth } from '../../auth/FirebaseAuthContext';
import { Button } from '../ui/Button';

export function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/report-issues', label: 'Report Issues', icon: AlertTriangle },
    { to: '/book-amenities', label: 'Book Amenities', icon: CalendarDays },
    { to: '/maintenance-fees', label: 'Maintenance Fees', icon: ReceiptText },
    { to: '/community-polls', label: 'Community Polls', icon: ClipboardList },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/apartments', label: 'Apartments', icon: Building2 },
    { to: '/tenants', label: 'Tenants', icon: Users },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/report-issues', label: 'Issue Reporting', icon: AlertTriangle },
    { to: '/book-amenities', label: 'Amenities Booking', icon: CalendarDays },
    { to: '/community-polls', label: 'Community Polls', icon: ClipboardList },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const nav = role === 'admin' ? adminNav : userNav;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo} aria-hidden="true" />
        <div>
          <div className={styles.title}>{property.name}</div>
          <div className={styles.subtitle}>Management</div>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Primary">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={styles.footer}>
        <div className={styles.userDot} aria-hidden="true" />
        <div className={styles.userMeta}>
          <div className={styles.userName}>{user?.role === 'admin' ? 'Admin' : user?.email}</div>
          <div className={styles.userRole}>{user?.role === 'admin' ? 'Administrator' : 'Resident'}</div>
        </div>

        <Button variant="ghost" size="sm" className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}

