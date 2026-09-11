/**
 * AI Pricing Service
 * Calculates fair price based on task, skills, urgency, and conditions
 */

const BASE_PRICES = {
  plumbing: 300,
  electrical: 350,
  cleaning: 200,
  carpentry: 400,
  painting: 350,
  'appliance-repair': 450,
  'pest-control': 500,
  gardening: 250,
  moving: 600,
  delivery: 150,
  other: 250
};

const SKILL_MULTIPLIERS = {
  basic: 1.0,
  intermediate: 1.3,
  advanced: 1.6,
  expert: 2.0
};

const URGENCY_MULTIPLIERS = {
  low: 0.9,
  medium: 1.0,
  high: 1.3,
  emergency: 1.8
};

const CONDITION_MULTIPLIERS = {
  clear: 1.0,
  rain: 1.15,
  extreme: 1.3,
  night: 1.25
};

class AIPricingService {
  /**
   * Calculate recommended price for a gig
   */
  static calculatePrice(gigData) {
    const {
      category,
      requiredSkills = [],
      urgency = 'medium',
      estimatedDuration = 1,
      workingConditions = {},
      location = {}
    } = gigData;

    // 1. Base price
    const basePrice = BASE_PRICES[category] || 250;

    // 2. Skill multiplier based on complexity
    const skillLevel = this.determineSkillLevel(requiredSkills);
    const skillMultiplier = SKILL_MULTIPLIERS[skillLevel] || 1.0;

    // 3. Urgency multiplier
    const urgencyMultiplier = URGENCY_MULTIPLIERS[urgency] || 1.0;

    // 4. Condition multiplier
    let conditionMultiplier = 1.0;
    if (workingConditions.weather) {
      conditionMultiplier *= CONDITION_MULTIPLIERS[workingConditions.weather] || 1.0;
    }
    if (workingConditions.isNightShift) conditionMultiplier *= 1.25;
    if (workingConditions.isFestival) conditionMultiplier *= 1.2;
    if (workingConditions.isWeekend) conditionMultiplier *= 1.1;

    // 5. Demand multiplier (simulated - in production would use real data)
    const demandMultiplier = this.getDemandMultiplier(category, location);

    // 6. Duration factor
    const durationFactor = Math.max(1, estimatedDuration);

    // Calculate final price
    const recommendedPrice = Math.round(
      basePrice *
        skillMultiplier *
        urgencyMultiplier *
        conditionMultiplier *
        demandMultiplier *
        durationFactor
    );

    // Confidence score (0-1)
    const aiConfidence = Math.min(
      0.95,
      0.6 +
        (requiredSkills.length * 0.05) +
        (urgency ? 0.1 : 0) +
        (workingConditions.weather ? 0.05 : 0)
    );

    return {
      recommended: recommendedPrice,
      min: Math.round(recommendedPrice * 0.85),
      max: Math.round(recommendedPrice * 1.2),
      breakdown: {
        basePrice,
        skillMultiplier,
        urgencyMultiplier,
        conditionMultiplier,
        demandMultiplier,
        durationFactor,
        aiConfidence: Math.round(aiConfidence * 100) / 100
      }
    };
  }

  /**
   * Determine skill level from required skills
   */
  static determineSkillLevel(skills) {
    if (!skills || skills.length === 0) return 'basic';
    if (skills.length >= 5) return 'expert';
    if (skills.length >= 3) return 'advanced';
    if (skills.length >= 2) return 'intermediate';
    return 'basic';
  }

  /**
   * Get demand multiplier (simplified simulation)
   */
  static getDemandMultiplier(category, location) {
    // In production, this would query real-time demand data
    const peakHours = [9, 10, 11, 17, 18, 19];
    const currentHour = new Date().getHours();
    const isPeak = peakHours.includes(currentHour);
    return isPeak ? 1.15 : 1.0;
  }

  /**
   * Match workers to a gig using AI scoring
   */
  static matchWorkers(gig, workers) {
    const scored = workers.map((worker) => {
      let score = 0;
      const reasons = [];

      // 1. Skill match (40 points)
      const matchedSkills = worker.skills.filter((s) =>
        gig.requiredSkills.map((rs) => rs.toLowerCase()).includes(s.toLowerCase())
      );
      const skillScore =
        gig.requiredSkills.length > 0
          ? (matchedSkills.length / gig.requiredSkills.length) * 40
          : 20;
      score += skillScore;
      if (matchedSkills.length > 0) {
        reasons.push(`Matches ${matchedSkills.length}/${gig.requiredSkills.length} skills`);
      }

      // 2. Rating (25 points)
      const ratingScore = (worker.rating / 5) * 25;
      score += ratingScore;
      if (worker.rating >= 4) reasons.push(`High rating (${worker.rating})`);

      // 3. Experience (15 points)
      const expScore = Math.min(15, worker.experience * 3);
      score += expScore;

      // 4. Proximity (10 points) - simplified
      const proximityScore = 10; // Would use geo-distance in production
      score += proximityScore;

      // 5. Availability (10 points)
      const availScore = worker.isAvailable ? 10 : 0;
      score += availScore;

      // 6. Verification bonus
      if (worker.isVerified) {
        score += 5;
        reasons.push('Verified profile');
      }

      return {
        worker,
        score: Math.round(score),
        reasons,
        matchPercentage: Math.round((score / 105) * 100)
      };
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Form optimal worker group for a gig
   */
  static formWorkerGroup(gig, matchedWorkers, maxSize = 4) {
    const group = [];
    const coveredSkills = new Set();
    const requiredSkills = gig.requiredSkills.map((s) => s.toLowerCase());

    // Greedy selection to cover all skills with minimum workers
    for (const match of matchedWorkers) {
      if (group.length >= maxSize) break;

      const workerSkills = match.worker.skills.map((s) => s.toLowerCase());
      const newSkills = workerSkills.filter(
        (s) => requiredSkills.includes(s) && !coveredSkills.has(s)
      );

      // Add worker if they cover new skills or if group is small
      if (newSkills.length > 0 || group.length < 2) {
        group.push(match);
        newSkills.forEach((s) => coveredSkills.add(s));
      }
    }

    // Calculate skill coverage
    const skillCoverage =
      requiredSkills.length > 0
        ? (coveredSkills.size / requiredSkills.length) * 100
        : 100;

    // Distribute payment shares
    const totalScore = group.reduce((sum, m) => sum + m.score, 0);
    const withShares = group.map((m) => ({
      ...m,
      share: totalScore > 0 ? Math.round((m.score / totalScore) * 100) : 100 / group.length
    }));

    return {
      members: withShares,
      skillCoverage: Math.round(skillCoverage),
      totalScore: Math.round(totalScore / group.length),
      estimatedCost: gig.budget?.recommended || 0
    };
  }

  /**
   * Calculate emergency pricing
   */
  static calculateEmergencyPrice(gig) {
    const base = gig.budget?.recommended || 300;
    const emergencyMultiplier = 1.8;
    return {
      regular: base,
      emergency: Math.round(base * emergencyMultiplier),
      breakdown: {
        basePrice: base,
        emergencySurcharge: Math.round(base * (emergencyMultiplier - 1)),
        multiplier: emergencyMultiplier
      }
    };
  }
}

module.exports = AIPricingService;