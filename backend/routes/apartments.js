const express = require('express');
const router = express.Router();
const Apartment = require('../models/Apartment');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all apartments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, wing, floor, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (wing) filter.wing = wing.toUpperCase();
    if (floor) filter.floor = parseInt(floor);

    const apartments = await Apartment.find(filter)
      .populate('tenantId', 'email profile.name profile.phone')
      .sort({ wing: 1, floor: 1, unit: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Apartment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        apartments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get apartments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get apartments',
      error: error.message
    });
  }
});

// Create new apartment (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const apartment = new Apartment(req.body);
    await apartment.save();

    await apartment.populate('tenantId', 'email profile.name profile.phone');

    res.status(201).json({
      success: true,
      message: 'Apartment created successfully',
      data: { apartment }
    });
  } catch (error) {
    console.error('Create apartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create apartment',
      error: error.message
    });
  }
});

// Update apartment (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const apartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('tenantId', 'email profile.name profile.phone');

    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }

    res.json({
      success: true,
      message: 'Apartment updated successfully',
      data: { apartment }
    });
  } catch (error) {
    console.error('Update apartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update apartment',
      error: error.message
    });
  }
});

// Assign tenant to apartment (admin only)
router.put('/:id/assign-tenant', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { tenantId } = req.body;
    
    const apartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      { 
        tenantId,
        status: 'Occupied'
      },
      { new: true, runValidators: true }
    ).populate('tenantId', 'email profile.name profile.phone');

    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }

    res.json({
      success: true,
      message: 'Tenant assigned successfully',
      data: { apartment }
    });
  } catch (error) {
    console.error('Assign tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign tenant',
      error: error.message
    });
  }
});

// Remove tenant from apartment (admin only)
router.put('/:id/remove-tenant', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const apartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      { 
        tenantId: null,
        status: 'Vacant'
      },
      { new: true, runValidators: true }
    );

    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }

    res.json({
      success: true,
      message: 'Tenant removed successfully',
      data: { apartment }
    });
  } catch (error) {
    console.error('Remove tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove tenant',
      error: error.message
    });
  }
});

// Delete apartment (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const apartment = await Apartment.findByIdAndDelete(req.params.id);
    
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }

    res.json({
      success: true,
      message: 'Apartment deleted successfully'
    });
  } catch (error) {
    console.error('Delete apartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete apartment',
      error: error.message
    });
  }
});

// Get apartment statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Apartment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRent: { $sum: '$monthlyRent' }
        }
      }
    ]);

    const result = {
      occupied: { count: 0, totalRent: 0 },
      vacant: { count: 0, totalRent: 0 },
      maintenance: { count: 0, totalRent: 0 },
      total: { count: 0, totalRent: 0 }
    };

    stats.forEach(stat => {
      const status = stat._id.toLowerCase();
      if (result[status]) {
        result[status].count = stat.count;
        result[status].totalRent = stat.totalRent;
      }
      result.total.count += stat.count;
      result.total.totalRent += stat.totalRent;
    });

    result.occupancyRate = result.total.count > 0 ? 
      Math.round((result.occupied.count / result.total.count) * 100) : 0;

    res.json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    console.error('Get apartment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get apartment statistics',
      error: error.message
    });
  }
});

module.exports = router;
