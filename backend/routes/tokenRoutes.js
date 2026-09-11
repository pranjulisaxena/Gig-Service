const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const TokenService = require('../services/tokenService');

// @desc    Get token history
// @route   GET /api/tokens/history
router.get('/history', protect, async (req, res) => {
  try {
    const history = await TokenService.getTokenHistory(req.user.id);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Redeem tokens
// @route   POST /api/tokens/redeem
router.post('/redeem', protect, authorize('worker'), async (req, res) => {
  try {
    const { amount, purpose } = req.body;
    const token = await TokenService.redeemTokens(req.user.id, amount, purpose);
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;