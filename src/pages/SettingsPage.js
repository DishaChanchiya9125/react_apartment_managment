import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { property } from '../data/mockData';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.h1}>Settings</div>
          <div className={styles.sub}>Branding and preferences</div>
        </div>
      </div>

      <div className={styles.grid}>
        <Card title="Property Info" subtitle="Shown across the app">
          <form className={styles.form}>
            <label className={styles.field}>
              <span>Property Name</span>
              <input defaultValue={property.name} />
            </label>
            <label className={styles.field}>
              <span>Address</span>
              <input defaultValue={property.address} />
            </label>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>Currency</span>
                <select defaultValue="INR">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Due Day</span>
                <select defaultValue="5">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.actions}>
              <Button variant="ghost">Reset</Button>
              <Button>Save</Button>
            </div>
          </form>
        </Card>

        <Card title="Theme" subtitle="Visual preferences">
          <div className={styles.themeBox}>
            <div className={styles.themeSwatch} />
            <div>
              <div className={styles.themeTitle}>Indigo</div>
              <div className={styles.themeSub}>Primary accent</div>
            </div>
          </div>
          <div className={styles.note}>
            Once the Figma tokens are confirmed, I’ll set exact colors and radii here.
          </div>
        </Card>
      </div>
    </div>
  );
}

