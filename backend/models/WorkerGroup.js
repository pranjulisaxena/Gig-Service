const mongoose = require('mongoose');

const workerGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, default: 'member' },
        share: { type: Number, default: 0 }, // percentage
        joinedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'active', 'left'],
          default: 'pending'
        }
      }
    ],
    // AI matching score (0-100)
    matchScore: { type: Number, default: 0 },
    // Group efficiency
    totalSkillCoverage: { type: Number, default: 0 },
    // Status
    status: {
      type: String,
      enum: ['forming', 'active', 'completed', 'disbanded'],
      default: 'forming'
    },
    // Communication
    chat: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkerGroup', workerGroupSchema);