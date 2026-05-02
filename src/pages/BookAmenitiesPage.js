import { CalendarDays, Clock3, CheckCircle2, Plus } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAmenityBookings, createAmenityBooking } from '../data/firebaseData';
import styles from './BookAmenitiesPage.module.css';
import { useAuth } from '../auth/FirebaseAuthContext';

function statusClass(status) {
  if (status === 'Pending') return styles.pending;
  if (status === 'Confirmed') return styles.confirmed;
  return styles.pending;
}

export function BookAmenitiesPage() {
  const { user } = useAuth();
  const role = user?.role;

  
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'Pending').length;
    const confirmed = bookings.filter((b) => b.status === 'Confirmed').length;
    return { upcoming: bookings.length, pending, confirmed };
  }, [bookings]);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [newBooking, setNewBooking] = useState({ amenity: '', startTime: '', endTime: '', date: '' });

  useEffect(() => {
    const loadBookings = async () => {
      try {
        console.log('Loading bookings for user:', user?.email, 'role:', role);
        console.log('User-specific filtering: Normal users see only their bookings, admin sees all bookings');
        
        const bookingsData = await getAmenityBookings(user?.email, role);
        
        console.log('Bookings data received for user', user?.email, ':', bookingsData);
        console.log('Each booking belongs to:', bookingsData.map(b => b.bookedBy));
        
        // Verify user-specific filtering
        if (role !== 'admin' && bookingsData.length > 0) {
          const allBelongToUser = bookingsData.every(booking => 
            booking.bookedBy?.toLowerCase().trim() === user?.email?.toLowerCase().trim()
          );
          console.log('All bookings belong to current user?', allBelongToUser);
        }
        
        setBookings(bookingsData);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user, role]);

  const handleBookAmenity = async () => {
    if (!newBooking.amenity || !newBooking.startTime || !newBooking.endTime || !newBooking.date) return;
    
    try {
      const cleanEmail = user?.email ? user.email.toLowerCase().trim() : user?.email;
      const bookingData = {
        amenity: newBooking.amenity,
        date: newBooking.date,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        bookedBy: cleanEmail,
        status: 'Pending',
        createdAt: new Date()
      };
      
      console.log('Creating booking with data:', bookingData);
      console.log('Original user email:', user?.email, 'Cleaned email:', cleanEmail);
      
      const result = await createAmenityBooking(bookingData);
      if (result.ok) {
        // Reload bookings
        const bookingsData = await getAmenityBookings(user?.email, role);
        setBookings(bookingsData);
        setNewBooking({ amenity: '', startTime: '', endTime: '', date: '' });
        setShowBookingForm(false);
      } else {
        console.error('Failed to create booking:', result.error);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  if (loading) {
    return <div className={styles.page}>Loading bookings data...</div>;
  }

  return (
    <div className={styles.page}>
      {showBookingForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Book Amenity</h3>
            <select
              value={newBooking.amenity}
              onChange={(e) => setNewBooking(prev => ({ ...prev, amenity: e.target.value }))}
            >
              <option value="">Select Amenity</option>
              <option value="Gym">Gym</option>
              <option value="Pool">Pool</option>
              <option value="Meeting Room">Meeting Room</option>
            </select>
            <input
              type="date"
              value={newBooking.date}
              onChange={(e) => setNewBooking(prev => ({ ...prev, date: e.target.value }))}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={newBooking.startTime}
                onChange={(e) => setNewBooking(prev => ({ ...prev, startTime: e.target.value }))}
                style={{ flex: 1 }}
              >
                <option value="">Start Time</option>
                <option value="06:00">6:00 AM</option>
                <option value="07:00">7:00 AM</option>
                <option value="08:00">8:00 AM</option>
                <option value="17:00">5:00 PM</option>
                <option value="18:00">6:00 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="20:00">8:00 PM</option>
              </select>
              <select
                value={newBooking.endTime}
                onChange={(e) => setNewBooking(prev => ({ ...prev, endTime: e.target.value }))}
                style={{ flex: 1 }}
              >
                <option value="">End Time</option>
                <option value="07:00">7:00 AM</option>
                <option value="08:00">8:00 AM</option>
                <option value="09:00">9:00 AM</option>
                <option value="18:00">6:00 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="20:00">8:00 PM</option>
                <option value="21:00">9:00 PM</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <Button onClick={handleBookAmenity}>Book Now</Button>
              <Button variant="ghost" onClick={() => setShowBookingForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.headerRow}>
        <div>
          <div className={styles.h1}>{role === 'admin' ? 'Amenities Booking (Admin)' : 'Book Amenities'}</div>
          <div className={styles.sub}>{role === 'admin' ? 'Approve and update reservations' : 'Reserve gym, pool, and meeting rooms'}</div>
        </div>
        <Button className={styles.bookBtn} onClick={() => setShowBookingForm(true)}>
          <Plus size={14} />
          <span>{role === 'admin' ? 'Create booking' : 'Book Amenities'}</span>
        </Button>
      </div>

      {role === 'admin' && (
        <div className={styles.statsGrid}>
          <Card
            title="Upcoming"
            right={
              <div className={`${styles.statIcon} ${styles.blue}`} aria-hidden="true">
                <CalendarDays size={18} />
              </div>
            }
          >
            <div className={styles.statValue}>{stats.upcoming}</div>
            <div className={styles.statHint}>Total bookings</div>
          </Card>
          <Card
            title="Confirmed"
            right={
              <div className={`${styles.statIcon} ${styles.green}`} aria-hidden="true">
                <CheckCircle2 size={18} />
              </div>
            }
          >
            <div className={styles.statValue}>{stats.confirmed}</div>
            <div className={styles.statHint}>Approved reservations</div>
          </Card>
          <Card
            title="Pending"
            right={
              <div className={`${styles.statIcon} ${styles.orange}`} aria-hidden="true">
                <Clock3 size={18} />
              </div>
            }
          >
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statHint}>Waiting for approval</div>
          </Card>
        </div>
      )}

      <Card title={role === 'admin' ? 'All bookings' : 'My bookings'} subtitle="Latest first">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Amenity</th>
                <th>Slot</th>
                <th>Booked by</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className={styles.bold}>{b.amenity}</td>
                  <td>{b.slot}</td>
                  <td>{b.bookedBy}</td>
                  <td>
                    {role === 'admin' ? (
                      <select
                        className={styles.adminSelect}
                        value={b.status}
                        onChange={async (e) => {
                          const nextStatus = e.target.value;
                          // Update local state immediately for better UX
                          setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: nextStatus } : x)));
                          
                          // Update database
                          try {
                            const { updateBookingStatus } = await import('../data/firebaseData');
                            const result = await updateBookingStatus(b.id, nextStatus);
                            console.log('Booking status update result:', result);
                          } catch (error) {
                            console.error('Error updating booking status:', error);
                          }
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                      </select>
                    ) : (
                      <span className={`${styles.statusPill} ${statusClass(b.status)}`}>{b.status}</span>
                    )}
                  </td>
                  <td>{b.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

