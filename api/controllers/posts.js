import { db } from "../db.js";
import jwt from "jsonwebtoken";

// --- GET ALL POSTS ---
export const getPosts = async (req, res) => {
  try {
    const q = req.query.cat
      ? `SELECT p.*, u.username AS authorName FROM posts AS p JOIN users AS u ON p.uid = u.id WHERE category=? ORDER BY p.date DESC`
      : `SELECT p.*, u.username AS authorName FROM posts AS p JOIN users AS u ON p.uid = u.id ORDER BY p.date DESC`;

    // The serverless driver returns the rows directly
    const data = await db.execute(q, [req.query.cat]);
    
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
};

// --- GET SINGLE POST ---
export const getPost = async (req, res) => {
  try {
    const q = `
      SELECT p.id, p.title, p.description, p.content, p.img, 
             p.category, p.date, p.uid, u.username AS authorName
      FROM posts p 
      JOIN users u ON p.uid = u.id 
      WHERE p.id = ?
    `;

    const data = await db.execute(q, [req.params.id]);

    if (data.length === 0) {
      return res.status(404).json({ message: "Post not found!" });
    }
    
    return res.status(200).json(data[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
};

// --- ADD POST ---
export const addPost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_KEY, async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "INSERT INTO posts(`title`, `img`, `content`, `description`, `category`, `uid`, `date`) VALUES (?, ?, ?, ?, ?, ?, NOW())";

    const values = [
      req.body.title,
      req.body.img,
      req.body.content,
      req.body.description,
      req.body.category,
      userInfo.id,
    ];

    try {
      await db.execute(q, values);
      return res.status(200).json("Post has been created.");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  });
};

// --- DELETE POST ---
export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_KEY, async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const postId = req.params.id;
      
      // 1. Check ownership
      const checkQuery = "SELECT uid FROM posts WHERE id = ?";
      const checkData = await db.execute(checkQuery, [postId]);

      if (checkData.length === 0) return res.status(404).json("Post not found!");
      
      // Ensure the logged-in user owns the post
      if (checkData[0].uid !== userInfo.id) {
        return res.status(403).json("You can only delete your own posts!");
      }

      // 2. Delete from DB (We skip file deletion since it's on Cloudinary now)
      const deleteQuery = "DELETE FROM posts WHERE id = ?";
      await db.execute(deleteQuery, [postId]);

      return res.status(200).json("Post has been deleted.");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  });
};

// --- UPDATE POST ---
export const updatePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_KEY, async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "UPDATE posts SET `title` = ?, `img` = ?, `content` = ?, `description` = ?, `category` = ? WHERE `id` = ? AND `uid` = ?";

    const values = [
      req.body.title,
      req.body.img,
      req.body.content,
      req.body.description,
      req.body.category,
      req.params.id,
      userInfo.id,
    ];

    try {
      await db.execute(q, values);
      return res.status(200).json("Post has been updated.");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  });
};