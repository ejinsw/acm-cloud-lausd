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
    delete data.schoolName;
    delete data.role;
    delete data.verified;

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
      // Note: subjects field is not in the UI, so we don't include it
    ];
    Object.keys(data).forEach(key => {
      if (!allowedFields.includes(key)) delete data[key];
    });

    // Filter out undefined and null values to only update provided fields
    const filteredData: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        filteredData[key] = data[key];
      }
    });

    // --- Validation ---
    const validation = await validateUserUpdatePayload(filteredData, 'INSTRUCTOR');
    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }
    // --- End Validation ---

    // Note: subjects handling removed since it's not in the UI

    // Only proceed if there are fields to update
    if (Object.keys(filteredData).length === 0) {
      res.status(400).json({ message: 'No valid fields provided for update' });
      return;
    }

    const updatedInstructor = await prisma.user.update({
      where: { id },
      data: filteredData,
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

  // --- Common Fields ---
  if ('street' in data) {
    if (typeof data.street !== 'string') {
      return {
        valid: false,
        message: 'Street address must be text. Please enter a valid street address.',
      };
    }
    // Allow empty string for street (user might want to clear it)
  }
  if ('apartment' in data) {
    if (typeof data.apartment !== 'string') {
      return {
        valid: false,
        message: 'Apartment/Suite must be text. Please enter a valid apartment or suite number.',
      };
    }
    // Allow empty string for apartment (user might want to clear it)
  }
  if ('city' in data) {
    if (typeof data.city !== 'string') {
      return { valid: false, message: 'City must be text. Please enter a valid city name.' };
    }
    // Allow empty string for city (user might want to clear it)
  }
  if ('state' in data) {
    if (typeof data.state !== 'string') {
      return { valid: false, message: 'State must be text. Please select a valid state.' };
    }
    // Allow empty string for state (user might want to clear it)
  }
  if ('zip' in data) {
    if (typeof data.zip !== 'string') {
      return { valid: false, message: 'ZIP code must be text. Please enter a valid ZIP code.' };
    }
    // Allow empty string for zip (user might want to clear it)
  }
  if ('country' in data) {
    if (typeof data.country !== 'string') {
      return { valid: false, message: 'Country must be text. Please select a valid country.' };
    }
    // Allow empty string for country (user might want to clear it)
  }
  if ('profilePicture' in data) {
    if (typeof data.profilePicture !== 'string') {
      return {
        valid: false,
        message: 'Profile picture must be a valid image URL. Please provide a valid image link.',
      };
    }
    // Allow empty string for profilePicture (user might want to clear it)
  }
  if ('bio' in data) {
    if (typeof data.bio !== 'string') {
      return { valid: false, message: 'Bio must be text. Please enter a valid bio description.' };
    }
    // Allow empty string for bio (user might want to clear it)
  }

  // --- Instructor Fields ---
  if (role === 'INSTRUCTOR') {
    if ('firstName' in data) {
      if (typeof data.firstName !== 'string') {
        return { valid: false, message: 'firstName must be a string' };
      }
      // Allow empty string for firstName (user might want to clear it)
    }
    if ('lastName' in data) {
      if (typeof data.lastName !== 'string') {
        return { valid: false, message: 'lastName must be a string' };
      }
      // Allow empty string for lastName (user might want to clear it)
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
        if (!Array.isArray(data[field])) {
          return { valid: false, message: `${field} must be an array of strings` };
        }

        // For education and experience, allow empty strings (users might be adding items gradually)
        if (field === 'education' || field === 'experience') {
          // Only validate that all items are strings
          if (!data[field].every((v: any) => typeof v === 'string')) {
            return { valid: false, message: `${field} must be an array of strings` };
          }
        } else {
          // For other fields, require non-empty strings
          if (data[field].length > 0 && !data[field].every((v: any) => typeof v === 'string' && v.trim() !== '')) {
            return { valid: false, message: `${field} must be an array of non-empty strings` };
          }
        }
      }
    }

    // Note: subjects validation removed since it's not in the UI
  }

  // --- Student Fields ---
  if (role === 'STUDENT') {
    if ('grade' in data) {
      if (typeof data.grade !== 'string') {
        return { valid: false, message: 'grade must be a string' };
      }
      // Allow empty string for grade (user might want to clear it)
    }
    if ('parentFirstName' in data) {
      if (typeof data.parentFirstName !== 'string') {
        return { valid: false, message: 'parentFirstName must be a string' };
      }
      // Allow empty string for parentFirstName (user might want to clear it)
    }
    if ('parentLastName' in data) {
      if (typeof data.parentLastName !== 'string') {
        return { valid: false, message: 'parentLastName must be a string' };
      }
      // Allow empty string for parentLastName (user might want to clear it)
    }
    if ('parentEmail' in data) {
      if (typeof data.parentEmail !== 'string') {
        return { valid: false, message: 'parentEmail must be a string' };
      }
      // Allow empty string for parentEmail (user might want to clear it)
      if (data.parentEmail.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parentEmail)) {
        return { valid: false, message: 'parentEmail must be a valid email address' };
      }
    }
    if ('parentPhone' in data) {
      if (typeof data.parentPhone !== 'string') {
        return { valid: false, message: 'parentPhone must be a string' };
      }
      // Allow empty string for parentPhone (user might want to clear it)
      if (data.parentPhone.trim() !== '' && !/^\+?[0-9\-\s()]{7,20}$/.test(data.parentPhone)) {
        return { valid: false, message: 'parentPhone must be a valid phone number' };
      }
    }
    // Array of strings fields
    const arrayStringFields = ['interests', 'learningGoals'];
    for (const field of arrayStringFields) {
      if (field in data) {
        if (!Array.isArray(data[field])) {
          return { valid: false, message: `${field} must be an array of strings` };
        }

        // Allow empty arrays for student fields
        if (data[field].length > 0 && !data[field].every((v: any) => typeof v === 'string' && v.trim() !== '')) {
          return { valid: false, message: `${field} must be an array of non-empty strings` };
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

  // For admin users, we'll skip validation since they can update any field
  if (user.role !== 'ADMIN') {
    const validation = await validateUserUpdatePayload(data, user.role as 'INSTRUCTOR' | 'STUDENT');
    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }
  }

  // Filter out undefined and null values to only update provided fields
  const filteredData: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      filteredData[key] = data[key];
    }
  });

  if (user.role === 'INSTRUCTOR') {
    // Instructors cannot update these fields
    delete filteredData.schoolName;
    delete filteredData.role;
    delete filteredData.verified;
    
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
      // Note: subjects field is not in the UI, so we don't include it
    ];
    Object.keys(filteredData).forEach(key => {
      if (!allowedFields.includes(key)) delete filteredData[key];
    });
    
    // Note: subjects handling removed since it's not in the UI
  } else if (user.role === 'STUDENT') {
    // Students cannot update these fields
    ['email', 'birthdate', 'schoolName', 'firstName', 'lastName', 'role', 'verified'].forEach(
      field => {
        delete filteredData[field];
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
    Object.keys(filteredData).forEach(key => {
      if (!allowedFields.includes(key)) delete filteredData[key];
    });
  }

  // Only proceed if there are fields to update
  if (Object.keys(filteredData).length === 0) {
    res.status(400).json({ message: 'No valid fields provided for update' });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: filteredData,
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
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'STUDENT') {
    res.status(403);
    throw new Error('Not authorized - Student access only');
  }

  // Get instructors that this student currently has sessions with
  const studentSessions = await prisma.session.findMany({
    where: {
      students: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      instructor: {
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
      },
    },
  });

  // Extract unique instructors from sessions
  const instructorMap = new Map();
  studentSessions.forEach(session => {
    if (session.instructor && !instructorMap.has(session.instructor.id)) {
      instructorMap.set(session.instructor.id, session.instructor);
    }
  });

  const instructors = Array.from(instructorMap.values());

  res.json({ instructors });
});

/**
 * @route GET /api/users/sessions
 * @desc Get user's sessions
 * @access Private
 */
export const getUserSessions = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
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
  const userId = (req.user as { sub: string })?.sub;
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
