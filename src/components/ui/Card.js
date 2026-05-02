import styles from './Card.module.css';

export function Card({ title, subtitle, right, children }) {
  return (
    <section className={styles.card}>
      {(title || subtitle || right) && (
        <header className={styles.header}>
          <div className={styles.headText}>
            {title && <div className={styles.title}>{title}</div>}
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>
          {right && <div className={styles.right}>{right}</div>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  );
}

