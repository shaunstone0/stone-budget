import mongoose from 'mongoose';

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

class DatabaseConnection {
  private readonly config: DatabaseConfig;

  constructor() {
    this.config = {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      options: {
        dbName: 'stone-budget',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      },
    };
  }

  public async connect(): Promise<void> {
    try {
      mongoose.set('strictQuery', false);

      await mongoose.connect(this.config.uri, this.config.options);

      console.log('✅ Connected to MongoDB Atlas successfully');

      // Handle connection events
      mongoose.connection.on('error', (error: Error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionState(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }
}

export const databaseConnection = new DatabaseConnection();
export default databaseConnection;
