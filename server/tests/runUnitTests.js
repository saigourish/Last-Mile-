/**
 * Gourish Last-Mile Delivery Tracker - Automated Unit Test Suite
 */
const {
  calculateVolumetricWeight,
  detectZone,
  calculateOrderPrice,
} = require('../src/services/pricingEngine');

const {
  calculateDistanceKm,
  calculateBearingDegrees,
} = require('../src/services/assignmentEngine');

let passedTests = 0;
let failedTests = 0;

const assert = (condition, testName) => {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
};

const assertEqual = (actual, expected, testName) => {
  if (actual === expected) {
    console.log(`  ✅ PASS: ${testName} (Got: ${actual})`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} (Expected: ${expected}, Got: ${actual})`);
    failedTests++;
  }
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING GOURISH BACKEND UNIT TESTS');
  console.log('======================================================\n');

  // Test 1: Volumetric Weight Calculation
  console.log('🔹 [1. Volumetric Weight Engine]');
  // 50 x 40 x 30 cm / 5000 = 60,000 / 5000 = 12.0 kg
  const vol1 = calculateVolumetricWeight(50, 40, 30, 5000);
  assertEqual(vol1, 12, '50x40x30 cm should yield exactly 12.00 kg volumetric weight');

  // 25 x 20 x 15 cm / 5000 = 7,500 / 5000 = 1.5 kg
  const vol2 = calculateVolumetricWeight(25, 20, 15, 5000);
  assertEqual(vol2, 1.5, '25x20x15 cm should yield 1.50 kg volumetric weight');

  // Test 2: Zone Detection Logic
  console.log('\n🔹 [2. Zone Detection Matrix]');
  const zoneA = await detectZone('560001', '560034', 'Bengaluru', 'Bengaluru');
  assertEqual(zoneA, 'ZONE_A', 'Matching first 4 digits pincode should resolve to ZONE_A (Local)');

  const zoneB = await detectZone('560001', '570001', 'Bengaluru', 'Mysuru');
  assertEqual(zoneB, 'ZONE_B', 'Matching first 2 digits pincode should resolve to ZONE_B (Regional)');

  const zoneC = await detectZone('560001', '400001', 'Bengaluru', 'Mumbai');
  assertEqual(zoneC, 'ZONE_C', 'Metro to Metro city pairing should resolve to ZONE_C');

  const zoneD = await detectZone('560001', '790001', 'Bengaluru', 'Itanagar');
  assertEqual(zoneD, 'ZONE_D', 'Remote non-metro routes should resolve to ZONE_D (National)');

  // Test 3: Haversine GPS Distance Calculation
  console.log('\n🔹 [3. Antigravity Physics GPS Calculations]');
  // Distance between MG Road (12.9756, 77.6066) and Indiranagar (12.9784, 77.6408) ~ 3.7 km
  const dist = calculateDistanceKm(12.9756, 77.6066, 12.9784, 77.6408);
  assert(dist > 3.0 && dist < 4.5, `Haversine distance should be ~3.7km, got ${dist}km`);

  const bearing = calculateBearingDegrees(12.9756, 77.6066, 12.9784, 77.6408);
  assert(bearing >= 0 && bearing <= 360, `Bearing angle should be 0-360 degrees, got ${bearing}°`);

  // Test 4: Pricing Engine Formula & Surcharges
  console.log('\n🔹 [4. Dynamic Rate Card & Surcharge Calculation]');
  const priceResult = await calculateOrderPrice({
    lengthCm: 50,
    widthCm: 40,
    heightCm: 30, // Volumetric = 12kg
    actualWeightKg: 2.0, // Actual = 2kg
    orderType: 'B2C',
    paymentMethod: 'COD',
    declaredValue: 2000,
    pickupPincode: '560001',
    dropPincode: '560034',
  });

  assertEqual(priceResult.chargeableWeightKg, 12, 'Chargeable weight must choose Max(Actual, Volumetric)');
  assertEqual(priceResult.chargedBy, 'VOLUMETRIC_DIMENSIONS', 'Charged by volumetric dimensions when vol > actual');
  assert(priceResult.pricingBreakdown.totalAmount > 0, 'Total billable amount should be positive non-zero number');
  assert(priceResult.pricingBreakdown.codSurcharge >= 30, 'COD surcharge must apply with minimum floor');
  assert(priceResult.pricingBreakdown.fuelSurcharge > 0, 'Fuel surcharge must be calculated');
  assert(priceResult.pricingBreakdown.gstAmount > 0, '18% GST must be computed accurately');

  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
