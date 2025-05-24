// api/index.js
import express from 'express';
import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js'; // <--- 1. IMPORT UPLOAD ROUTES
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';                       // <--- IMPORT PATH MODULE
import { fileURLToPath } from 'url';           // <--- For __dirname in ES modules

// For ES Modules, __dirname is not available directly.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// <--- 2. SERVE STATIC FILES --->
// This makes files in 'api/public/' accessible.
// e.g., http://localhost:8800/uploads/image.png will serve api/public/uploads/image.png
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes); // <--- 3. USE UPLOAD ROUTES

app.listen(8800, () => {
  console.log('Server listening on http://localhost:8800');
  console.log(`Static files (like uploads) will be served from: ${path.join(__dirname, 'public')}`);
});