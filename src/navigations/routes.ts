export enum Routes {
    // Root routes
    onboarding = 'onboarding',
    auth = 'auth',
    main = 'main',
    mainApp = 'mainApp',
    
    // Onboarding routes
    onboardingPager = 'onboardingPager',
    userTypeSelection = 'userTypeSelection',
    
    // Auth routes
    login = 'login',
    register = 'register',
    forgotPassword = 'forgotPassword',
    otp = 'otp',
    passwordResetOtp = 'passwordResetOtp',
    resetPassword = 'resetPassword',
    personalInfo = 'personalInfo',
    serviceSelection = 'serviceSelection',
    products = 'products',
    branches = 'branches',
    
    // Driver routes
    driverHome = 'driverHome',
    driverServices = 'driverServices',
    driverBookings = 'driverBookings',
    driverProfile = 'driverProfile',
    
    // Provider routes
    providerHome = 'providerHome',
    providerServices = 'providerServices',
    providerBookings = 'providerBookings',
    providerEarnings = 'providerEarnings',
    providerProfile = 'providerProfile',
    
    // Tab navigators
    driverTabs = 'driverTabs',
    providerTabs = 'providerTabs',
}