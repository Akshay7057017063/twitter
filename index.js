import express from "express";
import dotenv from "dotenv";
import databaseConnection from "./config/database.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import tweetRoute from "./routes/tweetRoute.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Required for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables
dotenv.config();

// ✅ Connect to MongoDB
databaseConnection();

// ✅ Initialize Express App
const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Enable CORS for Netlify (frontend) and localhost (dev)
const corsOptions = {
  origin: [
    "http://localhost:3000", // local dev
    "https://celadon-jelly-91b9e7.netlify.app" // deployed Netlify URL
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/tweet", tweetRoute);

// ✅ Default route for testing
app.get("/", (req, res) => {
  res.send("API is working ✅");
});

// ✅ Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
