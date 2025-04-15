import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Registration function
export const register = (req, res) => {
  console.log(req.body); // Log the body to verify fields
  
  // Check if the user already exists in the database
  const query = "SELECT * FROM users WHERE email = ? OR username = ?";
  db.query(query, [req.body.email, req.body.username], (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }
    if (data.length) {
      return res.status(409).json("User already exists");
    }
    
    // Hash the password using bcrypt for security
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(req.body.password, salt);
    
    // Insert the new user into the database
    const insertQuery =
      "INSERT INTO users (`email`, `username`, `password`) VALUES (?, ?, ?)";
    const values = [
      req.body.email,
      req.body.username,
      hash, // Store the hashed password
    ];
    db.query(insertQuery, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created");
    });
  });
};

// Login function
export const login = (req, res) => {
  // SQL query to find the user by username
  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err); // Server error
    if (data.length === 0) return res.status(404).json("User not found!"); // User not found
   
    // Check if the provided password matches the stored hashed password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json("Wrong username or password"); // Incorrect password
    }
   
    // Generate a JWT token for successful login
    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    
    // Remove password from user data before sending response
    const { password, ...other } = data[0];
   
    // Set the token as an HTTP-only cookie and send user data
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(other);
  });
};

// Logout function
export const logout = (req, res) => {
  // Clear the access_token cookie
  res.clearCookie("access_token", {
    sameSite: "none",
    secure: true,
  }).status(200).json("User has been logged out");
};