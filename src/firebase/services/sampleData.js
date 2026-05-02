// Sample Data Service - Create sample data for Firebase
import { 
  apartmentService,
  maintenanceService,
  amenityBookingService,
  communityPollService,
  paymentService
} from './firestoreService';

// Sample apartments data
export const createSampleApartments = async () => {
  try {
    const apartments = [
      {
        unit: 'A-101',
        wing: 'A',
        floor: '1',
        type: '2BHK',
        monthlyRent: 15000,
        status: 'Occupied',
        tenantId: 'tenant1',
        description: 'Spacious 2BHK with balcony',
        amenities: ['Parking', 'Lift', 'Security']
      },
      {
        unit: 'A-102',
        wing: 'A',
        floor: '1',
        type: '2BHK',
        monthlyRent: 15000,
        status: 'Vacant',
        description: 'Spacious 2BHK with balcony',
        amenities: ['Parking', 'Lift', 'Security']
      },
      {
        unit: 'B-201',
        wing: 'B',
        floor: '2',
        type: '1BHK',
        monthlyRent: 10000,
        status: 'Occupied',
        tenantId: 'tenant2',
        description: 'Compact 1BHK with modern fittings',
        amenities: ['Parking', 'Lift']
      },
      {
        unit: 'B-202',
        wing: 'B',
        floor: '2',
        type: '1BHK',
        monthlyRent: 10000,
        status: 'Vacant',
        description: 'Compact 1BHK with modern fittings',
        amenities: ['Parking', 'Lift']
      },
      {
        unit: 'C-301',
        wing: 'C',
        floor: '3',
        type: '3BHK',
        monthlyRent: 20000,
        status: 'Occupied',
        tenantId: 'tenant3',
        description: 'Luxurious 3BHK with sea view',
        amenities: ['Parking', 'Lift', 'Security', 'Gym']
      }
    ];

    for (const apartment of apartments) {
      await apartmentService.create(apartment);
    }
    
    console.log('Sample apartments created successfully');
    return { ok: true, message: 'Sample apartments created' };
  } catch (error) {
    console.error('Error creating sample apartments:', error);
    return { ok: false, error: error.message };
  }
};

// Sample maintenance requests
export const createSampleMaintenance = async () => {
  try {
    const maintenanceRequests = [
      {
        title: 'Kitchen faucet leak',
        description: 'Water leaking from kitchen faucet continuously',
        unit: 'A-101',
        priority: 'medium',
        status: 'Open',
        reportedBy: 'tenant1',
        category: 'Plumbing',
        createdAt: new Date('2024-04-25')
      },
      {
        title: 'AC not working',
        description: 'Air conditioner not cooling properly',
        unit: 'B-201',
        priority: 'high',
        status: 'In Progress',
        reportedBy: 'tenant2',
        category: 'Electrical',
        createdAt: new Date('2024-04-24')
      },
      {
        title: 'Lift malfunction',
        description: 'Lift buttons not responding properly',
        unit: 'Common Area',
        priority: 'high',
        status: 'Resolved',
        reportedBy: 'admin',
        category: 'Common Area',
        createdAt: new Date('2024-04-23'),
        resolvedDate: new Date('2024-04-24')
      },
      {
        title: 'Parking space issue',
        description: 'Someone parked in my designated spot',
        unit: 'C-301',
        priority: 'low',
        status: 'Open',
        reportedBy: 'tenant3',
        category: 'Parking',
        createdAt: new Date('2024-04-26')
      }
    ];

    for (const request of maintenanceRequests) {
      await maintenanceService.create(request);
    }
    
    console.log('Sample maintenance requests created successfully');
    return { ok: true, message: 'Sample maintenance requests created' };
  } catch (error) {
    console.error('Error creating sample maintenance:', error);
    return { ok: false, error: error.message };
  }
};

// Sample amenity bookings
export const createSampleBookings = async () => {
  try {
    const bookings = [
      {
        amenity: 'Gym',
        date: '2024-04-30',
        startTime: '06:00',
        endTime: '07:00',
        bookedBy: 'tenant1',
        status: 'Confirmed',
        createdAt: new Date('2024-04-25')
      },
      {
        amenity: 'Pool',
        date: '2024-05-01',
        startTime: '17:00',
        endTime: '18:00',
        bookedBy: 'tenant2',
        status: 'Pending',
        createdAt: new Date('2024-04-26')
      },
      {
        amenity: 'Meeting Room',
        date: '2024-05-02',
        startTime: '10:00',
        endTime: '11:00',
        bookedBy: 'tenant3',
        status: 'Confirmed',
        createdAt: new Date('2024-04-27')
      }
    ];

    for (const booking of bookings) {
      await amenityBookingService.create(booking);
    }
    
    console.log('Sample amenity bookings created successfully');
    return { ok: true, message: 'Sample bookings created' };
  } catch (error) {
    console.error('Error creating sample bookings:', error);
    return { ok: false, error: error.message };
  }
};

