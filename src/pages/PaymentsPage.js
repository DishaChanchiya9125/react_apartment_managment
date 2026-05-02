import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency, getRecentPayments } from '../data/firebaseData';
import { useAuth } from '../auth/FirebaseAuthContext';
import styles from './SimplePage.module.css';

export function PaymentsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      console.log('Loading payments from database...');
      const data = await getRecentPayments(50, user?.email, role);
      console.log('Payments data received:', data);
      setPayments(data);
      console.log('Payments state updated with', data.length, 'payments');
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.page}>Loading payments...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.h1}>Payments</div>
          <div className={styles.sub}>Track rent payments and dues</div>
        </div>
        <Button>Record payment</Button>
      </div>

      <Card title="Transactions" subtitle="Recent items">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {console.log('Rendering payments table with data:', payments) || payments.map((r) => (
                <tr key={r.id}>
                  <td className={styles.mono}>{r.id || 'Unknown'}</td>
                  <td className={styles.bold}>{r.tenantName || 'Unknown'}</td>
                  <td>{r.unit || 'Unknown'}</td>
                  <td>{formatCurrency(r.amount || 0)}</td>
                  <td>
                    <span className={`${styles.tag} ${styles[`status${r.status}`] || styles.statusPending}`}>{r.status || 'Pending'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
