import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  AlertTriangle,
  Building2,
  CreditCard,
  CalendarDays,
  ClipboardList,
  ReceiptText,
  Users,
  Home,
  Clock,
  CheckCircle,
  Calendar,
  Activity,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency, getDashboardStats, getRecentPayments, property } from '../data/firebaseData';
import styles from './DashboardPage.module.css';
import { useAuth } from '../auth/FirebaseAuthContext';
import { useState, useEffect } from 'react';

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, paymentsData] = await Promise.all([
          getDashboardStats(user?.email, role),
          getRecentPayments(5, user?.email, role)
        ]);
        setStats(statsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, role]);

  if (loading) {
    return <div className={styles.page}>Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Apartments', value: stats?.totalApartments || 0, icon: Building2 },
    { label: 'Active Tenants', value: stats?.activeTenants || 0, icon: Users },
    { label: 'Monthly Revenue', value: formatCurrency(stats?.monthlyRevenue || 0), icon: CreditCard },
    { label: 'Occupancy Rate', value: `${stats?.occupancyPct || 0}%`, icon: CalendarDays },
  ];

  
  const bookingStatCards = [
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: Calendar },
    { label: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Clock },
    { label: 'Confirmed Bookings', value: stats?.confirmedBookings || 0, icon: CheckCircle },
    { label: 'Total Payments', value: stats?.totalPayments || 0, icon: CreditCard },
  ];

  const systemStatCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users },
    { label: 'Total Activities', value: stats?.totalActivities || 0, icon: Activity },
    { label: 'Occupied Units', value: stats?.occupied || 0, icon: Building2 },
    { label: 'Vacant Units', value: stats?.vacant || 0, icon: Home },
  ];

  const quickLinks =
    role === 'admin'
      ? [
          { to: '/apartments', label: 'Apartments', text: 'Units & inventory', icon: Building2 },
          { to: '/tenants', label: 'Tenants', text: 'Directory & leases', icon: Users },
          { to: '/payments', label: 'Payments', text: 'Rent & dues tracking', icon: CreditCard },
          { to: '/report-issues', label: 'Issue Reporting', text: 'Manage maintenance issues', icon: AlertTriangle },
        ]
      : [
          { to: '/report-issues', label: 'Report Issues', text: 'Maintenance & facility problems', icon: AlertTriangle },
          { to: '/book-amenities', label: 'Book Amenities', text: 'Gym, pool & rooms', icon: CalendarDays },
          { to: '/community-polls', label: 'Community Polls', text: 'Vote on community decisions', icon: ClipboardList },
        ];

  return (
    <div className={styles.page}>
      {/* Modern Header with Gradient Background */}
      <div className={styles.modernHeader}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <div className={styles.greeting}>Welcome back, {user?.name || 'Admin'}!</div>
            <div className={styles.propertyInfo}>
              <h1 className={styles.h1}>{property.name}</h1>
              <div className={styles.sub}>{property.address}</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Button variant="ghost" className={styles.exportBtn}>
              <ReceiptText size={16} />
              Export
            </Button>
            {role === 'admin' ? (
              <Button onClick={() => navigate('/tenants')} className={styles.primaryBtn}>
                <Users size={16} />
                Add Tenant
                <ArrowUpRight size={14} />
              </Button>
            ) : (
              <Button onClick={() => navigate('/tenants')} className={styles.primaryBtn}>
                <Users size={16} />
                View Tenants
                <ArrowUpRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats with Enhanced Design */}
      <div className={styles.statsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <div className={styles.sectionSubtitle}>Key metrics at a glance</div>
        </div>
        <div className={styles.statsGrid}>
          {statCards.map(({ label, value, icon: Icon }, index) => (
            <Card key={label} className={`${styles.statCard} ${styles[`statCard${index}`]}`}>
              <div className={styles.statCardContent}>
                <div className={styles.statIconWrapper}>
                  <Icon size={20} className={styles.statIcon} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {role === 'admin' && (
        <>
          <div className={styles.enhancedSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Bookings & Payments</h2>
              <div className={styles.sectionSubtitle}>Financial and booking metrics</div>
            </div>
            <div className={styles.modernGrid}>
              {bookingStatCards.map(({ label, value, icon: Icon }, index) => (
                <Card key={label} className={`${styles.modernCard} ${styles[`modernCard${index}`]}`}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardIcon}>
                      <Icon size={18} />
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardValue}>{value}</div>
                      <div className={styles.cardLabel}>{label}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className={styles.enhancedSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>System Overview</h2>
              <div className={styles.sectionSubtitle}>Current system status</div>
            </div>
            <div className={styles.modernGrid}>
              {systemStatCards.map(({ label, value, icon: Icon }, index) => (
                <Card key={label} className={`${styles.modernCard} ${styles[`modernCard${index}`]}`}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardIcon}>
                      <Icon size={18} />
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardValue}>{value}</div>
                      <div className={styles.cardLabel}>{label}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      <div className={styles.quickSection}>
        <div className={styles.quickTitle}>Quick access</div>
        <div className={styles.quickGrid}>
          {quickLinks.map(({ to, label, text, icon: Icon }) => (
            <Link key={to} to={to} className={styles.quickCard}>
              <div className={styles.quickIcon}>
                <Icon size={18} />
              </div>
              <div>
                <div className={styles.quickLabel}>{label}</div>
                <div className={styles.quickText}>{text}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.grid2}>
        <Card title="Recent payments" subtitle="Latest rent activity">
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.tenantCell}>{p.tenantName}</td>
                    <td>{p.unit}</td>
                    <td>{formatCurrency(p.amount)}</td>
                    <td>
                      <span className={`${styles.pill} ${styles[p.status.toLowerCase()]}`}>{p.status}</span>
                    </td>
                    <td>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Occupancy" subtitle="Unit status summary">
          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <div className={styles.kpiLabel}>Occupied</div>
              <div className={styles.kpiValue}>{stats.occupied}</div>
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiLabel}>Vacant</div>
              <div className={styles.kpiValue}>{stats.vacant}</div>
            </div>
            <div className={styles.divider} />
            <div className={styles.bar}>
              <div className={styles.barFill} style={{ width: `${stats.occupancyPct}%` }} />
            </div>
            <div className={styles.barMeta}>
              <span>{stats.occupancyPct}% occupied</span>
              <span className={styles.muted}>Goal 80%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
