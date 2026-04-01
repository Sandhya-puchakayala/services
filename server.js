const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const sellerRoutes = require('./routes/sellerRoutes');

const app = express();

// CORS Configuration - MUST be first before other middleware
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json()); // Allows your server to accept JSON data from the frontend

// 🔍 LOG ALL INCOMING REQUESTS
app.use((req, res, next) => {
  console.log(`\n🔵 [REQUEST] ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

// Basic test route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Petoty backend is running smoothly!' });
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, '-')}`);
  },
});

const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload Route
app.post('/api/upload', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Return the path to access the file
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// Routes
app.use('/api/sellers', sellerRoutes);

// Database Connection
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    const isValidURI = mongoURI && (mongoURI.startsWith('mongodb://') || mongoURI.startsWith('mongodb+srv://'));
    let finalURI = mongoURI;

    if (!isValidURI || mongoURI.includes('127.0.0.1') || mongoURI.includes('localhost')) {
      console.log('No valid remote URI provided or local URI detected. Booting in-memory Database engine...');
      
      const mongoServer = await MongoMemoryServer.create();
      finalURI = mongoServer.getUri();
    }

    await mongoose.connect(finalURI);
    console.log(`MongoDB connected successfully to development Local DB.`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});