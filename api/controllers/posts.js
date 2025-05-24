// api/controllers/posts.js
import { db } from "../db.js"; // Make sure db.js exports your database connection
import jwt from "jsonwebtoken"; // For verifying the JWT

export const getPosts = (req, res) => {
  // We want to get all posts. For the homepage, we might also want author info.
  // Let's select post details and include the username of the author.
  // We also want to retrieve the 'description' field for the card snippets.
  const q = `
    SELECT p.*, u.username AS authorName 
    FROM posts AS p 
    JOIN users AS u ON p.uid = u.id 
    ORDER BY p.date DESC
  `;
  // If you only want posts from a specific category, you can add a WHERE clause
  // e.g., const q = req.query.cat ? "SELECT * FROM posts WHERE cat=? ORDER BY date DESC" : "SELECT * FROM posts ORDER BY date DESC";
  // For now, we'll fetch all.

  db.query(q, (err, data) => {
    if (err) {
      console.error("Database query error in getPosts:", err);
      return res.status(500).json(err);
    }
    if (data.length === 0) {
      return res.status(200).json([]); // Send empty array if no posts
    }
    return res.status(200).json(data);
  });
};

// ... your other post controller functions (getPost, addPost, deletePost, updatePost) ...
// ensure getPost is also defined for when you click "Read More" later
export const getPost = (req, res) => {
  const q = `
    SELECT p.id, p.title, p.description, p.content, p.img, p.cat, p.date, p.uid, 
           u.username AS authorName, u.img AS authorImg 
    FROM posts p 
    JOIN users u ON p.uid = u.id 
    WHERE p.id = ?
  `;

  db.query(q, [req.params.id], (err, data) => {
    if (err) {
      console.error("Error fetching single post:", err);
      return res.status(500).json(err);
    }
    if (data.length === 0) return res.status(404).json("Post not found!");
    return res.status(200).json(data[0]); // Send the single post object
  });
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