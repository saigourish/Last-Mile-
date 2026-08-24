const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('⚡ No MONGODB_URI detected in environment. Starting in-memory MongoDB engine...');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'gourish_delivery_db'
        }
      });
      mongoUri = mongodInstance.getUri();
      console.log(`🚀 Gourish In-Memory MongoDB running at: ${mongoUri}`);
    } else {
      console.log(`🔌 Connecting to external MongoDB at: ${mongoUri.split('@')[1] || mongoUri}...`);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (error) {
    console.error('Error closing DB:', error);
  }
};

module.exports = { connectDB, closeDB };
