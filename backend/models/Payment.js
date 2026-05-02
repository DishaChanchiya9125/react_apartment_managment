const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: [true, 'Payment ID is required'],
    unique: true,
    trim: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tenant ID is required']
  },
  apartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    required: [true, 'Apartment ID is required']
  },
  type: {
    type: String,
    enum: ['Rent', 'Maintenance', 'Parking', 'Other'],
    required: [true, 'Payment type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paidDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Partial'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Check', 'Online', 'UPI'],
    default: null
  },
  transactionId: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  lateFee: {
    type: Number,
    min: 0,
    default: 0
  },
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  paidAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  remainingAmount: {
    type: Number,
    min: 0,
    default: function() {
      return this.amount - this.paidAmount;
    }
  },
  receiptUrl: {
    type: String,
    trim: true
  },
  notes: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
paymentSchema.index({ tenantId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ type: 1 });

// Generate payment ID before saving
paymentSchema.pre('save', async function(next) {
  if (!this.paymentId) {
    const count = await this.constructor.countDocuments();
    this.paymentId = `PMT-${String(count + 1001).padStart(4, '0')}`;
  }
  
  // Update remaining amount
  this.remainingAmount = this.amount - this.paidAmount;
  
  // Update status based on paid amount
  if (this.paidAmount >= this.amount) {
    this.status = 'Paid';
    if (!this.paidDate) {
      this.paidDate = new Date();
    }
  } else if (this.paidAmount > 0) {
    this.status = 'Partial';
  } else if (this.dueDate < new Date() && this.status === 'Pending') {
    this.status = 'Overdue';
  }
  
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
