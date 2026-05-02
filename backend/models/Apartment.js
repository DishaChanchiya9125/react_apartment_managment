const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  unit: {
    type: String,
    required: [true, 'Unit number is required'],
    trim: true,
    unique: true
  },
  wing: {
    type: String,
    required: [true, 'Wing is required'],
    trim: true,
    uppercase: true
  },
  floor: {
    type: Number,
    required: [true, 'Floor is required'],
    min: 1
  },
  type: {
    type: String,
    required: [true, 'Apartment type is required'],
    enum: ['1BHK', '2BHK', '3BHK', 'Studio'],
    trim: true
  },
  monthlyRent: {
    type: Number,
    required: [true, 'Monthly rent is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['Occupied', 'Vacant', 'Maintenance'],
    default: 'Vacant'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  description: {
    type: String,
    trim: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
apartmentSchema.index({ unit: 1 });
apartmentSchema.index({ wing: 1, floor: 1 });
apartmentSchema.index({ status: 1 });

module.exports = mongoose.model('Apartment', apartmentSchema);
