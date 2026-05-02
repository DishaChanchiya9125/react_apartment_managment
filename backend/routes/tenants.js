const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Apartment = require('../models/Apartment');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all tenants (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { role: 'user', isActive: true };
    
    if (status) {
      if (status === 'with-apartment') {
        filter['profile.apartmentUnit'] = { $exists: true, $ne: '' };
      } else if (status === 'without-apartment') {
        filter['profile.apartmentUnit'] = { $exists: false };
      }
    }

    const tenants = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get apartment information for each tenant
    const tenantsWithApartments = await Promise.all(
      tenants.map(async (tenant) => {
        const apartment = await Apartment.findOne({ tenantId: tenant._id });
        return {
          ...tenant.toObject(),
          apartment: apartment || null
        };
      })
    );

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tenants: tenantsWithApartments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tenants',
      error: error.message
    });
  }
});

// Get tenant by ID (admin or self)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    let filter = { _id: req.params.id, role: 'user' };
    
    // Non-admin users can only get their own profile
    if (req.user.role !== 'admin') {
      filter._id = req.user.userId;
    }

    const tenant = await User.findOne(filter);
    
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Get apartment information
    const apartment = await Apartment.findOne({ tenantId: tenant._id });

    res.json({
      success: true,
      data: {
        tenant: {
          ...tenant.toObject(),
          apartment: apartment || null
        }
      }
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tenant',
      error: error.message
    });
  }
});

// Update tenant profile (admin or self)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    let filter = { _id: req.params.id, role: 'user' };
    
    // Non-admin users can only update their own profile
    if (req.user.role !== 'admin') {
      filter._id = req.user.userId;
    }

    const { profile, isActive } = req.body;
    const updateData = {};
    
    if (profile) updateData.profile = profile;
    if (req.user.role === 'admin' && typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    const tenant = await User.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Get apartment information
    const apartment = await Apartment.findOne({ tenantId: tenant._id });

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: {
        tenant: {
          ...tenant.toObject(),
          apartment: apartment || null
        }
      }
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant',
      error: error.message
    });
  }
});

// Delete tenant (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Check if tenant has assigned apartment
    const apartment = await Apartment.findOne({ tenantId: req.params.id });
    if (apartment) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete tenant with assigned apartment. Please remove apartment assignment first.'
      });
    }

    const tenant = await User.findByIdAndDelete(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    res.json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tenant',
      error: error.message
    });
  }
});

// Get tenant statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalTenants = await User.countDocuments({ role: 'user', isActive: true });
    const tenantsWithApartments = await User.countDocuments({ 
      role: 'user', 
      isActive: true,
      'profile.apartmentUnit': { $exists: true, $ne: '' }
    });
    const tenantsWithoutApartments = totalTenants - tenantsWithApartments;

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      role: 'user',
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const stats = {
      total: totalTenants,
      withApartments: tenantsWithApartments,
      withoutApartments: tenantsWithoutApartments,
      recentRegistrations,
      occupancyRate: totalTenants > 0 ? Math.round((tenantsWithApartments / totalTenants) * 100) : 0
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get tenant stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tenant statistics',
      error: error.message
    });
  }
});

// Assign apartment to tenant (admin only)
router.put('/:id/assign-apartment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { apartmentId } = req.body;
    
    // Check if apartment exists and is vacant
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }
    
    if (apartment.status !== 'Vacant') {
      return res.status(400).json({ success: false, message: 'Apartment is not vacant' });
    }

    // Remove tenant from current apartment if any
    await Apartment.updateOne(
      { tenantId: req.params.id },
      { tenantId: null, status: 'Vacant' }
    );

    // Assign new apartment
    await Apartment.findByIdAndUpdate(
      apartmentId,
      { tenantId: req.params.id, status: 'Occupied' }
    );

    // Update tenant profile
    const tenant = await User.findByIdAndUpdate(
      req.params.id,
      { 'profile.apartmentUnit': apartment.unit },
      { new: true }
    ).populate('profile.apartmentUnit');

    res.json({
      success: true,
      message: 'Apartment assigned successfully',
      data: { tenant }
    });
  } catch (error) {
    console.error('Assign apartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign apartment',
      error: error.message
    });
  }
});

module.exports = router;
