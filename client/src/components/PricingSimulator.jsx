import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Box, 
  Scale, 
  Sparkles, 
  MapPin, 
  Zap, 
  Info, 
  Check, 
  CreditCard, 
  DollarSign 
} from 'lucide-react';
import { orderService } from '../services/api';

export const PricingSimulator = ({ onSelectPricing = null }) => {
  const [lengthCm, setLengthCm] = useState(30);
  const [widthCm, setWidthCm] = useState(25);
  const [heightCm, setHeightCm] = useState(20);
  const [actualWeightKg, setActualWeightKg] = useState(2.0);
  const [orderType, setOrderType] = useState('B2C');
  const [paymentMethod, setPaymentMethod] = useState('PREPAID');
  const [declaredValue, setDeclaredValue] = useState(1500);
  const [pickupPincode, setPickupPincode] = useState('560001');
  const [dropPincode, setDropPincode] = useState('560034');
  const [pickupCity, setPickupCity] = useState('Bengaluru');
  const [dropCity, setDropCity] = useState('Bengaluru');

  const [pricingResult, setPricingResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Volumetric weight live preview
  const liveVolumetricWeight = Number(((lengthCm * widthCm * heightCm) / 5000).toFixed(2));
  const liveChargeableWeight = Math.max(actualWeightKg, liveVolumetricWeight);
  const isVolumetricHeavier = liveVolumetricWeight > actualWeightKg;

  const calculatePrice = async () => {
    setLoading(true);
    try {
      const res = await orderService.calculateRate({
        lengthCm,
        widthCm,
        heightCm,
        actualWeightKg,
        orderType,
        paymentMethod,
        declaredValue,
        pickupPincode,
        dropPincode,
        pickupCity,
        dropCity,
      });

      if (res.data.success) {
        setPricingResult(res.data.data);
        if (onSelectPricing) {
          onSelectPricing(res.data.data);
        }
      }
    } catch (err) {
      console.error('Pricing calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      calculatePrice();
    }, 250);
    return () => clearTimeout(timer);
  }, [
    lengthCm,
    widthCm,
    heightCm,
    actualWeightKg,
    orderType,
    paymentMethod,
    declaredValue,
    pickupPincode,
    dropPincode,
  ]);

  return (
    <div className="rounded-3xl glass-panel border border-slate-800 p-6">
      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg text-white">Smart Pricing & Volumetric Engine</h3>
          <p className="text-xs text-slate-400">
            Real-time rate computation based on dimensional weight (L × W × H / 5000), zone matrices, and surcharges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Form: Sliders & Controls */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Order Type & Payment Method Pill Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-space-850 border border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Order Segment
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-space-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setOrderType('B2C')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    orderType === 'B2C'
                      ? 'bg-cyan-500 text-space-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  B2C Retail
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('B2B')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    orderType === 'B2B'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  B2B Cargo
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-space-850 border border-slate-800">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Payment Type
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-space-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PREPAID')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    paymentMethod === 'PREPAID'
                      ? 'bg-emerald-500 text-space-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Prepaid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    paymentMethod === 'COD'
                      ? 'bg-amber-500 text-space-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  COD Cash
                </button>
              </div>
            </div>
          </div>

          {/* Package Dimensions Controls */}
          <div className="p-4 rounded-2xl bg-space-850 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-400" /> Package Dimensions (cm)
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {lengthCm} × {widthCm} × {heightCm} cm
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Length: {lengthCm} cm</label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-space-950 cursor-pointer h-1.5 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Width: {widthCm} cm</label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={widthCm}
                  onChange={(e) => setWidthCm(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-space-950 cursor-pointer h-1.5 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Height: {heightCm} cm</label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-space-950 cursor-pointer h-1.5 rounded-lg"
                />
              </div>
            </div>

            {/* Actual Weight Slider */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-400" /> Actual Deadweight
                </label>
                <span className="text-xs font-mono text-indigo-400 font-bold">{actualWeightKg} kg</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="50"
                step="0.2"
                value={actualWeightKg}
                onChange={(e) => setActualWeightKg(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-space-950 cursor-pointer h-1.5 rounded-lg"
              />
            </div>
          </div>

          {/* Route Pincodes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-space-850 border border-slate-800">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono">Pickup Pincode</label>
              <input
                type="text"
                value={pickupPincode}
                onChange={(e) => setPickupPincode(e.target.value)}
                className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div className="p-3 rounded-2xl bg-space-850 border border-slate-800">
              <label className="text-[10px] text-slate-400 block mb-1 font-mono">Drop Pincode</label>
              <input
                type="text"
                value={dropPincode}
                onChange={(e) => setDropPincode(e.target.value)}
                className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Antigravity Physics Weight Balance & Price Card */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Gravitational Drag Balance Indicator */}
          <div className="p-4 rounded-2xl bg-space-900 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Gravitational Weight Resolver
            </h4>

            <div className="grid grid-cols-2 gap-3 text-center mb-3">
              <div
                className={`p-3 rounded-xl border transition-all ${
                  !isVolumetricHeavier
                    ? 'bg-indigo-950/50 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'bg-space-950 border-slate-800'
                }`}
              >
                <span className="text-[10px] text-slate-400 block">Actual Weight</span>
                <span className="text-base font-bold font-mono text-indigo-400">{actualWeightKg} kg</span>
                {!isVolumetricHeavier && (
                  <span className="mt-1 inline-block text-[9px] font-bold text-indigo-300 uppercase">
                    Applied
                  </span>
                )}
              </div>

              <div
                className={`p-3 rounded-xl border transition-all ${
                  isVolumetricHeavier
                    ? 'bg-cyan-950/50 border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'bg-space-950 border-slate-800'
                }`}
              >
                <span className="text-[10px] text-slate-400 block">Volumetric ((L × W × H) / 5000)</span>
                <span className="text-base font-bold font-mono text-cyan-400">{liveVolumetricWeight} kg</span>
                {isVolumetricHeavier && (
                  <span className="mt-1 inline-block text-[9px] font-bold text-cyan-300 uppercase">
                    Applied (Vol. Drag)
                  </span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-space-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Chargeable Weight:</span>
              <strong className="text-white font-mono font-extrabold text-xs">
                {liveChargeableWeight} kg
              </strong>
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-space-850 to-space-900 border border-cyan-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">Rate Breakdown</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {pricingResult?.zoneCode || 'ZONE_A'}
              </span>
            </div>

            <div className="py-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Fare:</span>
                <span className="font-mono text-slate-200">₹{pricingResult?.pricingBreakdown?.baseRate || 40}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Incremental Weight ({pricingResult?.pricingBreakdown?.additionalWeightKg || 0}kg):</span>
                <span className="font-mono text-slate-200">₹{pricingResult?.pricingBreakdown?.weightCharge || 0}</span>
              </div>
              {paymentMethod === 'COD' && (
                <div className="flex justify-between text-amber-400">
                  <span>COD Handling Surcharge:</span>
                  <span className="font-mono">₹{pricingResult?.pricingBreakdown?.codSurcharge || 30}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Fuel Surcharge:</span>
                <span className="font-mono text-slate-200">₹{pricingResult?.pricingBreakdown?.fuelSurcharge || 0}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18%):</span>
                <span className="font-mono text-slate-200">₹{pricingResult?.pricingBreakdown?.gstAmount || 0}</span>
              </div>
            </div>

            {/* Total Price Banner */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Total Billable Freight
                </span>
                <span className="text-2xl font-extrabold text-cyan-400 font-mono tracking-tight">
                  ₹{pricingResult?.pricingBreakdown?.totalAmount || '0.00'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded-lg">
                Instant Guarantee
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
