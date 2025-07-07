import { create } from 'zustand';
import authService from '../../services/functions/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStore, PendingProfileCompletionState, User, UserType, RegisterData, OtpVerificationData } from '../../types/common';
import apiClient from '../../services/apiClient';

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tempEmail: null,
  token: null,
  userType: null,
  pendingProfileCompletion: { isPending: false, userType: null, email: null, step: null },

  setToken: async (token: string) => {
    try {
      if (!token) {
        console.warn('setToken called with empty/undefined token, skipping storage');
        return;
      }
      await AsyncStorage.setItem('userToken', token);
      set({ token });
    } catch (e: any) {
      console.error('Tokeni saxlamaq mümkün olmadı:', e.message);
    }
  },

  setUserData: async (userData: { user: User; userType: UserType; pendingProfileCompletionStatus: boolean; email: string }) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (e: any) {
      console.error('User data saxlamaq mümkün olmadı:', e.message);
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      set({ token: null });
    } catch (e: any) {
      console.error('Tokeni silmək mümkün olmadı:', e.message);
    }
  },

  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tempEmail: null,
      token: null,
      userType: null,
      pendingProfileCompletion: { isPending: false, userType: null, email: null, step: null },
    });
    get().removeToken();
  },

  setPendingProfileCompletionState: (state: PendingProfileCompletionState) => {
    set({ pendingProfileCompletion: state });
  },

  clearError: () => {
    set({ error: null });
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      
      console.log('Login API response:', {
        fullResponse: response.data,
        hasToken: !!response.data.token,
        hasRefreshToken: !!response.data.refreshToken,
        hasUserType: !!response.data.userType,
        hasPendingStatus: !!response.data.pendingProfileCompletionStatus
      });
      
      const { token, user, userType: userTypeNumber, pendingProfileCompletionStatus } = response.data;
      
      // Map numeric userType to string
      const userTypeMap: { [key: number]: UserType } = {
        2: 'driver',
        3: 'company_provider', 
        4: 'individual_provider'
      };
      
      const userType = userTypeMap[userTypeNumber];
      
      if (!userType) {
        console.error('Invalid userType received:', userTypeNumber);
        throw new Error('Invalid user type received from server');
      }
      
      console.log('UserType mapping:', {
        numeric: userTypeNumber,
        mapped: userType
      });
      
      await get().setToken(token);
      await get().setUserData({
        user: user as User,
        userType: userType,
        pendingProfileCompletionStatus: pendingProfileCompletionStatus || false,
        email: credentials.email
      });
      
      set({
        user: user as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        userType: userType,
        pendingProfileCompletion: {
          isPending: pendingProfileCompletionStatus || false,
          userType: userType,
          email: credentials.email,
          step: 'personalInfo'
        },
      });
      return response.data;
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            errorMessage = data?.message || 'Yanlış məlumat daxil edilib.';
            break;
          case 401:
            errorMessage = data?.message || 'Email və ya şifrə yanlışdır.';
            break;
          case 404:
            errorMessage = data?.message || 'İstifadəçi tapılmadı.';
            break;
          case 422:
            errorMessage = data?.message || 'Məlumatlar düzgün deyil.';
            break;
          case 500:
            errorMessage = 'Server xətası. Zəhmət olmasa daha sonra yenidən cəhd edin.';
            break;
          default:
            errorMessage = data?.message || 'Daxil olma zamanı səhv baş verdi.';
        }
      } else if (error.request) {
        errorMessage = 'Şəbəkə xətası. İnternet bağlantınızı yoxlayın.';
      }
      
      set({ 
        error: errorMessage, 
        isLoading: false, 
        isAuthenticated: false, 
        user: null, 
        token: null, 
        userType: null, 
        pendingProfileCompletion: { isPending: false, userType: null, email: null, step: null } 
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout(); 
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      get().clearAuth();
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUserData = await AsyncStorage.getItem('userData');
      
      if (storedToken) {
        set({ token: storedToken, isAuthenticated: true }); 
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            const { user, userType, pendingProfileCompletionStatus, email } = userData;
            
            set({
              user: user as User,
              userType: userType as UserType,
              pendingProfileCompletion: {
                isPending: pendingProfileCompletionStatus || false,
                userType: userType as UserType,
                email: email,
                step: 'personalInfo'
              },
            });
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            // If parsing fails, clear auth and require re-login
            get().clearAuth();
          }
        } else {
          // No stored user data and no API available
          // This means user logged in from another device but we can't get their data
          console.warn('No stored user data found and no getCurrentUser API available. User will need to re-login.');
          get().clearAuth();
        }
      } else {
        set({ isAuthenticated: false, token: null });
        delete apiClient.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Autentifikasiya başlatılamadı (yerli token oxunarkən səhv):', error);
      get().clearAuth(); 
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      const { userType, email, password, repeatPassword, selectedServices } = userData;

      set({ tempEmail: email });

      switch (userType) {
        case 'driver':
          response = await authService.registerDriver({ email, password, repeatPassword, userType });
          break;
        case 'company_provider':
          response = await authService.registerCompanyProvider({ email, password, repeatPassword, selectedServices, userType });
          break;
        case 'individual_provider':
          response = await authService.registerIndividualProvider({ email, password, repeatPassword, selectedServices, userType });
          break;
        default:
          throw new Error('Yanlış istifadəçi növü seçilib.');
      }

      set({ 
        isLoading: false, 
        error: null, 
        userType: userType,
        pendingProfileCompletion: { isPending: true, userType: userType, email: email, step: 'personalInfo' }
      }); 
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Qeydiyyat zamanı səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  resendOtp: async (email: string, userType: UserType) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      switch (userType) {
        case 'driver':
          response = await authService.resendDriverOtp(email);
          break;
        case 'company_provider':
          response = await authService.resendCompanyProviderOtp(email);
          break;
        case 'individual_provider':
          response = await authService.resendIndividualProviderOtp(email);
          break;
        default:
          throw new Error('Yanlış istifadəçi növü seçilib, OTP yenidən göndərilə bilmədi.');
      }
      set({ isLoading: false, error: null });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP-ni yenidən göndərmək mümkün olmadı.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.requestPasswordReset(email);
      set({ isLoading: false, error: null, tempEmail: email });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Şifrə sıfırlama kodu göndərilərkən səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  resendPasswordResetOtp: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.resendPasswordResetOtp(email);
      set({ isLoading: false, error: null });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP kodu yenidən göndərilərkən səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  verifyOtp: async (otpData: OtpVerificationData & { isPasswordReset?: boolean }) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      const { userType, token, email, isPasswordReset } = otpData;

      if (isPasswordReset) {
        response = await authService.validatePasswordResetToken(email, token);
        set({
          isLoading: false,
          error: null,
          tempEmail: null,
        });
        return response.data;
      } else {
        switch (userType) {
          case 'driver':
            response = await authService.verifyDriver({ email, token, userType });
            break;
          case 'company_provider':
            response = await authService.verifyCompanyProvider({ email, token, userType });
            break;
          case 'individual_provider':
            response = await authService.verifyIndividualProvider({ email, token, userType });
            break;
          default:
            throw new Error('Yanlış istifadəçi növü seçilib.');
        }

        console.log('Raw API response data:', response.data);
        
        // Try to extract data with different possible field names
        const user = response.data.user || response.data.data?.user || response.data;
        const authToken = response.data.authToken || response.data.token || response.data.access_token || response.data.data?.token;
        const pendingProfileCompletionStatus = response.data.pendingProfileCompletionStatus || response.data.data?.pendingProfileCompletionStatus || true;
        
        console.log('OTP verification response:', {
          user: user?.email,
          authToken: authToken ? 'present' : 'missing',
          pendingProfileCompletionStatus,
          fullResponse: response.data
        });
        
        // Check if we have the minimum required data for successful verification
        if (!user && !authToken) {
          console.error('OTP verification failed: Missing user data and auth token');
          throw new Error('OTP verification failed: Invalid response from server');
        }
        
        if (authToken) {
          await get().setToken(authToken);
        } else {
          console.warn('No authToken received from OTP verification response');
        }
        
        // Store user data for app initialization
        await get().setUserData({
          user: user as User,
          userType: userType as UserType,
          pendingProfileCompletionStatus: pendingProfileCompletionStatus !== false,
          email: email
        });
        
        set({
          user: user as User,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          tempEmail: null,
          userType: userType as UserType,
          pendingProfileCompletion: {
            isPending: pendingProfileCompletionStatus !== false,
            userType: userType as UserType,
            email: email,
            step: 'serviceSelection'
          },
        });
        return response.data;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP təsdiqlənərkən səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updatePassword: async (data: { email: string; token: string; newPassword: string; repeatPassword: string }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.updatePassword(data);
      set({ isLoading: false, error: null });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Şifrə yenilənərkən səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  completeProfile: async (email: string, firstName: string, lastName: string, phone: string, userType: UserType, dateOfBirth?: string, businessName?: string, taxId?: string) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      
      switch (userType) {
        case 'driver':
          response = await authService.completeDriverProfile({ 
            name: firstName, 
            surname: lastName, 
            birthday: dateOfBirth || new Date().toISOString().split('T')[0], 
            phone: phone || ''
          });
          break;
        case 'individual_provider':
          response = await authService.completeIndividualProviderProfile({ 
            name: firstName, 
            surname: lastName, 
            description: businessName || '', 
            phone, 
            birthday: dateOfBirth || new Date().toISOString().split('T')[0]
          });
          break;
        case 'company_provider':
          response = await authService.completeCompanyProviderProfile({ 
            companyName: businessName || '', 
            phone, 
            description: taxId || ''
          });
          break;
        default:
          throw new Error('Yanlış istifadəçi növü seçilib.');
      }

      // After personal info completion, keep pending profile completion for service selection
      console.log('Personal info completion successful, keeping pending state for service selection:', {
        userType,
        responseData: response.data
      });
      
      set({ 
        isLoading: false, 
        error: null,
        // Keep pending profile completion for service selection step
        pendingProfileCompletion: { isPending: true, userType: userType, email: email, step: 'serviceSelection' },
        isAuthenticated: true,
        userType: userType
      });
      
      console.log('State updated after personal info completion');
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profil tamamlama zamanı səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      return { success: false, message: errorMessage };
    }
  },
}));

export default useAuthStore;