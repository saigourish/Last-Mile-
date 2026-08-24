import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Orbit, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Navigation, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  Layers, 
  Activity, 
  Lock 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { orderService } from '../services/api';

export const AntigravityAssignmentVisualizer = ({ order, onAssignmentComplete }) => {
  const [candidates, setCandidates] = useState([]);
  const [bestAgent, setBestAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLifting, setIsLifting] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // Fetch evaluated candidates with physics simulation metrics
  const fetchEvaluation = async () => {
    if (!order?._id) return;
    setLoading(true);
    try {
      const res = await orderService.evaluateAntigravity(order._id);
      if (res.data.success) {
        setCandidates(res.data.data.candidates || []);
        setBestAgent(res.data.data.bestAgent);
        if (res.data.data.bestAgent) {
          setSelectedAgentId(res.data.data.bestAgent.agentId);
        }
      }
    } catch (err) {
      console.error('Error evaluating antigravity candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, [order?._id]);

  // Execute Dynamic Antigravity Lift Auto-Assignment
  const triggerDynamicAntigravityLift = async () => {
    setIsLifting(true);

    // Dynamic orbital physics animation delay
    setTimeout(async () => {
      try {
        const res = await orderService.autoAssignAgent(order._id);
        if (res.data.success) {
          setAssignedSuccess(res.data.data);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00F0FF', '#6366F1', '#10B981'],
          });
          if (onAssignmentComplete) {
            onAssignmentComplete(res.data.data.order);
          }
        }
      } catch (err) {
        console.error('Auto-assignment failed:', err);
      } finally {
        setIsLifting(false);
      }
    }, 2200);
  };

  // Manual Assignment Override
  const handleManualAssign = async (agentId) => {
    try {
      const res = await orderService.manualAssignAgent(order._id, agentId);
      if (res.data.success) {
        setAssignedSuccess({ assignedAgent: { _id: agentId } });
        if (onAssignmentComplete) {
          onAssignmentComplete(res.data.data);
        }
      }
    } catch (err) {
      console.error('Manual assign error:', err);
    }
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'drone':
        return '🛸';
      case 'delivery_van':
        return '🚐';
      case 'electric_bike':
        return '⚡';
      default:
        return '🏍️';
    }
  };

  return (
    <div className="rounded-3xl glass-panel border border-slate-800/80 p-6 relative overflow-hidden">
      {/* Background Quantum Gradient Aura */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Orbit className="w-4 h-4 animate-spin-slow" />
            </span>
            <h3 className="font-extrabold text-lg text-white tracking-tight">
              Gourish Dynamic Lift Dispatcher
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Proximity algorithm simulates orbital radar, weight capacity, and real-time agent dispatch.
          </p>
        </div>

        {/* Action Button */}
        {!order.assignedAgent && order.status !== 'DELIVERED' && (
          <button
            onClick={triggerDynamicAntigravityLift}
            disabled={isLifting || loading || candidates.length === 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              isLifting
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-space-950 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
            }`}
          >
            {isLifting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Simulating Dynamic Dispatch Lift...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-space-950 fill-current" />
                <span>Activate Gourish Auto-Assign</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Interactive Radar & Simulation Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        
        {/* Left Column: Orbital Gravity Radar Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[380px] p-4 rounded-2xl bg-space-900/80 border border-slate-800 bg-radial-grid">
          
          {/* Orbital Gravity Rings */}
          <div className="relative w-[320px] h-[320px] flex items-center justify-center">
            
            {/* Outer Orbit Ring */}
            <div className="absolute inset-0 rounded-full border border-slate-800/80 border-dashed animate-orbit opacity-40" />
            <div className="absolute w-[240px] h-[240px] rounded-full border border-indigo-900/40 border-dashed" />
            <div className="absolute w-[160px] h-[160px] rounded-full border border-cyan-900/50" />
            <div className="absolute w-[80px] h-[80px] rounded-full border border-cyan-500/30 animate-pulse-slow" />

            {/* Radar Sweep Beam Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-500/5 to-transparent animate-spin-slow pointer-events-none" />

            {/* Center: The Delivery Waypoint Core (Gravity Well) */}
            <motion.div
              animate={{
                scale: isLifting ? [1, 1.2, 1] : 1,
                boxShadow: isLifting
                  ? '0 0 35px 8px rgba(0, 240, 255, 0.6)'
                  : '0 0 20px 2px rgba(0, 240, 255, 0.3)',
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="z-20 w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center cursor-pointer group"
            >
              <div className="w-full h-full bg-space-950 rounded-[14px] flex flex-col items-center justify-center text-center p-1">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span className="text-[9px] font-bold text-slate-200 mt-0.5 font-mono">ORDER</span>
              </div>
            </motion.div>

            {/* Orbiting Agent Nodes */}
            {candidates.map((cand, idx) => {
              // Convert bearing and radius into Cartesian x, y
              const angleRad = ((cand.bearingAngle || idx * 90) * Math.PI) / 180;
              const radius = Math.min(135, Math.max(50, 140 - (cand.antigravityLiftScore || 50) * 0.9));
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              const isBest = cand.agentId === bestAgent?.agentId;
              const isSelected = cand.agentId === selectedAgentId;

              return (
                <motion.div
                  key={cand.agentId}
                  animate={{
                    x: isLifting && isBest ? [x, 0] : x,
                    y: isLifting && isBest ? [y, 0] : y,
                    scale: isBest ? (isLifting ? 1.3 : 1.1) : 0.95,
                  }}
                  transition={{
                    duration: isLifting ? 2 : 0.6,
                    type: 'spring',
                  }}
                  onClick={() => setSelectedAgentId(cand.agentId)}
                  className={`absolute z-30 cursor-pointer flex flex-col items-center group`}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  {/* Gravitational Tractor Beam Line to Best Agent */}
                  {(isBest || isSelected) && (
                    <div
                      className={`absolute w-0.5 pointer-events-none opacity-60 ${
                        isLifting ? 'bg-cyan-400 shadow-[0_0_10px_#00F0FF]' : 'bg-indigo-500/50'
                      }`}
                      style={{
                        height: `${radius}px`,
                        transformOrigin: 'top center',
                        transform: `rotate(${cand.bearingAngle + 90}deg)`,
                        top: '50%',
                        left: '50%',
                      }}
                    />
                  )}

                  {/* Agent Orb */}
                  <div
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-md ${
                      isBest
                        ? 'bg-cyan-500 text-space-950 ring-4 ring-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.6)]'
                        : isSelected
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                        : 'bg-space-850 text-slate-300 border border-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    <span>{getVehicleIcon(cand.vehicleType)}</span>

                    {/* Antigravity Score Badge */}
                    <span
                      className={`absolute -bottom-2 px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-full border ${
                        isBest
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-400'
                          : 'bg-space-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      {cand.antigravityLiftScore}
                    </span>
                  </div>

                  {/* Agent Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-space-950/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-slate-200 border border-slate-700 whitespace-nowrap pointer-events-none">
                    {cand.name} ({cand.distanceKm}km)
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Radar Telemetry Footer */}
          <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Waypoint: <strong className="text-slate-200">{order?.pickupAddress?.city || 'Bengaluru Local'}</strong></span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Best Fit</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600" /> Orbiting Fleet</span>
            </div>
          </div>
        </div>

        {/* Right Column: Ranked Candidate Lift Meters */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Gourish Candidate Rank
            </h4>
            <span className="text-[11px] text-slate-500">{candidates.length} agents evaluated</span>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {candidates.map((cand, idx) => {
              const isBest = cand.agentId === bestAgent?.agentId;
              const isSelected = cand.agentId === selectedAgentId;

              return (
                <div
                  key={cand.agentId}
                  onClick={() => setSelectedAgentId(cand.agentId)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isBest
                      ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                      : isSelected
                      ? 'bg-space-850 border-indigo-500/50'
                      : 'bg-space-850/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getVehicleIcon(cand.vehicleType)}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs text-slate-100">{cand.name}</h5>
                          {isBest && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-500 text-space-950 uppercase">
                              TOP MATCH
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {cand.distanceKm} km away • {cand.rating}★ • {cand.remainingCapacityKg}kg capacity free
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-extrabold text-sm text-cyan-400">
                        {cand.antigravityLiftScore}
                        <span className="text-[10px] text-slate-500">/100</span>
                      </div>
                      <span className="text-[9px] text-slate-400">Lift Index</span>
                    </div>
                  </div>

                  {/* Vertical Lift Level Progress Meter */}
                  <div className="w-full bg-space-950 h-1.5 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cand.antigravityLiftScore}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-full rounded-full ${
                        isBest
                          ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 shadow-[0_0_8px_#00F0FF]'
                          : 'bg-indigo-600'
                      }`}
                    />
                  </div>

                  {/* Rationale & Manual Assign Button */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="truncate max-w-[200px]">{cand.matchRationale}</span>
                    {!order.assignedAgent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManualAssign(cand.agentId);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        Force Assign
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Assignment Success Banner */}
      {order.assignedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-300">Gourish Lock Established</h4>
              <p className="text-xs text-slate-300">
                Shipment locked to Agent {order.assignedAgent?.name || 'Rahul Sharma'} (
                {order.assignedAgent?.phone || '+91 98450 12345'}). Dynamic telemetry stream active.
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60 text-xs font-mono text-emerald-300 font-bold">
            SCORE: {order.antigravityAssignmentScore || 96.4}/100
          </div>
        </motion.div>
      )}
    </div>
  );
};
