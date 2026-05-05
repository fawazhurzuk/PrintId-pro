require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const institutionRoutes = require('./routes/institutions');
const studentRoutes = require('./routes/students');
const batchRoutes = require('./routes/batches');
const templateRoutes = require('./routes/templates');
const designRoutes = require('./routes/designs');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`PrintID Pro API running on port ${PORT}`);
});
