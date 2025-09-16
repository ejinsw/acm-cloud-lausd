/**
 * Type definitions for the frontend that mirror the Prisma schema
 */

export interface User {
  id: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  firstName: string;
  lastName: string;
  birthdate?: string;
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  schoolName?: string;
  profilePicture?: string;
  bio?: string;
  grade?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  interests?: string[];
  learningGoals?: string[];
  education?: string[];
  experience?: string[];
  certificationUrls?: string[];
  subjects?: Array<{ id: string; name: string }>;
  averageRating?: number;
  sessionRequests?: SessionRequest[];
}

export interface Session {
  id: string;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  zoomLink?: string;
  maxAttendees?: number;
  createdAt?: string;
  updatedAt?: string;

  // Session Details
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  materials?: string[];
  objectives?: string[];

  instructorId: string;
  instructor?: User;
  students?: User[];
  subjects?: Subject[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;

  ownerId: string;
  owner?: {
    firstName: string;
    lastName: string;
  };
  recipientId: string;
  recipient?: {
    firstName: string;
    lastName: string;
  };
  sessionHistoryItemId?: string;
  sessionHistoryItem?: {
    id: string;
    name: string;
    description?: string;
    startTime?: string;
    endTime?: string;
  };
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  category?: string;
  level?: string;

  instructors?: User[];
  sessions?: Session[];
}

export interface SessionRequest {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "PENDING" | "ACCEPTED" | "REJECTED";

  studentId: string;
  student?: User;
  sessionId: string;
  session?: Session;
}

export interface SessionHistoryItem {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  zoomLink?: string;
  maxAttendees?: number;

  // Session Details
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  materials?: string[];
  objectives?: string[];
  subjects?: string[];
  instructorName?: string;
  instructorId?: string;
  studentNames?: string[];

  userId: string;
  relatedReview?: Review;
}
