import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sliders, 
  MapPin, 
  Layers, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Sparkles, 
  Search 
} from 'lucide-react';
import { zoneService, rateCardService } from '../services/api';

export const RateCardZoneManager = () => {
  const [zones, setZones] = useState([]);
  const [rateCards, setRateCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Zone Lookup Tester states
  const [testPickupPin, setTestPickupPin] = useState('560001');
  const [testDropPin, setTestDropPin] = useState('560034');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  // Edit Rate Card Modal state
  const [editingCard, setEditingCard] = useState(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [zonesRes, ratesRes] = await Promise.all([
        zoneService.getZones(),
        rateCardService.getRateCards(),
      ]);

      if (zonesRes.data.success) setZones(zonesRes.data.data);
      if (ratesRes.data.success) setRateCards(ratesRes.data.data);
    } catch (err) {
      console.error('Error loading zones & rate cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestLookup = async (e) => {
    e.preventDefault();
    setTestLoading(true);
    try {
      const res = await zoneService.lookupZone({
        pickupPincode: testPickupPin,
        dropPincode: testDropPin,
      });
      if (res.data.success) {
        setTestResult(res.data);
      }
    } catch (err) {
      console.error('Test lookup error:', err);
    } finally {
      setTestLoading(false);
    }
  };

  const handleSaveRateCard = async (e) => {
    e.preventDefault();
    try {
      if (editingCard._id) {
        await rateCardService.updateRateCard(editingCard._id, editingCard);
      } else {
        await rateCardService.createRateCard(editingCard);
      }
      setIsRateModalOpen(false);
      setEditingCard(null);
      loadData();
    } catch (err) {
      console.error('Failed to save rate card:', err);
      alert('Error saving rate card.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Logistics Zone & Smart Pricing Engine</h1>
          </div>
          <p className="text-xs text-slate-400">
            Admin configuration console for geographical zone boundaries, B2B/B2C rate cards, COD surcharges, and tax rates.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCard({
              title: 'New Rate Card',
              orderType: 'B2C',
              zoneCode: 'ZONE_A',
              baseWeightKg: 0.5,
              baseRate: 45,
              perAdditionalKgRate: 20,
              codFeePercent: 2.0,
              codFeeMin: 30,
              fuelSurchargePercent: 5.0,
              gstPercent: 18.0,
            });
            setIsRateModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-space-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" /> Create Rate Card
        </button>
      </div>

      {/* Zone Tester Sandbox */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Zone Resolution Sandbox
        </h2>
        <p className="text-xs text-slate-400">Test how origin & destination PIN pairs map to logistics zones in real-time.</p>

        <form onSubmit={handleTestLookup} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-mono">Origin Pincode</label>
            <input
              type="text"
              value={testPickupPin}
              onChange={(e) => setTestPickupPin(e.target.value)}
              className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-mono">Destination Pincode</label>
            <input
              type="text"
              value={testDropPin}
              onChange={(e) => setTestDropPin(e.target.value)}
              className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={testLoading}
            className="py-2.5 rounded-xl bg-space-850 hover:bg-space-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            {testLoading ? 'Resolving Zone...' : 'Run Zone Matrix Test'}
          </button>
        </form>

        {testResult && (
          <div className="p-3.5 rounded-2xl bg-space-950 border border-cyan-500/30 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Resolved Territory: <strong className="text-cyan-400 font-mono text-sm">{testResult.detectedZoneCode}</strong> ({testResult.zoneDetails?.name || 'Local Matrix'})
            </span>
            <span className="text-slate-400 font-mono">Est. SLA: {testResult.zoneDetails?.estimatedDeliveryHours || 24}h</span>
          </div>
        )}
      </div>

      {/* Configured Zones List */}
      <div className="space-y-4">
        <h2 className="font-extrabold text-base text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" /> Logistics Zones Matrix
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {zones.map((zone) => (
            <div key={zone._id} className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-cyan-400">{zone.code}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-space-950 text-slate-400 border border-slate-700">
                  {zone.type}
                </span>
              </div>
              <h3 className="font-bold text-xs text-white">{zone.name}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{zone.description || 'Configured territory cluster.'}</p>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between font-mono">
                <span>Max Radius: {zone.maxDistanceKm}km</span>
                <span>SLA: {zone.estimatedDeliveryHours}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configured Rate Cards Table */}
      <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-extrabold text-base text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Dynamic Rate Cards
          </h2>
          <span className="text-xs text-slate-400 font-mono">{rateCards.length} Active Cards</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-space-850/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Card Title</th>
                <th className="py-3.5 px-4">Segment</th>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4">Base Fare (Weight)</th>
                <th className="py-3.5 px-4">Additional Rate</th>
                <th className="py-3.5 px-4">COD Fee</th>
                <th className="py-3.5 px-4">Fuel & GST</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rateCards.map((rc) => (
                <tr key={rc._id} className="hover:bg-space-850/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-200">{rc.title}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rc.orderType === 'B2B' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {rc.orderType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{rc.zoneCode}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">
                    ₹{rc.baseRate} ({rc.baseWeightKg} kg)
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">₹{rc.perAdditionalKgRate} / kg</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {rc.codFeePercent}% (min ₹{rc.codFeeMin})
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {rc.fuelSurchargePercent}% Fuel + {rc.gstPercent}% GST
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setEditingCard(rc);
                        setIsRateModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Edit Rate Card"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rate Card Modal */}
      {isRateModalOpen && editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-space-900 border border-slate-800 p-6 space-y-4">
            <h3 className="font-extrabold text-base text-white">Configure Rate Card</h3>

            <form onSubmit={handleSaveRateCard} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingCard.title}
                  onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                  className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Order Type</label>
                  <select
                    value={editingCard.orderType}
                    onChange={(e) => setEditingCard({ ...editingCard, orderType: e.target.value })}
                    className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="B2C">B2C Retail</option>
                    <option value="B2B">B2B Cargo</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Zone Code</label>
                  <select
                    value={editingCard.zoneCode}
                    onChange={(e) => setEditingCard({ ...editingCard, zoneCode: e.target.value })}
                    className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="ZONE_A">ZONE_A (Local)</option>
                    <option value="ZONE_B">ZONE_B (Regional)</option>
                    <option value="ZONE_C">ZONE_C (Metro)</option>
                    <option value="ZONE_D">ZONE_D (National)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Base Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingCard.baseRate}
                    onChange={(e) => setEditingCard({ ...editingCard, baseRate: Number(e.target.value) })}
                    className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Base Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingCard.baseWeightKg}
                    onChange={(e) => setEditingCard({ ...editingCard, baseWeightKg: Number(e.target.value) })}
                    className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Add Rate / kg (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingCard.perAdditionalKgRate}
                    onChange={(e) => setEditingCard({ ...editingCard, perAdditionalKgRate: Number(e.target.value) })}
                    className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">COD Fee %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingCard.codFeePercent}
                    onChange={(e) => setEditingCard({ ...editingCard, codFeePercent: Number(e.target.value) })}
                    className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Min COD (₹)</label>
                  <input
                    type="number"
                    value={editingCard.codFeeMin}
                    onChange={(e) => setEditingCard({ ...editingCard, codFeeMin: Number(e.target.value) })}
                    className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold shadow-md"
                >
                  Save Rate Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
