/**
 * Database Seeder
 * Run: node seeder.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Gig = require('./models/Gig');
const Badge = require('./models/Badge');
const TokenService = require('./services/tokenService');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cooperative_gig');
  console.log('✅ MongoDB Connected for seeding');
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Gig.deleteMany({});
    await Badge.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Initialize badges
    await TokenService.initializeDefaultBadges();

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@cogig.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      isVerified: true
    });

    // Create customers
    const customers = await User.create([
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@techcorp.com',
        password: 'customer123',
        phone: '9876543210',
        role: 'customer',
        companyName: 'TechCorp Solutions',
        companySize: '50-200',
        location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        isVerified: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya@homeserve.com',
        password: 'customer123',
        phone: '9876543211',
        role: 'customer',
        companyName: 'HomeServe India',
        location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        isVerified: true
      }
    ]);

    // Create workers
    const workers = await User.create([
      {
        name: 'Amit Patel',
        email: 'amit@worker.com',
        password: 'worker123',
        phone: '9876543220',
        role: 'worker',
        skills: ['plumbing', 'pipe-fitting', 'water-heater'],
        experience: 8,
        hourlyRate: 400,
        rating: 4.7,
        totalReviews: 45,
        completedGigs: 52,
        tokens: 320,
        isVerified: true,
        bio: 'Expert plumber with 8 years of experience in residential and commercial plumbing.',
        location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        isAvailable: true,
        badges: [
          { name: 'First Gig', icon: '🎯' },
          { name: 'Rising Star', icon: '⭐' },
          { name: 'Expert Worker', icon: '🏆' }
        ]
      },
      {
        name: 'Suresh Reddy',
        email: 'suresh@worker.com',
        password: 'worker123',
        phone: '9876543221',
        role: 'worker',
        skills: ['electrical', 'wiring', 'circuit-repair', 'lighting'],
        experience: 6,
        hourlyRate: 450,
        rating: 4.5,
        totalReviews: 38,
        completedGigs: 41,
        tokens: 250,
        isVerified: true,
        bio: 'Licensed electrician specializing in home wiring and appliance installation.',
        location: { city: 'Bangalore', state: 'Karnataka', pincode: '560002' },
        isAvailable: true,
        badges: [{ name: 'First Gig', icon: '🎯' }, { name: 'Rising Star', icon: '⭐' }]
      },
      {
        name: 'Kavita Singh',
        email: 'kavita@worker.com',
        password: 'worker123',
        phone: '9876543222',
        role: 'worker',
        skills: ['cleaning', 'deep-cleaning', 'sanitization', 'kitchen-cleaning'],
        experience: 4,
        hourlyRate: 250,
        rating: 4.8,
        totalReviews: 67,
        completedGigs: 78,
        tokens: 450,
        isVerified: true,
        bio: 'Professional cleaning expert with attention to detail.',
        location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        isAvailable: true,
        badges: [
          { name: 'First Gig', icon: '🎯' },
          { name: 'Rising Star', icon: '⭐' },
          { name: 'Expert Worker', icon: '🏆' },
          { name: 'Top Rated', icon: '💎' }
        ]
      },
      {
        name: 'Mohammed Khan',
        email: 'mohammed@worker.com',
        password: 'worker123',
        phone: '9876543223',
        role: 'worker',
        skills: ['carpentry', 'furniture-repair', 'wood-work', 'installation'],
        experience: 12,
        hourlyRate: 500,
        rating: 4.9,
        totalReviews: 89,
        completedGigs: 95,
        tokens: 680,
        isVerified: true,
        bio: 'Master carpenter with 12+ years crafting custom furniture and repairs.',
        location: { city: 'Bangalore', state: 'Karnataka', pincode: '560003' },
        isAvailable: true,
        badges: [
          { name: 'First Gig', icon: '🎯' },
          { name: 'Rising Star', icon: '⭐' },
          { name: 'Expert Worker', icon: '🏆' },
          { name: 'Top Rated', icon: '💎' }
        ]
      },
      {
        name: 'Lakshmi Nair',
        email: 'lakshmi@worker.com',
        password: 'worker123',
        phone: '9876543224',
        role: 'worker',
        skills: ['painting', 'wall-texture', 'waterproofing', 'interior-painting'],
        experience: 5,
        hourlyRate: 350,
        rating: 4.4,
        totalReviews: 28,
        completedGigs: 32,
        tokens: 180,
        isVerified: false,
        bio: 'Creative painter with expertise in modern interior designs.',
        location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400002' },
        isAvailable: true,
        badges: [{ name: 'First Gig', icon: '🎯' }]
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram@worker.com',
        password: 'worker123',
        phone: '9876543225',
        role: 'worker',
        skills: ['appliance-repair', 'AC-repair', 'refrigerator-repair', 'washing-machine'],
        experience: 7,
        hourlyRate: 500,
        rating: 4.6,
        totalReviews: 42,
        completedGigs: 48,
        tokens: 300,
        isVerified: true,
        bio: 'Certified appliance technician for all major brands.',
        location: { city: 'Bangalore', state: 'Karnataka', pincode: '560004' },
        isAvailable: true,
        badges: [
          { name: 'First Gig', icon: '🎯' },
          { name: 'Rising Star', icon: '⭐' },
          { name: 'Expert Worker', icon: '🏆' }
        ]
      }
    ]);

    // Create sample gigs
    const gigs = await Gig.create([
      {
        title: 'Fix leaking kitchen pipe',
        description: 'Kitchen sink pipe is leaking continuously. Need urgent repair.',
        category: 'plumbing',
        customer: customers[0]._id,
        requiredSkills: ['plumbing', 'pipe-fitting'],
        location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        budget: { min: 300, max: 600, recommended: 450, final: 450 },
        pricingFactors: {
          basePrice: 300,
          skillMultiplier: 1.3,
          urgencyMultiplier: 1.3,
          conditionMultiplier: 1.0,
          demandMultiplier: 1.15,
          aiConfidence: 0.8
        },
        urgency: 'high',
        estimatedDuration: 2,
        workingConditions: { weather: 'clear', isNightShift: false },
        status: 'open'
      },
      {
        title: 'Complete house deep cleaning',
        description: '3BHK apartment needs thorough deep cleaning before Diwali.',
        category: 'cleaning',
        customer: customers[1]._id,
        requiredSkills: ['cleaning', 'deep-cleaning', 'sanitization'],
        location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        budget: { min: 800, max: 1500, recommended: 1200, final: 1200 },
        pricingFactors: {
          basePrice: 200,
          skillMultiplier: 1.6,
          urgencyMultiplier: 1.0,
          conditionMultiplier: 1.2,
          demandMultiplier: 1.0,
          aiConfidence: 0.85
        },
        urgency: 'medium',
        estimatedDuration: 6,
        workingConditions: { weather: 'clear', isFestival: true },
        status: 'open'
      },
      {
        title: 'Install new ceiling fan and lights',
        description: 'Need to install 2 ceiling fans and 6 LED lights in new apartment.',
        category: 'electrical',
        customer: customers[0]._id,
        requiredSkills: ['electrical', 'wiring', 'lighting'],
        location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        budget: { min: 500, max: 900, recommended: 700, final: 700 },
        pricingFactors: {
          basePrice: 350,
          skillMultiplier: 1.3,
          urgencyMultiplier: 1.0,
          conditionMultiplier: 1.0,
          demandMultiplier: 1.0,
          aiConfidence: 0.75
        },
        urgency: 'medium',
        estimatedDuration: 3,
        workingConditions: { weather: 'clear' },
        status: 'open'
      }
    ]);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:    admin@cogig.com / admin123');
    console.log('Customer: rajesh@techcorp.com / customer123');
    console.log('Customer: priya@homeserve.com / customer123');
    console.log('Worker:   amit@worker.com / worker123');
    console.log('Worker:   suresh@worker.com / worker123');
    console.log('Worker:   kavita@worker.com / worker123');
    console.log('Worker:   mohammed@worker.com / worker123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();