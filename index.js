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

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://peppy-horse-00bb7e.netlify.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // ✅ Safely reject disallowed origins without crashing the app
      callback(null, false);
    }
  },
  credentials: true,
};

// ✅ Use CORS
app.use(cors(corsOptions));

// ✅ Handle preflight OPTIONS request globally
app.options("*", cors(corsOptions));

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/tweet", tweetRoute);

// ✅ Default route for testing
app.get("/", (req, res) => {
  res.send("API is working ✅");
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
