const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ['worker', 'customer', 'admin'],
      default: 'customer'
    },
    // Worker-specific fields
    skills: [{ type: String, trim: true }],
    experience: { type: Number, default: 0 }, // years
    hourlyRate: { type: Number, default: 0 },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
      address: String,
      city: String,
      state: String,
      pincode: String
    },
    // Verification & Trust
    isVerified: { type: Boolean, default: false },
    verificationDocs: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    // Token & Badge System
    tokens: { type: Number, default: 0 },
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now }
      }
    ],
    // Availability
    isAvailable: { type: Boolean, default: true },
    // Company fields (for customers)
    companyName: String,
    companySize: String,
    // Stats
    completedGigs: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    // Profile
    avatar: String,
    bio: { type: String, maxlength: 500 },
    profileCompletion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ skills: 1 });
userSchema.index({ rating: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate profile completion
userSchema.methods.calculateProfileCompletion = function () {
  let fields = ['name', 'email', 'phone', 'bio', 'avatar'];
  let completed = fields.filter((f) => this[f]).length;
  if (this.role === 'worker') {
    const workerFields = ['skills', 'hourlyRate'];
    completed += workerFields.filter((f) => this[f] && this[f].length > 0).length;
    this.profileCompletion = Math.round((completed / (fields.length + workerFields.length)) * 100);
  } else {
    this.profileCompletion = Math.round((completed / fields.length) * 100);
  }
  return this.profileCompletion;
};

module.exports = mongoose.model('User', userSchema);