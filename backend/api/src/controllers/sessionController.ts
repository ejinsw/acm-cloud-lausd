import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';

// Types
interface SessionData {
  name: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  zoomLink?: string;
  maxAttendees?: number;
  materials: string[];
  objectives: string[];
  subjects: string[];
}

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
    const { tutorName, name, subject } = req.query;

    const where: any = {};
    if (name) {
      where.name = { contains: name as string, mode: 'insensitive' };
    }
    if (subject) {
      where.subjects = {
        some: {
          name: { contains: subject as string, mode: 'insensitive' },
        },
      };
    }

    if (tutorName) {
      where.instructor = {
        OR: [
          { firstName: { contains: tutorName as string, mode: 'insensitive' } },
          { lastName: { contains: tutorName as string, mode: 'insensitive' } },
        ],
      };
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        instructor: { select: { id: true, firstName: true, lastName: true } },
        subjects: true,
      },
    });

    res.json({ sessions });
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
    res.json({ message: 'Hello World!' });
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
    res.json({ message: 'Hello World!' });
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
    res.json({ message: 'Hello World!' });
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
    const { id } = req.params;
    const userId = (req.user as { sub: string })?.sub;

    // Find the session
    const session = await prisma.session.findUnique({ where: { id } });

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    // Only the instructor who owns the session can delete it
    if (session.instructorId !== userId) {
      res.status(403).json({ message: 'You do not have permission to delete this session' });
      return;
    }

    await prisma.session.delete({ where: { id } });
    res.status(200).json({ message: 'Session deleted successfully' });
  }
);

/**
 * @route GET /api/sessions/:id
 * @desc Get session by ID
 * @access Private
 */
export const getSession = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get session
});

/**
 * @route GET /api/sessions
 * @desc Get all sessions
 * @access Private
 */
export const getSessions = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get all sessions
});

/**
 * @route POST /api/sessions/:id/join
 * @desc Join a session
 * @access Private/Student
 */
export const joinSession = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement join session
});

/**
 * @route POST /api/sessions/:id/leave
 * @desc Leave a session
 * @access Private/Student
 */
export const leaveSession = expressAsyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement leave session
});
