const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createGig,
  getGigs,
  getGig,
  matchWorkers,
  formGroup,
  respondToInvite,
  completeGig,
  getEmergencyPrice
} = require('../controllers/gigController');

router.route('/')
  .get(getGigs)
  .post(protect, authorize('customer', 'admin'), createGig);

router.post('/emergency-price', protect, getEmergencyPrice);

router.route('/:id')
  .get(getGig);

router.get('/:id/match', protect, authorize('customer', 'admin'), matchWorkers);
router.post('/:id/form-group', protect, authorize('customer', 'admin'), formGroup);
router.put('/:id/respond', protect, authorize('worker'), respondToInvite);
router.put('/:id/complete', protect, authorize('customer', 'admin'), completeGig);

module.exports = router;