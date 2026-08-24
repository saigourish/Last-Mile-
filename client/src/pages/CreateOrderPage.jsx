import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  MapPin, 
  Box, 
  Scale, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  PlusCircle, 
  Building 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pickupAddress, setPickupAddress] = useState({
    street: '100 Residency Road, Tech Hub 4',
    area: 'Central Business District',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560025',
    contactPerson: 'Karan Mehra',
    contactPhone: '+91 98888 11111',
  });

  const [dropAddress, setDropAddress] = useState({
    street: 'Plot 45, 12th Main Road, HSR Sector 2',
    area: 'HSR Layout',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560102',
    contactPerson: 'Ananya Roy',
    contactPhone: '+91 97777 22222',
  });

  const [packageDetails, setPackageDetails] = useState({
    lengthCm: 30,
    widthCm: 25,
    heightCm: 20,
    actualWeightKg: 2.0,
    category: 'Electronics',
    description: 'Quantum Sensor Microcontrollers',
    isFragile: true,
  });

  const [orderType, setOrderType] = useState('B2C');
  const [paymentMethod, setPaymentMethod] = useState('PREPAID');
  const [declaredValue, setDeclaredValue] = useState(2500);

  const [calculatedPricing, setCalculatedPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Recalculate rates in real-time
  const fetchRatePreview = async () => {
    setLoading(true);
    try {
      const res = await orderService.calculateRate({
        lengthCm: packageDetails.lengthCm,
        widthCm: packageDetails.widthCm,
        heightCm: packageDetails.heightCm,
        actualWeightKg: packageDetails.actualWeightKg,
        orderType,
        paymentMethod,
        declaredValue,
        pickupPincode: pickupAddress.pincode,
        dropPincode: dropAddress.pincode,
        pickupCity: pickupAddress.city,
        dropCity: dropAddress.city,
      });

      if (res.data.success) {
        setCalculatedPricing(res.data.data);
      }
    } catch (err) {
      console.error('Failed to preview price:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRatePreview();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    packageDetails.lengthCm,
    packageDetails.widthCm,
    packageDetails.heightCm,
    packageDetails.actualWeightKg,
    orderType,
    paymentMethod,
    declaredValue,
    pickupAddress.pincode,
    dropAddress.pincode,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        pickupAddress,
        dropAddress,
        packageDetails,
        orderType,
        paymentMethod,
        declaredValue,
      };

      const res = await orderService.createOrder(payload);
      if (res.data.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#00F0FF', '#6366F1', '#10B981'],
        });

        const createdTracking = res.data.data.trackingNumber;
        navigate(`/track/${createdTracking}`);
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      alert(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title */}
      <div className="mb-8 text-center sm:text-left">
        <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <PlusCircle className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create New Logistics Order</h1>
        </div>
        <p className="text-xs text-slate-400">
          Instant volumetric calculation, dynamic zone detection, and upfront pricing breakdown.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns: Pickup, Drop, Package Specs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Segment & Payment Mode */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Shipment Configuration</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Order Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-space-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOrderType('B2C')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      orderType === 'B2C' ? 'bg-cyan-500 text-space-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    B2C (Retail)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('B2B')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      orderType === 'B2B' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    B2B (Bulk Freight)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-space-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PREPAID')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
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
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      paymentMethod === 'COD'
                        ? 'bg-amber-500 text-space-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    COD (Cash on Delivery)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Declared Package Value (₹)</label>
              <input
                type="number"
                min="100"
                max="500000"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(Number(e.target.value))}
                className="w-full bg-space-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Pickup Address Section */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> 1. Origin (Pickup Address)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sender Name / Contact</label>
                <input
                  type="text"
                  required
                  value={pickupAddress.contactPerson}
                  onChange={(e) => setPickupAddress({ ...pickupAddress, contactPerson: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sender Phone</label>
                <input
                  type="text"
                  required
                  value={pickupAddress.contactPhone}
                  onChange={(e) => setPickupAddress({ ...pickupAddress, contactPhone: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Street Address</label>
              <input
                type="text"
                required
                value={pickupAddress.street}
                onChange={(e) => setPickupAddress({ ...pickupAddress, street: e.target.value })}
                className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={pickupAddress.city}
                  onChange={(e) => setPickupAddress({ ...pickupAddress, city: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">State</label>
                <input
                  type="text"
                  required
                  value={pickupAddress.state}
                  onChange={(e) => setPickupAddress({ ...pickupAddress, state: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-mono">Pincode</label>
                <input
                  type="text"
                  required
                  value={pickupAddress.pincode}
                  onChange={(e) => setPickupAddress({ ...pickupAddress, pincode: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Drop Address Section */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> 2. Destination (Dropoff Address)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={dropAddress.contactPerson}
                  onChange={(e) => setDropAddress({ ...dropAddress, contactPerson: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Recipient Phone</label>
                <input
                  type="text"
                  required
                  value={dropAddress.contactPhone}
                  onChange={(e) => setDropAddress({ ...dropAddress, contactPhone: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Street Address</label>
              <input
                type="text"
                required
                value={dropAddress.street}
                onChange={(e) => setDropAddress({ ...dropAddress, street: e.target.value })}
                className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={dropAddress.city}
                  onChange={(e) => setDropAddress({ ...dropAddress, city: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">State</label>
                <input
                  type="text"
                  required
                  value={dropAddress.state}
                  onChange={(e) => setDropAddress({ ...dropAddress, state: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-mono">Pincode</label>
                <input
                  type="text"
                  required
                  value={dropAddress.pincode}
                  onChange={(e) => setDropAddress({ ...dropAddress, pincode: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Package Details Section */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5" /> 3. Package & Volumetric Dimensions
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Length (cm)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  required
                  value={packageDetails.lengthCm}
                  onChange={(e) => setPackageDetails({ ...packageDetails, lengthCm: Number(e.target.value) })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Width (cm)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  required
                  value={packageDetails.widthCm}
                  onChange={(e) => setPackageDetails({ ...packageDetails, widthCm: Number(e.target.value) })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  required
                  value={packageDetails.heightCm}
                  onChange={(e) => setPackageDetails({ ...packageDetails, heightCm: Number(e.target.value) })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Deadweight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="200"
                  required
                  value={packageDetails.actualWeightKg}
                  onChange={(e) => setPackageDetails({ ...packageDetails, actualWeightKg: Number(e.target.value) })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                <select
                  value={packageDetails.category}
                  onChange={(e) => setPackageDetails({ ...packageDetails, category: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Apparel">Apparel & Fashion</option>
                  <option value="Documents">Legal & Financial Documents</option>
                  <option value="Healthcare">Healthcare & Diagnostics</option>
                  <option value="Industrial">Industrial & Machinery</option>
                  <option value="General">General Goods</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Item Description</label>
                <input
                  type="text"
                  value={packageDetails.description}
                  onChange={(e) => setPackageDetails({ ...packageDetails, description: e.target.value })}
                  placeholder="e.g. Sensors, Laptop, Garment..."
                  className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Price Card & Submit Button */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/30 sticky top-24 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Live Rate Summary</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {calculatedPricing?.zoneCode || 'ZONE_A'}
              </span>
            </div>

            {/* Weight Diagnostic */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Volumetric Weight:</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {calculatedPricing?.volumetricWeightKg || '1.5'} kg
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Actual Deadweight:</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {packageDetails.actualWeightKg} kg
                </span>
              </div>
              <div className="p-2 rounded-xl bg-space-950 border border-slate-800 flex justify-between text-slate-300 font-medium">
                <span>Chargeable Weight:</span>
                <span className="font-mono text-white font-extrabold">
                  {calculatedPricing?.chargeableWeightKg || '2.0'} kg
                </span>
              </div>
            </div>

            {/* Pricing Surcharges Breakdown */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Base Rate:</span>
                <span className="font-mono text-slate-200">₹{calculatedPricing?.pricingBreakdown?.baseRate || 40}</span>
              </div>
              <div className="flex justify-between">
                <span>Weight Surcharge:</span>
                <span className="font-mono text-slate-200">₹{calculatedPricing?.pricingBreakdown?.weightCharge || 0}</span>
              </div>
              {paymentMethod === 'COD' && (
                <div className="flex justify-between text-amber-400">
                  <span>COD Handling Fee:</span>
                  <span className="font-mono">₹{calculatedPricing?.pricingBreakdown?.codSurcharge || 30}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Fuel Surcharge:</span>
                <span className="font-mono text-slate-200">₹{calculatedPricing?.pricingBreakdown?.fuelSurcharge || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span className="font-mono text-slate-200">₹{calculatedPricing?.pricingBreakdown?.gstAmount || 0}</span>
              </div>
            </div>

            {/* Total Price Callout */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Total Billable
                </span>
                <span className="text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
                  ₹{calculatedPricing?.pricingBreakdown?.totalAmount || '0.00'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded-lg">
                Gourish Express Ready
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-space-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
            >
              {submitting ? (
                <span>Locking Shipment...</span>
              ) : (
                <>
                  <span>Confirm & Book Shipment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};
