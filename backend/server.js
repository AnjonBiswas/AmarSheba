import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { checkDatabaseConnection } from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import applicationsRoutes from './routes/applicationsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/emergency', emergencyRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Server error.' });
});

app.listen(PORT, async () => {
  try {
    await checkDatabaseConnection();
    console.log('MySQL connection successful.');
  } catch (error) {
    console.warn('MySQL connection failed. Check backend/.env settings.', error.message);
  }

  console.log(`AmarSheba backend running on http://localhost:${PORT}`);
});
