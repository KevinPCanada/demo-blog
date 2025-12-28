// api/index.js
import express from 'express';
import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES Modules, __dirname is not available directly.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- CORS CONFIGURATION ---
const corsOptions = {
  // We use an array so we can allow Localhost AND future Vercel URL
  origin: [
    "http://localhost:5173", 
    // will add Vercel URL here later, e.g., "https://my-blog.vercel.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// --- END OF CORS ---

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Optional now that I use Cloudinary, but good to keep for safety)
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

// --- VERCEL DEPLOYMENT CONFIG ---
// Only listen to port 8800 if we are NOT in production (i.e., we are on Localhost)
if (process.env.NODE_ENV !== 'production') {
  app.listen(8800, () => {
    console.log('Server listening on http://localhost:8800');
  });
}

export default app;