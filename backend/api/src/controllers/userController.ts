import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types
interface UserProfile {
  id: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  firstName: string;
  lastName: string;
  birthdate?: Date;
  // ... other fields from schema
}

/**
 * Get all instructors.
 * Supports filtering by name or subject using query parameters:
 * - `name`: Filter by instructor's name.
 * - `subject`: Filter by subjects taught by the instructor.
 *
 * @route GET /instructors
 * @body {string} [name]
 * @body {string} [subject]
 */
export const getAllInstructors = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, subject } = req.query;
    const where: any = { role: 'INSTRUCTOR' };
    if (name) {
      where.OR = [
        { firstName: { contains: name, mode: 'insensitive' } },
        { lastName: { contains: name, mode: 'insensitive' } },
      ];
    }
    if (subject) {
      where.subjects = {
        some: { name: { contains: subject, mode: 'insensitive' } },
      };
    }
    const instructors = await prisma.user.findMany({
      where,
      include: {
        subjects: true,
        instructorReviews: true,
        instructorSessions: true,
      },
    });

    res.json({ instructors });
  }
);

/**
 * Get a specific instructor by their ID.
 *
 * @route GET /instructors/:id
 * @param {string} id - The unique identifier of the instructor.
 */
export const getInstructorById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const instructor = await prisma.user.findUnique({
      where: { id },
      include: {
        subjects: true,
        instructorReviews: true,
        instructorSessions: true,
      },
    });
    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      res.status(404).json({ message: 'Instructor not found' });
      return;
    }
    res.json({ instructor });
  }
);

/**
 * Update an existing instructor's profile by their ID.
 *
 * @route PUT /instructors/:id
 * @param {string} id - The unique identifier of the instructor.
 * @body {string[]} [certificationUrls] - Updated list of certification URLs (optional).
 * @body {string[]} [subjects] - Updated list of subjects (optional).
 * @body {number} [averageRating] - Updated average rating (optional).
 */
export const updateInstructor = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const data = { ...req.body };

    // Instructors cannot update these fields
    if ('schoolName' in data) delete data.schoolName;
    if ('role' in data) delete data.role;
    if ('verified' in data) delete data.verified;

    // Only allow instructor-specific and common fields
    const allowedFields = [
      // Common fields
      'firstName',
      'lastName',
      'birthdate',
      'street',
      'apartment',
      'city',
      'state',
      'zip',
      'country',
      'profilePicture',
      'bio',
      // Instructor-specific
      'education',
      'experience',
      'certificationUrls',
      'subjects',
    ];
    Object.keys(data).forEach(key => {
      if (!allowedFields.includes(key)) delete data[key];
    });

    // --- Validation ---
    const validation = await validateUserUpdatePayload(data, 'INSTRUCTOR');
    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }
    // --- End Validation ---

    // Handle subjects relation if present
    if (data.subjects) {
      data.subjects = {
        set: [],
        connect: data.subjects.map((subjectId: string) => ({ id: subjectId })),
      };
    }

    const updatedInstructor = await prisma.user.update({
      where: { id },
      data,
      include: {
        subjects: true,
        instructorReviews: true,
        instructorSessions: true,
      },
    });

    res.json({ instructor: updatedInstructor });
  }
);

/**
 * Delete an instructor profile by their ID.
 *
 * @route DELETE /instructors/:id
 * @param {string} id - The unique identifier of the instructor to delete.
 */
export const deleteInstructor = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingInstructor = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingInstructor || existingInstructor.role !== 'INSTRUCTOR') {
    res.status(404).json({ message: 'Instructor not found' });
    return;
  }

  await prisma.user.delete({ where: { id } });
  res.status(200).json({ message: 'Instructor deleted successfully' });
});

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private
 */
export const getUserProfile = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get user profile
  (req.user as { sub: string }) = { sub: 'instructor1' };
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized');
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ user });
});

