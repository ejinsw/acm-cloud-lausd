/**
 * Type definitions for the frontend that mirror the Prisma schema
 */

export interface Student {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  birthdate?: string;
  grade?: number;
  
  // Address
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  
  // School
  schoolName?: string;
  
  parentEmail?: string;
  reviews?: Review[];
  sessions?: Session[];
}

export interface Instructor {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  birthdate?: string;
  grade?: number;
  
  // Address
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  
  // School
  schoolName?: string;
  
  certificationUrls?: string[];
  averageRating?: number;
  reviews?: Review[];
  sessions?: Session[];
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
  
  instructorId: string;
  instructor?: Instructor;
  students?: Student[];
  subjects?: Subject[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  
  studentId: string;
  student?: Student;
  instructorId: string;
  instructor?: Instructor;
}

export interface Subject {
  id: string;
  name: string;
  
  instructors?: Instructor[];
  sessions?: Session[];
}

export interface User {
  id: string;
  email?: string;
  role: 'student' | 'instructor' | 'admin';
  student?: Student;
  instructor?: Instructor;
} 