import { UserType } from './common';

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isAvailable: boolean;
  userType: UserType;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  categories: string[];
  tags: string[];
  services: Service[];
  workingHours: WorkingHours;
  documents: Document[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  tags: string[];
  isActive: boolean;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface Document {
  id: string;
  type: 'id_card' | 'certificate' | 'license' | 'insurance';
  url: string;
  isVerified: boolean;
  uploadedAt: string;
}

export interface ProviderStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: number; // in minutes
} 