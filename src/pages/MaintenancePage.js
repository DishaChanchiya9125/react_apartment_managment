import { AlertTriangle, CheckCircle2, Clock3, Wrench } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getMaintenanceStats, maintenanceRequests } from '../data/mockData';
import styles from './MaintenancePage.module.css';

const statsConfig = [
  { key: 'open', label: 'Open', icon: AlertTriangle, tone: 'orange' },
  { key: 'inProgress', label: 'In Progress', icon: Clock3, tone: 'blue' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2, tone: 'green' },
];

function statusClass(status) {
  const s = status.toLowerCase().replace(/\s+/g, '');
  if (s === 'inprogress') return styles.inProgress;
  if (s === 'open') return styles.open;
  if (s === 'resolved') return styles.resolved;
  return styles.open;
}

function priorityClass(p) {
  if (p === 'high') return styles.high;
  if (p === 'medium') return styles.medium;
  return styles.low;
}

export function MaintenancePage() {
  const stats = getMaintenanceStats();

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.h1}>Maintenance</div>
          <div className={styles.sub}>Track repairs and facility requests</div>
        </div>
        <Button className={styles.headerBtn}>
          <Wrench size={16} />
          <span>New request</span>
        </Button>
      </div>

      <div className={styles.statsGrid}>
        {statsConfig.map(({ key, label, icon: Icon, tone }) => (
          <Card
            key={key}
            title={label}
            right={
              <div className={`${styles.statIcon} ${styles[tone]}`} aria-hidden="true">
                <Icon size={18} />
              </div>
            }
          >
            <div className={styles.statValue}>{stats[key]}</div>
            <div className={styles.statHint}>Total tickets: {stats.total}</div>
          </Card>
        ))}
      </div>

      <Card title="All requests" subtitle="Latest first">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Issue</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Reported</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...maintenanceRequests]
                .sort((a, b) => (a.reported < b.reported ? 1 : -1))
                .map((m) => (
                  <tr key={m.id}>
                    <td className={styles.bold}>{m.title}</td>
                    <td>{m.unit}</td>
                    <td>
                      <span className={`${styles.pill} ${priorityClass(m.priority)}`}>{m.priority}</span>
                    </td>
                    <td>{m.reported}</td>
                    <td>
                      <span className={`${styles.statusPill} ${statusClass(m.status)}`}>{m.status}</span>
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
