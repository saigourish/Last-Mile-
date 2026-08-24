let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`⚡ [Socket.IO] Client connected: ${socket.id}`);

    // Join specific order tracking room
    socket.on('join_order', (trackingNumber) => {
      if (trackingNumber) {
        socket.join(`order:${trackingNumber}`);
        console.log(`📡 Socket ${socket.id} joined tracking room order:${trackingNumber}`);
      }
    });

    socket.on('leave_order', (trackingNumber) => {
      if (trackingNumber) {
        socket.leave(`order:${trackingNumber}`);
      }
    });

    // Join agent mission stream
    socket.on('join_agent', (agentId) => {
      if (agentId) {
        socket.join(`agent:${agentId}`);
      }
    });

    // Join admin tower
    socket.on('join_admin_tower', () => {
      socket.join('admin_tower');
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

const getIO = () => ioInstance;

const broadcastOrderStatus = (order, trackingLog) => {
  if (!ioInstance) return;

  const payload = {
    orderId: order._id,
    trackingNumber: order.trackingNumber,
    status: order.status,
    updatedAt: order.updatedAt,
    assignedAgent: order.assignedAgent,
    trackingLog,
  };

  // Broadcast to specific order room
  ioInstance.to(`order:${order.trackingNumber}`).emit('order_updated', payload);

  // Broadcast to admin tower
  ioInstance.to('admin_tower').emit('order_updated', payload);

  // Broadcast to everyone general update
  ioInstance.emit('global_order_change', payload);
};

const broadcastAgentAssignment = (order, agent, physicsSimulation) => {
  if (!ioInstance) return;

  const payload = {
    orderId: order._id,
    trackingNumber: order.trackingNumber,
    agent: {
      id: agent._id,
      name: agent.name,
      vehicleType: agent.vehicleType,
      rating: agent.rating,
    },
    physicsSimulation,
    timestamp: new Date(),
  };

  ioInstance.to(`order:${order.trackingNumber}`).emit('antigravity_assignment_locked', payload);
  ioInstance.to('admin_tower').emit('antigravity_assignment_locked', payload);
  if (agent._id) {
    ioInstance.to(`agent:${agent._id}`).emit('new_mission_assigned', payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  broadcastOrderStatus,
  broadcastAgentAssignment,
};
