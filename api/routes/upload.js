// api/routes/upload.js
import express from 'express';
import multer from 'multer';
import path from 'path'; // Node.js path module

const router = express.Router();

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // IMPORTANT: Make sure this 'public/uploads/' path is correct relative to your project root where nodemon runs
    // If nodemon runs from /api, then 'public/uploads/' is fine.
    // If it runs from /blog, you might need './api/public/uploads/'
    // For now, let's assume nodemon runs from the /api directory.
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename: originalname-timestamp.extension
    // Using originalname directly can be a security risk if it contains malicious characters.
    // A safer approach is to sanitize it or generate a completely random name.
    // For simplicity here:
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-')); // Replace spaces
  }
});

// File filter (optional, to accept only certain image types)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, or GIF images are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter: fileFilter
});

// POST /api/upload
router.post('/', upload.single('file'), (req, res) => {
  // 'file' is the name of the field in FormData from the frontend
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or file type not allowed.' });
  }

  // Successfully uploaded
  res.status(200).json({
    message: 'File uploaded successfully',
    // This path will be relative to the 'public' folder you serve statically
    filePath: `/uploads/${req.file.filename}`
  });
}, (error, req, res, next) => {
    // This is an error handling middleware specific to multer errors on this route
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    next();
});

export default router;