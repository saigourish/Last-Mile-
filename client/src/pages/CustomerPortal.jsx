import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  PlusCircle, 
  CalendarClock, 
  Search, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Shield 
} from 'lucide-react';
import { orderService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { RescheduleModal } from '../components/RescheduleModal';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const CustomerPortal = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRescheduleOrder, setSelectedRescheduleOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCustomerOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders();
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerOrders();
  }, []);

  const failedOrders = orders.filter((o) => o.status === 'FAILED');

  const filteredOrders = orders.filter(
    (o) =>
      o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.dropAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.packageDetails?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Customer Shipment Center</h1>
          </div>
          <p className="text-xs text-slate-400">
            Welcome back, <strong className="text-slate-200">{user?.name || 'Valued Shipper'}</strong>! Monitor real-time transit telemetry and reschedule failed deliveries.
          </p>
        </div>

        <Link
          to="/create-order"
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-space-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Book New Parcel
        </Link>
      </div>

      {/* Action Required: Failed Deliveries Banner */}
      {failedOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-rose-950/40 border border-rose-500/40 space-y-3"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="font-extrabold text-sm text-rose-200">
              Action Required: {failedOrders.length} Delivery Attempt Failed
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Delivery hero was unable to complete handover. Please select an alternate date/time slot to automatically reschedule.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {failedOrders.map((fOrder) => (
              <div key={fOrder._id} className="p-3.5 rounded-2xl bg-space-900 border border-rose-500/30 flex items-center justify-between gap-3">
                <div>
                  <span className="font-mono font-bold text-xs text-rose-300">{fOrder.trackingNumber}</span>
                  <p className="text-[10px] text-slate-400">{fOrder.failureReason || 'Customer Unavailable'}</p>
                </div>
                <button
                  onClick={() => setSelectedRescheduleOrder(fOrder)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-md transition-colors flex items-center gap-1"
                >
                  <CalendarClock className="w-3 h-3" /> Reschedule
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Orders Table */}
      <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-extrabold text-base text-white">My Shipments & History</h2>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search tracking or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-space-850 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-space-850/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Tracking Number</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Chargeable Wt</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No shipments found in your account history.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-space-850/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      <Link to={`/track/${order.trackingNumber}`} className="hover:underline">
                        {order.trackingNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{order.dropAddress?.city}</div>
                      <span className="text-[10px] text-slate-400">{order.dropAddress?.street}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {order.packageDetails?.chargeableWeightKg || 1} kg
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-200">₹{order.pricingBreakdown?.totalAmount || '0'}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{order.paymentMethod}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {order.status === 'FAILED' && (
                        <button
                          onClick={() => setSelectedRescheduleOrder(order)}
                          className="px-2.5 py-1 rounded-lg bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 text-[11px] font-bold transition-colors"
                        >
                          Reschedule
                        </button>
                      )}
                      <Link
                        to={`/track/${order.trackingNumber}`}
                        className="px-2.5 py-1 rounded-lg bg-space-800 hover:bg-space-700 text-slate-300 border border-slate-700 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        Track <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule Modal */}
      {selectedRescheduleOrder && (
        <RescheduleModal
          isOpen={!!selectedRescheduleOrder}
          onClose={() => setSelectedRescheduleOrder(null)}
          order={selectedRescheduleOrder}
          onRescheduleSuccess={() => {
            setSelectedRescheduleOrder(null);
            loadCustomerOrders();
          }}
        />
      )}
    </div>
  );
};
