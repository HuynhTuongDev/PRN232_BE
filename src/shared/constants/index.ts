// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
  },
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  // Motorbikes
  MOTORBIKES: {
    BASE: '/motorbikes',
    BY_ID: (id: string) => `/motorbikes/${id}`,
    SEARCH: '/motorbikes/search',
  },
  // Rentals
  RENTALS: {
    BASE: '/rentals',
    BY_ID: (id: string) => `/rentals/${id}`,
    BY_USER: (userId: string) => `/rentals/user/${userId}`,
    STATUS: (id: string) => `/rentals/${id}/status`,
  },
  // Payments
  PAYMENTS: {
    BASE: '/payments',
    BY_RENTAL: (rentalId: string) => `/payments/rental/${rentalId}`,
    STATUS: (id: string) => `/payments/${id}/status`,
  },
  // Reviews
  REVIEWS: {
    BASE: '/reviews',
    BY_MOTORBIKE: (motorbikeId: string) => `/reviews/motorbike/${motorbikeId}`,
  },
  // Chatbot
  CHATBOT: {
    MESSAGE: '/chatbot/message',
    CONFIG: '/chatbot/config',
  },
} as const;

// Service Ports
export const SERVICE_PORTS = {
  GATEWAY: 3000,
  AUTH_SERVICE: 3001,
  USER_SERVICE: 3002,
  RENTAL_SERVICE: 3003,
  PAYMENT_SERVICE: 3004,
  AI_SERVICE: 3005,
  WEB_USER: 3003,
  WEB_MANAGER: 3002,
} as const;

// Message Patterns (Microservices)
export const MESSAGE_PATTERNS = {
  // Auth Service
  AUTH: {
    REGISTER: 'auth.register',
    LOGIN: 'auth.login',
    VALIDATE: 'auth.validate',
    REFRESH: 'auth.refresh',
  },
  // User Service
  USER: {
    GET_BY_ID: 'user.getById',
    UPDATE: 'user.update',
    DELETE: 'user.delete',
    LIST: 'user.list',
  },
  // Rental Service
  RENTAL: {
    CREATE: 'rental.create',
    GET_BY_ID: 'rental.getById',
    GET_BY_USER: 'rental.getByUser',
    UPDATE_STATUS: 'rental.updateStatus',
    CHECK_AVAILABILITY: 'rental.checkAvailability',
  },
  // Payment Service
  PAYMENT: {
    CREATE: 'payment.create',
    CONFIRM: 'payment.confirm',
    GET_BY_RENTAL: 'payment.getByRental',
  },
  // AI Service
  AI: {
    CHAT: 'ai.chat',
    CONFIG: 'ai.config',
  },
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
  RATING: {
    MIN: 1,
    MAX: 5,
  },
} as const;
