export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  preferences: CustomerPreferences;
  bookings: Booking[];
  favorites: string[]; // Provider IDs
}

export interface CustomerPreferences {
  notifications: boolean;
  language: string;
  theme: 'light' | 'dark';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Booking {
  id: string;
  providerId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  address: string;
  notes?: string;
} 