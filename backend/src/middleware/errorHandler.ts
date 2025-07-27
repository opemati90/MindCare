import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import { config } from '../config/config';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.userId,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Handle different types of errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        validationErrors,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target as string[];
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: `A record with this ${field?.join(', ')} already exists`,
            details: { field },
          },
          timestamp: new Date().toISOString(),
        });

      case 'P2025':
        // Record not found
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Record not found',
          },
          timestamp: new Date().toISOString(),
        });

      case 'P2003':
        // Foreign key constraint violation
        return res.status(400).json({
          success: false,
          error: {
            code: 'FOREIGN_KEY_VIOLATION',
            message: 'Referenced record does not exist',
          },
          timestamp: new Date().toISOString(),
        });

      case 'P2014':
        // Required relation violation
        return res.status(400).json({
          success: false,
          error: {
            code: 'REQUIRED_RELATION_VIOLATION',
            message: 'Required relation is missing',
          },
          timestamp: new Date().toISOString(),
        });

      default:
        logger.error('Unhandled Prisma error:', {
          code: error.code,
          message: error.message,
          meta: error.meta,
        });
        break;
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    logger.error('Unknown Prisma error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    logger.error('Prisma Rust panic:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_PANIC',
        message: 'Database engine panic',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error('Prisma initialization error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_INIT_ERROR',
        message: 'Database initialization failed',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error('Prisma validation error:', error);
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_VALIDATION_ERROR',
        message: 'Database validation failed',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Handle JWT errors (if not caught by auth middleware)
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Handle multer errors (file upload)
  if (error.name === 'MulterError') {
    let message = 'File upload error';
    let code = 'UPLOAD_ERROR';

    switch ((error as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        code = 'UNEXPECTED_FILE';
        break;
    }

    return res.status(400).json({
      success: false,
      error: {
        code,
        message,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response
  const statusCode = 500;
  const message = config.env === 'production' 
    ? 'Internal server error' 
    : error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      ...(config.env !== 'production' && { stack: error.stack }),
    },
    timestamp: new Date().toISOString(),
  });
};
