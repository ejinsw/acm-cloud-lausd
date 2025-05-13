import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";

// Types
interface SubjectData {
  name: string;
  description?: string;
  category?: string;
  level?: string;
}

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
 * @route POST /api/subjects
 * @desc Create a new subject
 * @access Private/Instructor
 */
export const createSubject = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // TODO: Implement create subject
  }
);

/**
 * @route GET /api/subjects/:id
 * @desc Get subject by ID
 * @access Private
 */
export const getSubject = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // TODO: Implement get subject
  }
);

/**
 * @route PUT /api/subjects/:id
 * @desc Update subject
 * @access Private/Instructor
 */
export const updateSubject = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // TODO: Implement update subject
  }
);

/**
 * @route DELETE /api/subjects/:id
 * @desc Delete subject
 * @access Private/Instructor
 */
export const deleteSubject = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // TODO: Implement delete subject
  }
);

/**
 * @route GET /api/subjects
 * @desc Get all subjects
 * @access Private
 */
export const getSubjects = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // TODO: Implement get all subjects
  }
);