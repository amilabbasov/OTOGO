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

export const validateUserRoles = (roles: string[]): UserType => {
  console.log('Validating user roles:', roles);
  
  if (!roles || roles.length === 0) {
    throw new Error('User has no roles assigned');
  }

  // Primary role checks
  if (roles.includes('ROLE_DRIVER')) {
    console.log('User type identified: driver (from ROLE_DRIVER)');
    return USER_TYPES.DRIVER;
  }

  if (roles.includes('ROLE_SOLE_PROVIDER')) {
    console.log('User type identified: sole_provider (from ROLE_SOLE_PROVIDER)');
    return USER_TYPES.SOLE_PROVIDER;
  }

  if (roles.includes('ROLE_CORPORATE_PROVIDER')) {
    console.log('User type identified: corporate_provider (from ROLE_CORPORATE_PROVIDER)');
    return USER_TYPES.CORPORATE_PROVIDER;
  }

  // Legacy role check
  if (roles.includes('ROLE_PROVIDER')) {
    console.log('User type identified: sole_provider (from legacy ROLE_PROVIDER)');
    return USER_TYPES.SOLE_PROVIDER;
  }

  // Detailed role checks
  const roleChecks = [
    {
      roles: ['ROLE_UPDATE_DRIVER', 'ROLE_DELETE_DRIVER', 'ROLE_CREATE_DRIVER', 'ROLE_READ_DRIVER', 'ROLE_MANAGE_DRIVER'],
      userType: USER_TYPES.DRIVER
    },
    {
      roles: ['ROLE_UPDATE_SOLE_PROVIDER', 'ROLE_DELETE_SOLE_PROVIDER', 'ROLE_CREATE_SOLE_PROVIDER', 'ROLE_READ_SOLE_PROVIDER', 'ROLE_MANAGE_SOLE_PROVIDER'],
      userType: USER_TYPES.SOLE_PROVIDER
    },
    {
      roles: ['ROLE_UPDATE_CORPORATE_PROVIDER', 'ROLE_DELETE_CORPORATE_PROVIDER', 'ROLE_CREATE_CORPORATE_PROVIDER', 'ROLE_READ_CORPORATE_PROVIDER', 'ROLE_MANAGE_CORPORATE_PROVIDER'],
      userType: USER_TYPES.CORPORATE_PROVIDER
    }
  ];

  for (const check of roleChecks) {
    if (roles.some(role => check.roles.includes(role))) {
      console.log(`User type identified: ${check.userType} (from detailed roles)`);
      return check.userType;
    }
  }

  // Default fallback
  if (roles.includes('ROLE_LOGIN') || roles.includes('ROLE_USER')) {
    console.log('User type identified: driver (from default roles)');
    return USER_TYPES.DRIVER;
  }

  throw new Error(`Invalid user roles: ${roles.join(', ')}. User must have either ROLE_DRIVER, ROLE_SOLE_PROVIDER, or ROLE_CORPORATE_PROVIDER.`);
};

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  userType: UserType | null;
  isLoading: boolean;
  registrationError: RegistrationError | null;
  pendingProfileCompletion: { email: string; userType: UserType | null } | null;
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
  const extractErrorMessage = (error: any): { message: string; errorType: RegistrationError } => {
    if (!error) return { message: 'Unknown error occurred', errorType: REGISTRATION_ERRORS.NETWORK_ERROR };

    if (!error.response) {
      return { message: 'Network error: Please check your internet connection', errorType: REGISTRATION_ERRORS.NETWORK_ERROR };
    }

    const { data, status } = error.response;

    // Check for specific error types
    if (status === 400) {
      if (data?.message?.toLowerCase().includes('email') && data?.message?.toLowerCase().includes('exists')) {
        return { message: 'This email is already registered', errorType: REGISTRATION_ERRORS.DUPLICATE_EMAIL };
      }
      if (data?.message?.toLowerCase().includes('otp') || data?.message?.toLowerCase().includes('code')) {
        return { message: 'Invalid or expired OTP code', errorType: REGISTRATION_ERRORS.INVALID_OTP };
      }
      if (data?.message?.toLowerCase().includes('password')) {
        return { message: 'Password does not meet requirements', errorType: REGISTRATION_ERRORS.WEAK_PASSWORD };
      }
    }

    if (status === 404) {
      return { message: 'User account not found', errorType: REGISTRATION_ERRORS.USER_NOT_FOUND };
    }

    if (status === 422) {
      return { message: 'Please check your input data', errorType: REGISTRATION_ERRORS.VALIDATION_ERROR };
    }

    // Extract message from response
    let message = 'An error occurred';
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) {
        message = data.message;
      } else if (typeof data.error === 'string' && data.error.trim()) {
        message = data.error;
      } else if (Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors.join(', ');
      } else if (data.errors && typeof data.errors === 'object') {
        const errorMessages = Object.values(data.errors)
          .flat()
          .filter(msg => typeof msg === 'string' && msg.trim())
          .join(', ');
        if (errorMessages) message = errorMessages;
      }
    }

    return { message, errorType: REGISTRATION_ERRORS.NETWORK_ERROR };
  };

  const createUserFromResponse = (response: any, email: string, userType: UserType): AuthUser => {
    console.log('Creating user from response. User type:', userType, 'Response data:', response);
    return {
      id: response.id || response.username || email,
      phone: response.phone || null,
      email: response.email || email,
      userType,
      name: response.name || response.username || email,
    };
  };

  const getUserTypeFromRoles = (roles: string[]): UserType => {
    console.log('Getting user type from roles array:', roles);
    return validateUserRoles(roles);
  };

  const storeAuthData = async (token: string, user: AuthUser, userType: UserType) => {
    console.log('Storing auth data. Token exists:', !!token, 'User:', user.email, 'User Type:', userType);
    await AsyncStorage.multiSet([
      ['auth_token', token],
      ['user_data', JSON.stringify(user)],
      ['user_type', userType]
    ]);
    set({ token, user, userType, isLoading: false });
    console.log('Auth state updated in Zustand:', get().token ? 'Token present' : 'No token', get().userType);
  };

  const store = {
    token: null,
    user: null,
    userType: null,
    isLoading: false,
    registrationError: null,
    pendingProfileCompletion: null,

    clearRegistrationError: () => {
      set({ registrationError: null });
    },

    checkToken: async () => {
      set({ isLoading: true });
      console.log('🔍 Checking for existing token in AsyncStorage...');
      try {
        const [token, userType, userData] = await AsyncStorage.multiGet([
          'auth_token',
          'user_type',
          'user_data'
        ]);

        if (!token[1]) {
          console.log('❌ No token found in AsyncStorage. Setting state to unauthenticated.');
          set({ token: null, userType: null, user: null, isLoading: false });
          return;
        }

        const user = userData[1] ? JSON.parse(userData[1]) : null;
        console.log('✅ Token found in AsyncStorage. User Type:', userType[1], 'User email:', user?.email);
        set({
          token: token[1],
          userType: userType[1] as UserType | null,
          user,
          isLoading: false
        });
      } catch (error) {
        console.error('❌ Error checking token in AsyncStorage:', error);
        set({ token: null, userType: null, user: null, isLoading: false });
      }
    },


    clearAuth: async () => {
      console.log('Clearing authentication data...');
      try {
        await AsyncStorage.multiRemove([
          'auth_token', 
          'user_type', 
          'user_data', 
          'pending_user_type'
        ]);
        set({ 
          token: null, 
          user: null, 
          userType: null, 
          pendingProfileCompletion: null,
          registrationError: null 
        });
        
        // Clear axios authorization header
        if (axiosInstance.defaults.headers.common) {
          delete axiosInstance.defaults.headers.common['Authorization'];
        }
        
        console.log('Authentication data cleared.');
      } catch (error) {
        console.error('Error clearing auth data from AsyncStorage:', error);
      }
    },

    signup: async (email: string, password: string, repeatPassword: string, userType: UserType) => {
      set({ isLoading: true, registrationError: null });
      console.log('Starting signup process for:', userType, 'Email:', email);

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

        // Get appropriate endpoints
        const endpoints = getRegistrationEndpoints(userType);
        const userTypeId = getUserTypeId(userType);
        
        console.log('Signup endpoint:', endpoints.register, 'User Type:', userType, 'User Type ID:', userTypeId);

        const requestData = { 
          email: email.trim().toLowerCase(), 
          password, 
          repeatPassword,
          userType: userTypeId
        };
        
        console.log('Registration request data:', { ...requestData, password: '[HIDDEN]', repeatPassword: '[HIDDEN]' });

        const response = await axiosInstance.post(endpoints.register, requestData);
        console.log('Signup API response status:', response.status);

        if (response.status >= 200 && response.status < 300) {
          set({ isLoading: false, registrationError: null });
          console.log('Signup successful. OTP required.');
          return { success: true, requiresOTP: true };
        } else {
          const errorResult = extractErrorMessage(response);
          set({ isLoading: false, registrationError: errorResult.errorType });
          console.log('Signup failed:', errorResult.message);
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        console.error('Signup error:', errorResult.message, error.response?.data);
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    verifyOTP: async (email: string, otpCode: string, userType: UserType) => {
      set({ isLoading: true, registrationError: null });
      console.log('🔧 Starting OTP verification for:', userType, 'Email:', email, 'OTP length:', otpCode.length);

      try {
        // Validate inputs
        if (!otpCode || otpCode.length !== 6) {
          const error = { message: 'Please enter a valid 6-digit OTP code', errorType: REGISTRATION_ERRORS.INVALID_OTP };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        const endpoints = getRegistrationEndpoints(userType);
        const userTypeId = getUserTypeId(userType);
        
        // Prepare payload based on user type
        const payload = userType === USER_TYPES.DRIVER 
          ? { email: email.trim().toLowerCase(), token: otpCode, userType: userTypeId }
          : { email: email.trim().toLowerCase(), otpCode, userType: userTypeId };

        console.log('🔧 OTP verification request:', { 
          endpoint: endpoints.verify, 
          payload: { ...payload, token: '[HIDDEN]', otpCode: '[HIDDEN]' }
        });

        const response = await axiosInstance.post(endpoints.verify, payload);
        console.log('✅ OTP verification response status:', response.status);
        console.log('🔍 OTP verification response data:', response.data);

        if (response.status === 200) {
          // Check for token in response (backend team will provide this)
          const authToken = response.data?.token || response.data?.access_token || response.data?.authToken;
          
          if (authToken) {
            console.log('✅ OTP verified successfully. Token received from backend.');
            
            // Store the token for profile completion
            await AsyncStorage.setItem('auth_token', authToken);
            await AsyncStorage.setItem('pending_user_type', userType);
            
            // Update axios instance with the token
            if (axiosInstance.defaults.headers.common) {
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            }
            
            set({ 
              token: authToken,
              pendingProfileCompletion: { email: email.trim().toLowerCase(), userType },
              isLoading: false,
              registrationError: null
            });
            
            console.log('✅ User authenticated after OTP verification. Ready for profile completion.');
            return { success: true, requiresProfile: true };
          } else {
            // This shouldn't happen once backend team implements token return
            console.error('⚠️  Backend did not return authentication token after OTP verification');
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
          console.log('❌ OTP verification failed:', errorResult.message);
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        console.error('❌ OTP verification error:', errorResult.message, error.response?.data);
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    resendOTP: async (email: string, userType: UserType) => {
      set({ isLoading: true, registrationError: null });
      console.log('Resending OTP for:', userType, 'Email:', email);

      try {
        const endpoints = getRegistrationEndpoints(userType);
        const userTypeId = getUserTypeId(userType);
        
        console.log('Resend OTP request:', { endpoint: endpoints.resend, email, userType, userTypeId });

        const response = await axiosInstance.post(endpoints.resend, { 
          email: email.trim().toLowerCase(), 
          userType: userTypeId 
        });

        console.log('Resend OTP response status:', response.status);

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
        console.error('Resend OTP error:', errorResult.message);
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    completeProfile: async (email: string, firstName: string, lastName: string, phone: string, userType: UserType, birthday?: string, modelId?: number) => {
      set({ isLoading: true, registrationError: null });

      console.log('🔧 Starting profile completion:', { 
        email, firstName, lastName, phone, userType, birthday, modelId 
      });

      // 🔍 DIAGNOSTIC: Check current auth state before making API call
      const currentState = get();
      console.log('🔍 Current auth state:', {
        hasToken: !!currentState.token,
        tokenPreview: currentState.token ? currentState.token.substring(0, 20) + '...' : 'No Token',
        userType: currentState.userType,
        pendingProfile: currentState.pendingProfileCompletion
      });

      // 🔍 DIAGNOSTIC: Check AsyncStorage for token
      let effectiveToken = currentState.token;
      
      try {
        const [storedToken, storedUserType] = await AsyncStorage.multiGet([
          'auth_token', 
          'pending_user_type'
        ]);
        
        console.log('🔍 AsyncStorage state:', {
          hasStoredToken: !!storedToken[1],
          storedTokenPreview: storedToken[1] ? storedToken[1].substring(0, 20) + '...' : 'No stored token',
          storedUserType: storedUserType[1]
        });

        // If we have a stored token, use it
        if (storedToken[1]) {
          effectiveToken = storedToken[1];
          console.log('🔧 Using stored token for profile completion');
          
          // Update state and axios instance with stored token
          if (!currentState.token) {
            set({ token: storedToken[1] });
          }
          if (axiosInstance.defaults.headers.common) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken[1]}`;
          }
        }
      } catch (storageError) {
        console.error('🔍 Error checking AsyncStorage:', storageError);
      }

      // 🔍 DIAGNOSTIC: Final token check
      if (!effectiveToken) {
        console.error('❌ No authentication token available for profile completion');
        const error = { 
          message: 'Authentication token not found. Please restart the registration process.', 
          errorType: REGISTRATION_ERRORS.TOKEN_MISSING 
        };
        set({ isLoading: false, registrationError: error.errorType });
        return { success: false, message: error.message, error: error.errorType };
      }

      console.log('🔧 Using token for profile completion:', effectiveToken.substring(0, 20) + '...');

      try {
        // Validate inputs
        if (!firstName.trim() || !lastName.trim()) {
          const error = { message: 'First name and last name are required', errorType: REGISTRATION_ERRORS.VALIDATION_ERROR };
          set({ isLoading: false, registrationError: error.errorType });
          return { success: false, message: error.message, error: error.errorType };
        }

        const endpoints = getRegistrationEndpoints(userType);
        let requestData: any;
        
        if (userType === USER_TYPES.DRIVER) {
          // Driver profile completion
          let formattedBirthday = formatDateForAPI(birthday || '');
          
          requestData = {
            name: firstName.trim(),
            surname: lastName.trim(),
            birthday: formattedBirthday,
            phone: phone.trim() || '',
            modelId: modelId || 0
          };
          
          console.log('Driver profile completion payload:', requestData);
        } else {
          // Provider profile completion  
          const userTypeId = getUserTypeId(userType);
          requestData = {
            email: email.trim().toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            userType: userTypeId
          };
          
          console.log('Provider profile completion payload:', requestData);
        }

        console.log('🔧 Profile completion request:', { 
          endpoint: endpoints.complete, 
          userType,
          authMethod: 'token'
        });

        const response = await axiosInstance.post(endpoints.complete, requestData);
        console.log('✅ Profile completion response status:', response.status);
        console.log('🔍 Profile completion response data:', response.data);

        if (response.status === 200) {
          // Check for token in response (backend may return updated token after profile completion)
          const responseToken = response.data?.token || response.data?.access_token || response.data?.authToken;
          
          if (responseToken) {
            console.log('✅ Profile completed successfully with new token from response');
            // Use the new token from profile completion response
            const user = createUserFromResponse(response.data, email, userType);
            user.name = `${firstName.trim()} ${lastName.trim()}`;
            user.phone = phone.trim();

            await storeAuthData(responseToken, user, userType);
            
            // Clear pending profile completion state
            await AsyncStorage.removeItem('pending_user_type');
            set({ 
              pendingProfileCompletion: null, 
              isLoading: false, 
              registrationError: null 
            });
            
            console.log('✅ Profile completion successful with new token');
            return { success: true };
          } else {
            // No new token in response, use existing token
            console.log('✅ Profile completed successfully with existing token');
            const user = createUserFromResponse(response.data, email, userType);
            user.name = `${firstName.trim()} ${lastName.trim()}`;
            user.phone = phone.trim();

            await storeAuthData(effectiveToken, user, userType);
            
            // Clear pending profile completion state
            await AsyncStorage.removeItem('pending_user_type');
            set({ 
              pendingProfileCompletion: null, 
              isLoading: false, 
              registrationError: null 
            });
            
            console.log('✅ Profile completion successful with existing token');
            return { success: true };
          }
        } else {
          const errorResult = extractErrorMessage(response);
          set({ isLoading: false, registrationError: errorResult.errorType });
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        console.error('Profile completion error:', error);
        
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        
        // Special handling for user not found errors
        if (errorResult.errorType === REGISTRATION_ERRORS.USER_NOT_FOUND) {
          set({ pendingProfileCompletion: null });
          return {
            success: false,
            message: 'User account not found. Please register again and complete the full registration process including OTP verification.',
            error: errorResult.errorType
          };
        }
        
        return {
          success: false,
          message: errorResult.message,
          error: errorResult.errorType
        };
      }
    },

    login: async (email: string, password: string) => {
      set({ isLoading: true, registrationError: null });
      console.log('Starting login process for:', email);

      try {
        await AsyncStorage.removeItem('auth_token');

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

        const loginData = { 
          email: email.trim().toLowerCase(), 
          password 
        };
        
        console.log('Login request for email:', loginData.email);
        
        const response = await axiosInstance.post('/api/auth/login', loginData);

        console.log('Login response status:', response.status);

        if (response.status === 200 && response.data?.token) {
          try {
            const userType = getUserTypeFromRoles(response.data.roles);
            const user = createUserFromResponse(response.data, email, userType);

            await storeAuthData(response.data.token, user, userType);
            set({ isLoading: false, registrationError: null });

            return { success: true, userType };
          } catch (roleError: any) {
            console.error('Role validation error:', roleError);
            
            // Check if this is a "no roles assigned" error (user registered but didn't complete profile)
            if (roleError.message === 'User has no roles assigned' && response.data.roles && response.data.roles.length === 0) {
              console.log('User has valid token but no roles - checking for stored userType');
              
              // Try to get the stored userType from previous OTP verification
              const storedUserType = await AsyncStorage.getItem('pending_user_type');
              console.log('Stored userType from OTP verification:', storedUserType);
              
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
            await AsyncStorage.multiRemove(['auth_token', 'user_type', 'user_data']);

            return {
              success: false,
              message: 'Your account does not have the required permissions. Please contact support or register with the correct account type.',
              error: REGISTRATION_ERRORS.VALIDATION_ERROR
            };
          }
        } else {
          const errorResult = extractErrorMessage(response);
          set({ isLoading: false, registrationError: errorResult.errorType });
          return { success: false, message: errorResult.message, error: errorResult.errorType };
        }
      } catch (error: any) {
        console.error('Login error:', error);
        
        const errorResult = extractErrorMessage(error);
        set({ isLoading: false, registrationError: errorResult.errorType });
        
        // Special handling for specific login errors
        if (error.response?.data?.internalMessage === 'Invalid phone or password') {
          return {
            success: false,
            message: 'Account not found. Please check your credentials or register if you haven\'t created an account yet.',
            error: REGISTRATION_ERRORS.USER_NOT_FOUND
          };
        }
        
        return {
          success: false,
          message: errorResult.message,
          error: errorResult.errorType
        };
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
        console.error('Forgot password error:', errorResult.message);
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
        console.error('Reset password error:', errorResult.message);
        return { success: false, message: errorResult.message, error: errorResult.errorType };
      }
    },

    setPendingProfileCompletion: (email: string, userType: UserType) => {
      set({ 
        pendingProfileCompletion: { email: email.trim().toLowerCase(), userType },
        registrationError: null 
      });
      console.log('Pending profile completion state set for:', email, userType);
    },

    clearPendingProfileCompletion: () => {
      set({ 
        pendingProfileCompletion: null,
        registrationError: null 
      });
      console.log('Pending profile completion state cleared.');
    },
  };

  return store;
});