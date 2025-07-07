import apiClient from '../apiClient';
import { RegisterData, OtpVerificationData } from '../../types/common';

const authService = {
  // ===== AUTHENTICATION =====
  login: (credentials: any) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),


  // ===== DRIVER REGISTRATION & VERIFICATION =====
  registerDriver: (userData: RegisterData) => apiClient.post('/api/drivers', userData),
  verifyDriver: (verificationData: OtpVerificationData) => apiClient.post('/api/drivers/verify', verificationData),
  completeDriverProfile: (data: { name: string; surname: string; birthday: string; phone: string }) => 
    apiClient.post('/api/drivers/complete-registration', data),
  resendDriverOtp: (email: string) => apiClient.post('/api/drivers/auth/resend-code', { email }),

  // ===== COMPANY PROVIDER REGISTRATION & VERIFICATION =====
  registerCompanyProvider: (userData: RegisterData) => apiClient.post('/api/company-providers', userData),
  verifyCompanyProvider: (verificationData: OtpVerificationData) => apiClient.post('/api/company-providers/verify', verificationData),
  completeCompanyProviderProfile: (data: { name: string; surname: string; phone: string; description: string }) => 
    apiClient.post('/api/company-providers/complete-registration-company', data),
  resendCompanyProviderOtp: (email: string) => apiClient.post('/api/company-providers/auth/resend-code', { email }),

  // ===== INDIVIDUAL PROVIDER REGISTRATION & VERIFICATION =====
  registerIndividualProvider: (userData: RegisterData) => apiClient.post('/api/individual-providers', userData),
  verifyIndividualProvider: (verificationData: OtpVerificationData) => apiClient.post('/api/individual-providers/verify', verificationData),
  completeIndividualProviderProfile: (data: { name: string; surname: string; description: string; phone: string; birthday: string }) => 
    apiClient.post('/api/individual-providers/complete-registration-individual', data),
  resendIndividualProviderOtp: (email: string) => apiClient.post('/api/individual-providers/auth/resend-code', { email }),

  // ===== PASSWORD MANAGEMENT =====
  requestPasswordReset: (email: string) => apiClient.post('/api/passwords/reset-request', { email }),
  resendPasswordResetOtp: (email: string) => apiClient.post('/api/passwords/auth/resend-code', { email }),
  validatePasswordResetToken: (email: string, token: string) => apiClient.post('/api/passwords/validate-token', { email, token }),
  updatePassword: (data: { email: string; token: string; newPassword: string; repeatPassword: string }) => apiClient.post('/api/passwords/update-password', data),

  // ===== SERVICES MANAGEMENT =====
  getServices: () => apiClient.get('/api/services'),

  // ===== USER PROFILE MANAGEMENT =====
  getDriverInformation: () => apiClient.get('/api/drivers/information'),
  getIndividualProviderInformation: () => apiClient.get('/api/individual-providers/information'),
  getCompanyProviderInformation: () => apiClient.get('/api/company-providers/information'),

  // ===== PROVIDER SERVICES MANAGEMENT =====
  updateIndividualProviderServices: (serviceIds: number[]) => apiClient.post('/api/individual-providers/services', { serviceIds }),
  updateCompanyProviderServices: (serviceIds: number[]) => apiClient.post('/api/company-providers/services', { serviceIds }),
};

export default authService;