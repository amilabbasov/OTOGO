import { create } from 'zustand';
import authService from '../../services/functions/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStore, PendingProfileCompletionState, User, UserType, RegisterData, OtpVerificationData, OtpResendState } from '../../types/common';
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
  otpResendState: {
    resendAttempts: 0,
    lastResendTime: null,
    lockoutUntil: null,
    isLockedOut: false,
    passwordResetResendAttempts: 0,
    passwordResetLastResendTime: null,
    passwordResetLockoutUntil: null,
    isPasswordResetLockedOut: false
  },
  isPasswordResetFlowActive: false,

  setToken: async (token: string) => {
    try {
      if (!token || token.trim() === '') {
        await get().removeToken();
        return;
      }
      await AsyncStorage.setItem('userToken', token);
      set({ token, isAuthenticated: true });
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (e: any) {
      console.error('setToken: Tokeni saxlamaq mümkün olmadı:', e.message);
    }
  },

  ensureApiClientAuth: () => {
    const { token } = get();
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  setUserData: async (data: { user: User; userType: UserType; pendingProfileCompletionStatus: boolean; email: string }) => {
    try {
      set({
        user: data.user,
        userType: data.userType,
        pendingProfileCompletion: {
          ...get().pendingProfileCompletion,
          isPending: data.pendingProfileCompletionStatus,
          userType: data.userType,
          email: data.email
        }
      });
      await AsyncStorage.setItem('userData', JSON.stringify(data));
    } catch (e: any) {
      console.error('setUserData: İstifadəçi məlumatlarını saxlamaq mümkün olmadı:', e.message);
    }
  },

  saveOtpResendState: async (otpResendState: OtpResendState) => {
    try {
      await AsyncStorage.setItem('otpResendState', JSON.stringify(otpResendState));
    } catch (e: any) {
      console.error('saveOtpResendState: OTP resend state saxlamaq mümkün olmadı:', e.message);
    }
  },

  loadOtpResendState: async (): Promise<OtpResendState | null> => {
    try {
      const stored = await AsyncStorage.getItem('otpResendState');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if lockout has expired
        if (parsed.lockoutUntil && Date.now() > parsed.lockoutUntil) {
          // Lockout has expired, reset the state
          await AsyncStorage.removeItem('otpResendState');
          return null;
        }
        return parsed;
      }
      return null;
    } catch (e: any) {
      console.error('loadOtpResendState: OTP resend state yükləmək mümkün olmadı:', e.message);
      return null;
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('otpResendState');
      delete apiClient.defaults.headers.common['Authorization'];
    } catch (e: any) {
      console.error('removeToken: Tokeni silmək mümkün olmadı:', e.message);
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
      otpResendState: {
        resendAttempts: 0,
        lastResendTime: null,
        lockoutUntil: null,
        isLockedOut: false,
        passwordResetResendAttempts: 0,
        passwordResetLastResendTime: null,
        passwordResetLockoutUntil: null,
        isPasswordResetLockedOut: false
      },
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
    const { token, userType: currentUserType, user, pendingProfileCompletion } = get();

    if (!token || !currentUserType) {
      set({ isLoading: false });
      if (!token && get().isAuthenticated) get().clearAuth();
      return;
    }

    const hasBasicInfo = currentUserType === 'company_provider'
      ? (user && user.companyName && user.phone)
      : (user && user.name && user.surname);

    if (!forceRefresh && hasBasicInfo && !pendingProfileCompletion.isPending) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
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
          console.error('fetchUserInformation: Naməlum istifadəçi növü:', currentUserType);
          get().clearAuth();
          return;
      }

      const apiUserData = response.data;

      // Profil tamamlama vəziyyətini API cavabına əsasən müəyyənləşdiririk.
      // Bu, `completeProfile` API cavabından sonra `isPending` dəyərini düzgün təyin etməyə kömək edir.
      // For corporate providers, basic info is company name and phone
      // For other user types, basic info is name and surname
      const hasBasicInfo = currentUserType === 'company_provider'
        ? (apiUserData && apiUserData.companyName && apiUserData.phone)
        : (apiUserData && apiUserData.name && apiUserData.surname);

      const newPendingState: PendingProfileCompletionState = {
        isPending: !hasBasicInfo, // Əgər əsas məlumatlar yoxdursa, isPending true
        userType: !hasBasicInfo ? currentUserType : null, // Əsas məlumatlar yoxdursa, userType təyin et
        email: apiUserData?.email || '',
        step: !hasBasicInfo ? 'personalInfo' : null // Əsas məlumatlar yoxdursa, personalInfo addımına get
      };

      // Store-u və AsyncStorage-i yeni məlumatlarla və pending statusu ilə yenilə.
      await get().setUserData({
        user: apiUserData,
        userType: currentUserType,
        pendingProfileCompletionStatus: newPendingState.isPending,
        email: newPendingState.email ?? ''
      });

      set({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        pendingProfileCompletion: newPendingState,
      });

    } catch (error: any) {
      console.error('fetchUserInformation: Məlumatları çəkərkən xəta:', error.response?.status, error.message);
      console.error('fetchUserInformation: Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });

      set({
        error: error.response?.data?.message || 'Profil məlumatlarını yükləmək mümkün olmadı.',
        isLoading: false
      });

      if (error?.response?.status === 400) {
        const currentState = get();
        set({
          pendingProfileCompletion: {
            isPending: true,
            userType: currentState.userType,
            email: currentState.user?.email || '',
            step: 'personalInfo'
          }
        });
        return;
      } else if (error?.response?.status === 401 || error?.response?.status === 403) {
        get().clearAuth();
      }
      throw error;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      const { token, user: loginUserData, userType: responseUserTypeNumber } = response.data;

      const userTypeMap: { [key: number]: UserType } = {
        2: 'driver', 3: 'company_provider', 4: 'individual_provider'
      };
      const userType = userTypeMap[responseUserTypeNumber];
      if (!userType) throw new Error('Düzgün olmayan istifadəçi növü cavabı.');

      await get().setToken(token);

      await get().setUserData({
        user: loginUserData,
        userType: userType,
        pendingProfileCompletionStatus: response.data.pendingProfileCompletionStatus || false,
        email: credentials.email
      });

      try {
        await get().fetchUserInformation(true);
      } catch (fetchError: any) {
        if (fetchError?.response?.status === 400) {
          set({
            pendingProfileCompletion: {
              isPending: true,
              userType: userType,
              email: credentials.email,
              step: 'personalInfo'
            }
          });
        } else {
          throw fetchError;
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('login: Giriş xətası:', error);
      const errorMessage = error.response?.data?.message || 'Giriş uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null, token: null, userType: null,
        pendingProfileCompletion: { isPending: false, userType: null, email: null, step: null }
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true }); // Logout zamanı loading göstər
    try {
      await authService.logout();
    } catch (error) {
    } finally {
      get().clearAuth();
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUserDataStr = await AsyncStorage.getItem('userData');
      const storedOtpResendState = await get().loadOtpResendState();

      // Set OTP resend state if it exists
      if (storedOtpResendState) {
        set({ otpResendState: storedOtpResendState });
      }

      if (storedToken) {
        await get().setToken(storedToken); // Tokeni set et və Axios headerini təyin et

        if (storedUserDataStr) {
          try {
            const storedUserData = JSON.parse(storedUserDataStr);

            // Validate stored data structure
            if (!storedUserData.user || !storedUserData.userType || !storedUserData.email) {
              get().clearAuth();
              return;
            }

            // İlk olaraq stored user data-nı store-a qoy (yüklənmə zamanı boş görünməsin)
            set({
              user: storedUserData.user as User,
              userType: storedUserData.userType as UserType,
              pendingProfileCompletion: {
                isPending: storedUserData.pendingProfileCompletionStatus || false,
                userType: storedUserData.userType as UserType,
                email: storedUserData.email,
                step: storedUserData.pendingProfileCompletionStatus ? 'personalInfo' : null // Məntiqi burda saxlaya bilərik
              }
            });

            // Sonra API-dən ən son və tam məlumatları çək
            try {
              await get().fetchUserInformation(true);
            } catch (fetchError: any) {
              // Əgər 400 xətası alırıqsa, bu o deməkdir ki, profil tam deyil
              if (fetchError?.response?.status === 400) {
                set({
                  pendingProfileCompletion: {
                    isPending: true,
                    userType: storedUserData.userType as UserType,
                    email: storedUserData.email,
                    step: 'personalInfo'
                  }
                });
              } else {
                get().clearAuth();
              }
            }

          } catch (parseError) {
            get().clearAuth();
          }
        } else {
          try {
            await get().fetchUserInformation(true);
          } catch (e) {
            get().clearAuth();
          }
        }
      } else {
        set({ isAuthenticated: false, token: null });
        delete apiClient.defaults.headers.common['Authorization'];
      }
    } catch (error) {
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

      set({ tempEmail: email, userType: userType }); // Qeydiyyatda tempEmail və userType təyin et

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
          throw new Error('register: Yanlış istifadəçi növü seçilib.');
      }

      set({
        isLoading: false,
        error: null,
        // Qeydiyyatdan sonra avtomatik olaraq pendingProfileCompletion statusunu təyin edirik
        pendingProfileCompletion: {
          isPending: true,
          userType: userType,
          email: email,
          step: 'personalInfo'
        }
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Qeydiyyat zamanı səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  resendOtp: async (email: string, userType: UserType) => {
    const currentState = get();
    const { otpResendState } = currentState;

    // Check if user is locked out for regular registration
    if (otpResendState.isLockedOut && otpResendState.lockoutUntil) {
      const now = Date.now();
      if (now < otpResendState.lockoutUntil) {
        const remainingTime = Math.ceil((otpResendState.lockoutUntil - now) / 1000 / 60); // minutes
        const errorMessage = `Too many resend attempts. Please wait ${remainingTime} minutes before trying again.`;
        set({ error: errorMessage });
        throw new Error(errorMessage);
      } else {
        // Lockout period has expired, reset the state
        get().resetOtpResendState();
      }
    }

    // Check if user has exceeded the 5-resend limit for regular registration
    if (otpResendState.resendAttempts >= 5) {
      const lockoutUntil = Date.now() + (15 * 60 * 1000); // 15 minutes from now
      get().setOtpLockout(lockoutUntil);
      const errorMessage = 'Maximum resend attempts reached. Please wait 15 minutes before trying again.';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }

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
          throw new Error('resendOtp: Yanlış istifadəçi növü seçilib, OTP yenidən göndərilə bilmədi.');
      }

      // Increment resend attempts and update last resend time for regular registration
      get().incrementOtpResendAttempts();

      set({ isLoading: false, error: null });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP-ni yenidən göndərmək mümkün olmadı.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  resendPasswordResetOtp: async (email: string) => {
    const currentState = get();
    const { otpResendState } = currentState;

    // Check if user is locked out for password reset
    if (otpResendState.isPasswordResetLockedOut && otpResendState.passwordResetLockoutUntil) {
      const now = Date.now();
      if (now < otpResendState.passwordResetLockoutUntil) {
        const remainingTime = Math.ceil((otpResendState.passwordResetLockoutUntil - now) / 1000 / 60); // minutes
        const errorMessage = `Too many password reset attempts. Please wait ${remainingTime} minutes before trying again.`;
        set({ error: errorMessage });
        throw new Error(errorMessage);
      } else {
        // Lockout period has expired, reset the password reset state
        get().resetPasswordResetOtpState();
      }
    }

    // Check if user has exceeded the 5-resend limit for password reset
    if (otpResendState.passwordResetResendAttempts >= 5) {
      const lockoutUntil = Date.now() + (15 * 60 * 1000); // 15 minutes from now
      get().setPasswordResetOtpLockout(lockoutUntil);
      const errorMessage = 'Maximum password reset attempts reached. Please wait 15 minutes before trying again.';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }

    set({ isLoading: true, error: null });
    try {
      const response = await authService.resendPasswordResetOtp(email);

      // Increment password reset resend attempts
      get().incrementPasswordResetOtpResendAttempts();

      set({ isLoading: false, error: null });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP kodu yenidən göndərilərkən səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.requestPasswordReset(email);
      set({
        isLoading: false,
        error: null,
        tempEmail: email,
        isPasswordResetFlowActive: true
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Şifrə sıfırlama kodu göndərilərkən səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearPasswordResetFlow: () => {
    set({ isPasswordResetFlowActive: false });
  },

  verifyOtp: async (otpData: OtpVerificationData & { isPasswordReset?: boolean }) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      const { userType, token, email, isPasswordReset } = otpData;

      if (isPasswordReset) {
        response = await authService.validatePasswordResetToken(email, token);
        set({ isLoading: false, error: null, tempEmail: null });
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
            throw new Error('verifyOtp: Yanlış istifadəçi növü seçilib.');
        }

        const authToken = response.data.authToken || response.data.token || response.data.access_token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user || response.data;

        if (!authToken) {
          throw new Error('OTP təsdiqləmə uğursuz oldu: cavabda token yoxdur.');
        }

        await get().setToken(authToken); // Tokeni saxla və header-i təyin et

        // OTP təsdiqləndikdən sonra ilkin məlumatları və pending statusunu təyin et
        await get().setUserData({
          user: user as User,
          userType: userType as UserType,
          pendingProfileCompletionStatus: true, // OTP-dən sonra profilin tamamlanması gözlənilir
          email: email
        });

        set({
          isAuthenticated: true,
          isLoading: false,
          error: null,
          tempEmail: null,
          pendingProfileCompletion: { // OTP-dən sonra personalInfo addımına keç
            isPending: true,
            userType: userType,
            email: email,
            step: 'personalInfo'
          }
        });

        // Reset OTP resend state after successful verification
        get().resetOtpResendState();

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

    // Ensure API client has proper authorization
    get().ensureApiClientAuth();

    const currentState = get();
    const validation = get().validateProfileCompletionState();
    if (!validation.isValid) {
      const errorMessage = `Profile completion validation failed: ${validation.errors.join(', ')}`;
      set({ error: errorMessage, isLoading: false });
      return { success: false, message: errorMessage };
    }

    try {
      let response;

      switch (userType) {
        case 'driver':
          response = await authService.completeDriverProfile({
            name: firstName, surname: lastName,
            birthday: dateOfBirth || new Date().toISOString().split('T')[0],
            phone: phone || '',
            email: email
          });
          break;
        case 'individual_provider':
          response = await authService.completeIndividualProviderProfile({
            name: firstName, surname: lastName,
            description: businessName || '', phone,
            birthday: dateOfBirth || new Date().toISOString().split('T')[0],
            email: email
          });
          break;
        case 'company_provider':
          response = await authService.completeCompanyProviderProfile({
            companyName: businessName || '',
            phone,
            description: `Company: ${businessName || ''}`,
            email: email
          });
          break;
        default:
          throw new Error('completeProfile: Yanlış istifadəçi növü seçilib.');
      }

      const apiUserData = response.data?.user || response.data;

      // Check if profile is complete based on user type
      const hasRequiredPersonalInfo = userType === 'company_provider'
        ? (apiUserData && apiUserData.companyName && apiUserData.phone)
        : (apiUserData && apiUserData.name && apiUserData.surname && apiUserData.phone && apiUserData.birthday);

      let nextStep: 'serviceSelection' | 'products' | 'branches' | null = null;
      if (userType === 'driver' && hasRequiredPersonalInfo) {
        nextStep = 'serviceSelection';
      } else if ((userType === 'individual_provider' || userType === 'company_provider') && hasRequiredPersonalInfo) {
        nextStep = 'products';
      }

      await get().setUserData({
        user: apiUserData,
        userType: userType,
        pendingProfileCompletionStatus: nextStep !== null,
        email: email
      });

      set({
        isLoading: false,
        error: null,
        pendingProfileCompletion: { // Növbəti addımı store-a yaz
          isPending: nextStep !== null,
          userType: nextStep !== null ? userType : null,
          email: nextStep !== null ? email : null,
          step: nextStep
        }
      });

      // Profil tamamlandıqdan sonra tam məlumatı yenidən çək
      await get().fetchUserInformation(true);

      return { success: true, data: response.data, nextStep };
    } catch (error: any) {
      if (error.response) {

        if (error.response.data && typeof error.response.data === 'object') {
          for (const key in error.response.data) {
          }
        }
      } else {
      }
      const errorMessage = error.response?.data?.message || 'Profil tamamlama zamanı səhv baş verdi.';
      set({ error: errorMessage, isLoading: false });
      return { success: false, message: errorMessage };
    }
  },

  checkAuthenticationState: () => {
    const state = get();
    return state;
  },

  validateProfileCompletionState: () => {
    const state = get();
    const validationResult = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (!state.isAuthenticated) {
      validationResult.isValid = false;
      validationResult.errors.push('User is not authenticated');
    }

    if (!state.token) {
      validationResult.isValid = false;
      validationResult.errors.push('No authentication token available');
    }

    if (!state.userType) {
      validationResult.isValid = false;
      validationResult.errors.push('User type is not set');
    }

    if (!state.pendingProfileCompletion.isPending) {
      validationResult.warnings.push('Profile completion is not marked as pending - this might indicate the profile is already complete');
    }

    if (state.pendingProfileCompletion.step !== 'personalInfo') {
      validationResult.warnings.push(`Expected step 'personalInfo' but current step is '${state.pendingProfileCompletion.step}'`);
    }

    if (state.user) {
      const hasBasicInfo = state.userType === 'company_provider'
        ? (state.user.companyName && state.user.phone)
        : (state.user.name && state.user.surname);

      if (hasBasicInfo) {
        validationResult.warnings.push('User already has basic information - this might indicate the profile is complete enough to access the home screen');
      }
    }

    return validationResult;
  },

  clearCorruptedData: async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
    } catch (error) {
    }

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tempEmail: null,
      token: null,
      userType: null,
      pendingProfileCompletion: { isPending: false, userType: null, email: null, step: null },
      otpResendState: {
        resendAttempts: 0,
        lastResendTime: null,
        lockoutUntil: null,
        isLockedOut: false,
        passwordResetResendAttempts: 0,
        passwordResetLastResendTime: null,
        passwordResetLockoutUntil: null,
        isPasswordResetLockedOut: false
      },
    });

    delete apiClient.defaults.headers.common['Authorization'];
  },

  resetOtpResendState: () => {
    const newState = {
      resendAttempts: 0,
      lastResendTime: null,
      lockoutUntil: null,
      isLockedOut: false,
      passwordResetResendAttempts: 0,
      passwordResetLastResendTime: null,
      passwordResetLockoutUntil: null,
      isPasswordResetLockedOut: false
    };
    set({ otpResendState: newState });
    get().saveOtpResendState(newState);
  },

  incrementOtpResendAttempts: () => {
    const currentState = get();
    const newAttempts = currentState.otpResendState.resendAttempts + 1;
    const isLockedOut = newAttempts >= 5;
    const lockoutUntil = isLockedOut ? Date.now() + (15 * 60 * 1000) : null;

    const newState = {
      ...currentState.otpResendState,
      resendAttempts: newAttempts,
      lastResendTime: Date.now(),
      lockoutUntil,
      isLockedOut
    };

    set({ otpResendState: newState });
    get().saveOtpResendState(newState);
  },

  setOtpLockout: (lockoutUntil: number) => {
    const currentState = get();
    const newState = {
      ...currentState.otpResendState,
      lockoutUntil,
      isLockedOut: true
    };
    set({ otpResendState: newState });
    get().saveOtpResendState(newState);
  },

  incrementPasswordResetOtpResendAttempts: () => {
    const currentState = get();
    const newAttempts = currentState.otpResendState.passwordResetResendAttempts + 1;
    const isLockedOut = newAttempts >= 5;
    const lockoutUntil = isLockedOut ? Date.now() + (15 * 60 * 1000) : null;

    const newState = {
      ...currentState.otpResendState,
      passwordResetResendAttempts: newAttempts,
      passwordResetLastResendTime: Date.now(),
      passwordResetLockoutUntil: lockoutUntil,
      isPasswordResetLockedOut: isLockedOut
    };

    set({ otpResendState: newState });
    get().saveOtpResendState(newState);
  },

  setPasswordResetOtpLockout: (lockoutUntil: number) => {
    const currentState = get();
    const newState = {
      ...currentState.otpResendState,
      passwordResetLockoutUntil: lockoutUntil,
      isPasswordResetLockedOut: true
    };
    set({ otpResendState: newState });
    get().saveOtpResendState(newState);
  },

  resetPasswordResetOtpState: () => {
    const currentState = get();
    const newState = {
      ...currentState.otpResendState,
      passwordResetResendAttempts: 0,
      passwordResetLastResendTime: null,
      passwordResetLockoutUntil: null,
      isPasswordResetLockedOut: false
    };
    set({ otpResendState: newState });
    get().saveOtpResendState(newState);
  },
}));

export default useAuthStore;