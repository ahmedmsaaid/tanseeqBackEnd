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
const MONGODB_URI = process.env.MONGODB_URI || '';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection helper for Serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!MONGODB_URI) return;
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.warn('MongoDB connection failed, falling back to mock data.');
  }
};

// Middleware to ensure DB connection per request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Root & Health Check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Tanseeq API is running 🚀' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Routes
app.get('/api/faculties', getFaculties);
app.get('/api/faculties/:id', getFacultyById);
app.post('/api/predict', predictAcceptance);
app.post('/api/recommend', getRecommendations);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Local development support
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

export default app;