const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'plumbing',
        'electrical',
        'cleaning',
        'carpentry',
        'painting',
        'appliance-repair',
        'pest-control',
        'gardening',
        'moving',
        'delivery',
        'other'
      ]
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Required skills
    requiredSkills: [{ type: String }],
    // Location
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
      }
    },
    // Pricing (AI-recommended)
    budget: {
      min: Number,
      max: Number,
      recommended: Number,
      final: Number
    },
    // AI Pricing breakdown
    pricingFactors: {
      basePrice: Number,
      skillMultiplier: Number,
      urgencyMultiplier: Number,
      conditionMultiplier: Number,
      demandMultiplier: Number,
      aiConfidence: Number
    },
    // Scheduling
    scheduledDate: Date,
    estimatedDuration: Number, // in hours
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium'
    },
    isEmergency: { type: Boolean, default: false },
    // Working conditions
    workingConditions: {
      weather: { type: String, enum: ['clear', 'rain', 'extreme', 'night'], default: 'clear' },
      isNightShift: { type: Boolean, default: false },
      isFestival: { type: Boolean, default: false },
      isWeekend: { type: Boolean, default: false }
    },
    // Group assignment
    assignedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerGroup' },
    assignedWorkers: [
      {
        worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String,
        share: Number, // percentage of payment
        status: {
          type: String,
          enum: ['invited', 'accepted', 'declined', 'completed'],
          default: 'invited'
        }
      }
    ],
    // Status
    status: {
      type: String,
      enum: ['open', 'matched', 'in-progress', 'completed', 'cancelled', 'disputed'],
      default: 'open'
    },
    // Attachments
    images: [{ type: String }],
    // Completion
    completedAt: Date,
    // Payment
    paymentStatus: {
      type: String,
      enum: ['pending', 'escrow', 'released', 'refunded'],
      default: 'pending'
    },
    // Reviews
    reviews: [
      {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

gigSchema.index({ category: 1, status: 1 });
gigSchema.index({ 'location.coordinates': '2dsphere' });
gigSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Gig', gigSchema);