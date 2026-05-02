const mongoose = require('mongoose');

const communityPollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true,
    maxlength: [300, 'Question cannot exceed 300 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Option cannot exceed 100 characters']
    },
    votes: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Archived'],
    default: 'Open'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    selectedOption: {
      type: Number,
      required: true,
      min: 0
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
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
communityPollSchema.index({ status: 1 });
communityPollSchema.index({ endDate: 1 });
communityPollSchema.index({ createdBy: 1 });

// Ensure end date is after start date
communityPollSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Update total votes when votes array changes
communityPollSchema.methods.updateVoteCounts = function() {
  this.options.forEach((option, index) => {
    option.votes = this.votes.filter(vote => vote.selectedOption === index).length;
  });
  this.totalVotes = this.votes.length;
};

// Check if user has already voted
communityPollSchema.methods.hasUserVoted = function(userId) {
  return this.votes.some(vote => vote.user.toString() === userId.toString());
};

module.exports = mongoose.model('CommunityPoll', communityPollSchema);
