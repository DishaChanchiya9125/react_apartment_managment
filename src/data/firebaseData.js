// Firebase Data Services
import { 
  maintenanceService,
  amenityBookingService,
  communityPollService,
  paymentService,
  apartmentService,
  userService,
  getApartmentStats,
  getPaymentStats
} from '../firebase/services/firestoreService';

// Mock data for fallback
export const property = {
  name: 'Lakeside Apartments',
  address: 'Pune, Maharashtra',
  currency: 'INR',
  symbol: '₹',
};

// Firebase data functions
export const getDashboardStats = async (userEmail = null, userRole = 'user') => {
  try {
    console.log('Getting dashboard stats for:', userEmail, userRole);
    
    // Get counts for all data types
    const [maintenanceStats, apartmentStats, paymentStats, amenityStats] = await Promise.all([
      getMaintenanceStats(userEmail, userRole),
      getApartmentStats(),
      getPaymentStats(userRole === 'admin' ? null : userEmail, userRole),
      getAmenityBookings(userEmail, userRole)
    ]);

    console.log('Stats received:', { maintenanceStats, apartmentStats, paymentStats, amenityStats });

    // Calculate real monthly revenue from payments
    const monthlyRevenue = paymentStats?.monthlyTotal || 0;
    
    // Count amenity bookings by status
    const pendingBookings = amenityStats.filter(b => b.status === 'Pending').length;
    const confirmedBookings = amenityStats.filter(b => b.status === 'Confirmed').length;
    const totalBookings = amenityStats.length;
    
    return {
      // Maintenance counts
      totalMaintenanceIssues: (maintenanceStats.open || 0) + (maintenanceStats.inProgress || 0) + (maintenanceStats.resolved || 0),
      openIssues: maintenanceStats.open || 0,
      inProgressIssues: maintenanceStats.inProgress || 0,
      resolvedIssues: maintenanceStats.resolved || 0,
      
      // Apartment counts
      totalApartments: apartmentStats.total || 0,
      occupied: apartmentStats.occupied || 0,
      vacant: apartmentStats.vacant || 0,
      occupancyPct: apartmentStats.total > 0 ? 
        Math.round((apartmentStats.occupied / apartmentStats.total) * 100) : 0,
      
      // Tenant counts
      activeTenants: apartmentStats.occupied || 0,
      
      // Amenity booking counts
      totalBookings: totalBookings,
      pendingBookings: pendingBookings,
      confirmedBookings: confirmedBookings,
      
      // Payment counts
      totalPayments: paymentStats?.total || 0,
      monthlyRevenue: monthlyRevenue,
      
      // Overall system counts
      totalUsers: apartmentStats.occupied || 0, // Approximate based on occupied apartments
      totalActivities: totalBookings + (maintenanceStats.open || 0) + (maintenanceStats.inProgress || 0)
    };
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return {
      totalMaintenanceIssues: 0,
      openIssues: 0,
      inProgressIssues: 0,
      resolvedIssues: 0,
      totalApartments: 0,
      occupied: 0,
      vacant: 0,
      occupancyPct: 0,
      activeTenants: 0,
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      totalPayments: 0,
      monthlyRevenue: 0,
      totalUsers: 0,
      totalActivities: 0
    };
  }
};

export const getRecentPayments = async (limit = 6, userEmail = null, userRole = 'user') => {
  try {
    console.log('Fetching payments from Firebase...', { limit, userEmail, userRole });
    const filters = userRole === 'admin' ? {} : { tenantId: userEmail };
    console.log('Filters applied:', filters);
    
    const result = await paymentService.getAll(filters, {
      orderBy: 'createdAt',
      orderDirection: 'desc',
      limit
    });
    
    console.log('Firebase payment result:', result);

    if (result.ok) {
      console.log('Raw payment data from Firebase:', result.data);
      const mappedData = result.data.map(payment => {
        console.log('Processing payment:', payment);
        return {
          id: payment.paymentId || `PMT-${payment.id}`,
          tenantId: payment.tenantId,
          tenantName: payment.tenantName || 'User',
          unit: payment.unit || 'A-101',
          amount: payment.amount || 15000,
          status: payment.status || 'Pending',
          date: payment.dueDate || new Date().toISOString().split('T')[0]
        };
      });
      console.log('Mapped payment data:', mappedData);
      return mappedData;
    }
    
    // Return empty array if no data
    return [];
  } catch (error) {
    console.error('Get recent payments error:', error);
    return [];
  }
};

