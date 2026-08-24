require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');
const seedDatabase = require('./seed/seedData');
const User = require('./models/User');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const agentRoutes = require('./routes/agentRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const rateCardRoutes = require('./routes/rateCardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

initSocket(io);

// Middleware
app.use(cors());
app.use(express.json());

// Attach io to req for controllers that might need direct reference
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Root & Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'Gourish Last-Mile Delivery Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

const path = require('path');

// Serve Frontend Client build if available
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/rate-cards', rateCardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// SPA fallback: Serve client index.html for frontend routes
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      next();
    }
  });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📦 Empty database detected. Running automatic initial seed...');
      await seedDatabase();
    }

    server.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🌌 GOURISH LAST-MILE DELIVERY PLATFORM BACKEND`);
      console.log(`🚀 Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
      console.log(`📡 Socket.IO Real-Time Stream: Active`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start Gourish Server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
