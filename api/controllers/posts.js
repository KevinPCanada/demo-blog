import { db } from "../db.js";
import jwt from "jsonwebtoken";
import fs from "fs";   // Node.js File System module for deleting files
import path from "path"; // Node.js Path module for constructing file paths
import { fileURLToPath } from 'url'; // For __dirname in ES modules

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This should resolve to your 'api/controllers' directory

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

export const getPost = (req, res) => {
  const postId = req.params.id;
  // console.log(`Backend: Fetching post with ID: ${postId}`); 

  const q = `
    SELECT p.id, p.title, p.description, p.content, p.img, 
           p.category,
           p.date, p.uid, 
           u.username AS authorName
    FROM posts p 
    JOIN users u ON p.uid = u.id 
    WHERE p.id = ?
  `;

  db.query(q, [postId], (err, data) => {
    if (err) {
      console.error("Database error fetching single post:", err);
      return res
        .status(500)
        .json({ message: "Database error occurred.", error: err.message });
    }
    if (data.length === 0) {
      // console.log(`Backend: Post not found for ID: ${postId}`); 
      return res.status(404).json({ message: "Post not found!" });
    }
    // console.log(`Backend: Successfully fetched post ID: ${postId}`); 
    return res.status(200).json(data[0]);
  });
};

export const addPost = (req, res) => {
  // 1. VERIFY USER AUTHENTICATION (JWT)
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    // Ensure "jwtkey" is your actual secret
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
      req.body.content, // This is from ReactQuill
      req.body.description,
      req.body.category,
      userInfo.id, // Extracted from the JWT
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
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;

    // Step 1: Get the post to retrieve the image filename and verify ownership
    const getPostQuery = "SELECT img, uid FROM posts WHERE id = ?";
    db.query(getPostQuery, [postId], (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Database error fetching post for deletion.", error: err.message });
      }
      if (data.length === 0) {
        return res.status(404).json("Post not found!");
      }
      if (data[0].uid !== userInfo.id) {
        return res.status(403).json("You can only delete your own posts!");
      }

      const imagePathInDB = data[0].img; // e.g., "/uploads/imagename.jpg"

      // Step 2: Delete the post from the database
      const deletePostQuery = "DELETE FROM posts WHERE id = ? AND uid = ?";
      db.query(deletePostQuery, [postId, userInfo.id], (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Database error deleting post.", error: err.message });
        }
        if (result.affectedRows === 0) {
          // This case should ideally be caught by the previous checks, but as a safeguard:
          return res.status(404).json("Post not found or already deleted.");
        }

        // Step 3: Delete the image file from the server
        if (imagePathInDB) {
          // Construct the full file system path
          // imagePathInDB is like "/uploads/filename.jpg"
          // We want to map this to PROJECT_ROOT/api/public/uploads/filename.jpg
          // __dirname here is PROJECT_ROOT/api/controllers
          // So, path.join(__dirname, '..', 'public', imagePathInDB) should work
          // because path.join intelligently handles the leading '/' in imagePathInDB if 'public' is relative.
          // More robust: construct from known 'public' folder structure.
          // The 'public' folder is at path.join(__dirname, '..', 'public')
          // And the image is inside 'uploads' folder within 'public' (or imagePathInDB already accounts for it)
          // imagePathInDB = "/uploads/image.png"
          // We want path.join(PROJECT_ROOT, 'api', 'public', imagePathInDB)
          const actualFilePath = path.join(__dirname, "..", "public", imagePathInDB);


          fs.unlink(actualFilePath, (unlinkErr) => {
            if (unlinkErr) {
              // Log the error, but don't necessarily make the whole delete operation fail
              // if the file was already gone or path was slightly off.
              // The post is deleted from DB, which is the main thing.
              if (unlinkErr.code === 'ENOENT') {
                console.log(`Image file not found, already deleted or path mismatch: ${actualFilePath}`);
              } else {
                console.error("Error deleting image file:", unlinkErr);
              }
              // Still return success for post deletion as DB record is gone.
              return res.status(200).json("Post deleted. Image file handling had issues or file not found.");
            }
            console.log(`Successfully deleted image: ${actualFilePath}`);
            return res.status(200).json("Post and associated image have been deleted.");
          });
        } else {
          // No image path associated with the post
          return res.status(200).json("Post has been deleted (no associated image).");
        }
      });
    });
  });
};

export const updatePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  // IMPORTANT: Ensure this JWT key is the SAME as in addPost ("jwtkey")
  jwt.verify(token, "jwtkey", (err, userInfo) => { // USE CONSISTENT JWT KEY
    if (err) return res.status(403).json("Token is not valid!");

    // Consider if 'date' should be updated.
    // If 'date' is creation_date, it should NOT be updated.
    // If you want an 'updated_at' timestamp, it's better to have a separate column
    // or use MySQL's ON UPDATE CURRENT_TIMESTAMP for that column.
    // For now, let's assume 'date' is creation date and remove it from the update.
    const q =
      "UPDATE posts SET `title` = ?, `img` = ?, `content` = ?, `description` = ?, `category` = ? WHERE `id` = ? AND `uid` = ?";

    const values = [
      req.body.title,
      req.body.img,       // This will be the new or existing image path
      req.body.content,
      req.body.description,
      req.body.category,
      req.params.id,    // Post ID from the URL
      userInfo.id,      // User ID from the JWT
    ];

    db.query(q, values, (err, data) => {
      if (err) {
        console.error("Database query error in updatePost:", err);
        // Consider sending a more structured error like in getPost
        return res.status(500).json({ message: "Failed to update post.", error: err.message });
      }
      if (data.affectedRows === 0) {
        return res.status(404).json("Post not found or user not authorized to update.");
      }
      return res.status(200).json("Post has been updated.");
    });
  });
};
