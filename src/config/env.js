require('dotenv').config();

// Try to load firebase-functions for Cloud Functions environment
let functions;
try {
  functions = require('firebase-functions');
} catch (e) {
  // Not in Cloud Functions environment
  functions = null;
}

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  firebaseConfig: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  },
  
  mlServiceUrl: process.env.ML_SERVICE_URL || 
                (functions?.config().ml?.service_url) || 
                'http://localhost:8000',
  
  jwtSecret: process.env.JWT_SECRET || 
             (functions?.config().jwt?.secret) || 
             'default-secret-change-in-production',
  
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : (functions?.config().cors?.origins?.split(','))
    || ['http://localhost:5173', 'http://localhost:8081'],
};

const validateConfig = () => {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && config.nodeEnv !== 'development') {
    console.warn(`⚠️  Missing required environment variables: ${missing.join(', ')}`);
  }
};

validateConfig();

module.exports = config;
