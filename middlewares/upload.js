import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Create uploads directory if not exists
const uploadPath = path.resolve("uploads");

try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }
} catch (error) {
  console.error("❌ Error creating uploads folder:", error);
}

// ✅ Configure storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g. 1699999991234.png
  }
});

// ✅ Optional: File type and size restrictions
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, jpeg, png, gif)."));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter
});

export default upload;
