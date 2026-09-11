const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['earned', 'spent', 'bonus', 'penalty'],
      required: true
    },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    reference: {
      type: String,
      enum: ['gig-completion', 'quality-bonus', 'referral', 'milestone', 'redemption', 'penalty'],
      required: true
    },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
    balanceAfter: { type: Number, required: true }
  },
  { timestamps: true }
);

tokenSchema.index({ worker: 1, createdAt: -1 });

module.exports = mongoose.model('Token', tokenSchema);