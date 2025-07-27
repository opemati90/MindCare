// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export enum UserRole {
  PATIENT = 'PATIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface UserProfile {
  id: string;
  userId: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: Address;
  emergencyContact?: EmergencyContact;
  profilePicture?: string;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

// Patient Types
export interface Patient extends User {
  role: UserRole.PATIENT;
  medicalRecords: MedicalRecord[];
  appointments: Appointment[];
  insuranceInfo?: InsuranceInfo;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId: string;
  visitDate: Date;
  diagnosis: string;
  treatment: string;
  medications: Medication[];
  notes?: string;
  attachments: MedicalAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  instructions?: string;
}

export interface MedicalAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
}

export interface InsuranceInfo {
  id: string;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate: Date;
  expirationDate?: Date;
}

// Healthcare Provider Types
export interface HealthcareProvider extends User {
  role: UserRole.PROVIDER;
  license: ProviderLicense;
  specialties: Specialty[];
  availability: ProviderAvailability[];
  patients: Patient[];
}

export interface ProviderLicense {
  id: string;
  licenseNumber: string;
  state: string;
  expirationDate: Date;
  isActive: boolean;
}

export interface Specialty {
  id: string;
  name: string;
  description?: string;
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

// Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  scheduledAt: Date;
  duration: number; // in minutes
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  telehealth?: TelehealthInfo;
  createdAt: Date;
  updatedAt: Date;
}

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP',
  EMERGENCY = 'EMERGENCY',
  TELEHEALTH = 'TELEHEALTH',
  ROUTINE_CHECKUP = 'ROUTINE_CHECKUP'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface TelehealthInfo {
  meetingUrl: string;
  meetingId: string;
  password?: string;
  platform: TelehealthPlatform;
}

export enum TelehealthPlatform {
  ZOOM = 'ZOOM',
  TEAMS = 'TEAMS',
  WEBEX = 'WEBEX',
  CUSTOM = 'CUSTOM'
}

// API Response Types are now in api.ts

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form and Validation Types
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  profile?: Partial<UserProfile>;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  profile?: Partial<UserProfile>;
}

export interface CreateAppointmentRequest {
  providerId: string;
  scheduledAt: string;
  duration: number;
  type: AppointmentType;
  reason: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  scheduledAt?: string;
  duration?: number;
  type?: AppointmentType;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentFilters extends SearchFilters {
  providerId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProviderFilters extends SearchFilters {
  specialtyId?: string;
  isAvailable?: boolean;
  location?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

export enum NotificationType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE'
}

// Export all types
export * from './auth';
export * from './api';
