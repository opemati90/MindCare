// API Types and Interfaces

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description?: string;
}

export interface ApiRoutes {
  // Auth routes
  auth: {
    login: ApiEndpoint;
    register: ApiEndpoint;
    refresh: ApiEndpoint;
    logout: ApiEndpoint;
    resetPassword: ApiEndpoint;
    changePassword: ApiEndpoint;
    verifyEmail: ApiEndpoint;
  };
  
  // User routes
  users: {
    getProfile: ApiEndpoint;
    updateProfile: ApiEndpoint;
    getUsers: ApiEndpoint;
    getUserById: ApiEndpoint;
    createUser: ApiEndpoint;
    updateUser: ApiEndpoint;
    deleteUser: ApiEndpoint;
  };
  
  // Patient routes
  patients: {
    getPatients: ApiEndpoint;
    getPatientById: ApiEndpoint;
    createPatient: ApiEndpoint;
    updatePatient: ApiEndpoint;
    getPatientMedicalRecords: ApiEndpoint;
    createMedicalRecord: ApiEndpoint;
    updateMedicalRecord: ApiEndpoint;
  };
  
  // Provider routes
  providers: {
    getProviders: ApiEndpoint;
    getProviderById: ApiEndpoint;
    createProvider: ApiEndpoint;
    updateProvider: ApiEndpoint;
    getProviderAvailability: ApiEndpoint;
    updateProviderAvailability: ApiEndpoint;
    getProviderSpecialties: ApiEndpoint;
  };
  
  // Appointment routes
  appointments: {
    getAppointments: ApiEndpoint;
    getAppointmentById: ApiEndpoint;
    createAppointment: ApiEndpoint;
    updateAppointment: ApiEndpoint;
    cancelAppointment: ApiEndpoint;
    getAvailableSlots: ApiEndpoint;
  };
  
  // Notification routes
  notifications: {
    getNotifications: ApiEndpoint;
    markAsRead: ApiEndpoint;
    markAllAsRead: ApiEndpoint;
    deleteNotification: ApiEndpoint;
  };
}

export interface RequestConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  withCredentials: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
}

export interface HttpError extends Error {
  status: number;
  statusText: string;
  data?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiValidationError extends ApiError {
  validationErrors: ValidationError[];
}

// WebSocket Types
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id: string;
}

export interface WebSocketEvent {
  APPOINTMENT_UPDATED: 'appointment_updated';
  NOTIFICATION_RECEIVED: 'notification_received';
  USER_STATUS_CHANGED: 'user_status_changed';
  MESSAGE_RECEIVED: 'message_received';
}

export interface WebSocketConnection {
  id: string;
  userId: string;
  connectedAt: Date;
  lastActivity: Date;
}

// File Upload Types
export interface FileUploadRequest {
  file: File | Buffer;
  fileName: string;
  fileType: string;
  category: FileCategory;
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
}

export enum FileCategory {
  PROFILE_PICTURE = 'PROFILE_PICTURE',
  MEDICAL_DOCUMENT = 'MEDICAL_DOCUMENT',
  INSURANCE_DOCUMENT = 'INSURANCE_DOCUMENT',
  LAB_RESULT = 'LAB_RESULT',
  PRESCRIPTION = 'PRESCRIPTION',
  OTHER = 'OTHER'
}

// Analytics Types
export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
}

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  userGrowth: Array<{ date: string; count: number }>;
}

// Health Check Types
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  version: string;
  uptime: number;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  lastChecked: Date;
  error?: string;
}
