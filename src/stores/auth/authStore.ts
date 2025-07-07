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
      console.log('Saving token to AsyncStorage:', token.substring(0, 10) + '...');
      await AsyncStorage.setItem('userToken', token);
      console.log('Token saved successfully');
      set({ token });
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (e: any) {
      console.error('Tokeni saxlamaq mümkün olmadı:', e.message);
    }
  },

  setUserData: async (userData: { user: User; userType: UserType; pendingProfileCompletionStatus: boolean; email: string }) => {
    try {
      console.log('Saving user data to AsyncStorage:', userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('User data saved successfully');
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

  fetchUserInformation: async (forceRefresh = false) => {
    try {
      const currentUserType = get().userType;
      const currentUser = get().user;
      
      if (!currentUserType) {
        return;
      }
      
      // Only skip API call if we have complete data and not forcing refresh
      if (!forceRefresh && currentUser && currentUser.name && currentUser.surname && currentUser.phone) {
        console.log('User information already available from stored data:', currentUser);
        return;
      }
      
      const token = get().token;
      if (token) {
        try {
          let response;
          switch (currentUserType) {
            case 'driver':
              response = await authService.getDriverInformation();
              break;
            case 'individual_provider':
              response = await authService.getIndividualProviderInformation();
              break;
            case 'company_provider':
              response = await authService.getCompanyProviderInformation();
              break;
            default:
              console.warn('Unknown user type for fetching information:', currentUserType);
              return;
          }
          
          if (response.data) {
            const userData = response.data;
            const updatedUser: User = {
              id: userData.id || currentUser?.id || '',
              email: userData.email || currentUser?.email || '',
              userType: currentUserType,
              name: userData.name,
              surname: userData.surname,
              birthday: userData.birthday,
              phone: userData.phone,
              // For company providers, description contains company info
              companyName: currentUserType === 'company_provider' ? userData.companyName : undefined,
            };
            
            set({ user: updatedUser });
            
            await get().setUserData({
              user: updatedUser,
              userType: currentUserType,
              pendingProfileCompletionStatus: get().pendingProfileCompletion.isPending,
              email: updatedUser.email
            });
          }
        } catch (apiError: any) {
          if (apiError.response?.status === 403 || apiError.response?.status === 401) {
            console.log('User information endpoint requires authentication, using stored data');
            return;
          }
          
          console.log('Failed to fetch user information from API:', apiError.response?.status);
          
          if (forceRefresh) {
            throw apiError;
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user information:', error);
      if (forceRefresh) {
        throw error; // Only throw if forceRefresh is true
      }
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      
      console.log('Login response data:', response.data);
      
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
      

      
      console.log('Login successful, setting token and user data...');
      await get().setToken(token);
      
      console.log('Creating login user object...');
      console.log('User from response:', user);
      console.log('UserType:', userType);
      
      // Set user data immediately from login response
      const loginUser: User = {
        id: user?.id || '',
        email: credentials.email,
        userType: userType,
        name: user?.name || '',
        surname: user?.surname || '',
        birthday: user?.birthday || '',
        phone: user?.phone || '',
        companyName: user?.companyName || undefined,
      };
      
      console.log('Login user data:', loginUser);
      console.log('About to call setUserData...');
      await get().setUserData({
        user: loginUser,
        userType: userType,
        pendingProfileCompletionStatus: pendingProfileCompletionStatus || false,
        email: credentials.email
      });
      console.log('setUserData completed');
      
      // Set user data in Zustand immediately
      set({
        user: loginUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        userType: userType,
        pendingProfileCompletion: {
          isPending: pendingProfileCompletionStatus || false,
          userType: userType,
          email: credentials.email,
          step: pendingProfileCompletionStatus ? 'serviceSelection' : null
        },
      });
      
      // Try to fetch additional user information, but don't fail if it doesn't work
      try {
        await get().fetchUserInformation();
        // Update with any additional data from the API
        const updatedUser = get().user;
        if (updatedUser) {
          set({ user: updatedUser });
          await get().setUserData({
            user: updatedUser,
            userType: userType,
            pendingProfileCompletionStatus: pendingProfileCompletionStatus || false,
            email: credentials.email
          });
        }
      } catch (fetchError) {
        console.log('Failed to fetch additional user information, using login data:', fetchError);
        // Don't fail login if fetch fails, we already have basic user data
      }
      
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
      
      console.log('Stored token:', storedToken ? 'exists' : 'not found');
      console.log('Stored user data:', storedUserData ? 'exists' : 'not found');
      
      if (storedToken) {
        set({ token: storedToken, isAuthenticated: true }); 
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            const { user, userType, pendingProfileCompletionStatus, email } = userData;
            

            
            // Set user data immediately from storage
            set({
              user: user as User,
              userType: userType as UserType,
              pendingProfileCompletion: {
                isPending: pendingProfileCompletionStatus || false,
                userType: userType as UserType,
                email: email,
                step: pendingProfileCompletionStatus ? 'serviceSelection' : null
              },
            });
            
            // Try to fetch fresh user information, but don't fail if it doesn't work
            try {
              await get().fetchUserInformation();
            } catch (fetchError) {
              console.log('Failed to fetch fresh user information on app start, using stored data:', fetchError);
              // Don't clear auth if fetch fails, we have stored data
            }
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            get().clearAuth();
          }
        } else {
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

        // Try to extract data with different possible field names
        const user = response.data.user || response.data.data?.user || response.data;
        const authToken = response.data.authToken || response.data.token || response.data.access_token || response.data.data?.token;
        const pendingProfileCompletionStatus = response.data.pendingProfileCompletionStatus || response.data.data?.pendingProfileCompletionStatus || true;
        
        // Check if we have the minimum required data for successful verification
        if (!user && !authToken) {
          throw new Error('OTP verification failed: Invalid response from server');
        }
        
        if (authToken) {
          await get().setToken(authToken);
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
      
      console.log('Completing profile for:', { email, firstName, lastName, phone, userType, dateOfBirth, businessName });
      
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
            description: businessName || ''
          });
          break;
        default:
          throw new Error('Yanlış istifadəçi növü seçilib.');
      }

      console.log('Profile completion response:', response.data);

      // Extract user data from response if available
      const responseUser = response.data?.user || response.data;
      
      // Update user object with new profile data
      const currentUser = get().user;
      const updatedUser: User = {
        id: responseUser?.id || currentUser?.id || '',
        email: responseUser?.email || currentUser?.email || email,
        userType: currentUser?.userType || userType,
        name: firstName,
        surname: lastName,
        birthday: dateOfBirth || new Date().toISOString().split('T')[0],
        phone: phone || currentUser?.phone,
        // Only set companyName for company providers
        ...(userType === 'company_provider' && { companyName: businessName }),
      };
      
      // Determine next step based on user type
      let nextStep: 'serviceSelection' | 'products' | 'branches' | null = null;
      
      if (userType === 'driver') {
        // Drivers go to car selection (serviceSelection step)
        nextStep = 'serviceSelection';
      } else if (userType === 'individual_provider') {
        // Individual providers go to products step
        nextStep = 'products';
      } else if (userType === 'company_provider') {
        // Company providers go to products step
        nextStep = 'products';
      }
      
      // Save updated user data to AsyncStorage
      await get().setUserData({
        user: updatedUser,
        userType: userType,
        pendingProfileCompletionStatus: nextStep !== null, // Still pending if there's a next step
        email: email
      });
      
      set({ 
        isLoading: false, 
        error: null,
        user: updatedUser,
        // Set next step for navigation
        pendingProfileCompletion: { 
          isPending: nextStep !== null, 
          userType: userType, 
          email: email, 
          step: nextStep 
        },
        isAuthenticated: true,
        userType: userType
      });
      
      return { success: true, data: response.data, nextStep };
    } catch (error: any) {
      console.error('Profile completion error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 'Profil tamamlama zamanı səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      return { success: false, message: errorMessage };
    }
  },
}));

export default useAuthStore;