const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Gig = require('../models/Gig');

// Mock payment processing (integrate Stripe/Razorpay in production)
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { gigId, amount } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    // In production: create Stripe PaymentIntent
    const clientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;

    gig.paymentStatus = 'escrow';
    gig.budget.final = amount;
    await gig.save();

    res.json({
      success: true,
      clientSecret,
      amount,
      gigId: gig._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Confirm payment
router.post('/confirm', protect, async (req, res) => {
  try {
    const { gigId, paymentIntentId } = req.body;
    const gig = await Gig.findByIdAndUpdate(
      gigId,
      { paymentStatus: 'escrow', status: 'in-progress' },
      { new: true }
    );

    res.json({ success: true, gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Release payment
router.post('/release', protect, async (req, res) => {
  try {
    const { gigId } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    gig.paymentStatus = 'released';
    await gig.save();

    res.json({ success: true, message: 'Payment released to workers', gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;