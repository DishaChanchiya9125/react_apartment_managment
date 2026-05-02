import { useState } from 'react';
import { Button } from '../components/ui/Button';
import styles from './LoginPage.module.css';
import { setupAdminUser, testAdminLogin } from '../firebase/services/adminSetup';

export function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetupAdmin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await setupAdminUser();
      if (result.ok) {
        setMessage('✅ Admin user setup successful!');
      } else {
        setMessage('❌ Error: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await testAdminLogin();
      if (result.ok) {
        setMessage('✅ Admin login test successful! Role: ' + result.user.role);
      } else {
        setMessage('❌ Login test failed: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.title}>Admin Setup</div>
        <div className={styles.subtitle}>Setup and test admin user</div>

        <div className={styles.form}>
          <div className={styles.note}>
            <strong>Admin Credentials:</strong><br/>
            Email: admin@gmail.com<br/>
            Password: admin@1234
          </div>

          <div style={{ margin: '20px 0' }}>
            <Button 
              className={styles.submit} 
              onClick={handleSetupAdmin} 
              disabled={loading}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              {loading ? 'Setting up...' : 'Setup Admin User'}
            </Button>

            <Button 
              variant="ghost" 
              onClick={handleTestLogin} 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Testing...' : 'Test Admin Login'}
            </Button>
          </div>

          {message && (
            <div style={{ 
              padding: '10px', 
              margin: '10px 0', 
              borderRadius: '4px',
              backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
              color: message.includes('✅') ? '#155724' : '#721c24'
            }}>
              {message}
            </div>
          )}

          <div className={styles.smallRow}>
            <span>Done with setup?</span>
            <a href="/login" className={styles.link}>
              Go to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
