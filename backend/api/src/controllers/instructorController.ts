import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";

/**
 * Get all instructors.
 * Supports filtering by name or subject using query parameters:
 * - `name`: Filter by instructor's name.
 * - `subject`: Filter by subjects taught by the instructor.
 * 
 * @route GET /instructors
 * @param {string} subject - Subject filter
 */
export const getAllInstructors = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const subjectFilter = req.query.subject;
    let instructors: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
    }[];
    if(subjectFilter != null)
    {
      instructors = await prisma.instructor.findMany({
        where: {
          subjects: {
            some: {
              subject: {
                name: {
                  contains: subjectFilter?.toString(),
                  mode: 'insensitive'
                }
              }
            }
          }
        },
        select: {
          firstName: true,
          lastName: true,
          email: true

        }
      });
    }
    else
    {
      instructors = await prisma.instructor.findMany({
        select:
        {
          firstName: true,
          lastName: true,
          email: true
        }
      });
    }
    res.json({ return: instructors });
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
 
    const filter = req.query.id;
    //should check if its null or not valid first
    if(filter == null)
    {
      res.status(400).json({error: "No ID was given"});
    }
    const inst = await prisma.instructor.findFirst({
      where: {
        id: filter?.toString()
      },
      select:
      {
        firstName: true,
        lastName: true,
        email: true
      }
    });
    res.json({instructor: inst});
  }
);

/**
 * Check if instructor exists by email
 * 
 * @route Get/instructors/:email
 * @param {string} email - The email of the instructor
 */
export const checkInstructorByEmail = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
)

/**
 * Create a new instructor profile.
 * 
 * @route POST /instructors
 * @body {string} userId - The ID of the user associated with the instructor.
 * @body {string[]} certificationUrls - List of URLs pointing to certification documents.
 * @body {string[]} subjects - List of subjects the instructor teaches.
 * @body {number} averageRating - The initial average rating of the instructor (default to 0).
 */
export const createInstructor = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
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
    res.json({ message: "Hello World!" });
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
    res.json({ message: "Hello World!" });
  }
);