import app from './app';
import { env } from '@/config/env';
import logger from '@/config/logger';
import supabase from '@/config/database';

const startServer = async () => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (!error) {
      logger.info('Supabase connected successfully');
    } else {
      logger.warn('Supabase connection test failed:', error.message);
    }

    // Start the server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(`📱 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API Base URL: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
      logger.info(`🏥 Health Check: http://localhost:${env.PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Supabase client doesn't need explicit disconnection
        logger.info('Server shutdown complete');
        
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();