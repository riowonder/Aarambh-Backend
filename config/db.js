import mongoose from "mongoose";

const connectDB = async () => {

  try {
    console.log(process.env.MONGO_URI)

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // timeout after 10s if cannot connect
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // Stop app if DB fails
  }
};

export default connectDB;