export const getMaintenanceRequests = async (userEmail = null, userRole = 'user') => {
  try {
    console.log('Getting maintenance requests for:', userEmail, userRole);
    
    // For normal users, filter by their email. For admin, show all issues
    const cleanUserEmail = userEmail ? userEmail.toLowerCase().trim() : userEmail;
    const filters = userRole === 'admin' ? {} : { reportedBy: cleanUserEmail };
    console.log('Using filters:', filters);
    console.log('Original user email:', userEmail, 'Cleaned email:', cleanUserEmail);
    
    const result = await maintenanceService.getAll(filters, {
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });

    console.log('Maintenance service result:', result);

    if (result.ok && result.data && result.data.length > 0) {
      const formattedData = result.data.map(request => ({
        id: request.id,
        title: request.title,
        unit: request.unit || 'Your Unit',
        priority: request.priority || 'medium',
        status: request.status || 'Open',
        reported: request.createdAt?.toDate()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        category: request.category || 'General',
        reportedBy: request.reportedBy
      }));
      console.log('Formatted maintenance data:', formattedData);
      return formattedData;
    }
    
    // If no results with exact match, try to get all issues and filter manually
    console.log('No exact matches found, trying manual filtering...');
    const allResult = await maintenanceService.getAll({}, {
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
    
    if (allResult.ok && allResult.data && allResult.data.length > 0) {
      console.log('All issues in database:', allResult.data.length);
      
      const manuallyFiltered = allResult.data.filter(request => {
        const storedEmail = request.reportedBy ? request.reportedBy.toLowerCase().trim() : '';
        const searchEmail = userEmail ? userEmail.toLowerCase().trim() : '';
        console.log(`Comparing: "${storedEmail}" with "${searchEmail}" - Match: ${storedEmail === searchEmail}`);
        return storedEmail === searchEmail;
      });
      
      if (manuallyFiltered.length > 0) {
        const formattedData = manuallyFiltered.map(request => ({
          id: request.id,
          title: request.title,
          unit: request.unit || 'Your Unit',
          priority: request.priority || 'medium',
          status: request.status || 'Open',
          reported: request.createdAt?.toDate()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          category: request.category || 'General',
          reportedBy: request.reportedBy
        }));
        console.log('Manually filtered data:', formattedData);
        return formattedData;
      }
    }
    
    // Return empty array if no data exists - show only real data
    console.log('No maintenance data found for user:', userEmail);
    return [];
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    // Return empty array on error - show only real data
    return [];
  }
};

export const getAmenityBookings = async (userEmail = null, userRole = 'user') => {
  try {
    console.log('Getting amenity bookings for:', userEmail, userRole);
    
    const cleanUserEmail = userEmail ? userEmail.toLowerCase().trim() : userEmail;
    const filters = userRole === 'admin' ? {} : { bookedBy: cleanUserEmail };
    console.log('Using filters:', filters);
    console.log('Original user email:', userEmail, 'Cleaned email:', cleanUserEmail);
    
    const result = await amenityBookingService.getAll(filters, {
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });

    console.log('Amenity bookings service result:', result);

    if (result.ok && result.data && result.data.length > 0) {
      const formattedData = result.data.map(booking => ({
        id: booking.id,
        amenity: booking.amenity,
        slot: `${booking.date} ${booking.startTime} - ${booking.endTime}`,
        bookedBy: booking.bookedByName || booking.bookedBy || 'User',
        status: booking.status || 'Pending',
        createdAt: booking.createdAt?.toDate()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      }));
      console.log('Formatted booking data:', formattedData);
      return formattedData;
    }
    
    // If no results with exact match, try to get all bookings and filter manually
    console.log('No exact matches found, trying manual filtering...');
    const allResult = await amenityBookingService.getAll({}, {
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
    
    if (allResult.ok && allResult.data && allResult.data.length > 0) {
      console.log('All bookings in database:', allResult.data.length);
      
      const manuallyFiltered = allResult.data.filter(booking => {
        const storedEmail = booking.bookedBy ? booking.bookedBy.toLowerCase().trim() : '';
        const searchEmail = userEmail ? userEmail.toLowerCase().trim() : '';
        console.log(`Comparing: "${storedEmail}" with "${searchEmail}" - Match: ${storedEmail === searchEmail}`);
        return storedEmail === searchEmail;
      });
      
      if (manuallyFiltered.length > 0) {
        const formattedData = manuallyFiltered.map(booking => ({
          id: booking.id,
          amenity: booking.amenity,
          slot: `${booking.date} ${booking.startTime} - ${booking.endTime}`,
          bookedBy: booking.bookedByName || booking.bookedBy || 'User',
          status: booking.status || 'Pending',
          createdAt: booking.createdAt?.toDate()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
        }));
        console.log('Manually filtered booking data:', formattedData);
        return formattedData;
      }
    }
    
    // Return empty array if no data exists - show only real data
    console.log('No booking data found for user:', userEmail);
    return [];
  } catch (error) {
    console.error('Get amenity bookings error:', error);
    // Return empty array on error - show only real data
    return [];
  }
};

export const getCommunityPolls = async (userEmail = null, userRole = 'user') => {
  try {
    const result = await communityPollService.getAll({}, {
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });

    if (result.ok && result.data) {
      return result.data.map(poll => ({
        id: poll.id,
        question: poll.question,
        options: poll.options || [],
        createdBy: poll.createdBy,
        status: poll.status || 'Open',
        endDate: poll.endDate,
        votes: poll.votes || [],
        createdAt: poll.createdAt?.toDate()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      }));
    }
    
    // Return empty array if no polls exist (no sample data)
    return [];
  } catch (error) {
    console.error('Get community polls error:', error);
    return [];
  }
};

export const getMaintenanceFees = async (userEmail = null, userRole = 'user') => {
  try {
    console.log('Getting maintenance fees for:', userEmail, userRole);
    
    const cleanUserEmail = userEmail ? userEmail.toLowerCase().trim() : userEmail;
    const filters = userRole === 'admin' ? {} : { tenantId: cleanUserEmail };
    console.log('Using filters:', filters);
    
    const result = await paymentService.getAll(filters, {
      orderBy: 'dueDate',
      orderDirection: 'desc'
    });

    console.log('Maintenance fees service result:', result);

    if (result.ok && result.data && result.data.length > 0) {
      const formattedData = result.data.map(payment => ({
        id: payment.id,
        title: payment.title || 'Maintenance Fees',
        description: payment.description || 'Monthly Maintenance Fee',
        dueDate: payment.dueDate,
        amount: payment.amount,
        status: payment.status,
        type: payment.type || 'Monthly',
        tenantId: payment.tenantId,
        tenantName: payment.tenantName,
        paidDate: payment.paidDate,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId
      }));
      console.log('Formatted maintenance fees data:', formattedData);
      return formattedData;
    }
    
    // If no data in database, create sample data for users
    if (userRole !== 'admin' && userEmail) {
      console.log('No maintenance fees found, creating sample data for user:', userEmail);
      
      const sampleFees = [
        {
          id: 'sample-monthly-' + Date.now(),
          title: 'Monthly Maintenance Fee',
          description: 'Monthly apartment maintenance charges',
          amount: 2000,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          status: 'Unpaid',
          type: 'Monthly',
          tenantId: cleanUserEmail,
          tenantName: userEmail?.split('@')[0] || 'User',
          paidDate: null,
          paymentMethod: null,
          transactionId: null
        },
        {
          id: 'sample-plumbing-' + Date.now(),
          title: 'Plumbing Maintenance Charge',
          description: 'Special charge for plumbing repairs',
          amount: 500,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago (overdue)
          status: 'Overdue',
          type: 'Special',
          tenantId: cleanUserEmail,
          tenantName: userEmail?.split('@')[0] || 'User',
          paidDate: null,
          paymentMethod: null,
          transactionId: null
        }
      ];
      
      console.log('Created sample maintenance fees:', sampleFees);
      return sampleFees;
    }
    
    // For admin, return empty if no data
    console.log('No maintenance fees data found');
    return [];
  } catch (error) {
    console.error('Get maintenance fees error:', error);
    return [];
  }
};

// User-specific stats function
export const getMaintenanceStats = async (userEmail = null, userRole = 'user') => {
  try {
    console.log('Getting maintenance stats for:', userEmail, userRole);
    
    // For admin, show all stats. For normal users, show only their stats
    const filters = userRole === 'admin' ? {} : { reportedBy: userEmail };
    console.log('Using filters for stats:', filters);
    
    const result = await maintenanceService.getAll(filters);
    console.log('Stats maintenance service result:', result);
    
    if (!result.ok || !result.data || result.data.length === 0) {
      console.log('No maintenance data found for stats, returning zero');
      return { open: 0, inProgress: 0, resolved: 0 };
    }
    
    const stats = result.data.reduce((acc, item) => {
      const originalStatus = item.status || 'Open';
      const normalizedStatus = originalStatus.toLowerCase();
      
      acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1;
      return acc;
    }, {});
    
    // Also track by original status names for accurate counting
    const debugStats = {};
    result.data.forEach(item => {
      const status = item.status || 'Open';
      debugStats[status] = (debugStats[status] || 0) + 1;
    });
    
    const resultStats = {
      open: (debugStats['open'] || 0),
      inProgress: (debugStats['in progress'] || 0),
      resolved: (debugStats['resolved'] || 0)
    };
    
    console.log('Calculated maintenance stats:', resultStats);
    console.log('Calculated user-specific maintenance stats:', resultStats);
    return resultStats;
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    return { open: 0, inProgress: 0, resolved: 0 };
  }
};

export const getApartments = async () => {
  try {
    console.log('Fetching apartments from Firebase...');
    const result = await apartmentService.getAll({}, {
      orderBy: 'unit',
      orderDirection: 'asc'
    });
    
    console.log('Firebase result:', result);

    if (result.ok && result.data) {
      console.log('Raw apartment data from Firebase:', result.data);
      const mappedData = result.data.map(apt => {
        console.log('Processing apartment:', apt);
        console.log('Rent field values:', {
          monthlyRent: apt.monthlyRent,
          rent: apt.rent,
          rentAmount: apt.rentAmount,
          allFields: Object.keys(apt)
        });
        
        return {
          id: apt.id,
          unit: apt.unit || 'Not Assigned',
          wing: apt.wing || 'Not Assigned',
          floor: apt.floor || 'Not Assigned',
          type: apt.type || 'Not Assigned',
          monthlyRent: apt.monthlyRent || apt.rent || apt.rentAmount || 0,
          status: apt.status || 'Unknown',
          tenantId: apt.tenantId || null,
          size: apt.size || 'Not Assigned',
          createdAt: apt.createdAt?.toDate()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
        };
      });
      console.log('Mapped apartment data:', mappedData);
      return mappedData;
    }
    
    console.log('No apartment data found in Firebase');
    // Return empty array if no apartments exist (no sample data)
    return [];
  } catch (error) {
    console.error('Get apartments error:', error);
    return [];
  }
};

// Create functions
export const createMaintenanceRequest = async (data) => {
  try {
    const result = await maintenanceService.create(data);
    return result;
  } catch (error) {
    console.error('Create maintenance request error:', error);
    return { ok: false, error: error.message };
  }
};

export const createAmenityBooking = async (data) => {
  try {
    const result = await amenityBookingService.create(data);
    return result;
  } catch (error) {
    console.error('Create amenity booking error:', error);
    return { ok: false, error: error.message };
  }
};

export const createCommunityPoll = async (data) => {
  try {
    const result = await communityPollService.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Create community poll error:', error);
    return { ok: false, error: error.message };
  }
};

export const updateCommunityPoll = async (id, data) => {
  try {
    const result = await communityPollService.update(id, {
      ...data,
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Update community poll error:', error);
    return { ok: false, error: error.message };
  }
};

export const deleteCommunityPoll = async (id) => {
  try {
    const result = await communityPollService.delete(id);
    return result;
  } catch (error) {
    console.error('Delete community poll error:', error);
    return { ok: false, error: error.message };
  }
};

export const voteInPoll = async (pollId, optionIndex, userEmail) => {
  try {
    const pollResult = await communityPollService.getById(pollId);
    if (!pollResult.ok) {
      return { ok: false, error: 'Poll not found' };
    }

    const poll = pollResult.data;
    const existingVote = poll.votes?.find(vote => vote.userEmail === userEmail);
    
    if (existingVote) {
      return { ok: false, error: 'You have already voted in this poll' };
    }

    const updatedOptions = poll.options.map((option, index) => {
      if (index === optionIndex) {
        return {
          ...option,
          votes: (option.votes || 0) + 1,
          voters: [...(option.voters || []), userEmail]
        };
      }
      return option;
    });

    const result = await communityPollService.update(pollId, {
      options: updatedOptions,
      votes: [...(poll.votes || []), { userEmail, optionIndex, votedAt: new Date() }],
      updatedAt: new Date()
    });

    return result;
  } catch (error) {
    console.error('Vote in poll error:', error);
    return { ok: false, error: error.message };
  }
};

export const getPollVotes = async (pollId) => {
  try {
    const pollResult = await communityPollService.getById(pollId);
    if (!pollResult.ok) {
      return { ok: false, error: 'Poll not found' };
    }

    const poll = pollResult.data;
    const votes = poll.votes || [];
    
    const voteDetails = votes.map(vote => ({
      userEmail: vote.userEmail,
      optionIndex: vote.optionIndex,
      votedAt: vote.votedAt?.toDate()?.toISOString() || new Date().toISOString(),
      optionText: poll.options[vote.optionIndex]?.text || 'Unknown'
    }));

    return { ok: true, data: voteDetails };
  } catch (error) {
    console.error('Get poll votes error:', error);
    return { ok: false, error: error.message };
  }
};

export const createPayment = async (data) => {
  try {
    const result = await paymentService.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Create payment error:', error);
    return { ok: false, error: error.message };
  }
};

export const createApartment = async (data) => {
  try {
    const result = await apartmentService.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Create apartment error:', error);
    return { ok: false, error: error.message };
  }
};

export const updateApartment = async (id, data) => {
  try {
    const result = await apartmentService.update(id, {
      ...data,
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Update apartment error:', error);
    return { ok: false, error: error.message };
  }
};

export const deleteApartment = async (id) => {
  try {
    const result = await apartmentService.delete(id);
    return result;
  } catch (error) {
    console.error('Delete apartment error:', error);
    return { ok: false, error: error.message };
  }
};


export const updateMaintenanceStatus = async (id, status) => {
  try {
    const result = await maintenanceService.update(id, { status });
    return result;
  } catch (error) {
    console.error('Update maintenance status error:', error);
    return { ok: false, error: error.message };
  }
};

export const createTenant = async (data) => {
  try {
    const result = await userService.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Create tenant error:', error);
    return { ok: false, error: error.message };
  }
};

export const updateTenant = async (id, data) => {
  try {
    const result = await userService.update(id, {
      ...data,
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error('Update tenant error:', error);
    return { ok: false, error: error.message };
  }
};

export const deleteTenant = async (id) => {
  try {
    const result = await userService.delete(id);
    return result;
  } catch (error) {
    console.error('Delete tenant error:', error);
    return { ok: false, error: error.message };
  }
};

export const getTenants = async () => {
  try {
    console.log('Fetching tenants from Firebase...');
    const result = await userService.getAll({}, {
      orderBy: 'name',
      orderDirection: 'asc'
    });
    
    console.log('Firebase result:', result);

    if (result.ok && result.data) {
      console.log('Raw tenant data from Firebase:', result.data);
      const mappedData = result.data.map(tenant => ({
        id: tenant.id,
        name: tenant.name || 'Unknown',
        email: tenant.email || '',
        phone: tenant.phone || '',
        unit: tenant.unit || 'Not Assigned',
        rentAmount: tenant.rentAmount || 0,
        status: tenant.status || 'Active',
        joinDate: tenant.joinDate || new Date().toISOString().split('T')[0],
        createdAt: tenant.createdAt?.toDate()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      }));
      console.log('Mapped tenant data:', mappedData);
      return mappedData;
    }
    
    console.log('No tenant data found in Firebase');
    // Return empty array if no tenants exist (no sample data)
    return [];
  } catch (error) {
    console.error('Get tenants error:', error);
    return [];
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    const result = await amenityBookingService.update(id, { status });
    return result;
  } catch (error) {
    console.error('Update booking status error:', error);
    return { ok: false, error: error.message };
  }
};

export const updatePollStatus = async (id, status) => {
  try {
    const result = await communityPollService.update(id, { status });
    return result;
  } catch (error) {
    console.error('Update poll status error:', error);
    return { ok: false, error: error.message };
  }
};

export const updatePaymentStatus = async (id, status, paymentData = {}) => {
  try {
    const updateData = {
      status,
      updatedAt: new Date(),
      ...paymentData
    };
    
    if (status === 'Paid') {
      updateData.paidDate = new Date().toISOString().split('T')[0];
      updateData.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const result = await paymentService.update(id, updateData);
    return result;
  } catch (error) {
    console.error('Update payment status error:', error);
    return { ok: false, error: error.message };
  }
};

// Utility functions
export const formatCurrency = (amount) => {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const getTenantById = (id) => {
  // This would be implemented with Firebase query
  return null;
};

export const getTenantByEmail = (email) => {
  // This would be implemented with Firebase query
  return null;
};
