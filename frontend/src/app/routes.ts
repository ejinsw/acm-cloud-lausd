export type RouteIconName =
  | "home"
  | "dashboard"
  | "queue"
  | "history"
  | "profile"
  | "settings"
  | "sessions"
  | "review"
  | "help"
  | "contact"
  | "auth"
  | "admin";

export interface RouteMeta {
  title: string;
  icon: RouteIconName;
  section: "public" | "auth" | "app";
  showShell: boolean;
}

// Define all application routes
export const routes = {
  // Landing page
  home: "/",

  // Auth routes
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  emailVerification: "/auth/email-verification",

  // Dashboard routes
  studentDashboard: "/dashboard/student",
  instructorDashboard: "/dashboard/instructor",
  adminDashboard: "/dashboard/admin",
  dashboard: (role: string) =>
    role === "admin"
      ? "/dashboard/admin"
      : role === "instructor"
        ? "/dashboard/instructor"
        : "/dashboard/student",

  // Session routes
  // Deprecated in v1: scheduled/planned session flows are hidden from navigation.
  exploreSessions: "/sessions/explore",
  mySession: (id?: string) => (id ? `/sessions/my/${id}` : "/sessions/my"),
  sessionDetails: (id: string) => `/sessions/explore/${id}`,
  session: (id: string) => `/sessions/${id}`,
  createSession: "/sessions/create",
  editSession: (id: string) => `/sessions/edit/${id}`,

  // Queue routes
  queue: "/queue",
  joinQueue: "/queue/join",
  instructorQueue: "/queue/instructor",

  // Instructor routes
  instructorProfile: (id: string) => `/instructor/${id}`,

  // Account routes
  settings: "/profile",
  notifications: "/account/notifications",

  // Help center
  help: "/help",
  contact: "/contact",

  // Legal
  terms: "/legal/terms",
  privacy: "/legal/privacy",
  history: "/history",
};

export const routeMeta: Record<string, RouteMeta> = {
  [routes.home]: {
    title: "Home",
    icon: "home",
    section: "public",
    showShell: false,
  },
  [routes.signIn]: {
    title: "Sign In",
    icon: "auth",
    section: "auth",
    showShell: false,
  },
  [routes.signUp]: {
    title: "Create Account",
    icon: "auth",
    section: "auth",
    showShell: false,
  },
  [routes.forgotPassword]: {
    title: "Reset Password",
    icon: "auth",
    section: "auth",
    showShell: false,
  },
  [routes.emailVerification]: {
    title: "Email Verification",
    icon: "auth",
    section: "auth",
    showShell: false,
  },
  [routes.studentDashboard]: {
    title: "Student Dashboard",
    icon: "dashboard",
    section: "app",
    showShell: true,
  },
  [routes.instructorDashboard]: {
    title: "Instructor Dashboard",
    icon: "dashboard",
    section: "app",
    showShell: true,
  },
  [routes.adminDashboard]: {
    title: "Admin Dashboard",
    icon: "admin",
    section: "app",
    showShell: true,
  },
  [routes.queue]: {
    title: "Queue",
    icon: "queue",
    section: "app",
    showShell: true,
  },
  [routes.joinQueue]: {
    title: "Join Queue",
    icon: "queue",
    section: "app",
    showShell: true,
  },
  [routes.instructorQueue]: {
    title: "Tutoring Queue",
    icon: "queue",
    section: "app",
    showShell: true,
  },
  [routes.history]: {
    title: "History",
    icon: "history",
    section: "app",
    showShell: true,
  },
  [routes.settings]: {
    title: "Settings",
    icon: "settings",
    section: "app",
    showShell: true,
  },
  [routes.exploreSessions]: {
    title: "Session Marketplace",
    icon: "sessions",
    section: "app",
    showShell: true,
  },
  [routes.createSession]: {
    title: "Scheduled Sessions Disabled",
    icon: "sessions",
    section: "app",
    showShell: true,
  },
  [routes.help]: {
    title: "Help Center",
    icon: "help",
    section: "public",
    showShell: false,
  },
  ["/help/faq"]: {
    title: "FAQs",
    icon: "help",
    section: "public",
    showShell: false,
  },
  [routes.contact]: {
    title: "Contact",
    icon: "contact",
    section: "public",
    showShell: false,
  },
};

export function getRouteMeta(pathname: string): RouteMeta {
  const direct = routeMeta[pathname];
  if (direct) return direct;

  if (pathname.startsWith("/sessions/explore/")) {
    return { title: "Session Details", icon: "sessions", section: "app", showShell: true };
  }
  if (pathname.startsWith("/sessions/")) {
    return { title: "Live Session", icon: "sessions", section: "app", showShell: true };
  }
  if (pathname.startsWith("/review/")) {
    return { title: "Review Session", icon: "review", section: "app", showShell: true };
  }
  if (pathname.startsWith("/instructor/")) {
    return { title: "Instructor Profile", icon: "profile", section: "app", showShell: true };
  }
  if (pathname.startsWith("/auth/")) {
    return { title: "Authentication", icon: "auth", section: "auth", showShell: false };
  }

  return { title: "Tutoring App", icon: "home", section: "app", showShell: true };
}

// Type for the routes object
export type Routes = typeof routes;
