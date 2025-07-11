import { create } from 'zustand';
import authService from '../../services/functions/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserType, RegisterData, OtpVerificationData, LoginCredentials, OtpResendState, PendingProfileCompletionState, AuthStore } from '../../types/common';
import apiClient from '../../services/apiClient';

const initialFullOtpResendState: OtpResendState = {
  resendAttempts: 0,
  lastResendTime: null,
  lockoutUntil: null,
  isLockedOut: false,
  passwordResetResendAttempts: 0,
  passwordResetLastResendTime: null,
  passwordResetLockoutUntil: null,
  isPasswordResetLockedOut: false,
};

const initialPendingProfileCompletionState: PendingProfileCompletionState = {
  isPending: false,
  userType: null,
  email: null,
  step: null,
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tempEmail: null,
      token: null,
      userType: null,
      pendingProfileCompletion: initialPendingProfileCompletionState,
      otpResendState: initialFullOtpResendState,
      isPasswordResetFlowActive: false,
      isOtpVerifiedForPasswordReset: false,
      passwordResetToken: null,

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
              email: data.email,
            },
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
            const parsed: OtpResendState = JSON.parse(stored);
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
          await AsyncStorage.multiRemove(['userToken', 'userData', 'otpResendState']);
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
          pendingProfileCompletion: initialPendingProfileCompletionState,
          otpResendState: initialFullOtpResendState,
          isPasswordResetFlowActive: false,
          isOtpVerifiedForPasswordReset: false,
          passwordResetToken: null,
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

          const hasBasicInfoAfterFetch = currentUserType === 'company_provider'
            ? (apiUserData && apiUserData.companyName && apiUserData.phone)
            : (apiUserData && apiUserData.name && apiUserData.surname);

          const newPendingState: PendingProfileCompletionState = {
            isPending: !hasBasicInfoAfterFetch,
            userType: !hasBasicInfoAfterFetch ? currentUserType : null,
            email: apiUserData?.email || '',
            step: !hasBasicInfoAfterFetch ? 'personalInfo' : null,
          };

          await get().setUserData({
            user: apiUserData,
            userType: currentUserType,
            pendingProfileCompletionStatus: newPendingState.isPending,
            email: newPendingState.email ?? '',
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
            method: error.config?.method,
          });

          set({
            error: error.response?.data?.message || 'Profil məlumatlarını yükləmək mümkün olmadı.',
            isLoading: false,
          });

          if (error?.response?.status === 400) {
            const currentState = get();
            set({
              pendingProfileCompletion: {
                isPending: true,
                userType: currentState.userType,
                email: currentState.user?.email || '',
                step: 'personalInfo',
              },
            });
            return;
          } else if (error?.response?.status === 401 || error?.response?.status === 403) {
            get().clearAuth();
          }
          throw error;
        }
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          const { token, user: loginUserData, userType: responseUserTypeNumber } = response.data;

          const userTypeMap: { [key: number]: UserType } = {
            2: 'driver', 3: 'company_provider', 4: 'individual_provider',
          };
          const userType = userTypeMap[responseUserTypeNumber];
          if (!userType) throw new Error('Düzgün olmayan istifadəçi növü cavabı.');

          await get().setToken(token);

          await get().setUserData({
            user: loginUserData,
            userType: userType,
            pendingProfileCompletionStatus: response.data.pendingProfileCompletionStatus || false,
            email: credentials.email,
          });

          try {
            await get().fetchUserInformation(true);
          } catch (fetchError: any) {
            if (fetchError?.response?.status === 400) {
              set((state) => ({
                pendingProfileCompletion: {
                  ...state.pendingProfileCompletion,
                  isPending: true,
                  userType: userType,
                  email: credentials.email,
                  step: 'personalInfo',
                },
              }));
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
            user: null,
            token: null,
            userType: null,
            pendingProfileCompletion: initialPendingProfileCompletionState,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('logout: Çıxış zamanı xəta:', error);
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

          if (storedOtpResendState) {
            const now = Date.now();
            if (
              (storedOtpResendState.lockoutUntil && now > storedOtpResendState.lockoutUntil) ||
              (storedOtpResendState.passwordResetLockoutUntil && now > storedOtpResendState.passwordResetLockoutUntil)
            ) {
              set({ otpResendState: initialFullOtpResendState }); // Kilid müddəti bitibsə sıfırla
              await AsyncStorage.removeItem('otpResendState');
            } else {
              set({ otpResendState: storedOtpResendState });
            }
          } else {
            set({ otpResendState: initialFullOtpResendState });
          }

          if (storedToken) {
            await get().setToken(storedToken);

            if (storedUserDataStr) {
              try {
                const storedUserData = JSON.parse(storedUserDataStr);

                if (!storedUserData.user || !storedUserData.userType || !storedUserData.email) {
                  get().clearAuth();
                  return;
                }

                set({
                  user: storedUserData.user as User,
                  userType: storedUserData.userType as UserType,
                  pendingProfileCompletion: {
                    isPending: storedUserData.pendingProfileCompletionStatus || false,
                    userType: storedUserData.userType as UserType,
                    email: storedUserData.email,
                    step: storedUserData.pendingProfileCompletionStatus ? 'personalInfo' : null,
                  },
                  isAuthenticated: true,
                });

                try {
                  await get().fetchUserInformation(true);
                } catch (fetchError: any) {
                  if (fetchError?.response?.status === 400) {
                    set({
                      pendingProfileCompletion: {
                        isPending: true,
                        userType: storedUserData.userType as UserType,
                        email: storedUserData.email,
                        step: 'personalInfo',
                      },
                    });
                  } else {
                    get().clearAuth();
                  }
                }
              } catch (parseError) {
                console.error('initializeAuth: İstifadəçi məlumatlarını parse edərkən xəta:', parseError);
                get().clearAuth();
              }
            } else {
              try {
                await get().fetchUserInformation(true);
              } catch (e) {
                console.error('initializeAuth: İstifadəçi məlumatlarını çəkərkən xəta (token var, data yoxdur):', e);
                get().clearAuth();
              }
            }
          } else {
            set({ isAuthenticated: false, token: null });
            delete apiClient.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          console.error('initializeAuth: Ümumi başlatma xətası:', error);
          get().clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          let response;
          const { userType, email, password, repeatPassword, selectedServices, isVerified } = userData;

          set({ tempEmail: email, userType: userType });

          switch (userType) {
            case 'driver':
              response = await authService.registerDriver({ email, password, repeatPassword, userType, isVerified });
              break;
            case 'company_provider':
              response = await authService.registerCompanyProvider({ email, password, repeatPassword, selectedServices, userType, isVerified });
              break;
            case 'individual_provider':
              response = await authService.registerIndividualProvider({ email, password, repeatPassword, selectedServices, userType, isVerified });
              break;
            default:
              throw new Error('register: Yanlış istifadəçi növü seçilib.');
          }

          set((state) => ({
            pendingProfileCompletion: {
              ...state.pendingProfileCompletion,
              isPending: true,
              userType: userType,
              email: email,
              step: 'personalInfo',
            },
          }));
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

        if (otpResendState.isLockedOut && otpResendState.lockoutUntil) {
          const now = Date.now();
          if (now < otpResendState.lockoutUntil) {
            const remainingTime = Math.ceil((otpResendState.lockoutUntil - now) / 1000 / 60);
            const errorMessage = `Çox sayda yenidən göndərmə cəhdi. Zəhmət olmasa ${remainingTime} dəqiqə gözləyin.`;
            set({ error: errorMessage });
            throw new Error(errorMessage);
          } else {
            get().resetOtpResendState();
          }
        }

        if (otpResendState.resendAttempts >= 5) {
          const lockoutUntil = Date.now() + 15 * 60 * 1000;
          get().setOtpLockout(lockoutUntil);
          const errorMessage = 'Maksimum yenidən göndərmə cəhdlərinə çatıldı. Zəhmət olmasa 15 dəqiqə gözləyin.';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }

        set({ isLoading: true, error: null });
        try {
          console.log('resendOtp: Attempting to resend OTP for:', { email, userType }); // Debug log
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
          console.log('resendOtp: API Response SUCCEEDED:', response.data); // Debug log

          get().incrementOtpResendAttempts();

          set({ isLoading: false, error: null });
          return response.data;
        } catch (error: any) {
          console.error('resendOtp: API Response FAILED:', error.response?.data || error.message); // Debug log

          let errorMessage = 'OTP-ni yenidən göndərmək mümkün olmadı.';

          if (error.response?.status === 403) {
            errorMessage = 'OTP yenidən göndərmə cəhdi bloklanıb. Zəhmət olmasa bir az gözləyin və yenidən cəhd edin.';
          } else if (error.response?.status === 429) {
            errorMessage = 'Çox sayda cəhd. Zəhmət olmasa bir az gözləyin və yenidən cəhd edin.';
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      resendPasswordResetOtp: async (email: string) => {
        const currentState = get();
        const { otpResendState } = currentState;

        if (otpResendState.isPasswordResetLockedOut && otpResendState.passwordResetLockoutUntil) {
          const now = Date.now();
          if (now < otpResendState.passwordResetLockoutUntil) {
            const remainingTime = Math.ceil((otpResendState.passwordResetLockoutUntil - now) / 1000 / 60);
            const errorMessage = `Çox sayda şifrə sıfırlama cəhdi. Zəhmət olmasa ${remainingTime} dəqiqə gözləyin.`;
            set({ error: errorMessage });
            throw new Error(errorMessage);
          } else {
            get().resetPasswordResetOtpState();
          }
        }

        if (otpResendState.passwordResetResendAttempts >= 5) {
          const lockoutUntil = Date.now() + 15 * 60 * 1000;
          get().setPasswordResetOtpLockout(lockoutUntil);
          const errorMessage = 'Maksimum şifrə sıfırlama cəhdlərinə çatıldı. Zəhmət olmasa 15 dəqiqə gözləyin.';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }

        set({ isLoading: true, error: null });
        try {
          const response = await authService.requestPasswordReset(email);

          get().incrementPasswordResetOtpResendAttempts();

          set({ isLoading: false, error: null });
          return response.data;
        } catch (error: any) {
          let errorMessage = 'OTP kodu yenidən göndərilərkən səhv baş verdi.';

          if (error.response?.status === 403) {
            errorMessage = 'OTP yenidən göndərmə cəhdi bloklanıb. Zəhmət olmasa bir az gözləyin və yenidən cəhd edin.';
          } else if (error.response?.status === 429) {
            errorMessage = 'Çox sayda cəhd. Zəhmət olmasa bir az gözləyin və yenidən cəhd edin.';
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.requestPasswordReset(email);
          set((state) => ({
            isLoading: false,
            error: null,
            tempEmail: email,
            isPasswordResetFlowActive: true,
            isOtpVerifiedForPasswordReset: false,
            otpResendState: {
              ...state.otpResendState,
              passwordResetLastResendTime: Date.now(),
              passwordResetResendAttempts: 0,
              isPasswordResetLockedOut: false,
              passwordResetLockoutUntil: null,
            },
          }));
          return response.data;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Şifrə sıfırlama kodu göndərilərkən səhv baş verdi.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      clearPasswordResetFlow: () => {
        set({
          isPasswordResetFlowActive: false,
          tempEmail: null,
          isOtpVerifiedForPasswordReset: false,
          passwordResetToken: null,
          otpResendState: {
            ...get().otpResendState,
            passwordResetResendAttempts: 0,
            passwordResetLastResendTime: null,
            passwordResetLockoutUntil: null,
            isPasswordResetLockedOut: false,
          },
        });
      },

      verifyOtp: async (otpData: OtpVerificationData) => {
        set({ isLoading: true, error: null });
        try {
          let response;
          // BURADA DƏYİŞİKLİK: refreshToken-ı otpData-dan çıxarın
          const { userType, token, email, isPasswordReset, refreshToken } = otpData;

          if (isPasswordReset) {
            // BURADA DƏYİŞİKLİK: refreshToken-ı API çağırışına ötürün
            response = await authService.validatePasswordResetToken(email, token, refreshToken || ''); // refreshToken yoxdursa boş string ötürün

            // actualPasswordResetToken təyinatı əvvəlki kimi qalır
            const actualPasswordResetToken = response.data?.refreshToken || response.data?.passwordResetToken || response.data?.token || response.data?.access_token;

            if (!actualPasswordResetToken) {
              console.error('Şifrə sıfırlama tokeni cavabda tapılmadı:', response.data);
              throw new Error('Şifrə sıfırlama tokeni cavabda tapılmadı.');
            }

            console.log("verifyOtp (isPasswordReset): Setting state", {
              isOtpVerifiedForPasswordReset: true,
              isPasswordResetFlowActive: true,
              passwordResetToken: actualPasswordResetToken,
              currentEmail: email
            });

            set({
              isLoading: false,
              error: null,
              isOtpVerifiedForPasswordReset: true,
              isPasswordResetFlowActive: true,
              passwordResetToken: actualPasswordResetToken,
              tempEmail: email,
            });
            return response.data;
          } else {
            // ... (qeydiyyat/login axını üçün verifyOtp-nin qalan hissəsi)
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

            await get().setToken(authToken);

            await get().setUserData({
              user: user as User,
              userType: userType as UserType,
              pendingProfileCompletionStatus: true,
              email: email,
            });

            set({
              isAuthenticated: true,
              isLoading: false,
              error: null,
              tempEmail: null,
              isPasswordResetFlowActive: false,
              isOtpVerifiedForPasswordReset: false,
              passwordResetToken: null,
              pendingProfileCompletion: {
                isPending: true,
                userType: userType as UserType,
                email: email,
                step: 'personalInfo',
              },
            });
            get().resetOtpResendState();
            return response.data;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'OTP təsdiqlənərkən səhv baş verdi.';
          set({ error: errorMessage, isLoading: false });

          if (otpData.isPasswordReset) {
            get().incrementPasswordResetOtpResendAttempts();
          } else {
            get().incrementOtpResendAttempts();
          }
          throw error;
        }
      },

      updatePassword: async (data: { email: string; token: string; newPassword: string; repeatPassword: string }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.updatePassword(data);
          set({ isLoading: false, error: null });
          get().clearPasswordResetFlow();
          return response.data;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Şifrə yenilənərkən səhv baş verdi.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      completeProfile: async (email: string, firstName: string, lastName: string, phone: string, userType: UserType, dateOfBirth?: string, businessName?: string) => {
        set({ isLoading: true, error: null });
        get().ensureApiClientAuth();

        const validation = get().validateProfileCompletionState();
        if (!validation.isValid) {
          const errorMessage = `Profil tamamlama doğrulama uğursuz oldu: ${validation.errors.join(', ')}`;
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
                email: email,
              });
              break;
            case 'individual_provider':
              response = await authService.completeIndividualProviderProfile({
                name: firstName, surname: lastName,
                description: businessName || '',
                phone,
                birthday: dateOfBirth || new Date().toISOString().split('T')[0],
                email: email,
              });
              break;
            case 'company_provider':
              response = await authService.completeCompanyProviderProfile({
                companyName: businessName || '',
                phone,
                description: `Company: ${businessName || ''}`,
                email: email,
              });
              break;
            default:
              throw new Error('completeProfile: Yanlış istifadəçi növü seçilib.');
          }

          const apiUserData = response.data?.user || response.data;

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
            email: email,
          });

          set({
            isLoading: false,
            error: null,
            pendingProfileCompletion: {
              isPending: nextStep !== null,
              userType: nextStep !== null ? userType : null,
              email: nextStep !== null ? email : null,
              step: nextStep,
            },
          });

          await get().fetchUserInformation(true);

          return { success: true, data: response.data, nextStep };
        } catch (error: any) {
          console.error('completeProfile: Profil tamamlama zamanı xəta:', error.response?.status, error.message);
          if (error.response) {
            if (error.response.data && typeof error.response.data === 'object') {
              for (const key in error.response.data) {
                // Hər hansı bir xəta detallarını qeyd etmək üçün buraya əlavə etmək olar
              }
            }
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
          warnings: [] as string[],
        };

        if (!state.isAuthenticated) {
          validationResult.isValid = false;
          validationResult.errors.push('İstifadəçi autentifikasiya olunmayıb');
        }

        if (!state.token) {
          validationResult.isValid = false;
          validationResult.errors.push('Autentifikasiya tokeni yoxdur');
        }

        if (!state.userType) {
          validationResult.isValid = false;
          validationResult.errors.push('İstifadəçi tipi təyin edilməyib');
        }

        if (!state.pendingProfileCompletion.isPending && state.userType) {
          validationResult.warnings.push('Profil tamamlanması gözlənilən kimi qeyd edilməyib - bu, profilin artıq tamamlandığını və ya state uyğunsuzluğunu göstərə bilər.');
        }

        if (state.pendingProfileCompletion.isPending && state.pendingProfileCompletion.step !== 'personalInfo') {
          validationResult.warnings.push(`Gözlənilən addım 'personalInfo' idi, lakin hazırkı addım '${state.pendingProfileCompletion.step}'`);
        }

        if (state.user) {
          const hasBasicInfo = state.userType === 'company_provider'
            ? (state.user.companyName && state.user.phone)
            : (state.user.name && state.user.surname);

          if (hasBasicInfo && state.pendingProfileCompletion.isPending) {
            validationResult.warnings.push('İstifadəçinin artıq əsas məlumatları var, lakin profil tamamlanması hələ də gözlənilən kimi qeyd edilib.');
          }
        }
        return validationResult;
      },

      clearCorruptedData: async () => {
        try {
          await AsyncStorage.multiRemove(['userToken', 'userData', 'otpResendState']);
        } catch (error) {
          console.error('clearCorruptedData: Keşlənmiş məlumatları silərkən xəta:', error);
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          tempEmail: null,
          token: null,
          userType: null,
          pendingProfileCompletion: initialPendingProfileCompletionState,
          otpResendState: initialFullOtpResendState,
          isPasswordResetFlowActive: false,
          isOtpVerifiedForPasswordReset: false,
          passwordResetToken: null,
        });

        delete apiClient.defaults.headers.common['Authorization'];
      },

      resetOtpResendState: () => {
        const newState: OtpResendState = {
          ...initialFullOtpResendState,
          passwordResetResendAttempts: get().otpResendState.passwordResetResendAttempts,
          passwordResetLastResendTime: get().otpResendState.passwordResetLastResendTime,
          passwordResetLockoutUntil: get().otpResendState.passwordResetLockoutUntil,
          isPasswordResetLockedOut: get().otpResendState.isPasswordResetLockedOut,
        };
        set({ otpResendState: newState });
        get().saveOtpResendState(newState);
      },

      resetPasswordResetOtpState: () => {
        const newState: OtpResendState = {
          ...get().otpResendState,
          passwordResetResendAttempts: 0,
          passwordResetLastResendTime: null,
          passwordResetLockoutUntil: null,
          isPasswordResetLockedOut: false,
        };
        set({ otpResendState: newState });
        get().saveOtpResendState(newState);
      },

      incrementOtpResendAttempts: () => {
        const currentState = get();
        const newAttempts = currentState.otpResendState.resendAttempts + 1;
        const isLockedOut = newAttempts >= 5;
        const lockoutUntil = isLockedOut ? Date.now() + 15 * 60 * 1000 : null;

        const newState = {
          ...currentState.otpResendState,
          resendAttempts: newAttempts,
          lastResendTime: Date.now(),
          lockoutUntil,
          isLockedOut,
        };

        set({ otpResendState: newState });
        get().saveOtpResendState(newState);
      },

      setOtpLockout: (lockoutUntil: number) => {
        const currentState = get();
        const newState = {
          ...currentState.otpResendState,
          lockoutUntil,
          isLockedOut: true,
        };
        set({ otpResendState: newState });
        get().saveOtpResendState(newState);
      },

      incrementPasswordResetOtpResendAttempts: () => {
        const currentState = get();
        const newAttempts = currentState.otpResendState.passwordResetResendAttempts + 1;
        const isLockedOut = newAttempts >= 5;
        const lockoutUntil = isLockedOut ? Date.now() + 15 * 60 * 1000 : null;

        const newState = {
          ...currentState.otpResendState,
          passwordResetResendAttempts: newAttempts,
          passwordResetLastResendTime: Date.now(),
          passwordResetLockoutUntil: lockoutUntil,
          isPasswordResetLockedOut: isLockedOut,
        };
        set({ otpResendState: newState });
        get().saveOtpResendState(newState);
      },

      setPasswordResetOtpLockout: (lockoutUntil: number) => {
        const currentState = get();
        const newState = {
          ...currentState.otpResendState,
          passwordResetLockoutUntil: lockoutUntil,
          isPasswordResetLockedOut: true,
        };
        set({ otpResendState: newState });
        get().saveOtpResendState(newState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        userType: state.userType,
        pendingProfileCompletion: state.pendingProfileCompletion,
        tempEmail: state.tempEmail,
        isPasswordResetFlowActive: state.isPasswordResetFlowActive,
        isOtpVerifiedForPasswordReset: state.isOtpVerifiedForPasswordReset,
        otpResendState: state.otpResendState,
        passwordResetToken: state.passwordResetToken,
      }),
      onRehydrateStorage: (state) => {
        if (state) {
          if (state.token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          }
          const now = Date.now();
          // Ümumi OTP kilidini təmizlə
          if (state.otpResendState.lockoutUntil && now > state.otpResendState.lockoutUntil) {
            state.otpResendState.isLockedOut = false;
            state.otpResendState.lockoutUntil = null;
            state.otpResendState.resendAttempts = 0;
          }
          // Şifrə sıfırlama OTP kilidini təmizlə
          if (state.otpResendState.passwordResetLockoutUntil && now > state.otpResendState.passwordResetLockoutUntil) {
            state.otpResendState.isPasswordResetLockedOut = false;
            state.otpResendState.passwordResetLockoutUntil = null;
            state.otpResendState.passwordResetResendAttempts = 0;
          }
        }
      },
    }
  )
);

export default useAuthStore;