const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const WorkerGroup = require('../models/WorkerGroup');

// @desc    Get group details
// @route   GET /api/groups/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await WorkerGroup.findById(req.params.id)
      .populate('gig')
      .populate('leader', 'name avatar rating')
      .populate('members.worker', 'name avatar rating skills tokens');

    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Send group chat message
// @route   POST /api/groups/:id/chat
router.post('/:id/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const group = await WorkerGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.some((m) => m.worker.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a group member' });

    group.chat.push({ sender: req.user.id, message });
    await group.save();

    const io = req.app.get('io');
    if (io) {
      group.members.forEach((m) => {
        io.to(m.worker.toString()).emit('newGroupMessage', {
          groupId: group._id,
          sender: req.user.name,
          message
        });
      });
    }

    res.json({ success: true, chat: group.chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get my groups
// @route   GET /api/groups/me/all
router.get('/me/all', protect, async (req, res) => {
  try {
    const groups = await WorkerGroup.find({
      'members.worker': req.user.id
    })
      .populate('gig', 'title category status budget')
      .sort({ createdAt: -1 });

    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;