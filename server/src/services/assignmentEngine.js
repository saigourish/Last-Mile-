const Agent = require('../models/Agent');

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Computes bearing angle in degrees from point A to point B for orbital UI visualization
 */
const calculateBearingDegrees = (lat1, lon1, lat2, lon2) => {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
};

/**
 * Antigravity Auto-Assignment Simulation & Scoring Engine
 */
const evaluateAgentsForOrder = async (order) => {
  const allAgents = await Agent.find({ status: { $ne: 'offline' } });
  
  if (!allAgents || allAgents.length === 0) {
    return {
      success: false,
      message: 'No active delivery agents found in the network.',
      candidates: [],
      bestAgent: null,
    };
  }

  const pickupLat = order.pickupAddress?.coordinates?.lat || 12.9716;
  const pickupLng = order.pickupAddress?.coordinates?.lng || 77.5946;
  const packageWeight = order.packageDetails?.chargeableWeightKg || 1;

  const evaluatedCandidates = allAgents.map((agent) => {
    const agentLat = agent.currentLocation?.coordinates?.lat || 12.9716;
    const agentLng = agent.currentLocation?.coordinates?.lng || 77.5946;

    const distanceKm = calculateDistanceKm(pickupLat, pickupLng, agentLat, agentLng);
    const bearingAngle = calculateBearingDegrees(pickupLat, pickupLng, agentLat, agentLng);
    const remainingCapacity = Math.max(0, agent.maxCapacityKg - (agent.currentLoadKg || 0));
    const canCarryWeight = remainingCapacity >= packageWeight;

    // 1. Proximity Gravity Pull Score (0 - 100) -> Higher when closer
    const proximityScore = Math.max(0, Math.min(100, 100 / (1 + distanceKm * 0.15)));

    // 2. Capacity Score (0 - 100)
    const capacityRatio = remainingCapacity / (agent.maxCapacityKg || 25);
    const capacityScore = Math.max(0, Math.min(100, capacityRatio * 100));

    // 3. Performance / Rating Score (0 - 100)
    const ratingScore = ((agent.rating || 4.5) / 5.0) * 100;

    // 4. Workload Penalty
    const activeOrderCount = (agent.activeOrders || []).length;
    const loadPenalty = activeOrderCount * 18;

    // 5. Vehicle capability bonus for heavy weights
    let vehicleBonus = 0;
    if (packageWeight > 10 && ['delivery_van', 'cargo_truck'].includes(agent.vehicleType)) {
      vehicleBonus = 15;
    } else if (agent.vehicleType === 'drone' && packageWeight <= 3) {
      vehicleBonus = 12;
    }

    // Availability multiplier
    const statusMultiplier = agent.status === 'available' ? 1.0 : 0.65;

    // Composite Antigravity Gravitational Lift Score (0 - 100)
    let antigravityLiftScore =
      (proximityScore * 0.45 + capacityScore * 0.25 + ratingScore * 0.2 + vehicleBonus - loadPenalty) *
      statusMultiplier;

    if (!canCarryWeight) {
      antigravityLiftScore *= 0.2; // severe penalty if over capacity
    }

    const normalizedLiftScore = Number(Math.max(10, Math.min(99.8, antigravityLiftScore)).toFixed(1));

    // Antigravity Orbital Physics Visualizer Metaphors:
    // Altitude: how high the agent is 'lifted' towards assignment (0% to 100%)
    // Orbital Radius: visual pixel radius on radar (closer score = closer orbit)
    const orbitalRadius = Math.max(40, Math.min(220, Math.round(240 - normalizedLiftScore * 2)));
    const visualAltitude = Math.round(normalizedLiftScore);

    return {
      agentId: agent._id,
      name: agent.name,
      phone: agent.phone,
      vehicleType: agent.vehicleType,
      status: agent.status,
      currentLocation: agent.currentLocation,
      distanceKm,
      bearingAngle,
      remainingCapacityKg: remainingCapacity,
      maxCapacityKg: agent.maxCapacityKg,
      currentLoadKg: agent.currentLoadKg,
      rating: agent.rating,
      activeOrdersCount: activeOrderCount,
      canCarryWeight,
      antigravityLiftScore: normalizedLiftScore,
      physicsSimulation: {
        orbitalRadius,
        visualAltitude, // Percentage lifted into zero-G dispatch zone
        gravitationalPullFactor: Number((normalizedLiftScore / 100).toFixed(2)),
        vectorAngleDeg: bearingAngle,
      },
      matchRationale: canCarryWeight
        ? `${distanceKm}km away | ${remainingCapacity}kg capacity available | Rating: ${agent.rating}★`
        : `Capacity exceeded (${packageWeight}kg needed, only ${remainingCapacity}kg left)`,
    };
  });

  // Sort descending by Antigravity Lift Score
  evaluatedCandidates.sort((a, b) => b.antigravityLiftScore - a.antigravityLiftScore);

  const bestAgent = evaluatedCandidates.length > 0 && evaluatedCandidates[0].canCarryWeight
    ? evaluatedCandidates[0]
    : evaluatedCandidates[0] || null;

  return {
    success: true,
    candidates: evaluatedCandidates,
    bestAgent,
    algorithm: 'ANTIGRAVITY_DYNAMIC_GRAVITATIONAL_LIFT_V2',
    evaluatedAt: new Date().toISOString(),
  };
};

module.exports = {
  calculateDistanceKm,
  calculateBearingDegrees,
  evaluateAgentsForOrder,
};