async function validateUserUpdatePayload(
  data: any,
  role: 'INSTRUCTOR' | 'STUDENT'
): Promise<{ valid: boolean; message?: string }> {
  // Define allowed fields for each role
  const commonFields = [
    'street',
    'apartment',
    'city',
    'state',
    'zip',
    'country',
    'profilePicture',
    'bio',
  ];
  const instructorFields = [
    'firstName',
    'lastName',
    'birthdate',
    'education',
    'experience',
    'certificationUrls',
    'subjects',
  ];
  const studentFields = [
    'grade',
    'parentFirstName',
    'parentLastName',
    'parentEmail',
    'parentPhone',
    'interests',
    'learningGoals',
  ];

  let allowedFields = [...commonFields];
  if (role === 'INSTRUCTOR') allowedFields = allowedFields.concat(instructorFields);
  if (role === 'STUDENT') allowedFields = allowedFields.concat(studentFields);

  // Check for unexpected fields
  for (const key of Object.keys(data)) {
    if (!allowedFields.includes(key)) {
      return { valid: false, message: `Unexpected field: ${key}` };
    }
  }

  // Check for required fields that shouldn't be empty
  const requiredFields = ['firstName', 'lastName'];
  for (const field of requiredFields) {
    if (
      field in data &&
      (data[field] === '' || data[field] === null || data[field] === undefined)
    ) {
      return {
        valid: false,
        message: `${field} cannot be empty. Please provide a valid ${field}.`,
      };
    }
  }

  // --- Common Fields ---
  if ('street' in data && typeof data.street !== 'string') {
    return {
      valid: false,
      message: 'Street address must be text. Please enter a valid street address.',
    };
  }
  if ('apartment' in data && typeof data.apartment !== 'string') {
    return {
      valid: false,
      message: 'Apartment/Suite must be text. Please enter a valid apartment or suite number.',
    };
  }
  if ('city' in data && typeof data.city !== 'string') {
    return { valid: false, message: 'City must be text. Please enter a valid city name.' };
  }
  if ('state' in data && typeof data.state !== 'string') {
    return { valid: false, message: 'State must be text. Please select a valid state.' };
  }
  if ('zip' in data && typeof data.zip !== 'string') {
    return { valid: false, message: 'ZIP code must be text. Please enter a valid ZIP code.' };
  }
  if ('country' in data && typeof data.country !== 'string') {
    return { valid: false, message: 'Country must be text. Please select a valid country.' };
  }
  if ('profilePicture' in data && typeof data.profilePicture !== 'string') {
    return {
      valid: false,
      message: 'Profile picture must be a valid image URL. Please provide a valid image link.',
    };
  }
  if ('bio' in data && typeof data.bio !== 'string') {
    return { valid: false, message: 'Bio must be text. Please enter a valid bio description.' };
  }

  // --- Instructor Fields ---
  if (role === 'INSTRUCTOR') {
    // Check for instructor-specific required fields
    const instructorRequiredFields = [
      'education',
      'experience',
      'certificationUrls',
      'birthdate',
    ];
    for (const field of instructorRequiredFields) {
      if (
        field in data &&
        (data[field] === '' || data[field] === null || data[field] === undefined)
      ) {
        return {
          valid: false,
          message: `${field} cannot be empty. Please provide a valid ${field}.`,
        };
      }
    }

    if ('email' in data) {
      if (typeof data.email !== 'string') {
        return { valid: false, message: 'email must be a string' };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return { valid: false, message: 'email must be a valid email address' };
      }
    }
    if ('firstName' in data && typeof data.firstName !== 'string') {
      return { valid: false, message: 'firstName must be a string' };
    }
    if ('lastName' in data && typeof data.lastName !== 'string') {
      return { valid: false, message: 'lastName must be a string' };
    }
    if ('birthdate' in data) {
      if (
        !(typeof data.birthdate === 'string' && !isNaN(Date.parse(data.birthdate))) &&
        !(data.birthdate instanceof Date)
      ) {
        return { valid: false, message: 'birthdate must be a valid ISO string or Date' };
      }
    }
    // Array of strings fields
    const arrayStringFields = [
      'education',
      'experience',
      'certificationUrls',
      'interests',
      'learningGoals',
    ];
    for (const field of arrayStringFields) {
      if (field in data) {
        if (!Array.isArray(data[field]) || !data[field].every((v: any) => typeof v === 'string')) {
          return { valid: false, message: `${field} must be an array of strings` };
        }
      }
    }

    // Validate subjects if present
    if ('subjects' in data) {
      if (!Array.isArray(data.subjects)) {
        return { valid: false, message: 'subjects must be an array of subject IDs' };
      }
      
      if (data.subjects.length === 0) {
        return { valid: false, message: 'subjects cannot be empty. Please provide at least one subject.' };
      }

      // Check if all subject IDs are valid strings
      if (!data.subjects.every((subjectId: any) => typeof subjectId === 'string' && subjectId.trim() !== '')) {
        return { valid: false, message: 'All subject IDs must be valid non-empty strings' };
      }

      // Validate that all subjects exist in the database
      try {
        const existingSubjects = await prisma.subject.findMany({
          where: {
            id: { in: data.subjects }
          },
          select: { id: true }
        });

        if (existingSubjects.length !== data.subjects.length) {
          const existingIds = existingSubjects.map(s => s.id);
          const invalidIds = data.subjects.filter((id: string) => !existingIds.includes(id));
          return { valid: false, message: `Invalid subject IDs: ${invalidIds.join(', ')}` };
        }
      } catch (error) {
        return { valid: false, message: 'Error validating subjects. Please try again.' };
      }
    }
    
  }

  // --- Student Fields ---
  if (role === 'STUDENT') {
    // Check for student-specific required fields
    const studentRequiredFields = [
      'grade',
      'parentFirstName',
      'parentLastName',
      'parentEmail',
      'parentPhone',
      'interests',
      'learningGoals',
    ];
    for (const field of studentRequiredFields) {
      if (
        field in data &&
        (data[field] === '' || data[field] === null || data[field] === undefined)
      ) {
        return {
          valid: false,
          message: `${field} cannot be empty. Please provide a valid ${field}.`,
        };
      }
    }

    if ('grade' in data && typeof data.grade !== 'string') {
      return { valid: false, message: 'grade must be a string' };
    }
    if ('parentFirstName' in data && typeof data.parentFirstName !== 'string') {
      return { valid: false, message: 'parentFirstName must be a string' };
    }
    if ('parentLastName' in data && typeof data.parentLastName !== 'string') {
      return { valid: false, message: 'parentLastName must be a string' };
    }
    if ('parentEmail' in data) {
      if (typeof data.parentEmail !== 'string') {
        return { valid: false, message: 'parentEmail must be a string' };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parentEmail)) {
        return { valid: false, message: 'parentEmail must be a valid email address' };
      }
    }
    if ('parentPhone' in data) {
      if (typeof data.parentPhone !== 'string') {
        return { valid: false, message: 'parentPhone must be a string' };
      }
      // Simple phone validation (optional, can be improved)
      if (!/^\+?[0-9\-\s()]{7,20}$/.test(data.parentPhone)) {
        return { valid: false, message: 'parentPhone must be a valid phone number' };
      }
    }
    // Array of strings fields
    const arrayStringFields = ['interests', 'learningGoals'];
    for (const field of arrayStringFields) {
      if (field in data) {
        if (!Array.isArray(data[field]) || !data[field].every((v: any) => typeof v === 'string')) {
          return { valid: false, message: `${field} must be an array of strings` };
        }
      }
    }
  }

  return { valid: true };
}

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
export const updateUserProfile = expressAsyncHandler(async (req: Request, res: Response) => {
  (req.user as { sub: string }) = { sub: 'instructor1' };
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const data = { ...req.body };

  const validation = await validateUserUpdatePayload(data, user.role);
  if (!validation.valid) {
    res.status(400).json({ message: validation.message });
    return;
  }

  if (user.role === 'INSTRUCTOR') {
    // Instructors cannot update these fields
    if ('schoolName' in data) delete data.schoolName;
    if ('role' in data) delete data.role;
    if ('verified' in data) delete data.verified;
    // Only allow instructor-specific and common fields
    const allowedFields = [
      'firstName',
      'lastName',
      'birthdate',
      'street',
      'apartment',
      'city',
      'state',
      'zip',
      'country',
      'profilePicture',
      'bio',
      'education',
      'experience',
      'certificationUrls',
      'subjects',
    ];
    Object.keys(data).forEach(key => {
      if (!allowedFields.includes(key)) delete data[key];
    });
    // Handle subjects relation if present
    if (data.subjects) {
      data.subjects = {
        set: [],
        connect: data.subjects.map((subjectId: string) => ({ id: subjectId })),
      };
    }
  } else if (user.role === 'STUDENT') {
    // Students cannot update these fields
    ['email', 'birthdate', 'schoolName', 'firstName', 'lastName', 'role', 'verified'].forEach(
      field => {
        if (field in data) delete data[field];
      }
    );
    // Only allow student-specific and common fields
    const allowedFields = [
      // Common fields
      'street',
      'apartment',
      'city',
      'state',
      'zip',
      'country',
      'profilePicture',
      'bio',
      // Student-specific
      'grade',
      'parentFirstName',
      'parentLastName',
      'parentEmail',
      'parentPhone',
      'interests',
      'learningGoals',
    ];
    Object.keys(data).forEach(key => {
      if (!allowedFields.includes(key)) delete data[key];
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    include: {
      subjects: true,
      instructorReviews: true,
      instructorSessions: true,
      studentSessions: true,
    },
  });

  res.json({ user: updatedUser });
});

/**
 * @route DELETE /api/users/profile
 * @desc Delete user account
 * @access Private
 */
export const deleteUser = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement delete user

  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!existingUser) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  await prisma.user.delete({ where: { id: userId } });
  res.status(200).json({ message: 'User deleted successfully' });
});

