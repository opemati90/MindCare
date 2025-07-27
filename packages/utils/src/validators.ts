import { z } from 'zod';

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Password validation
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Phone number validation
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');

/**
 * Name validation
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone: string): boolean => {
  return phoneSchema.safeParse(phone).success;
};

/**
 * Validate name
 */
export const isValidName = (name: string): boolean => {
  return nameSchema.safeParse(name).success;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate and sanitize email
 */
export const validateAndSanitizeEmail = (email: string): string | null => {
  const sanitized = sanitizeString(email.toLowerCase());
  return isValidEmail(sanitized) ? sanitized : null;
};
