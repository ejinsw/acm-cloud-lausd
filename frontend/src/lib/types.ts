/**
 * Type definitions for the frontend that mirror the Prisma schema
 */

export interface User {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  verified: boolean;
  firstName: string;
  lastName: string;
  birthdate?: string;
  
  // Address
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  
  // School
  schoolName?: string;
  
  // Profile
  profilePicture?: string;
  bio?: string;
  
  // Role-specific fields
  grade?: string; // For students
  parentFirstName?: string; // For students
  parentLastName?: string; // For students
  parentEmail?: string; // For students
  parentPhone?: string; // For students
  interests?: string[]; // For students
  learningGoals?: string[]; // For students
  education?: string[]; // For instructors
  experience?: string[]; // For instructors
  certificationUrls?: string[]; // For instructors
  averageRating?: number; // For instructors
  
  // Relations
  studentReviews?: Review[];
  instructorReviews?: Review[];
  instructorSessions?: Session[];
  studentSessions?: Session[];
  subjects?: Subject[];
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
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
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
  
  studentId: string;
  student?: User;
  instructorId: string;
  instructor?: User;
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

// Convenience types for specific roles
export interface Student extends User {
  role: 'STUDENT';
  grade?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  interests?: string[];
  learningGoals?: string[];
}

export interface Instructor extends User {
  role: 'INSTRUCTOR';
  education?: string[];
  experience?: string[];
  certificationUrls?: string[];
  averageRating?: number;
  subjects?: Subject[];
} 