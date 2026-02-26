// User Types
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Motorbike Types
export enum MotorbikeType {
  MANUAL = 'MANUAL',      // Xe số
  SCOOTER = 'SCOOTER',    // Xe ga
  SEMI_AUTO = 'SEMI_AUTO', // Xe côn
}

export enum MotorbikeStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  UNAVAILABLE = 'UNAVAILABLE',
}

export interface Motorbike {
  id: string;
  name: string;
  type: MotorbikeType;
  pricePerDay: number;
  description?: string;
  status: MotorbikeStatus;
  licensePlate: string;
  year?: number;
  images: string[];
  fuelCapacity?: string;
  engineSize?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Rental Types
export enum RentalStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Rental {
  id: string;
  userId: string;
  motorbikeId: string;
  startDate: Date;
  endDate: Date;
  pickupLocation: string;
  returnLocation: string;
  status: RentalStatus;
  totalPrice: number;
  numberOfDays: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  E_WALLET = 'E_WALLET',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string;
  rentalId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  transactionDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface Review {
  id: string;
  rentalId: string;
  userId: string;
  motorbikeId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
