import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Orbit, 
  Layers, 
  PlusCircle, 
  Search, 
  Users, 
  Sliders, 
  Bell, 
  Radio, 
  ChevronDown, 
  Shield, 
  Truck, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { NotificationDrawer } from './NotificationDrawer';

export const Navbar = () => {
  const { user, isAdmin, isAgent, isCustomer, switchPersona, logout } = useAuth();
  const { isConnected, liveNotifications } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [quickTrackInput, setQuickTrackInput] = useState('');

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickTrackInput.trim()) {
      navigate(`/track/${quickTrackInput.trim().toUpperCase()}`);
      setQuickTrackInput('');
    }
  };

  const personas = [
    {
      id: 'admin',
      name: 'Dr. Sarah Mitchell',
      role: 'Admin / Tower Dispatcher',
      email: 'admin@gourish.logistics',
      icon: Shield,
      color: 'text-purple-400 bg-purple-950/60 border-purple-800',
    },
    {
      id: 'agent',
      name: 'Rahul Sharma',
      role: 'Delivery Agent',
      email: 'rahul.agent@gourish.logistics',
      icon: Truck,
      color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800',
    },
    {
      id: 'customer',
      name: 'Priya Sharma',
      role: 'Customer / Shipper',
      email: 'priya.customer@gourish.logistics',
      icon: User,
      color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] transition-all">
              <div className="w-full h-full bg-space-950 rounded-[10px] flex items-center justify-center">
                <Orbit className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  GOURISH
                </span>
                <span className="px-1.5 py-0.2 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Logistics
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Next-Gen Last-Mile Dispatch</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    location.pathname === '/admin'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Dispatch Tower
                </Link>
                <Link
                  to="/rate-cards"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    location.pathname === '/rate-cards'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Zones & Rates
                </Link>
              </>
            )}

            {isAgent && (
              <Link
                to="/agent"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/agent'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Mission Board
              </Link>
            )}

            {isCustomer && (
              <Link
                to="/customer"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  location.pathname === '/customer'
                    ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                My Shipments
              </Link>
            )}

            <Link
              to="/create-order"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === '/create-order' || location.pathname === '/orders/new' || location.pathname === '/book'
                  ? 'bg-cyan-500 text-space-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-cyan-400 hover:bg-cyan-950/40 border border-cyan-500/30'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Book Parcel
            </Link>

            <Link
              to="/pricing-simulator"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === '/pricing-simulator'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Rate Simulator
            </Link>
          </nav>

          {/* Search Track ID Bar */}
          <form onSubmit={handleQuickTrack} className="hidden lg:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Track GSH-XXXXXX-IN..."
              value={quickTrackInput}
              onChange={(e) => setQuickTrackInput(e.target.value)}
              className="w-full bg-space-850 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Right Controls: WebSocket Dot + Notifications + Persona Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Live Socket Status Dot */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                isConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
              }`}
              title={isConnected ? 'Live WebSocket Connected' : 'Reconnecting...'}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="hidden xl:inline">{isConnected ? 'LIVE SYNC' : 'OFFLINE'}</span>
            </div>

            {/* Notification Drawer Trigger */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-xl bg-space-850 hover:bg-space-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {liveNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-space-950 text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {liveNotifications.length}
                </span>
              )}
            </button>

            {/* Quick Demo Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-space-850 hover:bg-space-800 border border-slate-700/80 text-xs text-slate-200 transition-all group"
              >
                <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {user?.role?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-semibold text-white leading-none text-xs">{user?.name?.split(' ')[0] || 'Guest'}</p>
                  <p className="text-[10px] text-cyan-400 uppercase font-mono">{user?.role || 'Guest'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
              </button>

              {/* Persona Dropdown Menu */}
              {isPersonaOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-space-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setIsPersonaOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-xs">
                    <p className="text-slate-400">1-Click Quick Demo Switcher</p>
                    <p className="text-[11px] text-cyan-400 font-medium">Switch persona to test role workflows</p>
                  </div>

                  <div className="space-y-1 py-1">
                    {personas.map((p) => {
                      const Icon = p.icon;
                      const isActive = user?.role === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            switchPersona(p.id);
                            if (p.id === 'admin') navigate('/admin');
                            else if (p.id === 'agent') navigate('/agent');
                            else if (p.id === 'customer') navigate('/customer');
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                            isActive
                              ? 'bg-cyan-500/10 border border-cyan-500/30 text-white'
                              : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg border ${p.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-100 truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.role}</p>
                          </div>
                          {isActive && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Slide-over Notifications */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
