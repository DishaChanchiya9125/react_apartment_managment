import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency, getTenants, createTenant, updateTenant, deleteTenant } from '../data/firebaseData';
import { useAuth } from '../auth/FirebaseAuthContext';
import styles from './SimplePage.module.css';

export function TenantsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    unit: '',
    rentAmount: 0,
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      console.log('Loading tenants from database...');
      const data = await getTenants();
      console.log('Tenants data received:', data);
      setTenants(data);
      console.log('Tenants state updated with', data.length, 'tenants');
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTenant) {
        await updateTenant(editingTenant.id, formData);
      } else {
        await createTenant(formData);
      }
      setShowAddModal(false);
      setEditingTenant(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        unit: '',
        rentAmount: 0,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
      });
      loadTenants();
    } catch (error) {
      console.error('Error saving tenant:', error);
      alert('Failed to save tenant. Please try again.');
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      unit: tenant.unit || '',
      rentAmount: tenant.rentAmount || 0,
      status: tenant.status || 'Active',
      joinDate: tenant.joinDate || new Date().toISOString().split('T')[0]
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    setTenantToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTenant = async () => {
    if (tenantToDelete) {
      try {
        console.log('Deleting tenant:', tenantToDelete);
        const result = await deleteTenant(tenantToDelete);
        console.log('Delete result:', result);
        
        if (result.ok) {
          console.log('Tenant deleted successfully, reloading tenants...');
          await loadTenants();
          setShowDeleteConfirm(false);
          setTenantToDelete(null);
          console.log('Tenant deletion completed');
        } else {
          console.error('Delete failed:', result.error);
          alert('Failed to delete tenant: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting tenant:', error);
        alert('Failed to delete tenant. Please try again.');
      }
    }
  };

  const cancelDeleteTenant = () => {
    setShowDeleteConfirm(false);
    setTenantToDelete(null);
  };

  if (loading) {
    return <div className={styles.page}>Loading tenants...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.h1}>Tenants</div>
          <div className={styles.sub}>Tenant directory and lease details</div>
        </div>
        {role === 'admin' && (
          <Button onClick={() => setShowAddModal(true)}>Add Tenant</Button>
        )}
      </div>

      <Card title="Tenant list" subtitle={`${tenants.length} active leases`}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Lease ends</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td className={styles.bold}>{t.name}</td>
                  <td>{t.unit}</td>
                  <td>{t.phone}</td>
                  <td>{t.email}</td>
                  <td>{t.joinDate}</td>
                  <td>
                    <span
                      className={`${styles.tag} ${t.status === 'Active' ? styles.tagOccupied : styles.tagVacant}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>
                    {role === 'admin' && (
                      <div className={styles.actions}>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(t)}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)}>Delete</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{editingTenant ? 'Edit Tenant' : 'Add New Tenant'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="tenant@example.com"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="9876543210"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  placeholder="A-101"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Rent Amount</label>
                <input
                  type="number"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({...formData, rentAmount: parseInt(e.target.value) || 0})}
                  placeholder="15000"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <Button type="submit">
                  {editingTenant ? 'Update' : 'Add'} Tenant
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTenant(null);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      unit: '',
                      rentAmount: 0,
                      status: 'Active',
                      joinDate: new Date().toISOString().split('T')[0]
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Tenant</h3>
            <p>Are you sure you want to delete this tenant? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <Button onClick={confirmDeleteTenant}>Delete</Button>
              <Button variant="ghost" onClick={cancelDeleteTenant}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
