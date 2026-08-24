const mongoose = require('mongoose');
const RateCard = require('../models/RateCard');
const Zone = require('../models/Zone');

/**
 * Calculates volumetric weight based on dimensions
 * Standard formula: (Length x Width x Height) / Divisor (typically 5000 in cm/kg)
 */
const calculateVolumetricWeight = (lengthCm, widthCm, heightCm, divisor = 5000) => {
  const l = Math.max(1, parseFloat(lengthCm) || 1);
  const w = Math.max(1, parseFloat(widthCm) || 1);
  const h = Math.max(1, parseFloat(heightCm) || 1);
  const div = Math.max(1, parseFloat(divisor) || 5000);
  
  const volWeight = (l * w * h) / div;
  return Number(volWeight.toFixed(2));
};

/**
 * Resolves Zone from Pickup and Drop Pincodes / Cities
 */
const detectZone = async (pickupPincode, dropPincode, pickupCity = '', dropCity = '') => {
  const pPin = String(pickupPincode || '').trim();
  const dPin = String(dropPincode || '').trim();

  // 1. If pickup and drop are in the exact same pincode or first 4 digits match -> Zone A (Local Hyperlocal)
  if (pPin && dPin && pPin.substring(0, 4) === dPin.substring(0, 4)) {
    return 'ZONE_A';
  }

  // 2. If same postal circle / state cluster -> Zone B (Regional Express)
  // Karnataka (56-59), Maharashtra (40-44), Tamil Nadu (60-64), Delhi/NCR (11, 12, 20), AP/Telangana (50-53)
  const isSameRegion = 
    (pPin && dPin && pPin.substring(0, 2) === dPin.substring(0, 2)) ||
    (pPin.startsWith('5') && dPin.startsWith('5')) ||
    (pPin.startsWith('4') && dPin.startsWith('4')) ||
    (pPin.startsWith('6') && dPin.startsWith('6')) ||
    (pPin.startsWith('1') && dPin.startsWith('1'));

  if (isSameRegion) {
    return 'ZONE_B';
  }

  // 3. If major metro cities match (Bengaluru, Mumbai, Delhi, Chennai, Hyderabad, Kolkata, Pune)
  const metros = ['bengaluru', 'bangalore', 'mumbai', 'delhi', 'new delhi', 'chennai', 'hyderabad', 'kolkata', 'pune'];
  const pCity = pickupCity.toLowerCase().trim();
  const dCity = dropCity.toLowerCase().trim();

  if (metros.includes(pCity) && metros.includes(dCity)) {
    return 'ZONE_C'; // Metro-to-Metro
  }

  // 4. Fallback to National / Rest of India
  return 'ZONE_D';
};

/**
 * Comprehensive Smart Rate Calculation Engine
 */
