import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserType, AuthUser } from '../../types/common';
import axiosInstance from '../../services/axiosInstance';
import { 
  USER_TYPES, 
  getUserTypeId, 
  getRegistrationEndpoints, 
  REGISTRATION_ERRORS,
  validateEmail,
  validatePassword,
  formatDateForAPI,
  type RegistrationError
} from '../../constants/registration';

// Simplified role validation
export const validateUserRoles = (roles: string[]): UserType => {
  if (!roles || roles.length === 0) {
    throw new Error('User has no roles assigned');
  }

  if (roles.includes('ROLE_DRIVER')) return USER_TYPES.DRIVER;
  if (roles.includes('ROLE_SOLE_PROVIDER')) return USER_TYPES.SOLE_PROVIDER;
  if (roles.includes('ROLE_CORPORATE_PROVIDER')) return USER_TYPES.CORPORATE_PROVIDER;
  if (roles.includes('ROLE_PROVIDER')) return USER_TYPES.SOLE_PROVIDER; // Legacy support

  // Check detailed roles
  const hasDriverRole = roles.some(role => role.includes('_DRIVER'));
  const hasSoleProviderRole = roles.some(role => role.includes('_SOLE_PROVIDER'));
  const hasCorporateProviderRole = roles.some(role => role.includes('_CORPORATE_PROVIDER'));

  if (hasDriverRole) return USER_TYPES.DRIVER;
  if (hasSoleProviderRole) return USER_TYPES.SOLE_PROVIDER;
  if (hasCorporateProviderRole) return USER_TYPES.CORPORATE_PROVIDER;

  // Default fallback
  if (roles.includes('ROLE_LOGIN') || roles.includes('ROLE_USER')) {
    return USER_TYPES.DRIVER;
  }

  throw new Error(`Invalid user roles: ${roles.join(', ')}`);
};

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  userType: UserType | null;
  isLoading: boolean;
  registrationError: RegistrationError | null;
  pendingProfileCompletion: { email: string; userType: UserType | null } | null;
  
  // Actions
  checkToken: () => Promise<void>;
  clearAuth: () => Promise<void>;
  clearRegistrationError: () => void;
  signup: (email: string, password: string, repeatPassword: string, userType: UserType) => Promise<{ success: boolean; message?: string; requiresOTP?: boolean; error?: RegistrationError }>;
  verifyOTP: (email: string, otpCode: string, userType: UserType) => Promise<{ success: boolean; message?: string; requiresProfile?: boolean; error?: RegistrationError }>;
  resendOTP: (email: string, userType: UserType) => Promise<{ success: boolean; message?: string; error?: RegistrationError }>;
  completeProfile: (email: string, firstName: string, lastName: string, phone: string, userType: UserType, birthday?: string, modelId?: number) => Promise<{ success: boolean; message?: string; error?: RegistrationError }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; userType?: UserType | null; pendingProfileCompletion?: boolean; error?: RegistrationError }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: RegistrationError }>;
  resetPassword: (email: string, token: string, newPassword: string, repeatPassword: string) => Promise<{ success: boolean; message?: string; error?: RegistrationError }>;
  setPendingProfileCompletion: (email: string, userType: UserType) => void;
  clearPendingProfileCompletion: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Simplified error extraction
  const extractErrorMessage = (error: any): { message: string; errorType: RegistrationError } => {
    if (!error?.response) {
      return { message: 'Network error: Please check your internet connection', errorType: REGISTRATION_ERRORS.NETWORK_ERROR };
    }

    const { data, status } = error.response;

    // Common error patterns
    if (status === 400) {
      if (data?.message?.toLowerCase().includes('email') && data?.message?.toLowerCase().includes('exists')) {
        return { message: 'This email is already registered', errorType: REGISTRATION_ERRORS.DUPLICATE_EMAIL };
      }
      if (data?.message?.toLowerCase().includes('otp') || data?.message?.toLowerCase().includes('code')) {
        return { message: 'Invalid or expired OTP code', errorType: REGISTRATION_ERRORS.INVALID_OTP };
      }
    }

    if (status === 404) {
      return { message: 'User account not found', errorType: REGISTRATION_ERRORS.USER_NOT_FOUND };
    }

    // Extract message
    const message = data?.message || data?.error || 'An error occurred';
    return { message, errorType: REGISTRATION_ERRORS.NETWORK_ERROR };
  };

  // Simplified user creation
  const createUserFromResponse = (response: any, email: string, userType: UserType): AuthUser => {
    return {
      id: response.id || email,
      phone: response.phone || null,
      email: response.email || email,
      userType,
      name: response.name || response.username || email,
    };
  };

  // Simplified auth data storage
  const storeAuthData = async (token: string, user: AuthUser, userType: UserType) => {
    await AsyncStorage.multiSet([
      ['auth_token', token],
      ['user_data', JSON.stringify(user)],
      ['user_type', userType]
    ]);
    
    // Update axios headers
    if (axiosInstance.defaults.headers.common) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    set({ token, user, userType, isLoading: false });
  };

  return {
    // State
    token: null,
    user: null,
    userType: null,
    isLoading: false,
    registrationError: null,
    pendingProfileCompletion: null,

    // Actions
    clearRegistrationError: () => set({ registrationError: null }),

    checkToken: async () => {
      set({ isLoading: true });
      try {
        const [token, userType, userData] = await AsyncStorage.multiGet([
          'auth_token', 'user_type', 'user_data'
        ]);

        if (!token[1]) {
          set({ token: null, userType: null, user: null, isLoading: false });
          return;
        }

        const user = userData[1] ? JSON.parse(userData[1]) : null;
        
        // Update axios headers
        if (axiosInstance.defaults.headers.common) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token[1]}`;
        }
        
        set({
          token: token[1],
          userType: userType[1] as UserType | null,
          user,
          isLoading: false
        });
      } catch (error) {
        set({ token: null, userType: null, user: null, isLoading: false });
      }
    },

    clearAuth: async () => {
      try {
        await AsyncStorage.multiRemove(['auth_token', 'user_type', 'user_data', 'pending_user_type']);
        
        // Clear axios headers
        if (axiosInstance.defaults.headers.common) {
          delete axiosInstance.defaults.headers.common['Authorization'];
        }
        
        set({ 
          token: null, 
          user: null, 
          userType: null, 
          pendingProfileCompletion: null,
          registrationError: null 
        });
      } catch (error) {
        console.error('Error clearing auth data:', error);
      }
    },

    signup: async (email: string, password: string, repeatPassword: string, userType: UserType) => {
      set({ isLoading: true, registrationError: null });

      try {
        // Validate inputs
        if (!validateEmail(email)) {
          const error = { message: 'Please enter a valid email address', errorType: REGISTRATION_ERRORS.VALIDATION_ERROR };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        if (!validatePassword(password)) {
          const error = { message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character', errorType: REGISTRATION_ERRORS.WEAK_PASSWORD };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        if (password !== repeatPassword) {
          const error = { message: 'Passwords do not match', errorType: REGISTRATION_ERRORS.VALIDATION_ERROR };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        const endpoints = getRegistrationEndpoints(userType);
        const userTypeId = getUserTypeId(userType);
        
        const requestData = { 
          email: email.trim().toLowerCase(), 
          password, 
          repeatPassword,
          userType: userTypeId
        };

        const response = await axiosInstance.post(endpoints.register, requestData);

        if (response.status >= 200 && response.status < 300) {
          set({ isLoading: false, registrationError: null });
          return { success: true, requiresOTP: true };
        } else {
          const errorResult = extractErrorMessage(response);
          set({ isLoading: false, registrationError: errorResult.errorType });
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    verifyOTP: async (email: string, otpCode: string, userType: UserType) => {
      set({ isLoading: true, registrationError: null });

      try {
        if (!otpCode || otpCode.length !== 6) {
          const error = { message: 'Please enter a valid 6-digit OTP code', errorType: REGISTRATION_ERRORS.INVALID_OTP };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        const endpoints = getRegistrationEndpoints(userType);
        const userTypeId = getUserTypeId(userType);
        
        const payload = userType === USER_TYPES.DRIVER 
          ? { email: email.trim().toLowerCase(), token: otpCode, userType: userTypeId }
          : { email: email.trim().toLowerCase(), otpCode, userType: userTypeId };

        const response = await axiosInstance.post(endpoints.verify, payload);

        if (response.status === 200) {
          const authToken = response.data?.token || response.data?.access_token || response.data?.authToken;
          
          if (authToken) {
            // Store token and set pending profile completion
            await AsyncStorage.setItem('auth_token', authToken);
            await AsyncStorage.setItem('pending_user_type', userType);
            
            if (axiosInstance.defaults.headers.common) {
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            }
            
            set({ 
              token: authToken,
              pendingProfileCompletion: { email: email.trim().toLowerCase(), userType },
              isLoading: false,
              registrationError: null
            });
            
            return { success: true, requiresProfile: true };
          } else {
            const error = { 
              message: 'OTP verified but authentication token not received. Please contact support.', 
              errorType: REGISTRATION_ERRORS.TOKEN_MISSING 
            };
            set({ isLoading: false, registrationError: error.errorType });
            return { success: false, message: error.message, error: error.errorType };
          }
        } else {
          const errorResult = extractErrorMessage(response);
          set({ isLoading: false, registrationError: errorResult.errorType });
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    resendOTP: async (email: string, userType: UserType) => {
      set({ isLoading: true, registrationError: null });

      try {
        const endpoints = getRegistrationEndpoints(userType);
        const userTypeId = getUserTypeId(userType);

        const response = await axiosInstance.post(endpoints.resend, { 
          email: email.trim().toLowerCase(), 
          userType: userTypeId 
        });

        if (response.status === 200) {
          set({ isLoading: false, registrationError: null });
          return { success: true, message: response.data?.message || 'OTP code resent successfully' };
        } else {
          const errorResult = extractErrorMessage(response);
          set({ isLoading: false, registrationError: errorResult.errorType });
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    completeProfile: async (email: string, firstName: string, lastName: string, phone: string, userType: UserType, birthday?: string, modelId?: number) => {
      set({ isLoading: true, registrationError: null });

      try {
        // Validate inputs
        if (!firstName.trim() || !lastName.trim()) {
          const error = { message: 'First name and last name are required', errorType: REGISTRATION_ERRORS.VALIDATION_ERROR };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        // Get token from state or storage
        let token = get().token;
        if (!token) {
          const storedToken = await AsyncStorage.getItem('auth_token');
          if (storedToken) {
            token = storedToken;
            set({ token: storedToken });
            if (axiosInstance.defaults.headers.common) {
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
          }
        }

        if (!token) {
          const error = { 
            message: 'Authentication token not found. Please restart the registration process.', 
            errorType: REGISTRATION_ERRORS.TOKEN_MISSING 
          };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        const endpoints = getRegistrationEndpoints(userType);
        let requestData: any;
        
        if (userType === USER_TYPES.DRIVER) {
          requestData = {
            name: firstName.trim(),
            surname: lastName.trim(),
            birthday: formatDateForAPI(birthday || ''),
            phone: phone.trim() || '',
            modelId: modelId || 1 // Default modelId for drivers (car selection commented out)
          };
        } else {
          requestData = {
            email: email.trim().toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            userType: getUserTypeId(userType)
          };
        }

        const response = await axiosInstance.post(endpoints.complete, requestData);

        if (response.status === 200) {
          const responseToken = response.data?.token || response.data?.access_token || response.data?.authToken;
          const finalToken = responseToken || token;
          
          const user = createUserFromResponse(response.data, email, userType);
          user.name = `${firstName.trim()} ${lastName.trim()}`;
          user.phone = phone.trim();

          await storeAuthData(finalToken, user, userType);
          await AsyncStorage.removeItem('pending_user_type');
          
          set({ 
            pendingProfileCompletion: null, 
            isLoading: false, 
            registrationError: null 
          });
          
          return { success: true };
        } else {
          const errorResult = extractErrorMessage(response);
          set({ isLoading: false, registrationError: errorResult.errorType });
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        
        if (errorResult.errorType === REGISTRATION_ERRORS.USER_NOT_FOUND) {
          set({ pendingProfileCompletion: null });
          return {
            success: false,
            message: 'User account not found. Please register again.',
            error: errorResult.errorType
          };
        }
        
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    login: async (email: string, password: string) => {
      set({ isLoading: true, registrationError: null });

      try {
        if (!validateEmail(email)) {
          const error = { message: 'Please enter a valid email address', errorType: REGISTRATION_ERRORS.VALIDATION_ERROR };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        if (!password.trim()) {
          const error = { message: 'Please enter your password', errorType: REGISTRATION_ERRORS.VALIDATION_ERROR };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        const response = await axiosInstance.post('/api/auth/login', { 
          email: email.trim().toLowerCase(), 
          password 
        });

        if (response.status === 200 && response.data?.token) {
          try {
            const userType = validateUserRoles(response.data.roles);
            const user = createUserFromResponse(response.data, email, userType);

            await storeAuthData(response.data.token, user, userType);
            set({ isLoading: false, registrationError: null });

            return { success: true, userType };
          } catch (roleError: any) {
            // Handle incomplete profile case
            if (roleError.message === 'User has no roles assigned') {
              const storedUserType = await AsyncStorage.getItem('pending_user_type');
              await AsyncStorage.setItem('auth_token', response.data.token);
              
              set({ 
                token: response.data.token,
                pendingProfileCompletion: { 
                  email: email.trim().toLowerCase(), 
                  userType: storedUserType as UserType || null 
                },
                isLoading: false,
                registrationError: null
              });
              
              return { 
                success: true, 
                userType: storedUserType as UserType || null, 
                pendingProfileCompletion: true 
              };
            }
            
            set({ isLoading: false, registrationError: REGISTRATION_ERRORS.VALIDATION_ERROR });
            return {
              success: false,
              message: 'Your account does not have the required permissions.',
              error: REGISTRATION_ERRORS.VALIDATION_ERROR
            };
          }
        } else {
          const errorResult = extractErrorMessage(response);
          set({ isLoading: false, registrationError: errorResult.errorType });
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    forgotPassword: async (email: string) => {
      set({ isLoading: true, registrationError: null });

      try {
        if (!validateEmail(email)) {
          const error = { message: 'Please enter a valid email address', errorType: REGISTRATION_ERRORS.VALIDATION_ERROR };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        const response = await axiosInstance.post('/api/passwords/reset-request', {
          email: email.trim().toLowerCase()
        });

        if (response.status === 200) {
          set({ isLoading: false, registrationError: null });
          return {
            success: true,
            message: response.data?.message || 'Password reset instructions have been sent to your email address.'
          };
        } else {
          const errorResult = extractErrorMessage(response);
          set({ isLoading: false, registrationError: errorResult.errorType });
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    resetPassword: async (email: string, token: string, newPassword: string, repeatPassword: string) => {
      set({ isLoading: true, registrationError: null });

      try {
        if (!validateEmail(email)) {
          const error = { message: 'Please enter a valid email address', errorType: REGISTRATION_ERRORS.VALIDATION_ERROR };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        if (!validatePassword(newPassword)) {
          const error = { message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character', errorType: REGISTRATION_ERRORS.WEAK_PASSWORD };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        if (newPassword !== repeatPassword) {
          const error = { message: 'Passwords do not match', errorType: REGISTRATION_ERRORS.VALIDATION_ERROR };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        const response = await axiosInstance.post('/api/passwords/reset', {
          email: email.trim().toLowerCase(),
          token: token.trim(),
          newPassword,
          repeatPassword
        });

        if (response.status === 200) {
          set({ isLoading: false, registrationError: null });
          return {
            success: true,
            message: response.data?.message || 'Password has been reset successfully.'
          };
        } else {
          const errorResult = extractErrorMessage(response);
          set({ isLoading: false, registrationError: errorResult.errorType });
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    setPendingProfileCompletion: (email: string, userType: UserType) => {
      set({ 
        pendingProfileCompletion: { email: email.trim().toLowerCase(), userType },
        registrationError: null 
      });
    },

    clearPendingProfileCompletion: () => {
      set({ 
        pendingProfileCompletion: null,
        registrationError: null 
      });
    },
  };
});
