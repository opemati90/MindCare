import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

// Generic validation middleware factory
export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate route parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        const validationError = new ValidationError(
          'Validation failed',
          validationErrors
        );

        return res.status(400).json({
          success: false,
          error: validationError.toJSON(),
          timestamp: new Date().toISOString(),
        });
      }

      next(error);
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  // ID parameter
  idParam: z.object({
    id: z.string().cuid('Invalid ID format'),
  }),

  // Search query
  searchQuery: z.object({
    q: z.string().optional(),
  }),

  // Date range
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

// User validation schemas
export const userSchemas = {
  create: z.object({
    email: z.string().email('Invalid email format'),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['PATIENT', 'PROVIDER', 'ADMIN']),
    profile: z.object({
      phoneNumber: z.string().optional(),
      dateOfBirth: z.string().datetime().optional(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    }).optional(),
  }),

  update: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    profile: z.object({
      phoneNumber: z.string().optional(),
      dateOfBirth: z.string().datetime().optional(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    }).optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
};

// Authentication validation schemas
export const authSchemas = {
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),

  register: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    role: z.enum(['PATIENT', 'PROVIDER']),
    termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),

  resetPassword: z.object({
    email: z.string().email('Invalid email format'),
  }),

  verifyEmail: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
};

// Appointment validation schemas
export const appointmentSchemas = {
  create: z.object({
    providerId: z.string().cuid('Invalid provider ID'),
    scheduledAt: z.string().datetime('Invalid date format'),
    duration: z.number().min(15, 'Minimum duration is 15 minutes').max(480, 'Maximum duration is 8 hours'),
    type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'TELEHEALTH', 'ROUTINE_CHECKUP']),
    reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
    notes: z.string().max(1000, 'Notes too long').optional(),
  }),

  update: z.object({
    scheduledAt: z.string().datetime().optional(),
    duration: z.number().min(15).max(480).optional(),
    type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'TELEHEALTH', 'ROUTINE_CHECKUP']).optional(),
    reason: z.string().min(1).max(500).optional(),
    notes: z.string().max(1000).optional(),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  }),

  filters: z.object({
    providerId: z.string().cuid().optional(),
    patientId: z.string().cuid().optional(),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
    type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'TELEHEALTH', 'ROUTINE_CHECKUP']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
};

// Medical record validation schemas
export const medicalRecordSchemas = {
  create: z.object({
    patientId: z.string().cuid('Invalid patient ID'),
    visitDate: z.string().datetime('Invalid date format'),
    diagnosis: z.string().min(1, 'Diagnosis is required').max(1000),
    treatment: z.string().min(1, 'Treatment is required').max(1000),
    notes: z.string().max(2000).optional(),
  }),

  update: z.object({
    visitDate: z.string().datetime().optional(),
    diagnosis: z.string().min(1).max(1000).optional(),
    treatment: z.string().min(1).max(1000).optional(),
    notes: z.string().max(2000).optional(),
  }),
};

// Provider validation schemas
export const providerSchemas = {
  updateAvailability: z.object({
    availability: z.array(z.object({
      dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
      isAvailable: z.boolean(),
    })),
  }),

  filters: z.object({
    specialtyId: z.string().cuid().optional(),
    isAvailable: z.string().transform(val => val === 'true').optional(),
    location: z.string().optional(),
  }),
};
