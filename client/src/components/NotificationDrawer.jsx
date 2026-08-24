import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  MessageSquare, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { notificationService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { liveNotifications } = useSocket();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Combine with live notifications
  const allNotifications = [...liveNotifications, ...notifications.filter(
    (n) => !liveNotifications.some((ln) => ln._id === n._id)
  )];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-space-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-space-850">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">Live Communication Dispatch</h3>
                  <p className="text-xs text-slate-400">Email & SMS Multi-Channel Notification Logs</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {allNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notification dispatches yet.</p>
                </div>
              ) : (
                allNotifications.map((item, idx) => (
                  <motion.div
                    key={item._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-space-800/70 border border-slate-700/60 hover:border-cyan-500/30 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {item.type === 'EMAIL' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800 font-mono">
                            <Mail className="w-3 h-3" /> EMAIL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
                            <MessageSquare className="w-3 h-3" /> SMS
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      {item.trackingNumber && (
                        <Link
                          to={`/track/${item.trackingNumber}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono font-semibold"
                        >
                          {item.trackingNumber} <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>

                    <h4 className="font-semibold text-slate-200 text-sm mb-1">{item.subject}</h4>
                    <p className="text-slate-400 leading-relaxed">{item.message}</p>

                    {item.recipient?.phone && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                        <span>Recipient: {item.recipient.name || 'Customer'}</span>
                        <span className="font-mono">{item.recipient.phone}</span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-space-850 text-center text-xs text-slate-500">
              ⚡ Gourish Real-Time Multi-Channel Notification Router
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
