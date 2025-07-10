// src/types/common.ts

export type UserType = 'driver' | 'individual_provider' | 'company_provider';

// Login Credentials interfeysi əlavə edildi
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PendingProfileCompletionState {
  isPending: boolean;
  userType: UserType | null;
  email: string | null;
  step: 'personalInfo' | 'serviceSelection' | 'products' | 'branches' | null;
}

export interface OtpResendState {
  resendAttempts: number;
  lastResendTime: number | null;
  lockoutUntil: number | null;
  isLockedOut: boolean;
  
  passwordResetResendAttempts: number;
  passwordResetLastResendTime: number | null;
  passwordResetLockoutUntil: number | null;
  isPasswordResetLockedOut: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  surname?: string;
  phone?: string;
  birthday?: string;
  companyName?: string;
  description?: string;
}

export interface Service {
  id: number;
  serviceName: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication state propertiləri
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tempEmail: string | null;
  token: string | null;
  userType: UserType | null;
  pendingProfileCompletion: PendingProfileCompletionState;
  isPasswordResetFlowActive: boolean;
  isOtpVerifiedForPasswordReset: boolean;
  otpResendState: OtpResendState; 
  passwordResetToken: string | null;
}

// Authentication actions propertiləri
export interface AuthActions {
  setToken: (token: string) => Promise<void>;
  setUserData: (userData: { user: User; userType: UserType; pendingProfileCompletionStatus: boolean; email: string }) => Promise<void>;
  removeToken: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<any>; // LoginCredentials əlavə edildi
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  register: (userData: RegisterData) => Promise<any>;
  verifyOtp: (otpData: OtpVerificationData) => Promise<any>;
  resendOtp: (email: string, userType: UserType) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resendPasswordResetOtp: (email: string) => Promise<any>;
  updatePassword: (data: { email: string; token: string; newPassword: string; repeatPassword: string }) => Promise<any>;
  completeProfile: (email: string, firstName: string, lastName: string, phone: string, userType: UserType, dateOfBirth?: string, businessName?: string, taxId?: string) => Promise<{ success: boolean; data?: any; message?: string; nextStep?: 'serviceSelection' | 'products' | 'branches' | null }>;
  clearAuth: () => void;
  clearError: () => void;
  setPendingProfileCompletionState: (state: PendingProfileCompletionState) => void;
  fetchUserInformation: (forceRefresh?: boolean) => Promise<void>;
  checkAuthenticationState: () => AuthState;
  validateProfileCompletionState: () => { isValid: boolean; errors: string[]; warnings: string[] };
  resetOtpResendState: () => void;
  incrementOtpResendAttempts: () => void;
  setOtpLockout: (lockoutUntil: number) => void;
  saveOtpResendState: (otpResendState: OtpResendState) => Promise<void>;
  loadOtpResendState: () => Promise<OtpResendState | null>;
  ensureApiClientAuth: () => void;
  incrementPasswordResetOtpResendAttempts: () => void;
  setPasswordResetOtpLockout: (lockoutUntil: number) => void;
  resetPasswordResetOtpState: () => void;
  clearPasswordResetFlow: () => void;
  clearCorruptedData: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

export interface RegisterData {
  email: string;
  password: string;
  repeatPassword: string;
  userType: UserType;
  selectedServices?: string[];
}

export interface OtpVerificationData {
  email: string;
  token: string;
  userType?: UserType;
  isPasswordReset?: boolean;
}