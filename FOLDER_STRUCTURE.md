# otogo - Professional Folder Structure

## Overview
otogo is a service marketplace app connecting drivers with service providers. The app has two main user types with different interfaces and functionalities.

## User Types
- **Driver**: Books services, finds providers, manages bookings
- **Provider**: Offers services, manages bookings, tracks earnings

## Folder Structure

```
src/
├── components/
│   ├── common/           # Shared components used across user types
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Loading/
│   │   └── Modal/
│   ├── customer/         # Customer-specific components
│   │   ├── ProviderCard/
│   │   ├── ServiceCard/
│   │   └── BookingCard/
│   └── provider/         # Provider-specific components
│       ├── ServiceForm/
│       ├── BookingItem/
│       └── EarningsCard/
├── screens/
│   ├── auth/            # Authentication & onboarding flow
│   │   ├── onboarding/  # User type selection (first screen)
│   │   ├── login/       # Login screen
│   │   ├── register/    # Registration screen
│   │   ├── forgot/      # Forgot password
│   │   └── otp/         # OTP verification
│   ├── customer/        # Customer-specific screens
│   │   ├── home/        # Browse providers, search services
│   │   ├── services/    # View available services
│   │   ├── bookings/    # Manage bookings
│   │   └── profile/     # Customer profile & settings
│   └── provider/        # Provider-specific screens
│       ├── home/        # Dashboard, stats
│       ├── services/    # Manage offered services
│       ├── bookings/    # View & manage bookings
│       ├── earnings/    # Track earnings & analytics
│       └── profile/     # Provider profile & settings
├── navigations/
│   ├── OnboardingNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── CustomerNavigator.tsx
│   └── ProviderNavigator.tsx
├── stores/
│   ├── auth/           # Authentication & user type
│   ├── customer/       # Customer-specific state
│   └── provider/       # Provider-specific state
├── services/
│   ├── api/
│   │   ├── auth.ts
│   │   ├── customer.ts
│   │   └── provider.ts
│   └── storage/
│       └── LocalStorage.ts
├── types/
│   ├── common.ts       # Shared types (UserType, AuthUser, etc.)
│   ├── customer.ts     # Customer-specific types
│   └── provider.ts     # Provider-specific types
├── utils/
│   ├── validation.ts
│   ├── helpers.ts
│   └── constants.ts
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
└── locales/
    ├── en.json
    ├── az.json
    └── ru.json
```

## Navigation Flow

### App Launch Flow
1. **App Opens** → Check authentication status
2. **If Not Authenticated** → Onboarding (User Type Selection)
3. **If Authenticated** → Main App (Customer or Provider)

### Customer Flow
1. **Onboarding** → Select "Customer"
2. **Authentication** → Login/Register
3. **Main App** → Customer Navigator
   - **Home**: Browse providers, search services
   - **Services**: View available service categories
   - **Bookings**: Manage active/past bookings
   - **Profile**: Settings, preferences, account

### Provider Flow
1. **Onboarding** → Select "Service Provider"
2. **Authentication** → Login/Register
3. **Main App** → Provider Navigator
   - **Home**: Dashboard with stats
   - **Services**: Manage offered services
   - **Bookings**: View & respond to bookings
   - **Earnings**: Track income & analytics
   - **Profile**: Settings, documents, account

## Key Features by User Type

### Customer Features
- Browse service providers
- Search by category/location
- Book services
- Track booking status
- Rate & review providers
- Manage favorites
- Payment integration

### Provider Features
- Create service listings
- Set availability & pricing
- Manage bookings
- Track earnings
- Upload documents
- Set categories & tags
- Respond to customer requests

## Technical Architecture

### State Management
- **Zustand** for global state
- Separate stores for different user types
- Persistent storage for auth & preferences

### Navigation
- **React Navigation** with type-safe routing
- Separate navigators for different user types
- Conditional rendering based on user type

### Type Safety
- **TypeScript** throughout the app
- Separate type definitions for each user type
- Shared common types

### Internationalization
- **react-i18next** for multi-language support
- Separate translation files for each language

## Benefits of This Structure

1. **Scalability**: Easy to add new features for each user type
2. **Maintainability**: Clear separation of concerns
3. **Type Safety**: Full TypeScript support
4. **Performance**: Lazy loading of user-specific components
5. **Professional**: Industry-standard architecture
6. **Flexibility**: Easy to customize per user type 