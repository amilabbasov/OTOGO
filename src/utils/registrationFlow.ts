import { UserType } from '../types/common';
import { 
  USER_TYPES, 
  REGISTRATION_STATES,
  type RegistrationState,
  type RegistrationError,
  REGISTRATION_ERRORS
} from '../constants/registration';

export interface RegistrationFlowState {
  currentState: RegistrationState;
  userType: UserType | null;
  email: string;
  error: RegistrationError | null;
  canProceed: boolean;
  nextStep: string;
}

export class RegistrationFlowManager {
  private state: RegistrationFlowState;

  constructor() {
    this.state = {
      currentState: REGISTRATION_STATES.INITIAL,
      userType: null,
      email: '',
      error: null,
      canProceed: false,
      nextStep: 'Select user type'
    };
  }

  getState(): RegistrationFlowState {
    return { ...this.state };
  }

  setUserType(userType: UserType): void {
    this.state.userType = userType;
    this.state.currentState = REGISTRATION_STATES.USER_TYPE_SELECTED;
    this.state.canProceed = true;
    this.state.nextStep = 'Enter registration details';
    this.state.error = null;
  }

  setEmail(email: string): void {
    this.state.email = email.trim().toLowerCase();
  }

  markRegistered(): void {
    this.state.currentState = REGISTRATION_STATES.REGISTERED;
    this.state.nextStep = 'Verify OTP code';
    this.state.canProceed = true;
    this.state.error = null;
  }

  markOTPVerified(): void {
    this.state.currentState = REGISTRATION_STATES.OTP_VERIFIED;
    this.state.nextStep = 'Complete profile information';
    this.state.canProceed = true;
    this.state.error = null;
  }

  markProfileCompleted(): void {
    this.state.currentState = REGISTRATION_STATES.PROFILE_COMPLETED;
    this.state.nextStep = this.state.userType === USER_TYPES.DRIVER ? 'Complete setup' : 'Complete setup';
    this.state.canProceed = true;
    this.state.error = null;
  }

  markCompleted(): void {
    this.state.currentState = REGISTRATION_STATES.COMPLETED;
    this.state.nextStep = 'Welcome to the app!';
    this.state.canProceed = false;
    this.state.error = null;
  }

  setError(error: RegistrationError, message?: string): void {
    this.state.error = error;
    this.state.canProceed = false;
    
    switch (error) {
      case REGISTRATION_ERRORS.USER_NOT_FOUND:
        this.state.nextStep = 'Register again';
        this.state.currentState = REGISTRATION_STATES.INITIAL;
        break;
      case REGISTRATION_ERRORS.INVALID_OTP:
        this.state.nextStep = 'Enter correct OTP or resend';
        break;
      case REGISTRATION_ERRORS.EXPIRED_OTP:
        this.state.nextStep = 'Resend OTP code';
        break;
      default:
        this.state.nextStep = 'Try again';
    }
  }

  clearError(): void {
    this.state.error = null;
    this.updateCanProceed();
  }

  canRetry(): boolean {
    return this.state.error !== null && 
           this.state.error !== REGISTRATION_ERRORS.USER_NOT_FOUND;
  }

  shouldRestart(): boolean {
    return this.state.error === REGISTRATION_ERRORS.USER_NOT_FOUND;
  }

  getProgressPercentage(): number {
    switch (this.state.currentState) {
      case REGISTRATION_STATES.INITIAL:
        return 0;
      case REGISTRATION_STATES.USER_TYPE_SELECTED:
        return 20;
      case REGISTRATION_STATES.REGISTERED:
        return 40;
      case REGISTRATION_STATES.OTP_VERIFIED:
        return 60;
      case REGISTRATION_STATES.PROFILE_COMPLETED:
        return 80;
      case REGISTRATION_STATES.COMPLETED:
        return 100;
      default:
        return 0;
    }
  }

  getStepTitle(): string {
    switch (this.state.currentState) {
      case REGISTRATION_STATES.INITIAL:
        return 'Getting Started';
      case REGISTRATION_STATES.USER_TYPE_SELECTED:
        return 'Account Registration';
      case REGISTRATION_STATES.REGISTERED:
        return 'Email Verification';
      case REGISTRATION_STATES.OTP_VERIFIED:
        return 'Profile Setup';
      case REGISTRATION_STATES.PROFILE_COMPLETED:
        return this.state.userType === USER_TYPES.DRIVER ? 'Final Setup' : 'Final Setup';
      case REGISTRATION_STATES.COMPLETED:
        return 'Welcome!';
      default:
        return 'Registration';
    }
  }

  private updateCanProceed(): void {
    this.state.canProceed = this.state.error === null && 
                           this.state.currentState !== REGISTRATION_STATES.COMPLETED;
  }

  reset(): void {
    this.state = {
      currentState: REGISTRATION_STATES.INITIAL,
      userType: null,
      email: '',
      error: null,
      canProceed: false,
      nextStep: 'Select user type'
    };
  }
}

// Factory function for creating flow manager
export const createRegistrationFlow = (): RegistrationFlowManager => {
  return new RegistrationFlowManager();
};

// Helper for getting user-friendly error messages
export const getErrorMessage = (error: RegistrationError): string => {
  switch (error) {
    case REGISTRATION_ERRORS.USER_NOT_FOUND:
      return 'Account not found. Please register again.';
    case REGISTRATION_ERRORS.INVALID_OTP:
      return 'Invalid OTP code. Please check and try again.';
    case REGISTRATION_ERRORS.EXPIRED_OTP:
      return 'OTP code has expired. Please request a new one.';
    case REGISTRATION_ERRORS.DUPLICATE_EMAIL:
      return 'This email is already registered. Try logging in instead.';
    case REGISTRATION_ERRORS.WEAK_PASSWORD:
      return 'Password must be at least 8 characters with uppercase, lowercase, number and special character.';
    case REGISTRATION_ERRORS.VALIDATION_ERROR:
      return 'Please check your input and try again.';
    case REGISTRATION_ERRORS.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Helper for determining next navigation route
export const getNextRoute = (state: RegistrationFlowState): string => {
  switch (state.currentState) {
    case REGISTRATION_STATES.INITIAL:
      return 'UserTypeSelection';
    case REGISTRATION_STATES.USER_TYPE_SELECTED:
      return 'Register';
    case REGISTRATION_STATES.REGISTERED:
      return 'OTP';
    case REGISTRATION_STATES.OTP_VERIFIED:
      return 'PersonalInfo';
    case REGISTRATION_STATES.PROFILE_COMPLETED:
      return state.userType === USER_TYPES.DRIVER ? 'MainApp' : 'MainApp';
    case REGISTRATION_STATES.COMPLETED:
      return 'MainApp';
    default:
      return 'Login';
  }
};
