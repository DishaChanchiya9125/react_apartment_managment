const express = require('express');
const router = express.Router();
const AmenityBooking = require('../models/AmenityBooking');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all amenity bookings (with role-based filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, amenity, date, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (amenity) filter.amenity = amenity;
    if (date) {
      const dateObj = new Date(date);
      filter.date = {
        $gte: dateObj.setHours(0, 0, 0, 0),
        $lt: dateObj.setHours(23, 59, 59, 999)
      };
    }
    
    // Non-admin users can only see their own bookings
    if (req.user.role !== 'admin') {
      filter.bookedBy = req.user.userId;
    }

    const bookings = await AmenityBooking.find(filter)
      .populate('bookedBy', 'email profile.name')
      .populate('approvedBy', 'email profile.name')
      .sort({ date: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AmenityBooking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get amenity bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get amenity bookings',
      error: error.message
    });
  }
});

// Create new amenity booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      bookedBy: req.user.userId
    };

    // Check for time conflicts
    const conflictingBooking = await AmenityBooking.findOne({
      amenity: bookingData.amenity,
      date: bookingData.date,
      status: { $in: ['Pending', 'Confirmed'] },
      $or: [
        { startTime: { $lt: bookingData.endTime }, endTime: { $gt: bookingData.startTime } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot already booked for this amenity'
      });
    }

    const booking = new AmenityBooking(bookingData);
    await booking.save();

    await booking.populate('bookedBy', 'email profile.name');

    res.status(201).json({
      success: true,
      message: 'Amenity booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create amenity booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create amenity booking',
      error: error.message
    });
  }
});

// Update booking status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await AmenityBooking.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        approvedBy: status === 'Confirmed' ? req.user.userId : null,
        approvedAt: status === 'Confirmed' ? new Date() : null
      },
      { new: true, runValidators: true }
    ).populate('bookedBy', 'email profile.name')
    .populate('approvedBy', 'email profile.name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
});

// Cancel booking (owner or admin)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    let filter = { _id: req.params.id };
    
    // Non-admin users can only cancel their own bookings
    if (req.user.role !== 'admin') {
      filter.bookedBy = req.user.userId;
    }

    const booking = await AmenityBooking.findOneAndUpdate(
      filter,
      { status: 'Cancelled' },
      { new: true }
    ).populate('bookedBy', 'email profile.name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or access denied' });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
});

// Get booking statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    // Non-admin users see only their own stats
    if (req.user.role !== 'admin') {
      filter.bookedBy = req.user.userId;
    }

    const stats = await AmenityBooking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
      total: 0
    };

    stats.forEach(stat => {
      result[stat._id.toLowerCase()] = stat.count;
      result.total += stat.count;
    });

    res.json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    console.error('Get amenity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get amenity statistics',
      error: error.message
    });
  }
});

// Get available time slots for a specific amenity and date
router.get('/available-slots', authenticateToken, async (req, res) => {
  try {
    const { amenity, date } = req.query;
    
    if (!amenity || !date) {
      return res.status(400).json({
        success: false,
        message: 'Amenity and date are required'
      });
    }

    // Define available time slots (1-hour slots from 6 AM to 10 PM)
    const allSlots = [];
    for (let hour = 6; hour <= 21; hour++) {
      allSlots.push({
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        available: true
      });
    }

    // Get booked slots for the date
    const bookedSlots = await AmenityBooking.find({
      amenity,
      date: new Date(date),
      status: { $in: ['Pending', 'Confirmed'] }
    });

    // Mark booked slots as unavailable
    bookedSlots.forEach(booking => {
      const slotIndex = allSlots.findIndex(slot => 
        slot.startTime === booking.startTime && slot.endTime === booking.endTime
      );
      if (slotIndex !== -1) {
        allSlots[slotIndex].available = false;
      }
    });

    res.json({
      success: true,
      data: { availableSlots: allSlots }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: error.message
    });
  }
});

module.exports = router;
