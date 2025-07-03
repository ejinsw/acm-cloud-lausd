// Define all application routes
export const routes = {
  // Landing page
  home: '/',
  
  // Auth routes
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  emailVerification: '/auth/email-verification',
  
  // Dashboard routes
  studentDashboard: '/dashboard/student',
  instructorDashboard: '/dashboard/instructor',
  adminDashboard: '/dashboard/admin',
  
  // Session routes
  exploreSessions: '/sessions/explore',
  mySession: (id?: string) => id ? `/sessions/my/${id}` : '/sessions/my',
  sessionDetails: (id: string) => `/sessions/explore/${id}`,
  createSession: '/sessions/create',
  editSession: (id: string) => `/sessions/edit/${id}`,
  
  // Instructor routes
  instructorProfile: (id: string) => `/instructor/${id}`,

  // Account routes
  profile: '/profile',
  settings: '/profile?tab=settings',
  billing: '/account/billing',
  notifications: '/account/notifications',
  
  // Help center
  help: '/help',
  contact: '/contact',
  
  // Legal
  terms: '/legal/terms',
  privacy: '/legal/privacy',
};

// Type for the routes object
export type Routes = typeof routes; 