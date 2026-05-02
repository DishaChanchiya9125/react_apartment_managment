const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all maintenance requests (with role-based filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    // Non-admin users can only see their own requests (except resolved ones)
    if (req.user.role !== 'admin') {
      filter.reportedBy = req.user.userId;
    }

    const maintenanceRequests = await Maintenance.find(filter)
      .populate('reportedBy', 'email profile.name profile.phone')
      .populate('assignedTo', 'email profile.name')
      .sort({ reportedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Maintenance.countDocuments(filter);

    res.json({
      success: true,
      data: {
        maintenanceRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get maintenance requests',
      error: error.message
    });
  }
});

// Create new maintenance request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const maintenanceData = {
      ...req.body,
      reportedBy: req.user.userId
    };

    const maintenance = new Maintenance(maintenanceData);
    await maintenance.save();

    await maintenance.populate('reportedBy', 'email profile.name profile.phone');

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: { maintenance }
    });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create maintenance request',
      error: error.message
    });
  }
});

// Update maintenance request status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, assignedTo, notes } = req.body;
    
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        assignedTo,
        resolvedDate: status === 'Resolved' ? new Date() : null,
        $push: notes ? {
          notes: {
            text: notes,
            addedBy: req.user.userId,
            addedAt: new Date()
          }
        } : {}
      },
      { new: true, runValidators: true }
    ).populate('reportedBy', 'email profile.name profile.phone')
    .populate('assignedTo', 'email profile.name');

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    res.json({
      success: true,
      message: 'Maintenance request updated successfully',
      data: { maintenance }
    });
  } catch (error) {
    console.error('Update maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update maintenance request',
      error: error.message
    });
  }
});

// Add note to maintenance request
router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
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

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { maintenance }
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
});

// Get maintenance statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    // Non-admin users see only their own stats
    if (req.user.role !== 'admin') {
      filter.reportedBy = req.user.userId;
    }

    const stats = await Maintenance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
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
    console.error('Get maintenance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get maintenance statistics',
      error: error.message
    });
  }
});

// Delete maintenance request (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    res.json({
      success: true,
      message: 'Maintenance request deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete maintenance request',
      error: error.message
    });
  }
});

module.exports = router;
