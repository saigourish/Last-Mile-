import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [activeOrderUpdate, setActiveOrderUpdate] = useState(null);

  useEffect(() => {
    // Determine socket connection target
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ [Frontend] Connected to Gourish Real-Time Stream:', socketInstance.id);
      setIsConnected(true);
      socketInstance.emit('join_admin_tower');
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 [Frontend] Disconnected from stream');
      setIsConnected(false);
    });

    // Listen for live in-app notifications
    socketInstance.on('new_notification', (notification) => {
      setLiveNotifications((prev) => [notification, ...prev.slice(0, 19)]);
    });

    // Listen for real-time order updates
    socketInstance.on('order_updated', (data) => {
      setActiveOrderUpdate({
        ...data,
        timestamp: new Date(),
      });
    });

    socketInstance.on('global_order_change', (data) => {
      setActiveOrderUpdate({
        ...data,
        timestamp: new Date(),
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinOrderRoom = (trackingNumber) => {
    if (socket && trackingNumber) {
      socket.emit('join_order', trackingNumber);
    }
  };

  const leaveOrderRoom = (trackingNumber) => {
    if (socket && trackingNumber) {
      socket.emit('leave_order', trackingNumber);
    }
  };

  const clearNotification = (id) => {
    setLiveNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        liveNotifications,
        activeOrderUpdate,
        joinOrderRoom,
        leaveOrderRoom,
        clearNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
