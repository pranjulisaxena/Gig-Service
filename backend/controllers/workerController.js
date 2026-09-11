const User = require('../models/User');
const Gig = require('../models/Gig');
const TokenService = require('../services/tokenService');
const Badge = require('../models/Badge');

// @desc    Get worker profile
// @route   GET /api/workers/:id
exports.getWorker = async (req, res) => {
  try {
    const worker = await User.findById(req.params.id).select('-password');
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    res.json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all workers (with filters)
// @route   GET /api/workers
exports.getWorkers = async (req, res) => {
  try {
    const { skill, city, minRating, isVerified, page = 1, limit = 20 } = req.query;
    const query = { role: 'worker' };

    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (isVerified) query.isVerified = isVerified === 'true';

    const workers = await User.find(query)
      .select('-password')
      .sort({ rating: -1, completedGigs: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: workers.length,
      total,
      workers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get worker's gigs
// @route   GET /api/workers/me/gigs
exports.getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({
      'assignedWorkers.worker': req.user.id
    })
      .populate('customer', 'name companyName')
      .sort({ createdAt: -1 });

    res.json({ success: true, gigs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get worker's token history
// @route   GET /api/workers/me/tokens
exports.getMyTokens = async (req, res) => {
  try {
    const history = await TokenService.getTokenHistory(req.user.id);
    const worker = await User.findById(req.user.id).select('tokens badges');

    res.json({
      success: true,
      balance: worker.tokens,
      badges: worker.badges,
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all available badges
// @route   GET /api/workers/badges
exports.getBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ tier: 1, threshold: 1 });
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify a worker (admin only)
// @route   PUT /api/workers/:id/verify
exports.verifyWorker = async (req, res) => {
  try {
    const worker = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    // Award verification bonus
    await TokenService.awardTokens(
      worker._id,
      25,
      'Profile verification bonus',
      'bonus'
    );

    res.json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get worker dashboard stats
// @route   GET /api/workers/me/stats
exports.getMyStats = async (req, res) => {
  try {
    const worker = await User.findById(req.user.id);

    const activeGigs = await Gig.countDocuments({
      'assignedWorkers.worker': req.user.id,
      status: { $in: ['matched', 'in-progress'] }
    });

    const completedGigs = await Gig.countDocuments({
      'assignedWorkers.worker': req.user.id,
      status: 'completed'
    });

    // Calculate earnings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthGigs = await Gig.find({
      'assignedWorkers.worker': req.user.id,
      status: 'completed',
      completedAt: { $gte: startOfMonth }
    });

    let monthlyEarnings = 0;
    monthGigs.forEach((gig) => {
      const assignment = gig.assignedWorkers.find(
        (w) => w.worker.toString() === req.user.id
      );
      if (assignment) {
        monthlyEarnings += Math.round((gig.budget.final || gig.budget.recommended || 0) * assignment.share / 100);
      }
    });

    res.json({
      success: true,
      stats: {
        tokens: worker.tokens,
        badges: worker.badges.length,
        rating: worker.rating,
        totalReviews: worker.totalReviews,
        completedGigs,
        activeGigs,
        totalEarnings: worker.totalEarnings,
        monthlyEarnings,
        isVerified: worker.isVerified,
        profileCompletion: worker.profileCompletion
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};