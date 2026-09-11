const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    icon: String,
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    requirement: {
      type: String,
      enum: ['gigs-completed', 'rating', 'tokens', 'skill-mastery', 'referral'],
      required: true
    },
    threshold: { type: Number, required: true },
    tokenReward: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);