// middlewares/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Define upload directory
const uploadPath = path.resolve("uploads");

// ✅ Create 'uploads' folder if not exists
try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
    console.log("📁 'uploads' folder created.");
  }
} catch (error) {
  console.error("❌ Failed to create 'uploads' folder:", error);
}

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`); // e.g. 1621231231234.png
  }
});

// ✅ Allow only image files (jpg, png, gif, etc.)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValidMime = allowedTypes.test(file.mimetype);
  const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, gif) are allowed."));
  }
};

// ✅ Multer upload middleware (5MB max)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
});

export default upload;
