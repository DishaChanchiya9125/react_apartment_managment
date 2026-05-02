import styles from './Button.module.css';

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`.trim();
  return <button className={cls} type="button" {...props} />;
}

