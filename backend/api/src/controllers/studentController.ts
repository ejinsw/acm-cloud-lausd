import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";

/**
 * Get a student by their ID.
 *
 * @route GET /student/:id
 * @param {string} id - The unique identifier of the student.
 */
export const getStudentById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Create a new student profile.
 *
 * @route POST /students
 * @body {string} userId - The ID of the user associated with the instructor.
 * @body {string} firstName?
 * @body {string} lastName?
 * @body {string} email?
 * @body {Date} birthdate?
 * @body {string} street?
 * @body {string} apartment?
 * @body {string} city?
 * @body {string} state?
 * @body {string} country?
 * @body {string} zip?
 * @body {Int} grade?
 * @body {string} parentEmail?
 */
export const createStudent = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      userId,
      firstName,
      lastName,
      email,
      birthdate,
      street,
      apartment,
      city,
      state,
      country,
      zip,
      grade,
      parentEmail,
      schoolName
    } = req.body;

    if (!userId || !email) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    const existingUser = await prisma.student.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(400).json({ message: "User already exists." });
      return;
    }

    const newUser = await prisma.student.create({
      data: {
        id: userId,
        email,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        birthdate: birthdate ?? null,
        street: street ?? null,
        apartment: apartment ?? null,
        city: city ?? null,
        state: state ?? null,
        country: country ?? null,
        zip: zip ?? null,
        grade: grade ?? null,
        parentEmail: parentEmail ?? null,
        schoolName: schoolName ?? null
      },
    });

    res.status(400).json({ user: newUser });
  }
);

/**
 * Update a student's information by their ID.
 *
 * @route PUT /student/:id
 * @param {string} id - The unique identifier of the student.
 * @query {string} [firstName] - The updated first name (optional).
 * @query {string} [lastName] - The updated last name (optional).
 * @query {string} [email] - The updated email address (optional).
 * @query {string} [password] - The updated password (optional).
 * @query {number} [grade] - The updated grade level (optional).
 * @query {string} [address] - The updated address (optional).
 * @query {string} [phoneNumber] - The updated phone number (optional).
 */
export const updateStudent = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Delete a student by their ID.
 *
 * @route DELETE /student/:id
 * @param {string} id - The unique identifier of the student to delete.
 */
export const deleteStudent = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);
