import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Use local MongoDB by default, with fallback to Atlas
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/secureshare_demo";

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    tls: true,
    tlsAllowInvalidCertificates: true,
    retryWrites: true,
  })
  .then(() => console.log("✓ DB connected"))
  .catch((err) => {
    console.error("DB connection error:", err.message);
    console.log("Attempting to use local MongoDB fallback...");
    // Try local MongoDB if Atlas fails
    const localURI = "mongodb://127.0.0.1:27017/secureshare_demo";
    return mongoose.connect(localURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
      .then(() => console.log("✓ Connected to local MongoDB"))
      .catch((localErr) => {
        console.error("Local MongoDB also failed:", localErr.message);
        console.warn("⚠️ Database unavailable - running in demo mode");
      });
  });

export default mongoose;
