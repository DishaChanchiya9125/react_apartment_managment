const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    // Non-admin users can only see their own payments
    if (req.user.role !== 'admin') {
      filter.tenantId = req.user.userId;
    }

    const payments = await Payment.find(filter)
      .populate('tenantId', 'email profile.name profile.phone')
      .populate('apartmentId', 'unit monthlyRent')
      .sort({ dueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
});

// Create new payment (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const payment = new Payment(paymentData);
    await payment.save();

    await payment.populate('tenantId', 'email profile.name profile.phone')
    .populate('apartmentId', 'unit monthlyRent');

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

// Update payment (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('tenantId', 'email profile.name profile.phone')
    .populate('apartmentId', 'unit monthlyRent');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  }
});

// Delete payment (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
      error: error.message
    });
  }
});

// Get payment statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    // Non-admin users see only their own stats
    if (req.user.role !== 'admin') {
      filter.tenantId = req.user.userId;
    }

    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const result = {
      paid: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      partial: { count: 0, amount: 0 },
      total: { count: 0, amount: 0 }
    };

    stats.forEach(stat => {
      const status = stat._id.toLowerCase();
      if (result[status]) {
        result[status].count = stat.count;
        result[status].amount = stat.totalAmount;
      }
      result.total.count += stat.count;
      result.total.amount += stat.totalAmount;
    });

    res.json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment statistics',
      error: error.message
    });
  }
});

module.exports = router;
