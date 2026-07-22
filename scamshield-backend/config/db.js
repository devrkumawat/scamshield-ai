// config/db.js — MongoDB Atlas connection (Mongoose)
import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'scamshield';

  if (!uri || uri === 'your_mongodb_atlas_connection_string_here') {
    console.warn('⚠️  MONGO_URI not configured. Database features will be disabled.');
    return null;
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return null;
  }
};

export default connectDB;
