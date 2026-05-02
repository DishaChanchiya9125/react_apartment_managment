import { Bell, Search } from 'lucide-react';
import { property } from '../../data/firebaseData';
import styles from './Topbar.module.css';

export function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.pageTitle}>{property.name}</div>
        <div className={styles.badge}>Demo</div>
      </div>

      <div className={styles.right}>
        <label className={styles.search}>
          <Search size={16} />
          <input placeholder="Search..." aria-label="Search" />
        </label>
        <button className={styles.iconBtn} aria-label="Notifications" type="button">
          <Bell size={18} />
        </button>
        <div className={styles.avatar} aria-label="User" />
      </div>
    </header>
  );
}

