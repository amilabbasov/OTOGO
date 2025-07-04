// User Type Constants - Single source of truth
export const USER_TYPES = {
  DRIVER: 'driver',
  SOLE_PROVIDER: 'sole_provider',
  CORPORATE_PROVIDER: 'corporate_provider'
} as const;

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES];

// Backend user type IDs mapping
export const USER_TYPE_IDS = {
  [USER_TYPES.DRIVER]: 2,
  [USER_TYPES.SOLE_PROVIDER]: 4,
  [USER_TYPES.CORPORATE_PROVIDER]: 3
} as const;

// Registration API endpoints
export const REGISTRATION_ENDPOINTS = {
  DRIVER: {
    register: '/api/drivers',
    verify: '/api/drivers/verify',
    complete: '/api/drivers/complete-registration',
    resend: '/api/drivers/auth/resend-code'
  },
  PROVIDER: {
    register: '/api/providers',
    verify: '/api/providers/verify',
    complete: '/api/providers/complete-profile',
    resend: '/api/providers/auth/resend-code'
  }
} as const;

// Registration states
export const REGISTRATION_STATES = {
  INITIAL: 'initial',
  USER_TYPE_SELECTED: 'user_type_selected',
  REGISTERED: 'registered',
  OTP_VERIFIED: 'otp_verified',
  PROFILE_COMPLETED: 'profile_completed',
  COMPLETED: 'completed'
} as const;

export type RegistrationState = typeof REGISTRATION_STATES[keyof typeof REGISTRATION_STATES];

// Error types
export const REGISTRATION_ERRORS = {
  USER_NOT_FOUND: 'user_not_found',
  INVALID_OTP: 'invalid_otp',
  EXPIRED_OTP: 'expired_otp',
  NETWORK_ERROR: 'network_error',
  VALIDATION_ERROR: 'validation_error',
  DUPLICATE_EMAIL: 'duplicate_email',
  WEAK_PASSWORD: 'weak_password',
  TOKEN_MISSING: 'token_missing'
} as const;

export type RegistrationError = typeof REGISTRATION_ERRORS[keyof typeof REGISTRATION_ERRORS];

// Helper functions
export const getUserTypeId = (userType: UserType): number => {
  return USER_TYPE_IDS[userType];
};

export const getRegistrationEndpoints = (userType: UserType) => {
  return userType === USER_TYPES.DRIVER 
    ? REGISTRATION_ENDPOINTS.DRIVER 
    : REGISTRATION_ENDPOINTS.PROVIDER;
};

export const isProviderType = (userType: UserType): boolean => {
  return userType === USER_TYPES.SOLE_PROVIDER || userType === USER_TYPES.CORPORATE_PROVIDER;
};

export const isDriverType = (userType: UserType): boolean => {
  return userType === USER_TYPES.DRIVER;
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateDateOfBirth = (dateString: string): boolean => {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) return false;
  
  const [, day, month, year] = match;
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  
  // Basic validation
  if (dayNum < 1 || dayNum > 31) return false;
  if (monthNum < 1 || monthNum > 12) return false;
  if (yearNum < 1900 || yearNum > currentYear) return false;
  
  // Check if it's a valid date
  const testDate = new Date(yearNum, monthNum - 1, dayNum);
  return testDate.getDate() === dayNum && 
         testDate.getMonth() === monthNum - 1 && 
         testDate.getFullYear() === yearNum;
};

export const formatDateForAPI = (dateString: string): string => {
  // Convert DD/MM/YYYY to YYYY-MM-DD
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) return new Date().toISOString().split('T')[0];
  
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};
