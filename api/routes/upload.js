import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

const router = express.Router();

const require = createRequire(import.meta.url);
const multerStoragePkg = require("multer-storage-cloudinary");

// Try to grab CloudinaryStorage from the direct export OR the .default property
const CloudinaryStorage = multerStoragePkg.CloudinaryStorage || multerStoragePkg.default?.CloudinaryStorage;

// Debugging line: If this prints 'undefined',  the library is acting up
console.log("CloudinaryStorage Class:", CloudinaryStorage);

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
  },
});

const upload = multer({ storage: storage });

// 3. The Route (with error handling)
router.post("/", (req, res) => {
  // wrap the uploader in a function to catch the error manually
  const uploadSingle = upload.single("file");

  uploadSingle(req, res, (err) => {
    if (err) {
      // 1. Log the REAL error to terminal
      console.error("CLOUDINARY UPLOAD ERROR:", err);
      
      // 2. Send the error as JSON so the frontend doesn't crash with "SyntaxError"
      return res.status(500).json({ 
        message: "Upload failed", 
        error: err.message || err 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    // Success!
    res.status(200).json({ url: req.file.path });
  });
});

export default router;