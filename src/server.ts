import app from './app';
import { config } from './config/env';
import { connectDB } from './db';

const start = async () => {
  try {
    await connectDB();

    const server = app.listen(config.PORT, () => {
      console.log(`\n🚀 Server running on port ${config.PORT}`);
      console.log(`📖 API Docs: http://localhost:${config.PORT}/api-docs`);
      console.log(`🌍 Environment: ${config.NODE_ENV}\n`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();
