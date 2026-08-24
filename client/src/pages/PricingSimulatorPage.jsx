import React from 'react';
import { PricingSimulator } from '../components/PricingSimulator';
import { Sparkles, Info, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingSimulatorPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Gourish Rate Diagnostic Matrix
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Smart Pricing & Volumetric Simulator
        </h1>
        <p className="text-xs text-slate-400">
          Simulate logistics rates, compare actual vs dimensional displacement (L × W × H / 5000), and test surcharges.
        </p>
      </div>

      {/* Simulator Component */}
      <PricingSimulator />

      {/* Mathematical Guide / Knowledge Card */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" /> How Gourish Calculates Delivery Charges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="p-4 rounded-2xl bg-space-850 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200">1. Volumetric vs Deadweight</h4>
            <div className="p-2.5 rounded-xl bg-space-950 border border-slate-700 font-mono text-cyan-300 text-[11px]">
              Volumetric Weight (kg) = (Length × Width × Height) / 5000
            </div>
            <p>
              Logistics carriers bill based on whichever is higher between actual deadweight and volumetric displacement.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-space-850 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200">2. Zone Detection Matrix</h4>
            <p>
              Intra-city local routes map to <strong>Zone A</strong>, intra-state to <strong>Zone B</strong>, metro routes to <strong>Zone C</strong>, and rest of country to <strong>Zone D</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-space-850 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200">3. Surcharges & Taxes</h4>
            <p>
              Includes configurable fuel index (5-7%), COD handling surcharge (min ₹30 or 2%), and standard 18% GST.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
