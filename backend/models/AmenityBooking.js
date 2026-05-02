const mongoose = require('mongoose');

const amenityBookingSchema = new mongoose.Schema({
  amenity: {
    type: String,
    required: [true, 'Amenity type is required'],
    enum: ['Gym', 'Pool', 'Meeting Room', 'Club House', 'Tennis Court', 'Playground'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  numberOfPeople: {
    type: Number,
    min: 1,
    max: 50,
    default: 1
  },
  specialRequirements: {
    type: String,
    trim: true,
    maxlength: [300, 'Special requirements cannot exceed 300 characters']
  },
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
amenityBookingSchema.index({ bookedBy: 1 });
amenityBookingSchema.index({ amenity: 1, date: 1 });
amenityBookingSchema.index({ status: 1 });
amenityBookingSchema.index({ date: 1, startTime: 1 });

// Ensure end time is after start time
amenityBookingSchema.pre('save', function(next) {
  if (this.startTime >= this.endTime) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

module.exports = mongoose.model('AmenityBooking', amenityBookingSchema);
