import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Orbit, 
  Truck, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  Clock, 
  Search, 
  Filter, 
  Zap, 
  Eye, 
  RefreshCw, 
  PlusCircle, 
  ShieldCheck 
} from 'lucide-react';
import { analyticsService, orderService, agentService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { AntigravityAssignmentVisualizer } from '../components/AntigravityAssignmentVisualizer';
import { LiveTrackingTimeline } from '../components/LiveTrackingTimeline';
import { RescheduleModal } from '../components/RescheduleModal';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals / Drawer states
  const [activeDispatchOrder, setActiveDispatchOrder] = useState(null);
  const [activeTimelineOrder, setActiveTimelineOrder] = useState(null);
  const [activeRescheduleOrder, setActiveRescheduleOrder] = useState(null);

  const { activeOrderUpdate } = useSocket();

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsRes, ordersRes, agentsRes] = await Promise.all([
        analyticsService.getOverview(),
        orderService.getOrders(),
        agentService.getAgents(),
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
      if (ordersRes.data.success) setOrders(ordersRes.data.data);
      if (agentsRes.data.success) setAgents(agentsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to live socket order updates
  useEffect(() => {
    if (activeOrderUpdate) {
      setOrders((prev) =>
        prev.map((o) => (o.trackingNumber === activeOrderUpdate.trackingNumber ? { ...o, ...activeOrderUpdate } : o))
      );
    }
  }, [activeOrderUpdate]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'ACTIVE' && ['AGENT_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(order.status)) ||
      order.status === selectedStatus;

    const matchesSearch =
      order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.dropAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Orbit className="w-5 h-5 animate-spin-slow" />
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Gourish Dispatch Control Tower</h1>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous dynamic logistics management, smart agent scoring, and real-time shipment telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-space-850 hover:bg-space-800 border border-slate-700 text-slate-300 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/create-order"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-space-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Book Shipment
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Orders</span>
          <div className="text-xl font-extrabold text-white font-mono">{metrics?.summary?.totalOrders || orders.length}</div>
          <span className="text-[10px] text-cyan-400">Active Pipeline</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Missions</span>
          <div className="text-xl font-extrabold text-indigo-400 font-mono">
            {metrics?.summary?.activeMissions || orders.filter((o) => ['AGENT_ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)).length}
          </div>
          <span className="text-[10px] text-indigo-300">In Active Transit</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Success Rate</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">{metrics?.summary?.successRate || '98.5'}%</div>
          <span className="text-[10px] text-emerald-300">SLA Adherence</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Revenue</span>
          <div className="text-xl font-extrabold text-cyan-300 font-mono">₹{metrics?.summary?.totalRevenue || '3,450'}</div>
          <span className="text-[10px] text-slate-400">Freight & Surcharges</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Failed / Resched</span>
          <div className="text-xl font-extrabold text-rose-400 font-mono">
            {(metrics?.summary?.failedOrders || 0) + (metrics?.summary?.rescheduledOrders || 0)}
          </div>
          <span className="text-[10px] text-rose-300">Needs Customer Action</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fleet Online</span>
          <div className="text-xl font-extrabold text-purple-400 font-mono">{agents.length} Units</div>
          <span className="text-[10px] text-purple-300">Electric & Drone Fleet</span>
        </div>
      </div>

      {/* Embedded Gourish Auto-Assignment Dispatch Modal / Viewer */}
      {activeDispatchOrder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
              Live Gourish Dispatch Focus: #{activeDispatchOrder.trackingNumber}
            </h2>
            <button
              onClick={() => setActiveDispatchOrder(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Close Dispatch Console
            </button>
          </div>
          <AntigravityAssignmentVisualizer
            order={activeDispatchOrder}
            onAssignmentComplete={(updatedOrder) => {
              setActiveDispatchOrder(null);
              loadData();
            }}
          />
        </div>
      )}

      {/* Embedded Live Tracking Timeline Viewer */}
      {activeTimelineOrder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
              Immutable Timeline Focus: #{activeTimelineOrder.trackingNumber}
            </h2>
            <button
              onClick={() => setActiveTimelineOrder(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Close Timeline
            </button>
          </div>
          <LiveTrackingTimeline
            timeline={activeTimelineOrder.timeline || []}
            currentStatus={activeTimelineOrder.status}
            deliveryOtp={activeTimelineOrder.deliveryOtp}
          />
        </div>
      )}

      {/* Live Orders Table & Filters */}
      <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-base text-white">Live Logistics Stream</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-space-850 text-slate-400 border border-slate-700">
              {filteredOrders.length} Shipments
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search tracking, city, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-space-850 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-space-850 border border-slate-800 text-xs">
              {['ALL', 'ORDER_CREATED', 'ACTIVE', 'DELIVERED', 'FAILED', 'RESCHEDULED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    selectedStatus === st
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'ORDER_CREATED' ? 'Unassigned' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-space-850/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Tracking Number</th>
                <th className="py-3.5 px-4">Route & Zone</th>
                <th className="py-3.5 px-4">Package / Weight</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Agent</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No shipments match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-space-850/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      <Link to={`/track/${order.trackingNumber}`} className="hover:underline flex items-center gap-1">
                        {order.trackingNumber}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        {order.orderType} • {order.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">
                        {order.pickupAddress?.city} → {order.dropAddress?.city}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{order.zoneCode || 'ZONE_A'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">
                        <strong>{order.packageDetails?.chargeableWeightKg || 1} kg</strong>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {order.packageDetails?.lengthCm}×{order.packageDetails?.widthCm}×{order.packageDetails?.heightCm}cm
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      ₹{order.pricingBreakdown?.totalAmount || '0.00'}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      {order.assignedAgent ? (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <div>
                            <span className="font-semibold text-slate-200">{order.assignedAgent.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Score: {order.antigravityAssignmentScore || 95}/100
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {!order.assignedAgent && order.status !== 'DELIVERED' && (
                        <button
                          onClick={() => setActiveDispatchOrder(order)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <Zap className="w-3 h-3" /> Gourish Dispatch
                        </button>
                      )}

                      {order.status === 'FAILED' && (
                        <button
                          onClick={() => setActiveRescheduleOrder(order)}
                          className="px-2.5 py-1 rounded-lg bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          Reschedule
                        </button>
                      )}

                      <Link
                        to={`/track/${order.trackingNumber}`}
                        className="px-2.5 py-1 rounded-lg bg-space-800 hover:bg-space-700 text-slate-300 border border-slate-700 text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Track
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Status Cards */}
      <div className="space-y-4">
        <h2 className="font-extrabold text-base text-white flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-400" /> Active Zero-G Fleet Operations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <div key={agent._id} className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-space-850 flex items-center justify-center font-bold text-base border border-slate-700">
                    {agent.vehicleType === 'drone' ? '🛸' : agent.vehicleType === 'delivery_van' ? '🚐' : '⚡'}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white">{agent.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{agent.vehicleType.replace('_', ' ')}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                    agent.status === 'available'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Current Payload:</span>
                  <span className="font-mono text-slate-200">
                    {agent.currentLoadKg || 0} / {agent.maxCapacityKg} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gourish Lift Index:</span>
                  <span className="font-mono text-cyan-400 font-bold">{agent.antigravityIndex || 95}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Operating Base:</span>
                  <span className="text-slate-200">{agent.currentLocation?.area || 'Koramangala'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reschedule Modal */}
      {activeRescheduleOrder && (
        <RescheduleModal
          isOpen={!!activeRescheduleOrder}
          onClose={() => setActiveRescheduleOrder(null)}
          order={activeRescheduleOrder}
          onRescheduleSuccess={() => {
            setActiveRescheduleOrder(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
