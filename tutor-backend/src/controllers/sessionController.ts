import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";

/**
 * Get all sessions.
 * Supports filtering by tutor name, session name, and subject using query parameters:
 * - `tutorName`: Filter by instructor's name.
 * - `name`: Filter by session name.
 * - `subject`: Filter by subject taught.
 * 
 * @route GET /sessions
 */
export const getAllSessions = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Get a specific session by its ID.
 * 
 * @route GET /sessions/:id
 * @param {string} id - The unique identifier of the session.
 */
export const getSessionById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Create a new session.
 * 
 * @route POST /sessions
 * @body {string} name - The name of the session.
 * @body {string} description - A brief description of the session.
 * @body {Date} startTime - The scheduled start time of the session.
 * @body {Date} endTime - The scheduled end time of the session.
 * @body {string} zoomLink - The meeting link for the session.
 * @body {number} maxAttendees - The maximum number of students allowed in the session.
 * @body {string} instructorId - The ID of the instructor hosting the session.
 */
export const createSession = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Update an existing session by its ID.
 * 
 * @route PUT /sessions/:id
 * @param {string} id - The unique identifier of the session.
 * @body {string} [name] - The updated session name (optional).
 * @body {string} [description] - The updated description (optional).
 * @body {Date} [startTime] - The updated start time (optional).
 * @body {Date} [endTime] - The updated end time (optional).
 * @body {string} [zoomLink] - The updated meeting link (optional).
 * @body {number} [maxAttendees] - The updated maximum attendees (optional).
 */
export const updateSession = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);

/**
 * Delete a session by its ID.
 * 
 * @route DELETE /sessions/:id
 * @param {string} id - The unique identifier of the session to delete.
 */
export const deleteSession = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Hello World!" });
  }
);