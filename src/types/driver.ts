export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  preferences: DriverPreferences;
  bookings: Booking[];
  favorites: string[];
}

export interface DriverPreferences {
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