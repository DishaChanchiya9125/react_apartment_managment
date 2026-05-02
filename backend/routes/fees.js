const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all maintenance fees/payments
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

// Create new payment/invoice (admin only)
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
      message: 'Payment invoice created successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment invoice',
      error: error.message
    });
  }
});

// Update payment status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, paidAmount, paymentMethod, transactionId } = req.body;
    
    let filter = { _id: req.params.id };
    
    // Non-admin users can only update their own payments
    if (req.user.role !== 'admin') {
      filter.tenantId = req.user.userId;
    }

    const updateData = { status };
    
    if (status === 'Paid' || status === 'Partial') {
      updateData.paidAmount = paidAmount || 0;
      updateData.paidDate = new Date();
      updateData.paymentMethod = paymentMethod;
      updateData.transactionId = transactionId;
    }

    const payment = await Payment.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    ).populate('tenantId', 'email profile.name profile.phone')
    .populate('apartmentId', 'unit monthlyRent');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found or access denied' });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
});

// Pay all due payments (user action)
router.post('/pay-all', authenticateToken, async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;
    
    const duePayments = await Payment.find({
      tenantId: req.user.userId,
      status: { $in: ['Pending', 'Overdue'] }
    });

    if (duePayments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No due payments found'
      });
    }

    const updatePromises = duePayments.map(payment => 
      Payment.findByIdAndUpdate(
        payment._id,
        {
          status: 'Paid',
          paidAmount: payment.amount,
          paidDate: new Date(),
          paymentMethod,
          transactionId
        },
        { new: true }
      )
    );

    const updatedPayments = await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `Successfully paid ${updatedPayments.length} payments`,
      data: { payments: updatedPayments }
    });
  } catch (error) {
    console.error('Pay all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payments',
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
          totalAmount: { $sum: '$amount' },
          totalPaid: { $sum: '$paidAmount' }
        }
      }
    ]);

    const result = {
      paid: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      partial: { count: 0, amount: 0 },
      total: { count: 0, amount: 0, paidAmount: 0 }
    };

    stats.forEach(stat => {
      const status = stat._id.toLowerCase();
      if (result[status]) {
        result[status].count = stat.count;
        result[status].amount = stat.totalAmount;
      }
      result.total.count += stat.count;
      result.total.amount += stat.totalAmount;
      result.total.paidAmount += stat.totalPaid;
    });

    result.total.dueAmount = result.total.amount - result.total.paidAmount;

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

// Add note to payment
router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    let filter = { _id: req.params.id };
    
    // Non-admin users can only add notes to their own payments
    if (req.user.role !== 'admin') {
      filter.tenantId = req.user.userId;
    }
    
    const payment = await Payment.findOneAndUpdate(
      filter,
      {
        $push: {
          notes: {
            text,
            addedBy: req.user.userId,
            addedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('notes.addedBy', 'email profile.name');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found or access denied' });
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Add payment note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
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

module.exports = router;
