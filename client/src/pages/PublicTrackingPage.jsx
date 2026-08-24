import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Orbit, 
  Search, 
  MapPin, 
  Package, 
  Scale, 
  CalendarClock, 
  KeyRound, 
  User, 
  Truck, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { orderService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LiveTrackingTimeline } from '../components/LiveTrackingTimeline';
import { AntigravityAssignmentVisualizer } from '../components/AntigravityAssignmentVisualizer';
import { RescheduleModal } from '../components/RescheduleModal';
import { useSocket } from '../context/SocketContext';

export const PublicTrackingPage = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(trackingNumber || '');
  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  const { joinOrderRoom, leaveOrderRoom, activeOrderUpdate } = useSocket();

  const fetchTrackingDetails = async (trackId) => {
    if (!trackId) return;
    setLoading(true);
    setError('');
    try {
      const res = await orderService.trackOrder(trackId.trim().toUpperCase());
      if (res.data.success) {
        setOrder(res.data.data.order);
        setTimeline(res.data.data.timeline || []);
        joinOrderRoom(trackId.trim().toUpperCase());
      }
    } catch (err) {
      setError(err.response?.data?.message || `No tracking history found for #${trackId}`);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingDetails(trackingNumber);
    }
    return () => {
      if (trackingNumber) {
        leaveOrderRoom(trackingNumber);
      }
    };
  }, [trackingNumber]);

  // Listen to live socket updates for this order
  useEffect(() => {
    if (activeOrderUpdate && activeOrderUpdate.trackingNumber === trackingNumber) {
      setOrder((prev) => (prev ? { ...prev, status: activeOrderUpdate.status } : prev));
      if (activeOrderUpdate.trackingLog) {
        setTimeline((prev) => [...prev, activeOrderUpdate.trackingLog]);
      }
    }
  }, [activeOrderUpdate, trackingNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track/${searchInput.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Search Bar */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono">
          <Orbit className="w-3.5 h-3.5 animate-spin-slow" /> Gourish Quantum Radar
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Live Shipment Radar & Audit Trail
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Enter Tracking ID (e.g. GSH-748921-IN)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-space-900 border border-slate-700 rounded-2xl pl-10 pr-24 py-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-xl"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs transition-colors flex items-center gap-1"
          >
            Track <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {loading && (
        <div className="py-16 text-center text-cyan-400 text-xs font-mono animate-pulse">
          ⚡ Initializing Gourish Radar...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center text-xs text-rose-300">
          {error}
        </div>
      )}

      {order && !loading && (
        <div className="space-y-6">
          
          {/* Order Header Summary */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-mono font-extrabold text-xl text-cyan-400">{order.trackingNumber}</h2>
                <StatusBadge status={order.status} size="md" />
              </div>
              <p className="text-xs text-slate-400">
                Route: <strong className="text-slate-200">{order.pickupAddress?.city}</strong> →{' '}
                <strong className="text-slate-200">{order.dropAddress?.city}</strong> ({order.zoneCode || 'ZONE_A'})
              </p>
            </div>

            {/* Quick Actions / OTP Callout */}
            <div className="flex items-center gap-3">
              {order.status === 'OUT_FOR_DELIVERY' && order.deliveryOtp && (
                <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-right">
                  <span className="text-[10px] text-amber-300 uppercase font-bold block">Delivery Passcode</span>
                  <span className="text-base font-mono font-extrabold text-amber-400 tracking-wider">
                    {order.deliveryOtp}
                  </span>
                </div>
              )}

              {order.status === 'FAILED' && (
                <button
                  onClick={() => setIsRescheduleOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                >
                  <CalendarClock className="w-4 h-4" /> Reschedule Delivery
                </button>
              )}
            </div>
          </div>

          {/* Antigravity Dynamic Lift Dispatcher for unassigned/assigned shipments */}
          <AntigravityAssignmentVisualizer
            order={order}
            onAssignmentComplete={(updatedOrder) => {
              fetchTrackingDetails(order.trackingNumber);
            }}
          />

          {/* Details & Specs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Origin Card */}
            <div className="p-5 rounded-3xl glass-card border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> Origin Pickup
              </span>
              <h4 className="font-bold text-xs text-slate-200">{order.pickupAddress?.contactPerson}</h4>
              <p className="text-xs text-slate-400">{order.pickupAddress?.street}, {order.pickupAddress?.city}</p>
              <p className="text-[10px] text-slate-500 font-mono">PIN: {order.pickupAddress?.pincode}</p>
            </div>

            {/* Destination Card */}
            <div className="p-5 rounded-3xl glass-card border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-400" /> Destination Drop
              </span>
              <h4 className="font-bold text-xs text-slate-200">{order.dropAddress?.contactPerson}</h4>
              <p className="text-xs text-slate-400">{order.dropAddress?.street}, {order.dropAddress?.city}</p>
              <p className="text-[10px] text-slate-500 font-mono">PIN: {order.dropAddress?.pincode}</p>
            </div>

            {/* Package & Volumetric Specs Card */}
            <div className="p-5 rounded-3xl glass-card border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Package className="w-3 h-3 text-purple-400" /> Package Telemetry
              </span>
              <div className="text-xs text-slate-300 flex justify-between">
                <span>Chargeable Weight:</span>
                <span className="font-mono font-bold text-cyan-400">{order.packageDetails?.chargeableWeightKg || 1} kg</span>
              </div>
              <div className="text-xs text-slate-400 flex justify-between">
                <span>Volumetric:</span>
                <span className="font-mono">{order.packageDetails?.volumetricWeightKg || 1} kg</span>
              </div>
              <div className="text-xs text-slate-400 flex justify-between">
                <span>Payment:</span>
                <span className="font-mono text-slate-200">{order.paymentMethod} (₹{order.pricingBreakdown?.totalAmount})</span>
              </div>
            </div>

          </div>

          {/* Immutable Audit Logs Timeline */}
          <LiveTrackingTimeline
            timeline={timeline}
            currentStatus={order.status}
            deliveryOtp={order.deliveryOtp}
          />

        </div>
      )}

      {/* Reschedule Modal */}
      {order && isRescheduleOpen && (
        <RescheduleModal
          isOpen={isRescheduleOpen}
          onClose={() => setIsRescheduleOpen(false)}
          order={order}
          onRescheduleSuccess={() => {
            setIsRescheduleOpen(false);
            fetchTrackingDetails(order.trackingNumber);
          }}
        />
      )}
    </div>
  );
};
