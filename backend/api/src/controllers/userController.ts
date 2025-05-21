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

    const instructors = await prisma.user.findMany({
      where: { 
        role: "INSTRUCTOR",
        AND: [
          name ? {
            OR: [
              {firstName: {contains: String(name), mode: "insensitive"}},
              {lastName: {contains: String(name), mode: "insensitive"}},
            ],
          } : {},
          subject ? {subjects:{
            some:{
              name:{contains: String(subject), mode:"insensitive"},
            },
          },
        } : {},

        ],
        
      },
      include: {subjects: true,},


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
    
    const {id} = req.params;
    const instructor = await prisma.user.findUnique({
      where: {id},
      include: {
        subjects: true,
        instructorReviews: true,
        instructorSessions: true,
      },
    });

    if (!instructor || instructor.role !== "INSTRUCTOR"){
      res.status(404);
      throw new Error("Instructor not found");
    }

    res.json({instructor});
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
    const { certificationUrls, subjects, averageRating } = req.body;
  
    const existingInstructor = await prisma.user.findUnique({
      where: { id },
      include: { subjects: true }
    });

    if (!existingInstructor || existingInstructor.role !== "INSTRUCTOR") {
      res.status(404);
      throw new Error("Instructor not found");
    }

    // Update the instructor
    const updatedInstructor = await prisma.user.update({
      where: { id },
      data: {
        // Update certification URLs if provided
        ...(certificationUrls && { certificationUrls }),
        // Update average rating if provided
        ...(averageRating !== undefined && { averageRating }),
        // Update subjects if provided
        ...(subjects && {
          subjects: {
            // Clear existing subjects and connect new ones
            disconnect: existingInstructor.subjects.map(subject => ({ id: subject.id })),
            connect: subjects.map((subjectId: string) => ({ id: subjectId }))
          }
        })
      },
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
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const existingInstructor = await prisma.user.findUnique({ where: { id } });

    if (!existingInstructor || existingInstructor.role !== "INSTRUCTOR") {
      res.status(404);
      throw new Error("Instructor not found");
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: "Instructor deleted successfully" });
  }
);

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private
 */
export const getUserProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subjects: true,
        instructorReviews: true,
        instructorSessions: true,
        studentSessions: true,
      },
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user);
  }
);

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
export const updateUserProfile = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      res.status(404);
      throw new Error("User not found");
    }

    const {
      firstName, lastName, email, birthdate,
      street, apartment, city, state, zip, country,
      schoolName, profilePicture, bio,
      // Student fields
      grade, parentFirstName, parentLastName, parentEmail, parentPhone,
      interests, learningGoals,
      // Instructor fields
      education, experience, certificationUrls, averageRating, subjects
    } = req.body;

    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(birthdate && { birthdate: new Date(birthdate) }),
      ...(street && { street }),
      ...(apartment && { apartment }),
      ...(city && { city }),
      ...(state && { state }),
      ...(zip && { zip }),
      ...(country && { country }),
      ...(schoolName && { schoolName }),
      ...(profilePicture && { profilePicture }),
      ...(bio && { bio }),
      ...(existingUser.role === "STUDENT" && {
        ...(grade && { grade }),
        ...(parentFirstName && { parentFirstName }),
        ...(parentLastName && { parentLastName }),
        ...(parentEmail && { parentEmail }),
        ...(parentPhone && { parentPhone }),
        ...(interests && { interests }),
        ...(learningGoals && { learningGoals })
      }),
      ...(existingUser.role === "INSTRUCTOR" && {
        ...(education && { education }),
        ...(experience && { experience }),
        ...(certificationUrls && { certificationUrls }),
        ...(typeof averageRating === 'number' && { averageRating }),
        ...(subjects && {
          subjects: {
            set: [], // Clear existing subjects
            connect: subjects.map((subjectId: string) => ({ id: subjectId }))
          }
        })
      })
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        subjects: true,
        instructorReviews: true,
        instructorSessions: true,
        studentSessions: true,
      },
    });

    res.json(updatedUser);
  }
);

/**
 * @route DELETE /api/users/profile
 * @desc Delete user account
 * @access Private
 */
export const deleteUser = expressAsyncHandler(
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

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: "User account deleted successfully" });
  }
);

/**
 * @route GET /api/users/students
 * @desc Get all students (instructor only)
 * @access Private/Instructor
 */
export const getStudents = expressAsyncHandler(
  async (req: Request, res: Response) => {
    if (req.user?.role !== "INSTRUCTOR") {
      res.status(403);
      throw new Error("Not authorized - Instructor access only");
    }

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        grade: true,
        schoolName: true,
        interests: true,
        learningGoals: true,
        studentSessions: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.json({ students });
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