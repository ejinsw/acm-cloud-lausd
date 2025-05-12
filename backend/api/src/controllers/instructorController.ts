import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { CreateInstructorDto } from "../types/index";
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
    if (subjectFilter != null) {
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
    else {
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
    if (filter == null) {
      res.status(400).json({ error: "No ID was given" });
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
    res.json({ instructor: inst });
  }
);
/**
 * Create a new instructor profile.
 * 
 * @route POST /instructors
 * @body {string} userId - The ID of the user associated with the instructor, as in the sub from the auth0 token
 * @body {string[]} certificationUrls - List of URLs pointing to certification documents.
 * @body {string[]} subjects - List of subjects the instructor teaches.
 * @body {string} firstName - The first name of the instructor.
 * @body {string} lastName - The last name of the instructor.
 * @body {string} email - The email of the instructor.
 * @body {Date} dateOfBirth - The date of birth of the instructor. 
 * @body {string} phoneNumber - The phone number of the instructor.    There should be a phone number in the database 
 * @body {string} address - The address of the instructor.
 * @body {string} city - The city of the instructor.
 * @body {string} state - The state of the instructor.
 * @body {string} zipCode - The zip code of the instructor.
 * @body {string} country - The country of the instructor.
 * @body {string} schoolName - The name of the school the instructor teaches at.
 */
export const createInstructor = expressAsyncHandler(
  async (req: Request<{}, {}, CreateInstructorDto>, res: Response, next: NextFunction) => {
    //valdie the data and make sure all queries are filled 
    const { userId, certificationUrls, subjects, firstName, lastName, email, dateOfBirth, phoneNumber, address, city, state, zipCode, country, schoolName } = req.body;
    if (!userId || !certificationUrls || !subjects) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }


    const existingUser = await prisma.instructor.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(400).json({ message: "User already exists." });
      return;
    }
    //need to create instructor profile in the database 
    const newUser = await prisma.instructor.create({
      data: {
        id: userId,
        certificationUrls: certificationUrls,
        //subjects: subjects, figure out what subject part of
        averageRating: 0,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        email: email ?? null,
        birthdate: dateOfBirth ?? null,
        //phoneNumber: phoneNumber,
        address: address ?? null,
        city: city ?? null,
        state: state ?? null,
        zip: zipCode ?? null,
        country: country ?? null,
        schoolName: schoolName ?? null,
      }
    })


    res.json({ user: newUser });
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