// Sample community polls
export const createSamplePolls = async () => {
  try {
    const polls = [
      {
        question: 'Should we install solar panels on the rooftop?',
        description: 'Voting for renewable energy installation to reduce electricity costs',
        options: [
          { option: 'Yes, install immediately', count: 15 },
          { option: 'Yes, but after 3 months', count: 8 },
          { option: 'No, too expensive', count: 5 },
          { option: 'Need more information', count: 3 }
        ],
        createdBy: 'admin',
        status: 'Open',
        startDate: new Date('2024-04-20'),
        endDate: new Date('2024-05-05'),
        allowMultipleVotes: false,
        isAnonymous: false,
        createdAt: new Date('2024-04-20')
      },
      {
        question: 'New gym equipment budget approval',
        description: 'Annual budget for new gym equipment and maintenance',
        options: [
          { option: '₹50,000 - Basic equipment', count: 12 },
          { option: '₹75,000 - Standard equipment', count: 18 },
          { option: '₹1,00,000 - Premium equipment', count: 7 }
        ],
        createdBy: 'admin',
        status: 'Open',
        startDate: new Date('2024-04-22'),
        endDate: new Date('2024-05-10'),
        allowMultipleVotes: false,
        isAnonymous: false,
        createdAt: new Date('2024-04-22')
      }
    ];

    for (const poll of polls) {
      await communityPollService.create(poll);
    }
    
    console.log('Sample community polls created successfully');
    return { ok: true, message: 'Sample polls created' };
  } catch (error) {
    console.error('Error creating sample polls:', error);
    return { ok: false, error: error.message };
  }
};

// Sample payments
export const createSamplePayments = async () => {
  try {
    const payments = [
      {
        paymentId: 'PAY-001',
        tenantId: 'tenant1',
        apartmentId: 'A-101',
        type: 'Rent',
        amount: 15000,
        dueDate: '2024-05-01',
        paidDate: '2024-04-28',
        status: 'Paid',
        paymentMethod: 'Bank Transfer',
        transactionId: 'TXN123456789',
        description: 'Monthly rent for May 2024',
        paidAmount: 15000,
        remainingAmount: 0,
        createdBy: 'admin'
      },
      {
        paymentId: 'PAY-002',
        tenantId: 'tenant2',
        apartmentId: 'B-201',
        type: 'Maintenance Fee',
        amount: 500,
        dueDate: '2024-05-05',
        status: 'Pending',
        paymentMethod: 'Cash',
        description: 'Monthly maintenance fee for May 2024',
        paidAmount: 0,
        remainingAmount: 500,
        createdBy: 'admin'
      },
      {
        paymentId: 'PAY-003',
        tenantId: 'tenant3',
        apartmentId: 'C-301',
        type: 'Rent',
        amount: 20000,
        dueDate: '2024-05-01',
        paidDate: '2024-04-25',
        status: 'Paid',
        paymentMethod: 'Online Banking',
        transactionId: 'TXN987654321',
        description: 'Monthly rent for May 2024',
        paidAmount: 20000,
        remainingAmount: 0,
        createdBy: 'admin'
      }
    ];

    for (const payment of payments) {
      await paymentService.create(payment);
    }
    
    console.log('Sample payments created successfully');
    return { ok: true, message: 'Sample payments created' };
  } catch (error) {
    console.error('Error creating sample payments:', error);
    return { ok: false, error: error.message };
  }
};

// Create all sample data
export const createAllSampleData = async () => {
  try {
    console.log('Creating all sample data...');
    
    const results = await Promise.all([
      createSampleApartments(),
      createSampleMaintenance(),
      createSampleBookings(),
      createSamplePolls(),
      createSamplePayments()
    ]);
    
    const successCount = results.filter(r => r.ok).length;
    const totalCount = results.length;
    
    console.log(`Sample data creation complete: ${successCount}/${totalCount} successful`);
    
    return { 
      ok: successCount === totalCount,
      message: `Created ${successCount}/${totalCount} sample data sets`,
      details: results
    };
  } catch (error) {
    console.error('Error creating sample data:', error);
    return { ok: false, error: error.message };
  }
};
