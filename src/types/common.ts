export type UserType = 'driver' | 'individual_provider' | 'company_provider';

export interface PendingProfileCompletionState {
  isPending: boolean;
  userType: UserType | null;
  email: string | null;
  step: 'personalInfo' | 'serviceSelection' | 'products' | 'branches' | null;
}

export interface User {
  id: string;
  email: string;
  userType: UserType;
  name?: string;
  companyName?: string;
}

export interface Service {
  id: number;
  serviceName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tempEmail: string | null;
  token: string | null;
  userType: UserType | null;
  pendingProfileCompletion: PendingProfileCompletionState;
}

export interface AuthActions {
  setToken: (token: string) => Promise<void>;
  setUserData: (userData: { user: User; userType: UserType; pendingProfileCompletionStatus: boolean; email: string }) => Promise<void>;
  removeToken: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  register: (userData: RegisterData) => Promise<any>;
  verifyOtp: (otpData: OtpVerificationData) => Promise<any>;
  resendOtp: (email: string, userType: UserType) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resendPasswordResetOtp: (email: string) => Promise<any>;
  updatePassword: (data: { email: string; token: string; newPassword: string; repeatPassword: string }) => Promise<any>;
  completeProfile: (email: string, firstName: string, lastName: string, phone: string, userType: UserType, dateOfBirth?: string, businessName?: string, taxId?: string) => Promise<{ success: boolean; data?: any; message?: string }>;
  clearAuth: () => void;
  clearError: () => void;
  setPendingProfileCompletionState: (state: PendingProfileCompletionState) => void;
}

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
  userType: UserType;
}

export type AuthStore = AuthState & AuthActions;