import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import styles from './RegisterPage.module.css';
import { useAuth } from '../auth/FirebaseAuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    try {
      const res = await register({ email, password, name });
      if (!res.ok) {
        setError(res.error || 'Registration failed.');
        return;
      }
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.title}>Register</div>
        <div className={styles.subtitle}>Create your account to access the portal</div>

        <div className={styles.form}>
          <label className={styles.field}>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>

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
              placeholder="Create a password"
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <Button className={styles.submit} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>

          <div className={styles.smallRow}>
            <span>Already have an account?</span>
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

