import apiClient from '../apiClient';
import { RegisterData, OtpVerificationData } from '../../types/common';

const authService = {
  // ===== AUTHENTICATION =====
  login: (credentials: any) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),


  // ===== DRIVER REGISTRATION & VERIFICATION =====
  registerDriver: (userData: RegisterData) => apiClient.post('/api/drivers', userData),
  verifyDriver: (verificationData: OtpVerificationData) => apiClient.post('/api/drivers/verify', verificationData),
  completeDriverProfile: (data: { name: string; surname: string; birthday: string; phone: string; email: string }) =>
    apiClient.post('/api/drivers/complete-registration', data),
  resendDriverOtp: (email: string) => {
    console.log("authService.resendDriverOtp: Making API call to /api/drivers/auth/resend-code with email:", email);
    const payload = { email };
    console.log("authService.resendDriverOtp: Request payload:", payload);
    return apiClient.post('/api/drivers/auth/resend-code', payload);
  },

  // ===== COMPANY PROVIDER REGISTRATION & VERIFICATION =====
  registerCompanyProvider: (userData: RegisterData) => apiClient.post('/api/company-providers', userData),
  verifyCompanyProvider: (verificationData: OtpVerificationData) => apiClient.post('/api/company-providers/verify', verificationData),
  completeCompanyProviderProfile: (data: { companyName: string; phone: string; description: string; email: string }) =>
    apiClient.post('/api/company-providers/complete-registration-company', data),
  resendCompanyProviderOtp: (email: string) => apiClient.post('/api/company-providers/auth/resend-code', { email }),

  // ===== INDIVIDUAL PROVIDER REGISTRATION & VERIFICATION =====
  registerIndividualProvider: (userData: RegisterData) => apiClient.post('/api/individual-providers', userData),
  verifyIndividualProvider: (verificationData: OtpVerificationData) => apiClient.post('/api/individual-providers/verify', verificationData),
  completeIndividualProviderProfile: async (data: { name: string; surname: string; dayTimes: Array<{ dayOfWeek: string; startTime: string; endTime: string; isOpen: number }>; phone: string; address: string; birthday: string }) => {
    console.log('authService.completeIndividualProviderProfile: Making API call with data:', data);
    console.log('authService.completeIndividualProviderProfile: API endpoint: /api/individual-providers/complete-registration-individual');
    try {
      const response = await apiClient.post('/api/individual-providers/complete-registration-individual', data);
      console.log('authService.completeIndividualProviderProfile: Success response:', response.data);
      return response;
    } catch (error: any) {
      console.log('authService.completeIndividualProviderProfile: Error response:', error.response?.data);
      throw error;
    }
  },
  resendIndividualProviderOtp: (email: string) => apiClient.post('/api/individual-providers/auth/resend-code', { email }),

  // ===== PASSWORD MANAGEMENT =====
  requestPasswordReset: (email: string) => {
    console.log("authService.requestPasswordReset: Making API call to /api/passwords/reset-request with email:", email);
    return apiClient.post('/api/passwords/reset-request', { email });
  },
  resendPasswordResetOtp: (email: string) => apiClient.post('/api/passwords/auth/resend-code', { email }),
  validatePasswordResetToken: (email: string, token: string, refreshToken: string) => apiClient.post('/api/passwords/validate-token', { email, token, refreshToken }),
  updatePassword: (data: { email: string; token: string; newPassword: string; repeatPassword: string }) => apiClient.post('/api/passwords/update-password', data),

  // ===== SERVICES MANAGEMENT =====
  getServices: () => apiClient.get('/api/services'),
  getServiceTags: (serviceId: number) => apiClient.get(`/api/tags/service/${serviceId}`),

  // ===== USER PROFILE MANAGEMENT =====
  getDriverInformation: () => apiClient.get('/api/drivers/information'),
  getIndividualProviderInformation: () => apiClient.get('/api/individual-providers/information'),
  getCompanyProviderInformation: () => apiClient.get('/api/company-providers/information'),

  // ===== PROVIDER SERVICES MANAGEMENT =====
  updateIndividualProviderServices: (serviceIds: number[]) => apiClient.post('/api/individual-providers/services', { serviceIds }),
  updateCompanyProviderServices: (serviceIds: number[]) => apiClient.post('/api/company-providers/services', { serviceIds }),
  
  // ===== PROVIDER TAGS MANAGEMENT =====
  updateIndividualProviderTags: (tagIds: number[]) => apiClient.post('/api/individual-providers/tags', { tagIds }),
  updateCompanyProviderTags: (tagIds: number[]) => apiClient.post('/api/company-providers/tags', { tagIds }),
};

export default authService;