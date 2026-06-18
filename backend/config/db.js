require("./env");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables. Please set MONGO_URI in your .env file.");
    }
    
    // Cleanup URI (remove any trailing spaces or hidden characters)
    const mongoUri = process.env.MONGO_URI.trim();

    await mongoose.connect(mongoUri, {
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("✅ MongoDB Connected Successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed!");
    console.error("Error Message:", err.message);
    
    if (err.message.includes("MongooseServerSelectionError") || err.message.includes("Could not connect to any servers")) {
      console.warn("\n💡 TIP: This usually means your IP address is not whitelisted in MongoDB Atlas.");
      console.warn("Please go to MongoDB Atlas -> Security -> Network Access and add your current IP.\n");
    } else if (err.message.includes("ENOTFOUND")) {
      console.warn("\n💡 TIP: DNS resolution failed. Check your internet connection or DNS settings.\n");
    }
    
    throw err;
  }
};

// Reuse the default connection to avoid spawning a second connection pool
const mongo_connection = mongoose.connection;

module.exports = {
  connectDB,
  mongo_connection,
};
