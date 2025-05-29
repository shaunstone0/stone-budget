import 'reflect-metadata';
import dotenv from 'dotenv';
import { App } from './app';
import databaseConnection from './config/database/database';
import { dataSeeder } from './utils/seedData';

// Load environment variables
dotenv.config();

class Server {
  private app: App;

  constructor() {
    this.app = new App();
  }

  public async start(): Promise<void> {
    try {
      // Connect to MongoDB
      await databaseConnection.connect();

      // Seed default data
      await dataSeeder.seedAllData();

      // Start the server
      const port = this.app.getPort();
      this.app.getApp().listen(port, () => {
        console.log('🚀 Server started successfully!');
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Server running on port: ${port}`);
        console.log(`🔗 Health check: http://localhost:${port}/health`);
        console.log(`📡 API base: http://localhost:${port}/api`);
        console.log(`🗄️  Database: ${databaseConnection.getConnectionState()}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      console.log('🛑 Shutting down server...');
      await databaseConnection.disconnect();
      console.log('✅ Server shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during server shutdown:', error);
      process.exit(1);
    }
  }
}

// Create server instance
const server = new Server();

// Handle graceful shutdown
const gracefulShutdown = (signal: string): void => {
  console.log(`\n📡 Received ${signal}, initiating graceful shutdown...`);
  server.stop().catch(error => {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  });
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error);
  server.stop().catch(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  console.error('💥 Unhandled Rejection:', reason);
  server.stop().catch(() => process.exit(1));
});

// Start the server
server.start().catch(error => {
  console.error('💥 Failed to start application:', error);
  process.exit(1);
});
