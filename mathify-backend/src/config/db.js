const mongoose = require("mongoose");

async function connectDB() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
}

module.exports = connectDB;
// const mongoose = require("mongoose");

// async function connectDB() {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("MongoDB connected");
//     } catch (err) {
//         console.error("MongoDB connection failed:", err.message);
//         process.exit(1);  // kill server if DB fails — don't run silently broken
//     }
// }

// module.exports = connectDB;