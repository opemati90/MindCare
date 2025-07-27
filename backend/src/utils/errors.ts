export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ApiError);
  }

  // Static factory methods for common errors
  static badRequest(message: string, code: string = 'BAD_REQUEST', details?: Record<string, any>) {
    return new ApiError(message, 400, code, details);
  }

  static unauthorized(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    return new ApiError(message, 401, code);
  }

  static forbidden(message: string = 'Forbidden', code: string = 'FORBIDDEN') {
    return new ApiError(message, 403, code);
  }

  static notFound(message: string = 'Not found', code: string = 'NOT_FOUND') {
    return new ApiError(message, 404, code);
  }

  static conflict(message: string, code: string = 'CONFLICT', details?: Record<string, any>) {
    return new ApiError(message, 409, code, details);
  }

  static unprocessableEntity(message: string, code: string = 'UNPROCESSABLE_ENTITY', details?: Record<string, any>) {
    return new ApiError(message, 422, code, details);
  }

  static tooManyRequests(message: string = 'Too many requests', code: string = 'TOO_MANY_REQUESTS') {
    return new ApiError(message, 429, code);
  }

  static internal(message: string = 'Internal server error', code: string = 'INTERNAL_ERROR') {
    return new ApiError(message, 500, code);
  }

  static serviceUnavailable(message: string = 'Service unavailable', code: string = 'SERVICE_UNAVAILABLE') {
    return new ApiError(message, 503, code);
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

// Validation error class
export class ValidationError extends ApiError {
  public readonly validationErrors: Array<{
    field: string;
    message: string;
    code: string;
  }>;

  constructor(
    message: string,
    validationErrors: Array<{
      field: string;
      message: string;
      code: string;
    }>
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.validationErrors = validationErrors;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      validationErrors: this.validationErrors,
    };
  }
}

// Database error class
export class DatabaseError extends ApiError {
  constructor(message: string, originalError?: Error) {
    super(message, 500, 'DATABASE_ERROR', {
      originalError: originalError?.message,
    });
  }
}

// Authentication error class
export class AuthenticationError extends ApiError {
  constructor(message: string, code: string = 'AUTHENTICATION_ERROR') {
    super(message, 401, code);
  }
}

// Authorization error class
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions', code: string = 'AUTHORIZATION_ERROR') {
    super(message, 403, code);
  }
}

// Rate limit error class
export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// File upload error class
export class FileUploadError extends ApiError {
  constructor(message: string, code: string = 'FILE_UPLOAD_ERROR') {
    super(message, 400, code);
  }
}

// External service error class
export class ExternalServiceError extends ApiError {
  public readonly service: string;

  constructor(message: string, service: string, statusCode: number = 502) {
    super(message, statusCode, 'EXTERNAL_SERVICE_ERROR', { service });
    this.service = service;
  }
}
