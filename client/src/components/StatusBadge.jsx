import React from 'react';
import { 
  Clock, 
  UserCheck, 
  PackageCheck, 
  Truck, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  CalendarClock, 
  XCircle 
} from 'lucide-react';

const statusConfig = {
  ORDER_CREATED: {
    label: 'Order Created',
    color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',
    icon: Clock,
    glow: 'shadow-[0_0_12px_-2px_rgba(0,240,255,0.3)]',
  },
  AGENT_ASSIGNED: {
    label: 'Agent Assigned',
    color: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30',
    icon: UserCheck,
    glow: 'shadow-[0_0_12px_-2px_rgba(99,102,241,0.3)]',
  },
  PICKED_UP: {
    label: 'Picked Up',
    color: 'text-purple-400 bg-purple-950/60 border-purple-500/30',
    icon: PackageCheck,
    glow: 'shadow-[0_0_12px_-2px_rgba(139,92,246,0.3)]',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    color: 'text-blue-400 bg-blue-950/60 border-blue-500/30',
    icon: Truck,
    glow: 'shadow-[0_0_12px_-2px_rgba(59,130,246,0.3)]',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
    icon: Navigation,
    glow: 'shadow-[0_0_12px_-2px_rgba(245,158,11,0.4)]',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    icon: CheckCircle2,
    glow: 'shadow-[0_0_12px_-2px_rgba(16,185,129,0.4)]',
  },
  FAILED: {
    label: 'Delivery Failed',
    color: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
    icon: AlertTriangle,
    glow: 'shadow-[0_0_12px_-2px_rgba(244,63,94,0.4)]',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    color: 'text-fuchsia-400 bg-fuchsia-950/60 border-fuchsia-500/30',
    icon: CalendarClock,
    glow: 'shadow-[0_0_12px_-2px_rgba(217,70,239,0.3)]',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-slate-400 bg-slate-900 border-slate-700',
    icon: XCircle,
    glow: '',
  },
};

export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const config = statusConfig[status] || {
    label: status,
    color: 'text-slate-400 bg-slate-900 border-slate-700',
    icon: Clock,
    glow: '',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.color} ${config.glow} ${sizeClasses[size]} ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
