const Gig = require('../models/Gig');
const User = require('../models/User');
const WorkerGroup = require('../models/WorkerGroup');
const AIPricingService = require('../services/aiPricingService');
const TokenService = require('../services/tokenService');

// @desc    Create a new gig with AI pricing
// @route   POST /api/gigs
exports.createGig = async (req, res) => {
  try {
    const gigData = { ...req.body, customer: req.user.id };

    // Calculate AI-recommended price
    const pricing = AIPricingService.calculatePrice(gigData);
    gigData.budget = pricing;
    gigData.pricingFactors = pricing.breakdown;

    const gig = await Gig.create(gigData);

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) io.emit('newGig', { gigId: gig._id, category: gig.category });

    res.status(201).json({ success: true, gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all gigs (with filters)
// @route   GET /api/gigs
exports.getGigs = async (req, res) => {
  try {
    const { category, status, city, minBudget, maxBudget, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (minBudget || maxBudget) {
      query['budget.recommended'] = {};
      if (minBudget) query['budget.recommended'].$gte = Number(minBudget);
      if (maxBudget) query['budget.recommended'].$lte = Number(maxBudget);
    }

    const gigs = await Gig.find(query)
      .populate('customer', 'name companyName rating avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Gig.countDocuments(query);

    res.json({
      success: true,
      count: gigs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      gigs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single gig
// @route   GET /api/gigs/:id
exports.getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('customer', 'name companyName rating avatar phone')
      .populate('assignedWorkers.worker', 'name rating skills avatar tokens')
      .populate('assignedGroup');

    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    res.json({ success: true, gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI-matched workers for a gig
// @route   GET /api/gigs/:id/match
exports.matchWorkers = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    // Find available workers with matching skills
    const workers = await User.find({
      role: 'worker',
      isAvailable: true,
      _id: { $ne: req.user.id }
    }).limit(50);

    // AI matching
    const matched = AIPricingService.matchWorkers(gig, workers);
    const topMatches = matched.slice(0, 10);

    res.json({
      success: true,
      total: matched.length,
      matches: topMatches.map((m) => ({
        worker: {
          id: m.worker._id,
          name: m.worker.name,
          skills: m.worker.skills,
          rating: m.worker.rating,
          experience: m.worker.experience,
          hourlyRate: m.worker.hourlyRate,
          isVerified: m.worker.isVerified,
          avatar: m.worker.avatar
        },
        matchPercentage: m.matchPercentage,
        score: m.score,
        reasons: m.reasons
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Form worker group for a gig
// @route   POST /api/gigs/:id/form-group
exports.formGroup = async (req, res) => {
  try {
    const { workerIds, groupName } = req.body;
    const gig = await Gig.findById(req.params.id).populate('customer');

    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const workers = await User.find({ _id: { $in: workerIds }, role: 'worker' });
    if (workers.length !== workerIds.length) {
      return res.status(400).json({ success: false, message: 'Some workers not found' });
    }

    // AI group formation
    const matched = AIPricingService.matchWorkers(gig, workers);
    const groupData = AIPricingService.formWorkerGroup(gig, matched, workerIds.length);

    // Create worker group
    const workerGroup = await WorkerGroup.create({
      name: groupName || `${gig.title} - Team`,
      gig: gig._id,
      leader: workerIds[0],
      members: groupData.members.map((m, idx) => ({
        worker: m.worker._id,
        role: idx === 0 ? 'leader' : 'member',
        share: m.share,
        status: 'pending'
      })),
      matchScore: groupData.totalScore,
      totalSkillCoverage: groupData.skillCoverage,
      status: 'forming'
    });

    // Update gig
    gig.assignedGroup = workerGroup._id;
    gig.assignedWorkers = groupData.members.map((m, idx) => ({
      worker: m.worker._id,
      role: idx === 0 ? 'leader' : 'member',
      share: m.share,
      status: 'invited'
    }));
    gig.status = 'matched';
    await gig.save();

    // Notify workers via Socket.IO
    const io = req.app.get('io');
    if (io) {
      workerIds.forEach((id) => {
        io.to(id.toString()).emit('groupInvite', {
          gigId: gig._id,
          groupId: workerGroup._id,
          gigTitle: gig.title,
          budget: gig.budget
        });
      });
    }

    res.status(201).json({
      success: true,
      group: workerGroup,
      skillCoverage: groupData.skillCoverage,
      estimatedCost: groupData.estimatedCost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept/decline group invite
// @route   PUT /api/gigs/:id/respond
exports.respondToInvite = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'declined'
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    const workerAssignment = gig.assignedWorkers.find(
      (w) => w.worker.toString() === req.user.id
    );

    if (!workerAssignment) {
      return res.status(404).json({ success: false, message: 'You are not assigned to this gig' });
    }

    workerAssignment.status = status;
    await gig.save();

    // Update group member status
    if (gig.assignedGroup) {
      const group = await WorkerGroup.findById(gig.assignedGroup);
      const member = group.members.find((m) => m.worker.toString() === req.user.id);
      if (member) {
        member.status = status === 'accepted' ? 'accepted' : 'left';
        await group.save();
      }
    }

    // Check if all accepted
    const allAccepted = gig.assignedWorkers.every((w) => w.status === 'accepted');
    if (allAccepted) {
      gig.status = 'in-progress';
      await gig.save();
    }

    res.json({ success: true, gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete gig and award tokens
// @route   PUT /api/gigs/:id/complete
exports.completeGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    gig.status = 'completed';
    gig.completedAt = new Date();
    gig.paymentStatus = 'released';
    await gig.save();

    // Award tokens to workers
    const tokenRewards = [];
    for (const assignment of gig.assignedWorkers) {
      if (assignment.status === 'accepted' || assignment.status === 'completed') {
        const baseTokens = 10;
        const bonusTokens = Math.round((assignment.share / 100) * 20);
        const totalTokens = baseTokens + bonusTokens;

        await TokenService.awardTokens(
          assignment.worker,
          totalTokens,
          `Completed gig: ${gig.title}`,
          'gig-completion',
          gig._id
        );

        // Update worker stats
        await User.findByIdAndUpdate(assignment.worker, {
          $inc: {
            completedGigs: 1,
            totalEarnings: Math.round((gig.budget.recommended * assignment.share) / 100)
          }
        });

        tokenRewards.push({ worker: assignment.worker, tokens: totalTokens });
      }
    }

    // Update group status
    if (gig.assignedGroup) {
      await WorkerGroup.findByIdAndUpdate(gig.assignedGroup, { status: 'completed' });
    }

    res.json({ success: true, gig, tokenRewards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get emergency pricing
// @route   POST /api/gigs/emergency-price
exports.getEmergencyPrice = async (req, res) => {
  try {
    const { category, estimatedDuration } = req.body;
    const pricing = AIPricingService.calculatePrice({
      category,
      urgency: 'emergency',
      estimatedDuration,
      workingConditions: { isNightShift: true }
    });

    const emergency = AIPricingService.calculateEmergencyPrice({ budget: pricing });

    res.json({ success: true, pricing: emergency });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};