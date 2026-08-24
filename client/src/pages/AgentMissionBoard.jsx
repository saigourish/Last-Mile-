import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  KeyRound, 
  Navigation, 
  ArrowRight, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { orderService, agentService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const AgentMissionBoard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delivery Handover Dialog state
  const [deliveryModalOrder, setDeliveryModalOrder] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Failure Report Dialog state
  const [failureModalOrder, setFailureModalOrder] = useState(null);
  const [failureReason, setFailureReason] = useState('CUSTOMER_UNAVAILABLE');
  const [failureNotes, setFailureNotes] = useState('');

  const loadMissions = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders();
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load agent missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus, extraData = {}) => {
    try {
      const res = await orderService.updateStatus(orderId, {
        status: newStatus,
        ...extraData,
      });

      if (res.data.success) {
        if (newStatus === 'DELIVERED') {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
        loadMissions();
        setDeliveryModalOrder(null);
        setFailureModalOrder(null);
        setEnteredOtp('');
        setOtpError('');
      }
    } catch (err) {
      console.error('Status update failed:', err);
      if (err.response?.data?.message?.includes('OTP')) {
        setOtpError(err.response.data.message);
      } else {
        alert(err.response?.data?.message || 'Update failed.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Agent Field Mission Board</h1>
          </div>
          <p className="text-xs text-slate-400">
            Assigned missions for <strong className="text-slate-200">{user?.name || 'Agent Rahul Sharma'}</strong>. Execute one-click handovers with verified OTP.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-space-850 border border-slate-800 text-xs font-mono flex items-center gap-3">
          <span className="text-slate-400">Vehicle: <strong className="text-white">Electric Fast-Bike</strong></span>
          <span className="text-cyan-400 font-bold">Lift Score: 98/100</span>
        </div>
      </div>

      {/* Active Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs glass-panel rounded-3xl border border-slate-800">
            No active deliveries assigned to your route right now.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="p-5 rounded-3xl glass-panel border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-extrabold text-sm text-cyan-400">
                    {order.trackingNumber}
                  </span>
                  <StatusBadge status={order.status} size="sm" />
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                  <span>{order.orderType}</span>
                  <span>•</span>
                  <span>{order.paymentMethod} (₹{order.pricingBreakdown?.totalAmount})</span>
                </div>
              </div>

              {/* Waypoint Details */}
              <div className="p-3 rounded-2xl bg-space-850 border border-slate-800/80 space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3 h-3 text-cyan-400" /> Origin Pickup
                  </span>
                  <p className="text-slate-200 font-medium truncate">{order.pickupAddress?.street}, {order.pickupAddress?.city}</p>
                  <p className="text-[10px] text-slate-400">{order.pickupAddress?.contactPerson} ({order.pickupAddress?.contactPhone})</p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-0.5">
                    <Navigation className="w-3 h-3 text-indigo-400" /> Destination Drop
                  </span>
                  <p className="text-slate-200 font-medium truncate">{order.dropAddress?.street}, {order.dropAddress?.city}</p>
                  <p className="text-[10px] text-slate-400">{order.dropAddress?.contactPerson} ({order.dropAddress?.contactPhone})</p>
                </div>
              </div>

              {/* Package Specs */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Weight: <strong className="text-slate-200 font-mono">{order.packageDetails?.chargeableWeightKg || 1} kg</strong></span>
                <span>Category: <strong className="text-slate-200">{order.packageDetails?.category || 'General'}</strong></span>
              </div>

              {/* Lifecycle Progression Controls */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                {order.status === 'AGENT_ASSIGNED' && (
                  <button
                    onClick={() => handleStatusUpdate(order._id, 'PICKED_UP')}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5" /> Confirm Package Pickup
                  </button>
                )}

                {order.status === 'PICKED_UP' && (
                  <button
                    onClick={() => handleStatusUpdate(order._id, 'IN_TRANSIT')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Start Transit Route
                  </button>
                )}

                {order.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleStatusUpdate(order._id, 'OUT_FOR_DELIVERY')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-space-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" /> Out For Delivery (Notify Customer)
                  </button>
                )}

                {order.status === 'OUT_FOR_DELIVERY' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeliveryModalOrder(order)}
                      className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-space-950 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Handover (OTP)
                    </button>
                    <button
                      onClick={() => setFailureModalOrder(order)}
                      className="py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Report Failed
                    </button>
                  </div>
                )}

                {order.status === 'DELIVERED' && (
                  <div className="py-2 text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1 bg-emerald-950/40 rounded-xl border border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Successfully Completed
                  </div>
                )}

                {order.status === 'FAILED' && (
                  <div className="py-2 text-center text-xs text-rose-400 font-semibold flex items-center justify-center gap-1 bg-rose-950/40 rounded-xl border border-rose-800">
                    <AlertTriangle className="w-3.5 h-3.5" /> Attempt Failed: {order.failureReason || 'Unavailable'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* OTP Delivery Verification Modal */}
      {deliveryModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-space-900 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Customer OTP Verification</h3>
                <p className="text-xs text-slate-400">Order #{deliveryModalOrder.trackingNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Ask customer for the 6-digit delivery OTP sent via SMS / shown in their portal.
            </p>

            <div className="p-2.5 rounded-xl bg-space-850 border border-slate-800 text-center text-[11px] text-slate-400">
              Demo Preview Helper: <span className="font-mono text-cyan-400 font-bold">{deliveryModalOrder.deliveryOtp}</span>
            </div>

            <div>
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-Digit OTP"
                value={enteredOtp}
                onChange={(e) => {
                  setEnteredOtp(e.target.value);
                  setOtpError('');
                }}
                className="w-full bg-space-850 border border-slate-700 rounded-xl py-2.5 text-center font-mono text-lg tracking-widest text-white focus:border-cyan-400 focus:outline-none"
              />
              {otpError && <p className="text-[11px] text-rose-400 mt-1.5">{otpError}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeliveryModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate(deliveryModalOrder._id, 'DELIVERED', { otpEntered: enteredOtp })}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-space-950 font-bold text-xs shadow-lg"
              >
                Verify & Complete Handover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Failure Modal */}
      {failureModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-space-900 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Log Delivery Exception</h3>
                <p className="text-xs text-slate-400">Order #{failureModalOrder.trackingNumber}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Failure Reason Code</label>
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="CUSTOMER_UNAVAILABLE">Customer Unavailable / Door Locked</option>
                <option value="CASH_NOT_READY">Cash Not Ready (COD Refusal)</option>
                <option value="INCORRECT_ADDRESS">Incorrect / Incomplete Destination Address</option>
                <option value="CUSTOMER_REFUSED">Customer Refused Package</option>
                <option value="ACCESS_RESTRICTED">Gated Community / Access Restricted</option>
                <option value="WEATHER_ANOMALY">Weather / Natural Disruption</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Agent Field Remarks</label>
              <textarea
                rows="2"
                value={failureNotes}
                onChange={(e) => setFailureNotes(e.target.value)}
                placeholder="Called 3 times, neighbor confirmed..."
                className="w-full bg-space-850 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFailureModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleStatusUpdate(failureModalOrder._id, 'FAILED', {
                    failureReason,
                    notes: failureNotes,
                  })
                }
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg"
              >
                Log Failure & Alert Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
