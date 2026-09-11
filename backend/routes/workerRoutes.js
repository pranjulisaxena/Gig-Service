const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getWorker,
  getWorkers,
  getMyGigs,
  getMyTokens,
  getBadges,
  verifyWorker,
  getMyStats
} = require('../controllers/workerController');

router.get('/', getWorkers);
router.get('/badges', getBadges);
router.get('/me/gigs', protect, authorize('worker'), getMyGigs);
router.get('/me/tokens', protect, authorize('worker'), getMyTokens);
router.get('/me/stats', protect, authorize('worker'), getMyStats);
router.get('/:id', getWorker);
router.put('/:id/verify', protect, authorize('admin'), verifyWorker);

module.exports = router;