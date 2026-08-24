import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Orbit, Shield, Truck, User, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, switchPersona, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      const res = await register({ name, email, password, role });
      if (res.success) {
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'agent') navigate('/agent');
        else navigate('/customer');
      } else {
        setError(res.message);
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'agent') navigate('/agent');
        else navigate('/customer');
      } else {
        setError(res.message);
      }
    }
  };

  const handleQuickPersona = async (personaKey) => {
    const res = await switchPersona(personaKey);
    if (res.success) {
      if (personaKey === 'admin') navigate('/admin');
      else if (personaKey === 'agent') navigate('/agent');
      else navigate('/customer');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
            <Orbit className="w-8 h-8 text-space-950 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Gourish Logistics Auth</h2>
          <p className="text-xs text-slate-400">Next-generation last-mile delivery tracking platform</p>
        </div>

        {/* 1-Click Quick Demo Persona Cards */}
        <div className="p-4 rounded-3xl glass-panel border border-cyan-500/30 space-y-3">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block text-center">
            ⚡ 1-Click Demo Evaluation Logins
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickPersona('admin')}
              className="p-2.5 rounded-2xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800 text-center transition-all group"
            >
              <Shield className="w-4 h-4 text-purple-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-white block">Admin</span>
              <span className="text-[9px] text-slate-400">Dr. Sarah</span>
            </button>

            <button
              onClick={() => handleQuickPersona('agent')}
              className="p-2.5 rounded-2xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800 text-center transition-all group"
            >
              <Truck className="w-4 h-4 text-indigo-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-white block">Agent</span>
              <span className="text-[9px] text-slate-400">Rahul S.</span>
            </button>

            <button
              onClick={() => handleQuickPersona('customer')}
              className="p-2.5 rounded-2xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800 text-center transition-all group"
            >
              <User className="w-4 h-4 text-cyan-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-white block">Customer</span>
              <span className="text-[9px] text-slate-400">Priya S.</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 pb-3 text-xs font-bold transition-all ${
                !isRegister ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 pb-3 text-xs font-bold transition-all ${
                isRegister ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'
              }`}
            >
              Register New User
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {isRegister && (
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gourish.logistics"
                className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {isRegister && (
              <div>
                <label className="text-slate-400 block mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="customer">Customer / Merchant</option>
                  <option value="agent">Delivery Fleet Agent</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-space-950 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
