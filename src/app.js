const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

const caseRoutes = require('./routes/caseRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const userRoutes = require('./routes/userRoutes');
const simulationRoutes = require('./routes/simulationRoutes');

const app = express();

app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Juris AI Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      cases: '/api/cases',
      analytics: '/api/analytics',
      predictions: '/api/predict',
      users: '/api/users',
      simulation: '/api/simulation',
    },
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/cases', caseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/simulation', simulationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
