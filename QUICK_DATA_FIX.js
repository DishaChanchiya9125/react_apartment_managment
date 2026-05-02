// Quick Data Fix Script - Run this in browser console
// Open browser console (F12) and paste this code

// Create sample data directly
const createQuickSampleData = async () => {
  console.log('Creating quick sample data...');
  
  try {
    // Check if Firebase is available
    if (!window.firebase || !window.firebase.firestore) {
      console.error('Firebase not initialized');
      return;
    }

    const db = window.firebase.firestore();
    const auth = window.firebase.auth();

    // Wait for auth to be ready
    if (!auth.currentUser) {
      console.log('Please login first, then run this again');
      return;
    }

    console.log('User logged in:', auth.currentUser.email);

    // Sample apartments
    const apartments = [
      { unit: 'A-101', wing: 'A', floor: '1', type: '2BHK', monthlyRent: 15000, status: 'Occupied', tenantId: 'tenant1', description: 'Spacious 2BHK with balcony' },
      { unit: 'A-102', wing: 'A', floor: '1', type: '2BHK', monthlyRent: 15000, status: 'Vacant', description: 'Spacious 2BHK with balcony' },
      { unit: 'B-201', wing: 'B', floor: '2', type: '1BHK', monthlyRent: 10000, status: 'Occupied', tenantId: 'tenant2', description: 'Compact 1BHK with modern fittings' },
      { unit: 'B-202', wing: 'B', floor: '2', type: '1BHK', monthlyRent: 10000, status: 'Vacant', description: 'Compact 1BHK with modern fittings' },
      { unit: 'C-301', wing: 'C', floor: '3', type: '3BHK', monthlyRent: 20000, status: 'Occupied', tenantId: 'tenant3', description: 'Luxurious 3BHK with sea view' }
    ];

    // Sample maintenance requests
    const maintenance = [
      { title: 'Kitchen faucet leak', description: 'Water leaking from kitchen faucet continuously', unit: 'A-101', priority: 'medium', status: 'Open', reportedBy: 'tenant1', category: 'Plumbing', createdAt: new Date('2024-04-25') },
      { title: 'AC not working', description: 'Air conditioner not cooling properly', unit: 'B-201', priority: 'high', status: 'In Progress', reportedBy: 'tenant2', category: 'Electrical', createdAt: new Date('2024-04-24') },
      { title: 'Lift malfunction', description: 'Lift buttons not responding properly', unit: 'Common Area', priority: 'high', status: 'Resolved', reportedBy: 'admin', category: 'Common Area', createdAt: new Date('2024-04-23'), resolvedDate: new Date('2024-04-24') },
      { title: 'Parking space issue', description: 'Someone parked in my designated spot', unit: 'C-301', priority: 'low', status: 'Open', reportedBy: 'tenant3', category: 'Parking', createdAt: new Date('2024-04-26') }
    ];

    // Sample bookings
    const bookings = [
      { amenity: 'Gym', date: '2024-04-30', startTime: '06:00', endTime: '07:00', bookedBy: 'tenant1', status: 'Confirmed', createdAt: new Date('2024-04-25') },
      { amenity: 'Pool', date: '2024-05-01', startTime: '17:00', endTime: '18:00', bookedBy: 'tenant2', status: 'Pending', createdAt: new Date('2024-04-26') },
      { amenity: 'Meeting Room', date: '2024-05-02', startTime: '10:00', endTime: '11:00', bookedBy: 'tenant3', status: 'Confirmed', createdAt: new Date('2024-04-27') }
    ];

    // Sample polls
    const polls = [
      { question: 'Should we install solar panels on the rooftop?', description: 'Voting for renewable energy installation to reduce electricity costs', options: [{ option: 'Yes, install immediately', count: 15 }, { option: 'Yes, but after 3 months', count: 8 }, { option: 'No, too expensive', count: 5 }, { option: 'Need more information', count: 3 }], createdBy: 'admin', status: 'Open', startDate: new Date('2024-04-20'), endDate: new Date('2024-05-05'), allowMultipleVotes: false, isAnonymous: false, createdAt: new Date('2024-04-20') },
      { question: 'New gym equipment budget approval', description: 'Annual budget for new gym equipment and maintenance', options: [{ option: '₹50,000 - Basic equipment', count: 12 }, { option: '₹75,000 - Standard equipment', count: 18 }, { option: '₹1,00,000 - Premium equipment', count: 7 }], createdBy: 'admin', status: 'Open', startDate: new Date('2024-04-22'), endDate: new Date('2024-05-10'), allowMultipleVotes: false, isAnonymous: false, createdAt: new Date('2024-04-22') }
    ];

    // Sample payments
    const payments = [
      { paymentId: 'PAY-001', tenantId: 'tenant1', apartmentId: 'A-101', type: 'Rent', amount: 15000, dueDate: '2024-05-01', paidDate: '2024-04-28', status: 'Paid', paymentMethod: 'Bank Transfer', transactionId: 'TXN123456789', description: 'Monthly rent for May 2024', paidAmount: 15000, remainingAmount: 0, createdBy: 'admin' },
      { paymentId: 'PAY-002', tenantId: 'tenant2', apartmentId: 'B-201', type: 'Maintenance Fee', amount: 500, dueDate: '2024-05-05', status: 'Pending', paymentMethod: 'Cash', description: 'Monthly maintenance fee for May 2024', paidAmount: 0, remainingAmount: 500, createdBy: 'admin' },
      { paymentId: 'PAY-003', tenantId: 'tenant3', apartmentId: 'C-301', type: 'Rent', amount: 20000, dueDate: '2024-05-01', paidDate: '2024-04-25', status: 'Paid', paymentMethod: 'Online Banking', transactionId: 'TXN987654321', description: 'Monthly rent for May 2024', paidAmount: 20000, remainingAmount: 0, createdBy: 'admin' }
    ];

    // Add data to Firestore
    console.log('Adding apartments...');
    for (const apt of apartments) {
      await db.collection('apartments').add(apt);
    }

    console.log('Adding maintenance requests...');
    for (const req of maintenance) {
      await db.collection('maintenance').add(req);
    }

    console.log('Adding bookings...');
    for (const booking of bookings) {
      await db.collection('amenityBookings').add(booking);
    }

    console.log('Adding polls...');
    for (const poll of polls) {
      await db.collection('communityPolls').add(poll);
    }

    console.log('Adding payments...');
    for (const payment of payments) {
      await db.collection('payments').add(payment);
    }

    console.log('✅ Sample data created successfully!');
    console.log('📊 Data added:');
    console.log(`- ${apartments.length} apartments`);
    console.log(`- ${maintenance.length} maintenance requests`);
    console.log(`- ${bookings.length} bookings`);
    console.log(`- ${polls.length} polls`);
    console.log(`- ${payments.length} payments`);
    
    console.log('🔄 Refresh the page to see data!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
};

// Auto-run the function
createQuickSampleData();

console.log('🚀 Quick data fix script loaded!');
console.log('📋 If data doesn\'t appear, refresh the page after script completes.');