const calculateOrderPrice = async ({
  lengthCm,
  widthCm,
  heightCm,
  actualWeightKg,
  orderType = 'B2C',
  paymentMethod = 'PREPAID',
  declaredValue = 0,
  pickupPincode = '',
  dropPincode = '',
  pickupCity = '',
  dropCity = '',
  customZone = null,
}) => {
  // 1. Calculate Weights
  const actualWeight = Math.max(0.1, parseFloat(actualWeightKg) || 0.5);
  const volumetricWeight = calculateVolumetricWeight(lengthCm, widthCm, heightCm, 5000);
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);

  // 2. Resolve Zone
  const zoneCode = customZone || (await detectZone(pickupPincode, dropPincode, pickupCity, dropCity));

  // 3. Find matching active Rate Card (with safe fallback if mongoose not connected)
  let rateCard = null;
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      rateCard = await RateCard.findOne({
        orderType: orderType.toUpperCase(),
        zoneCode: zoneCode.toUpperCase(),
        isActive: true,
      });
    } catch (dbErr) {
      console.warn('DB rate card lookup fallback:', dbErr.message);
    }
  }

  // Fallback default rate configurations
  if (!rateCard) {
    const isB2B = orderType.toUpperCase() === 'B2B';
    const basePrices = {
      ZONE_A: isB2B ? 180 : 40,
      ZONE_B: isB2B ? 320 : 65,
      ZONE_C: isB2B ? 480 : 90,
      ZONE_D: isB2B ? 650 : 120,
    };
    const addPrices = {
      ZONE_A: isB2B ? 15 : 20,
      ZONE_B: isB2B ? 25 : 30,
      ZONE_C: isB2B ? 35 : 45,
      ZONE_D: isB2B ? 50 : 60,
    };

    rateCard = {
      orderType,
      zoneCode,
      baseWeightKg: isB2B ? 5.0 : 0.5,
      baseRate: basePrices[zoneCode] || (isB2B ? 250 : 50),
      perAdditionalKgRate: addPrices[zoneCode] || (isB2B ? 20 : 30),
      codFeePercent: 2.0,
      codFeeMin: 30,
      fuelSurchargePercent: 5.0,
      gstPercent: 18.0,
      volumetricDivisor: 5000,
      minBillableWeightKg: 0.5,
    };
  }

  // 4. Calculate Base & Additional Weight Charges
  const baseWeight = rateCard.baseWeightKg;
  const baseRate = rateCard.baseRate;
  const perAddKgRate = rateCard.perAdditionalKgRate;

  let additionalWeightKg = 0;
  let weightCharge = 0;

  if (chargeableWeight > baseWeight) {
    additionalWeightKg = Number((chargeableWeight - baseWeight).toFixed(2));
    // Ceil to nearest step or fractional kg
    const billedAddUnits = Math.ceil(additionalWeightKg * (orderType === 'B2B' ? 1 : 2)) / (orderType === 'B2B' ? 1 : 2);
    weightCharge = Number((billedAddUnits * perAddKgRate).toFixed(2));
  }

  const freightSubtotal = Number((baseRate + weightCharge).toFixed(2));

  // 5. Calculate COD Surcharge
  let codSurcharge = 0;
  if (paymentMethod.toUpperCase() === 'COD') {
    const val = Math.max(0, parseFloat(declaredValue) || 0);
    const calculatedCodFee = (val * (rateCard.codFeePercent || 2.0)) / 100;
    codSurcharge = Number(Math.max(rateCard.codFeeMin || 30, calculatedCodFee).toFixed(2));
  }

  // 6. Fuel Surcharge
  const fuelPercent = rateCard.fuelSurchargePercent || 5.0;
  const fuelSurcharge = Number(((freightSubtotal * fuelPercent) / 100).toFixed(2));

  // 7. GST Calculation (18% on Freight + Fuel + COD)
  const taxableSubtotal = freightSubtotal + fuelSurcharge + codSurcharge;
  const gstPercent = rateCard.gstPercent || 18.0;
  const gstAmount = Number(((taxableSubtotal * gstPercent) / 100).toFixed(2));

  // 8. Total Billable Amount
  const totalAmount = Number((taxableSubtotal + gstAmount).toFixed(2));

  // 9. Mathematical Formula Explanation
  const formulaString = `Base (₹${baseRate} for ${baseWeight}kg) + Weight Add (₹${weightCharge} for ${additionalWeightKg}kg @ ₹${perAddKgRate}/kg) + Fuel (${fuelPercent}% = ₹${fuelSurcharge}) + COD (₹${codSurcharge}) + GST (${gstPercent}% = ₹${gstAmount}) = ₹${totalAmount}`;

  return {
    volumetricWeightKg: volumetricWeight,
    actualWeightKg: actualWeight,
    chargeableWeightKg: Number(chargeableWeight.toFixed(2)),
    chargedBy: volumetricWeight > actualWeight ? 'VOLUMETRIC_DIMENSIONS' : 'ACTUAL_DEADWEIGHT',
    zoneCode,
    pricingBreakdown: {
      baseRate,
      additionalWeightKg,
      weightCharge,
      codSurcharge,
      fuelSurcharge,
      gstAmount,
      totalAmount,
      formula: formulaString,
    },
    rateCardApplied: {
      title: rateCard.title || `${orderType} ${zoneCode} Rate`,
      baseWeightKg: baseWeight,
      baseRate,
      perAdditionalKgRate: perAddKgRate,
      fuelSurchargePercent: fuelPercent,
      gstPercent,
      codFeeMin: rateCard.codFeeMin,
      codFeePercent: rateCard.codFeePercent,
    },
  };
};

module.exports = {
  calculateVolumetricWeight,
  detectZone,
  calculateOrderPrice,
};
