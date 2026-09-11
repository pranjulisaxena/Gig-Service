const Token = require('../models/Token');
const Badge = require('../models/Badge');
const User = require('../models/User');

class TokenService {
  /**
   * Award tokens to a worker
   */
  static async awardTokens(workerId, amount, reason, reference, gigId = null) {
    const worker = await User.findById(workerId);
    if (!worker) throw new Error('Worker not found');

    const balanceAfter = worker.tokens + amount;

    const token = await Token.create({
      worker: workerId,
      type: amount > 0 ? 'earned' : 'spent',
      amount,
      reason,
      reference,
      gig: gigId,
      balanceAfter
    });

    worker.tokens = balanceAfter;
    await worker.save();

    // Check for badge eligibility
    await this.checkBadges(workerId);

    return token;
  }

  /**
   * Check and award badges based on worker stats
   */
  static async checkBadges(workerId) {
    const worker = await User.findById(workerId);
    if (!worker) return;

    const allBadges = await Badge.find();
    const earnedBadgeNames = worker.badges.map((b) => b.name);
    const newBadges = [];

    for (const badge of allBadges) {
      if (earnedBadgeNames.includes(badge.name)) continue;

      let qualifies = false;

      switch (badge.requirement) {
        case 'gigs-completed':
          qualifies = worker.completedGigs >= badge.threshold;
          break;
        case 'rating':
          qualifies = worker.rating >= badge.threshold && worker.totalReviews >= 5;
          break;
        case 'tokens':
          qualifies = worker.tokens >= badge.threshold;
          break;
        case 'referral':
          qualifies = false; // Would need referral tracking
          break;
      }

      if (qualifies) {
        worker.badges.push({ name: badge.name, icon: badge.icon });
        newBadges.push(badge);

        // Award bonus tokens
        if (badge.tokenReward > 0) {
          await this.awardTokens(
            workerId,
            badge.tokenReward,
            `Badge earned: ${badge.name}`,
            'bonus'
          );
        }
      }
    }

    if (newBadges.length > 0) {
      await worker.save();
    }

    return newBadges;
  }

  /**
   * Get token history for a worker
   */
  static async getTokenHistory(workerId, limit = 50) {
    return await Token.find({ worker: workerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('gig', 'title category');
  }

  /**
   * Redeem tokens (for platform benefits)
   */
  static async redeemTokens(workerId, amount, purpose) {
    const worker = await User.findById(workerId);
    if (!worker) throw new Error('Worker not found');
    if (worker.tokens < amount) throw new Error('Insufficient tokens');

    return await this.awardTokens(workerId, -amount, purpose, 'redemption');
  }

  /**
   * Initialize default badges
   */
  static async initializeDefaultBadges() {
    const defaultBadges = [
      {
        name: 'First Gig',
        description: 'Completed your first gig',
        icon: '🎯',
        tier: 'bronze',
        requirement: 'gigs-completed',
        threshold: 1,
        tokenReward: 10
      },
      {
        name: 'Rising Star',
        description: 'Completed 10 gigs',
        icon: '⭐',
        tier: 'silver',
        requirement: 'gigs-completed',
        threshold: 10,
        tokenReward: 50
      },
      {
        name: 'Expert Worker',
        description: 'Completed 50 gigs',
        icon: '🏆',
        tier: 'gold',
        requirement: 'gigs-completed',
        threshold: 50,
        tokenReward: 200
      },
      {
        name: 'Top Rated',
        description: 'Maintained 4.5+ rating',
        icon: '💎',
        tier: 'platinum',
        requirement: 'rating',
        threshold: 4.5,
        tokenReward: 300
      },
      {
        name: 'Token Master',
        description: 'Earned 1000 tokens',
        icon: '👑',
        tier: 'diamond',
        requirement: 'tokens',
        threshold: 1000,
        tokenReward: 500
      }
    ];

    for (const badge of defaultBadges) {
      await Badge.findOneAndUpdate({ name: badge.name }, badge, {
        upsert: true,
        new: true
      });
    }

    console.log('✅ Default badges initialized');
  }
}

module.exports = TokenService;