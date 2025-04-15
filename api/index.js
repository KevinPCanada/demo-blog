import express from 'express';
import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import cookieParser from 'cookie-parser';

import cors from 'cors';
// Enable CORS for all origins


const app = express();
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // the current frontend URL
  credentials: true
}));

app.use(express.json()); //For parsing JSON
app.use(express.urlencoded({ extended: true })); // For parsing form data

app.use("/api/posts", postRoutes)
app.use("/api/auth", authRoutes); // Register the auth routes
app.use("/api/users", userRoutes);

app.listen(8800, () => {
  console.log('Server listening on http://localhost:8800')
});