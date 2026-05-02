import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import styles from './LoginPage.module.css';
import { useAuth } from '../auth/FirebaseAuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/dashboard';

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    try {
      const res = await login({ email, password });
      if (!res.ok) {
        setError(res.error || 'Login failed.');
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.title}>Login</div>
        <div className={styles.subtitle}>Welcome back to your apartment portal</div>

        <div className={styles.form}>
          <label className={styles.field}>
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <Button className={styles.submit} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <div className={styles.smallRow}>
            <span>New user?</span>
            <Link to="/register" className={styles.link}>
              Register
            </Link>
          </div>

          <div className={styles.note}>
            Admin credentials: <b>admin@gmail.com</b> / <b>admin@1234</b>
          </div>
        </div>
      </div>
    </div>
  );
}

