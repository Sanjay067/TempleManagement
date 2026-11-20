const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase(uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/temple_management') {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`[Database] Connected successfully to ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    throw error;
  }
}

async function disconnectDatabase() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = {
  connectToDatabase,
  disconnectDatabase
};

