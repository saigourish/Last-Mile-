require('dotenv').config();
const { connectDB, closeDB } = require('../config/db');
const seedDatabase = require('./seedData');

const run = async () => {
  await connectDB();
  await seedDatabase();
  await closeDB();
  console.log('🎉 Seeding process completed.');
  process.exit(0);
};

run();
