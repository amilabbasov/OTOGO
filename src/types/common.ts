export type UserType = 'driver' | 'provider';

export interface AuthUser {
  id: string;
  email: string;
  userType: UserType;
  name: string;
  phone?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface NavigationParams {
  userType?: UserType;
} 