/**
 * @route GET /api/users/students
 * @desc Get all students (instructor only)
 * @access Private/Instructor
 */
export const getStudents = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get all students
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized');
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'INSTRUCTOR') {
    res.status(403);
    throw new Error('Access denied');
  }

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: { studentSessions: true },
  });

  res.json({ students });
});

/**
 * @route GET /api/users/instructors
 * @desc Get all instructors (student only)
 * @access Private/Student
 */
export const getInstructors = expressAsyncHandler(async (req: Request, res: Response) => {
  if ((req.user as { role: string })?.role !== 'STUDENT') {
    res.status(403);
    throw new Error('Not authorized - Student access only');
  }

  const instructors = await prisma.user.findMany({
    where: { role: 'INSTRUCTOR' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      bio: true,
      education: true,
      experience: true,
      averageRating: true,
      subjects: {
        select: {
          id: true,
          name: true,
          level: true,
        },
      },
      instructorReviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  res.json({ instructors });
});

/**
 * @route GET /api/users/sessions
 * @desc Get user's sessions
 * @access Private
 */
export const getUserSessions = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { id: string })?.id;
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      instructorSessions: {
        include: {
          students: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          subjects: true,
        },
      },
      studentSessions: {
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          subjects: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const sessions = user.role === 'INSTRUCTOR' ? user.instructorSessions : user.studentSessions;
  res.json({ sessions });
});

/**
 * @route GET /api/users/reviews
 * @desc Get user's reviews
 * @access Private
 */
export const getUserReviews = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { id: string })?.id;
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const reviews =
    user.role === 'INSTRUCTOR'
      ? await prisma.review.findMany({
          where: { instructorId: userId },
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        })
      : await prisma.review.findMany({
          where: { studentId: userId },
          include: {
            instructor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });

  res.json({ reviews });
});
