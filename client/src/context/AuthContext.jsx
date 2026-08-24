import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gourish_token') || localStorage.getItem('antigravity_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('gourish_token') || localStorage.getItem('antigravity_token');
      if (savedToken) {
        try {
          const res = await authService.getMe();
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Auth token validation failed, falling back to guest demo state:', err.message);
          localStorage.removeItem('gourish_token');
          localStorage.removeItem('antigravity_token');
          setToken(null);
          setUser(null);
        }
      } else {
        // Auto-login as demo Admin by default for seamless instant evaluation
        try {
          const res = await authService.quickPersona('admin');
          if (res.data.success) {
            localStorage.setItem('gourish_token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
          }
        } catch (e) {
          console.warn('Auto demo login skipped:', e.message);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.data.success) {
        localStorage.setItem('gourish_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await authService.register(formData);
      if (res.data.success) {
        localStorage.setItem('gourish_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const switchPersona = async (persona) => {
    setLoading(true);
    try {
      const res = await authService.quickPersona(persona);
      if (res.data.success) {
        localStorage.setItem('gourish_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to switch persona' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gourish_token');
    localStorage.removeItem('gourish_user');
    localStorage.removeItem('antigravity_token');
    localStorage.removeItem('antigravity_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isAgent: user?.role === 'agent',
        isCustomer: user?.role === 'customer',
        login,
        register,
        switchPersona,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
