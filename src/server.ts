import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  getFaculties,
  getFacultyById,
  predictAcceptance,
  getRecommendations
} from './controllers/faculty.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tanseeq';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/faculties', getFaculties);
app.get('/api/faculties/:id', getFacultyById);
app.post('/api/predict', predictAcceptance);
app.post('/api/recommend', getRecommendations);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Connect to Database & Start Server
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.warn('MongoDB connection failed. Running with local mock data fallback.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
};

startServer();