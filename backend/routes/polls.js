const express = require('express');
const router = express.Router();
const CommunityPoll = require('../models/CommunityPoll');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all community polls
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;

    const polls = await CommunityPoll.find(filter)
      .populate('createdBy', 'email profile.name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CommunityPoll.countDocuments(filter);

    // Process polls to check if current user has voted
    const processedPolls = polls.map(poll => {
      const pollObj = poll.toObject();
      pollObj.hasVoted = poll.hasUserVoted(req.user.userId);
      pollObj.userVote = pollObj.hasVoted ? 
        poll.votes.find(v => v.user.toString() === req.user.userId.toString())?.selectedOption : null;
      return pollObj;
    });

    res.json({
      success: true,
      data: {
        polls: processedPolls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get polls',
      error: error.message
    });
  }
});

// Create new poll (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { question, description, options, endDate, allowMultipleVotes, isAnonymous } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Question and at least 2 options are required'
      });
    }

    const poll = new CommunityPoll({
      question,
      description,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      createdBy: req.user.userId,
      endDate,
      allowMultipleVotes: allowMultipleVotes || false,
      isAnonymous: isAnonymous || false
    });

    await poll.save();
    await poll.populate('createdBy', 'email profile.name');

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: { poll }
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create poll',
      error: error.message
    });
  }
});

// Vote on a poll
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { selectedOption } = req.body;
    const pollId = req.params.id;

    const poll = await CommunityPoll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    if (poll.status !== 'Open') {
      return res.status(400).json({ success: false, message: 'Poll is not open for voting' });
    }

    if (poll.endDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Poll has expired' });
    }

    if (selectedOption < 0 || selectedOption >= poll.options.length) {
      return res.status(400).json({ success: false, message: 'Invalid option selected' });
    }

    // Check if user has already voted (if multiple votes not allowed)
    if (!poll.allowMultipleVotes && poll.hasUserVoted(req.user.userId)) {
      return res.status(400).json({ success: false, message: 'You have already voted on this poll' });
    }

    // Add vote
    poll.votes.push({
      user: req.user.userId,
      selectedOption,
      votedAt: new Date()
    });

    // Update vote counts
    poll.updateVoteCounts();
    await poll.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: { poll }
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote',
      error: error.message
    });
  }
});

// Update poll status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const poll = await CommunityPoll.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'email profile.name');

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    res.json({
      success: true,
      message: 'Poll status updated successfully',
      data: { poll }
    });
  } catch (error) {
    console.error('Update poll status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update poll status',
      error: error.message
    });
  }
});

// Get poll results
router.get('/:id/results', authenticateToken, async (req, res) => {
  try {
    const poll = await CommunityPoll.findById(req.params.id)
      .populate('createdBy', 'email profile.name')
      .populate('votes.user', 'email profile.name');

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Update vote counts
    poll.updateVoteCounts();

    const results = {
      poll: {
        question: poll.question,
        description: poll.description,
        status: poll.status,
        totalVotes: poll.totalVotes,
        options: poll.options,
        createdBy: poll.createdBy
      },
      votes: poll.isAnonymous ? [] : poll.votes
    };

    res.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    console.error('Get poll results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get poll results',
      error: error.message
    });
  }
});

// Delete poll (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const poll = await CommunityPoll.findByIdAndDelete(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    res.json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete poll',
      error: error.message
    });
  }
});

// Get poll statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await CommunityPoll.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      open: 0,
      closed: 0,
      archived: 0,
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
    console.error('Get poll stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get poll statistics',
      error: error.message
    });
  }
});

module.exports = router;
