const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusvision';
    try {
        console.log(`[CampusVision] Attempting MongoDB connection...`);
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 2500 // Fast fail if local MongoDB is not running
        });
        console.log(`[CampusVision] ✓ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.warn(`[CampusVision] ! MongoDB connection notice: ${error.message}`);
        console.warn(`[CampusVision] ! Running in resilient IN-MEMORY DEMO MODE.`);
        console.warn(`[CampusVision] ! Web Dashboard and all REST APIs are fully functional.`);
        console.warn(`[CampusVision] ! (To persist data, start MongoDB or set MONGO_URI in .env)\n`);
        return false;
    }
};

module.exports = connectDB;
