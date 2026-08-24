import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, AlertTriangle, CheckCircle, X, Sparkles } from 'lucide-react';
import { orderService } from '../services/api';

export const RescheduleModal = ({ isOpen, onClose, order, onRescheduleSuccess }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [rescheduledDate, setRescheduledDate] = useState(minDate);
  const [timeSlot, setTimeSlot] = useState('02:00 PM - 06:00 PM');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const timeSlots = [
    '09:00 AM - 01:00 PM (Morning Priority)',
    '02:00 PM - 06:00 PM (Afternoon Slot)',
    '06:00 PM - 09:00 PM (Evening Express)',
  ];

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await orderService.rescheduleOrder(order._id, {
        rescheduledDate,
        timeSlot,
        notes,
      });

      if (res.data.success) {
        setSuccessMsg('Delivery successfully rescheduled! Reset for dynamic Gourish re-assignment.');
        setTimeout(() => {
          if (onRescheduleSuccess) {
            onRescheduleSuccess(res.data.data);
          }
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Error rescheduling order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="relative w-full max-w-lg rounded-3xl bg-space-900 border border-slate-800 p-6 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Reschedule Delivery Attempt</h3>
                  <p className="text-xs text-slate-400">Order #{order?.trackingNumber}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {order?.status === 'FAILED' && (
              <div className="mt-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <strong>Previous Attempt Failed:</strong> {order.failureReason || 'Customer Unavailable'} - {order.failureNotes || 'Please pick an alternate time slot.'}
                </div>
              </div>
            )}

            {successMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-slate-100">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleRescheduleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Preferred Delivery Date
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    value={rescheduledDate}
                    onChange={(e) => setRescheduledDate(e.target.value)}
                    required
                    className="w-full bg-space-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Preferred Time Slot
                  </label>
                  <div className="space-y-2">
                    {timeSlots.map((slot) => (
                      <label
                        key={slot}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          timeSlot === slot
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                            : 'bg-space-850 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span>{slot}</span>
                        <input
                          type="radio"
                          name="timeSlot"
                          checked={timeSlot === slot}
                          onChange={() => setTimeSlot(slot)}
                          className="accent-cyan-400"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Special Handover Instructions
                  </label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Leave with building security if unattended..."
                    className="w-full bg-space-850 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg transition-all"
                  >
                    {loading ? 'Confirming Reschedule...' : 'Confirm Rescheduled Slot'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
