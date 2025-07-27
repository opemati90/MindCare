import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';
import { logger } from '../utils/logger';

// Extend PrismaClient with custom methods if needed
class ExtendedPrismaClient extends PrismaClient {
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Log database queries in development
    if (config.env === 'development') {
      this.$on('query', (e) => {
        logger.debug('Database Query', {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        });
      });
    }

    // Log database errors
    this.$on('error', (e) => {
      logger.error('Database Error', {
        message: e.message,
        target: e.target,
      });
    });

    // Log database info
    this.$on('info', (e) => {
      logger.info('Database Info', {
        message: e.message,
        target: e.target,
      });
    });

    // Log database warnings
    this.$on('warn', (e) => {
      logger.warn('Database Warning', {
        message: e.message,
        target: e.target,
      });
    });
  }

  // Custom method to safely disconnect
  async safeDisconnect() {
    try {
      await this.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
    }
  }

  // Custom method for health check
  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return { status: 'unhealthy', timestamp: new Date(), error };
    }
  }

  // Custom method for transaction with retry logic
  async transactionWithRetry<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.$transaction(fn);
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Transaction attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError!;
  }
}

// Create a global instance
declare global {
  var __prisma: ExtendedPrismaClient | undefined;
}

// Prevent multiple instances during development hot reloads
export const prisma = globalThis.__prisma || new ExtendedPrismaClient();

if (config.env === 'development') {
  globalThis.__prisma = prisma;
}

// Export types for use in other files
export type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
export type { PrismaClient } from '@prisma/client';
