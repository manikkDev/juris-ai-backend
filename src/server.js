const app = require('./app');
const config = require('./config/env');
const { initializeFirebase } = require('./config/firebase');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    initializeFirebase();
    
    const PORT = config.port;
    
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 Juris AI Backend Server Started');
      console.log('='.repeat(50));
      console.log(`📡 Server running on port: ${PORT}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log('='.repeat(50) + '\n');
      
      logger.success(`Server started successfully on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', { error: err.message, stack: err.stack });
      console.error('Unhandled Rejection - shutting down...');
      process.exit(1);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server:', { error: error.message });
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
