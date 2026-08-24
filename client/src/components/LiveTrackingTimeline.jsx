import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Shield, 
  AlertTriangle, 
  CalendarClock, 
  KeyRound, 
  Layers 
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const LiveTrackingTimeline = ({ timeline = [], currentStatus = 'ORDER_CREATED', deliveryOtp = '' }) => {
  const getActorBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin Tower', color: 'bg-purple-950/80 text-purple-400 border-purple-800', icon: Shield };
      case 'AGENT':
        return { label: 'Field Agent', color: 'bg-indigo-950/80 text-indigo-400 border-indigo-800', icon: User };
      case 'CUSTOMER':
        return { label: 'Customer', color: 'bg-cyan-950/80 text-cyan-400 border-cyan-800', icon: User };
      default:
        return { label: 'Gourish Core', color: 'bg-slate-900 text-slate-400 border-slate-700', icon: Layers };
    }
  };

  return (
    <div className="rounded-3xl glass-panel border border-slate-800 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F0FF]" />
            <h3 className="font-extrabold text-base text-white tracking-tight">Immutable Order Lifecycle Logs</h3>
          </div>
          <p className="text-xs text-slate-400">Cryptographically verifiable immutable audit trail with actor timestamps</p>
        </div>

        <div className="flex items-center gap-2">
          {deliveryOtp && currentStatus !== 'DELIVERED' && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-300">Delivery OTP:</span>
              <span className="font-mono font-extrabold text-xs text-amber-300 tracking-wider">{deliveryOtp}</span>
            </div>
          )}
          <StatusBadge status={currentStatus} size="sm" />
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="mt-6 relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-slate-800">
        {timeline.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">No immutable log entries recorded yet.</div>
        ) : (
          timeline.map((log, idx) => {
            const actor = getActorBadge(log.actorRole);
            const ActorIcon = actor.icon;
            const isLatest = idx === timeline.length - 1;

            return (
              <motion.div
                key={log._id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative group"
              >
                {/* Timeline Dot Node */}
                <div
                  className={`absolute -left-[27px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isLatest
                      ? 'bg-space-950 border-cyan-400 ring-4 ring-cyan-500/20 shadow-[0_0_12px_#00F0FF]'
                      : 'bg-space-900 border-indigo-500/60'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
                </div>

                {/* Log Card */}
                <div className="p-4 rounded-2xl bg-space-850/80 border border-slate-800/80 hover:border-slate-700 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={log.status} size="sm" />
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${actor.color}`}>
                        <ActorIcon className="w-2.5 h-2.5" />
                        {log.actorName || actor.label}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">{log.message}</p>

                  {/* Location & Metadata Note */}
                  {log.location?.city && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{log.location.area ? `${log.location.area}, ` : ''}{log.location.city}</span>
                      {log.location.coordinates?.lat && (
                        <span className="text-slate-600">({log.location.coordinates.lat.toFixed(4)}, {log.location.coordinates.lng.toFixed(4)})</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
