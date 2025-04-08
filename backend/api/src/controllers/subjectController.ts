import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";

/**
 * Get all subjects.
 * Retrieves a list of all available subjects.
 * 
 * @route GET /subjects
 */
export const getAllSubjects = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Get a specific subject by its name.
 * 
 * @route GET /subjects/:name
 * @param {string} name - The name of the subject.
 */
export const getSubjectByName = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Create a new subject.
 * 
 * @route POST /subjects
 * @body {string} name - The name of the new subject.
 */
export const createSubject = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Update an existing subject by its ID.
 * 
 * @route PUT /subjects/:id
 * @param {string} id - The unique identifier of the subject.
 * @body {string} [name] - The updated name of the subject (optional).
 */
export const updateSubject = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Delete a subject by its ID.
 * 
 * @route DELETE /subjects/:id
 * @param {string} id - The unique identifier of the subject to delete.
 */
export const deleteSubject = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);