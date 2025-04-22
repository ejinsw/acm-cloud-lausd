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
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: {
        id,
      },
    });

    if (!student) {
      res.status(404).json({ message: "Student not found." });
      return;
    }

    res.json({ student });
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
 * @body {string} [firstName] - The updated first name (optional).
 * @body {string} [lastName] - The updated last name (optional).
 * @body {string} [email] - The updated email address (optional).
 * @body {number} [grade] - The updated grade level (optional).
 * @body {string} [apartment] - The updated apartment (optional).
 * @body {string} [city] - The updated city (optional).
 * @body {string} [state] - The updated state (optional).
 * @body {string} [country] - The updated country (optional).
 * @body {string} [zip] - The updated zip code (optional).
 * @body {string} [street] - The updated street address (optional).
 */
export const updateStudent = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { firstName, lastName, email, grade, apartment, city, state, country, zip, street, parentEmail, schoolName } = req.body;

    if (!id) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      res.status(404).json({ message: "Student not found." });
      return;
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        firstName: firstName ?? existingStudent.firstName,
        lastName: lastName ?? existingStudent.lastName,
        email: email ?? existingStudent.email,
        grade: grade ?? existingStudent.grade,
        apartment: apartment ?? existingStudent.apartment,
        city: city ?? existingStudent.city,
        state: state ?? existingStudent.state,
        country: country ?? existingStudent.country,
        zip: zip ?? existingStudent.zip,
        street: street ?? existingStudent.street,
        parentEmail: parentEmail ?? existingStudent.parentEmail,
        schoolName: schoolName ?? existingStudent.schoolName,
      },
    });

    res.json({ student: updatedStudent });
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
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      res.status(404).json({ message: "Student not found." });
      return;
    }

    await prisma.student.delete({
      where: { id },
    });

    res.json({ message: "Student deleted successfully." });
  }
);
