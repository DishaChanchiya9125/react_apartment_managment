import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency, getApartments, createApartment, updateApartment, deleteApartment, getTenants } from '../data/firebaseData';
import { useAuth } from '../auth/FirebaseAuthContext';
import styles from './SimplePage.module.css';

export function ApartmentsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState(null);
  const [formData, setFormData] = useState({
    unit: '',
    type: '1BHK',
    rent: 0,
    status: 'Vacant',
    tenant: '',
    size: '',
    floor: ''
  });

  useEffect(() => {
    loadApartments();
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const getTenantById = (tenantId) => {
    if (!tenantId || !tenants || tenants.length === 0) return null;
    return tenants.find(tenant => tenant.email === tenantId || tenant.id === tenantId);
  };

  const loadApartments = async () => {
    try {
      console.log('Loading apartments from database...');
      const data = await getApartments();
      console.log('Apartments data received:', data);
      setApartments(data);
      console.log('Apartments state updated with', data.length, 'apartments');
    } catch (error) {
      console.error('Error loading apartments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingApartment) {
        await updateApartment(editingApartment.id, formData);
      } else {
        await createApartment(formData);
      }
      setShowAddModal(false);
      setEditingApartment(null);
      setFormData({
        unit: '',
        type: '1BHK',
        rent: 0,
        status: 'Vacant',
        tenant: '',
        size: '',
        floor: ''
      });
      loadApartments();
    } catch (error) {
      console.error('Error saving apartment:', error);
      alert('Failed to save apartment. Please try again.');
    }
  };

  const handleEdit = (apartment) => {
    setEditingApartment(apartment);
    setFormData({
      unit: apartment.unit || '',
      type: apartment.type || '1BHK',
      rent: apartment.rent || 0,
      status: apartment.status || 'Vacant',
      tenant: apartment.tenant || '',
      size: apartment.size || '',
      floor: apartment.floor || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    setApartmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (apartmentToDelete) {
      try {
        await deleteApartment(apartmentToDelete);
        loadApartments();
        setShowDeleteConfirm(false);
        setApartmentToDelete(null);
      } catch (error) {
        console.error('Error deleting apartment:', error);
        alert('Failed to delete apartment. Please try again.');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setApartmentToDelete(null);
  };

  if (loading) {
    return <div className={styles.page}>Loading apartments...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.h1}>Apartments</div>
          <div className={styles.sub}>Manage units, rent, and availability</div>
        </div>
        {role === 'admin' && (
          <Button onClick={() => setShowAddModal(true)}>Add Unit</Button>
        )}
      </div>

      <Card title="Units" subtitle={`${apartments.length} units in portfolio`}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Wing</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Monthly rent</th>
                <th>Tenant</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {console.log('Rendering apartments table with data:', apartments) || apartments.map((a) => {
                const tenant = a.tenantId ? getTenantById(a.tenantId) : null;
                console.log('Rendering apartment:', a, 'with tenant:', tenant);
                return (
                  <tr key={a.id}>
                    <td className={styles.bold}>{a.unit}</td>
                    <td>{a.wing}</td>
                    <td>{a.floor}</td>
                    <td>{a.type}</td>
                    <td>{formatCurrency(a.monthlyRent)}</td>
                    <td>{tenant ? tenant.name : '—'}</td>
                    <td>
                      <span
                        className={`${styles.tag} ${a.status === 'Occupied' ? styles.tagOccupied : styles.tagVacant}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td>
                      {role === 'admin' && (
                        <div className={styles.actions}>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(a)}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}>Delete</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{editingApartment ? 'Edit Unit' : 'Add New Unit'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Unit Number</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  placeholder="A-101"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="1BHK">1 BHK</option>
                  <option value="2BHK">2 BHK</option>
                  <option value="3BHK">3 BHK</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Monthly Rent</label>
                <input
                  type="number"
                  value={formData.rent}
                  onChange={(e) => setFormData({...formData, rent: parseInt(e.target.value) || 0})}
                  placeholder="15000"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Tenant Email</label>
                <input
                  type="email"
                  value={formData.tenant}
                  onChange={(e) => setFormData({...formData, tenant: e.target.value})}
                  placeholder="tenant@example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Size (sq ft)</label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  placeholder="800"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Floor</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  placeholder="1"
                />
              </div>
              <div className={styles.modalActions}>
                <Button type="submit">
                  {editingApartment ? 'Update' : 'Add'} Unit
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingApartment(null);
                    setFormData({
                      unit: '',
                      type: '1BHK',
                      rent: 0,
                      status: 'Vacant',
                      tenant: '',
                      size: '',
                      floor: ''
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
            <h3>Delete Apartment</h3>
            <p>Are you sure you want to delete this apartment? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <Button onClick={confirmDelete}>Delete</Button>
              <Button variant="ghost" onClick={cancelDelete}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
