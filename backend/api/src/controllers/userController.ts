import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Types
interface UserProfile {
  id: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR";
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
    const {name, subject} = req.query;
    const where: any = {role: "INSTRUCTOR"};
    if (name){
      where.OR = [
        {firstName: {contains: name, mode: "insensitive"}},
        {lastName: {contains: name, mode: "insensitive"}},
      ]
    }
    if (subject){
      where.subjects = {
        some: {name: {contains: subject, mode: "insensitive"}}
      }
    }
    const instructors = await prisma.user.findMany({
      where,
      include: {
        subjects: true,
        instructorReviews: true,
        instructorSessions: true,
      },
    });
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
    if (!instructor || instructor.role !== "INSTRUCTOR") {
      res.status(404).json({ message: "Instructor not found" });
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

    // Instructors cannot update schoolName
    if ('schoolName' in data) delete data.schoolName;

    // Only allow instructor-specific and common fields
    const allowedFields = [
      // Common fields
      'email', 'role', 'verified', 'firstName', 'lastName', 'birthdate',
      'street', 'apartment', 'city', 'state', 'zip', 'country',
      'profilePicture', 'bio',
      // Instructor-specific
      'education', 'experience', 'certificationUrls', 'averageRating', 'subjects'
    ];
    Object.keys(data).forEach(key => {
      if (!allowedFields.includes(key)) delete data[key];
    });

    // Handle subjects relation if present
    if (data.subjects) {
      data.subjects = {
        set: [],
        connect: data.subjects.map((subjectId: string) => ({ id: subjectId }))
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
export const deleteInstructor = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const existingInstructor = await prisma.user.findUnique({ 
      where: { id },
    });
    
    if (!existingInstructor || existingInstructor.role !== "INSTRUCTOR") {
      res.status(404).json({ message: "Instructor not found" });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "Instructor deleted successfully" });
  }
);

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private
 */
export const getUserProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // TODO: Implement get user profile
    const userId = (req.user as { sub: string })?.sub;
    if (!userId) {
      res.status(401);
      throw new Error("Not authorized");
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ user });
  }
);

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
export const updateUserProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as { sub: string })?.sub;
    if (!userId) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const data = { ...req.body };

    if (user.role === "INSTRUCTOR") {
      // Instructors cannot update schoolName
      if ('schoolName' in data) delete data.schoolName;
      // Only allow instructor-specific and common fields
      const allowedFields = [
        'email', 'role', 'verified', 'firstName', 'lastName', 'birthdate',
        'street', 'apartment', 'city', 'state', 'zip', 'country',
        'profilePicture', 'bio',
        'education', 'experience', 'certificationUrls', 'averageRating', 'subjects'
      ];
      Object.keys(data).forEach(key => {
        if (!allowedFields.includes(key)) delete data[key];
      });
      // Handle subjects relation if present
      if (data.subjects) {
        data.subjects = {
          set: [],
          connect: data.subjects.map((subjectId: string) => ({ id: subjectId }))
        };
      }
    } else if (user.role === "STUDENT") {
      // Students cannot update these fields
      [
        'email', 'birthdate', 'schoolName', 'firstName', 'lastName'
      ].forEach(field => {
        if (field in data) delete data[field];
      });
      // Only allow student-specific and common fields
      const allowedFields = [
        // Common fields
        'role', 'verified',
        'street', 'apartment', 'city', 'state', 'zip', 'country',
        'profilePicture', 'bio',
        // Student-specific
        'grade', 'parentFirstName', 'parentLastName', 'parentEmail', 'parentPhone',
        'interests', 'learningGoals'
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
  }
);

/**
 * @route DELETE /api/users/profile
 * @desc Delete user account
 * @access Private
 */
export const deleteUser = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // TODO: Implement delete user

    const userId = (req.user as { sub: string })?.sub;
    if(!userId){
      res.status(401).json({message: "Unauthorized"});
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })

    if (!existingUser){
      res.status(404).json({message: "User not found"});
      return;
    }
    await prisma.user.delete({where: {id: userId}});
    res.status(200).json({message: "User deleted successfully"});
  }
);

/**
 * @route GET /api/users/students
 * @desc Get all students (instructor only)
 * @access Private/Instructor
 */
export const getStudents = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // TODO: Implement get all students
    const userId = (req.user as { sub: string })?.sub;
    if (!userId) {
      res.status(401);
      throw new Error("Not authorized");
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "INSTRUCTOR") {
      res.status(403);
      throw new Error("Access denied");
    }

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { studentSessions: true },
    });

  }
);

/**
 * @route GET /api/users/instructors
 * @desc Get all instructors (student only)
 * @access Private/Student
 */
export const getInstructors = expressAsyncHandler(
  async (req: Request, res: Response) => {
    if (req.user?.role !== "STUDENT") {
      res.status(403);
      throw new Error("Not authorized - Student access only");
    }

    const instructors = await prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
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
            level: true
          }
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
                lastName: true
              }
            }
          }
        }
      }
    });

    res.json({ instructors });
  }
);

/**
 * @route GET /api/users/sessions
 * @desc Get user's sessions
 * @access Private
 */
export const getUserSessions = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401);
      throw new Error("Not authorized");
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
                email: true
              }
            },
            subjects: true
          }
        },
        studentSessions: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            subjects: true
          }
        }
      }
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const sessions = user.role === "INSTRUCTOR" ? user.instructorSessions : user.studentSessions;
    res.json({ sessions });
  }
);

/**
 * @route GET /api/users/reviews
 * @desc Get user's reviews
 * @access Private
 */
export const getUserReviews = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const reviews = user.role === "INSTRUCTOR" 
      ? await prisma.review.findMany({
          where: { instructorId: userId },
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        })
      : await prisma.review.findMany({
          where: { studentId: userId },
          include: {
            instructor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        });

    res.json({ reviews });
  }
);