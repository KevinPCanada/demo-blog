import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Registration function
export const register = async (req, res) => {
  try {
    // 1. CHECK IF USER EXISTS
    const q = "SELECT * FROM users WHERE email = ? OR username = ?";
    
    // Serverless driver returns the data array directly
    const existingUsers = await db.execute(q, [req.body.email, req.body.username]);

    if (existingUsers.length > 0) {
      return res.status(409).json("User already exists!");
    }

    // 2. HASH THE PASSWORD
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    // 3. INSERT NEW USER
    const insertQ = "INSERT INTO users(`username`,`email`,`password`) VALUES (?, ?, ?)";
    const values = [req.body.username, req.body.email, hash];

    await db.execute(insertQ, values);

    return res.status(200).json("User has been created.");
  } catch (err) {
    console.error("Error in register:", err);
    return res.status(500).json(err);
  }
};

export const login = async (req, res) => {
  try {
    // 1. CHECK IF USER EXISTS
    const q = "SELECT * FROM users WHERE username = ?";
    const users = await db.execute(q, [req.body.username]);

    if (users.length === 0) {
      return res.status(404).json("User not found!");
    }

    // 2. CHECK PASSWORD
    // users[0] is the first user found
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      users[0].password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json("Wrong username or password!");
    }

    // 3. GENERATE TOKEN
    const token = jwt.sign({ id: users[0].id }, process.env.JWT_KEY);

    // 4. SEPARATE PASSWORD FROM USER DATA
    const { password, ...other } = users[0];

    // 5. SEND COOKIE AND USER DATA
    // We use "samesite: none" and "secure: true" for cross-site cookies (Vercel -> Backend)
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true, // Required for Vercel/HTTPS
        sameSite: "none", // Required for Cross-Site (Frontend vs Backend domains)
      })
      .status(200)
      .json(other);
      
  } catch (err) {
    console.error("Error in login:", err);
    return res.status(500).json(err);
  }
};

// Logout function
export const logout = (req, res) => {
  // Clear the access_token cookie
  res.clearCookie("access_token", {
    sameSite: "none",
    secure: true,
  }).status(200).json("User has been logged out");
};