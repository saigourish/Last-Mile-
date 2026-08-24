import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import { Navbar } from './components/Navbar';

// Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { CustomerPortal } from './pages/CustomerPortal';
import { AgentMissionBoard } from './pages/AgentMissionBoard';
import { PublicTrackingPage } from './pages/PublicTrackingPage';
import { RateCardZoneManager } from './pages/RateCardZoneManager';
import { PricingSimulatorPage } from './pages/PricingSimulatorPage';
import { LoginPage } from './pages/LoginPage';

// Smart Home Redirector
const HomeRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'agent') return <Navigate to="/agent" replace />;
  if (user?.role === 'customer') return <Navigate to="/customer" replace />;
  return <Navigate to="/admin" replace />;
};

export const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-space-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-700 dark:selection:text-cyan-200 transition-colors duration-200">
              {/* Navbar Header */}
              <Navbar />

              {/* Main Application Body */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomeRedirect />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/create-order" element={<CreateOrderPage />} />
                  <Route path="/orders/new" element={<CreateOrderPage />} />
                  <Route path="/book" element={<CreateOrderPage />} />
                  <Route path="/book-parcel" element={<CreateOrderPage />} />
                  <Route path="/customer" element={<CustomerPortal />} />
                  <Route path="/agent" element={<AgentMissionBoard />} />
                  <Route path="/track" element={<PublicTrackingPage />} />
                  <Route path="/track/:trackingNumber" element={<PublicTrackingPage />} />
                  <Route path="/rate-cards" element={<RateCardZoneManager />} />
                  <Route path="/pricing-simulator" element={<PricingSimulatorPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Footer */}
              <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-space-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-mono text-slate-700 dark:text-slate-400">Gourish Logistics Quantum Platform v1.0.0</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    MERN Stack • Dynamic Proximity Lift • Immutable Audit Logs • Smart Dynamic Pricing
                  </div>
                </div>
              </footer>
            </div>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
