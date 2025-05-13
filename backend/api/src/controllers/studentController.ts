import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";

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
