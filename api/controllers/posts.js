// api/controllers/posts.js
import { db } from "../db.js"; // Make sure db.js exports your database connection
import jwt from "jsonwebtoken"; // For verifying the JWT

export const getPosts = (req, res) => {
  // ... (your existing or future code)
};

export const getPost = (req, res) => {
  res.json("from controller");
};

export const addPost = (req, res) => {
  // 1. VERIFY USER AUTHENTICATION (JWT)
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => { // Ensure "jwtkey" is your actual secret
    if (err) return res.status(403).json("Token is not valid!");

    // 2. PREPARE THE SQL QUERY
    // The 'date' column will now be populated by MySQL's NOW() function.
    // We list 6 '?' placeholders for the 6 values we'll provide.
    const q =
      "INSERT INTO posts(`title`, `img`, `content`, `description`, `category`, `uid`, `date`) VALUES (?, ?, ?, ?, ?, ?, NOW())";

    // The 'values' array no longer includes a date from req.body.
    // It should match the order of the '?' placeholders in the query.
    const values = [
      req.body.title,
      req.body.img,
      req.body.content,       // This is from ReactQuill
      req.body.description,
      req.body.category,
      userInfo.id,          // Extracted from the JWT
    ];

    // 3. EXECUTE THE QUERY
    // Note: db.query expects 'values' as a flat array when 'q' has multiple '?'
    db.query(q, values, (err, data) => {
      if (err) {
        console.error("Database query error:", err); // Keep this for debugging
        return res.status(500).json(err); // Send the actual MySQL error object
      }
      return res.status(200).json("Post has been created.");
    });
  });
};

export const deletePost = (req, res) => {
  res.json("from controller");
};

export const updatePost = (req, res) => {
  // 1. VERIFY USER AUTHENTICATION (JWT)
  const token = req.cookies.access_token; // Or however you're sending the token
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "your_jwt_secret_key", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // 2. PREPARE THE SQL QUERY
    const q =
      "UPDATE posts SET `title` = ?, `img` = ?, `date` = ?, `content` = ?, `description` = ?, `category` = ? WHERE `id` = ? AND `uid` = ?";

    const values = [
      req.body.title,
      req.body.img,
      req.body.date,
      req.body.content,
      req.body.description,
      req.body.category,
      req.params.id, // Post ID from the URL
      userInfo.id, // User ID from the JWT
    ];

    // 3. EXECUTE THE QUERY
    db.query(q, values, (err, data) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json("Post has been updated.");
    });
  });
};