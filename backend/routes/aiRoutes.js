const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const AIPricingService = require('../services/aiPricingService');
const Gig = require('../models/Gig');
const User = require('../models/User');

// @desc    Get AI price recommendation
// @route   POST /api/ai/price
router.post('/price', protect, async (req, res) => {
  try {
    const pricing = AIPricingService.calculatePrice(req.body);
    res.json({ success: true, pricing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get AI worker recommendations for a gig
// @route   POST /api/ai/recommend
router.post('/recommend', protect, async (req, res) => {
  try {
    const { gigId } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    const workers = await User.find({ role: 'worker', isAvailable: true }).limit(100);
    const matches = AIPricingService.matchWorkers(gig, workers);

    res.json({
      success: true,
      recommendations: matches.slice(0, 15).map((m) => ({
        workerId: m.worker._id,
        name: m.worker.name,
        matchPercentage: m.matchPercentage,
        reasons: m.reasons
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Auto-form group for a gig
// @route   POST /api/ai/auto-group
router.post('/auto-group', protect, async (req, res) => {
  try {
    const { gigId, groupSize = 3 } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    const workers = await User.find({ role: 'worker', isAvailable: true }).limit(100);
    const matched = AIPricingService.matchWorkers(gig, workers);
    const group = AIPricingService.formWorkerGroup(gig, matched, groupSize);

    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;