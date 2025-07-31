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
    const { tutorName, name, subject, instructorId } = req.query;

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
    if (instructorId) {
      where.instructorId = instructorId as string;
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
        instructor: { select: { firstName: true, lastName: true } },
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
    const { id } = req.params;
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            bio: true,
            averageRating: true,
            profilePicture: true,
            education: true,
            experience: true,
            certificationUrls: true,
          },
        },
        subjects: true,
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ message: 'Session not Found' });
      return;
    }

    res.json({ session });
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
    const userId = (req.user as { sub: string })?.sub;
    // Only instructors can create sessions (enforced by middleware, but double-check)
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Check if user is an instructor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'INSTRUCTOR') {
      res.status(403).json({ message: 'Only instructors can create sessions' });
      return;
    }

    const {
      name,
      description,
      startTime,
      endTime,
      zoomLink,
      maxAttendees,
      materials = [],
      objectives = [],
      subjects = [],
    } = req.body;

    // Validate required fields
    if (!name || !Array.isArray(subjects) || subjects.length === 0) {
      res.status(400).json({ message: 'Missing required fields: name and at least one subject' });
      return;
    }

    // Validate all required fields
    if (
      !description ||
      !startTime ||
      !endTime ||
      !zoomLink ||
      !maxAttendees ||
      !Array.isArray(materials) ||
      materials.length === 0 ||
      !Array.isArray(objectives) ||
      objectives.length === 0
    ) {
      res.status(400).json({
        message:
          'Missing required fields: description, startTime, endTime, zoomLink, maxAttendees, materials, and objectives',
      });
      return;
    }

    // Validate that dates are actually valid
    if (startTime) {
      let isValidDate = false;
      if (startTime instanceof Date) {
        isValidDate = !isNaN(startTime.getTime());
      } else if (typeof startTime === 'string') {
        isValidDate = !isNaN(Date.parse(startTime));
      }
      if (!isValidDate) {
        res.status(400).json({ message: 'startTime must be a valid ISO string or Date' });
        return;
      }
    }

    if (endTime) {
      let isValidDate = false;
      if (endTime instanceof Date) {
        isValidDate = !isNaN(endTime.getTime());
      } else if (typeof endTime === 'string') {
        isValidDate = !isNaN(Date.parse(endTime));
      }
      if (!isValidDate) {
        res.status(400).json({ message: 'endTime must be a valid ISO string or Date' });
        return;
      }
    }

    // Validate time constraints
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (start >= end) {
        res.status(400).json({ message: 'Start time must be before end time' });
        return;
      }
    }

    // Validate start time is in the future
    if (startTime) {
      const start = new Date(startTime);
      const now = new Date();
      if (start <= now) {
        res.status(400).json({ message: 'Start time must be in the future' });
        return;
      }
    }

    // Validate max attendees
    if (maxAttendees !== undefined) {
      if (!Number.isInteger(maxAttendees) || maxAttendees <= 0) {
        res.status(400).json({ message: 'Max attendees must be a positive integer' });
        return;
      }
    }

    // Find subject IDs for connection
    const subjectRecords = await prisma.subject.findMany({
      where: { name: { in: subjects } },
      select: { id: true, name: true },
    });
    if (subjectRecords.length !== subjects.length) {
      const foundNames = subjectRecords.map(s => s.name);
      const missing = subjects.filter((s: string) => !foundNames.includes(s));
      res.status(400).json({ message: `Invalid subject(s): ${missing.join(', ')}` });
      return;
    }

    const session = await prisma.session.create({
      data: {
        name,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        zoomLink,
        maxAttendees,
        materials,
        objectives,
        instructorId: userId,
        subjects: {
          connect: subjectRecords.map(s => ({ id: s.id })),
        },
      },
      include: {
        instructor: { select: { id: true, firstName: true, lastName: true } },
        subjects: true,
      },
    });

    res.status(201).json({ session });
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
    const { id } = req.params;

    const userId = (req.user as { sub: string })?.sub;

    // Find the session
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    // Only the instructor who owns the session can update it
    if (session.instructorId !== userId) {
      res.status(403).json({ message: 'You do not have permission to update this session' });
      return;
    }

    const {
      name,
      description,
      startTime,
      endTime,
      zoomLink,
      maxAttendees,
      materials,
      objectives,
      subjects,
    } = req.body;

    // Build update data object, skip empty strings/arrays
    const data: any = {};
    if (name !== undefined && name !== '') data.name = name;
    if (description !== undefined && description !== '') data.description = description;
    if (startTime !== undefined && startTime !== '')
      data.startTime = startTime ? new Date(startTime) : null;
    if (endTime !== undefined && endTime !== '') data.endTime = endTime ? new Date(endTime) : null;
    if (zoomLink !== undefined && zoomLink !== '') data.zoomLink = zoomLink;
    if (maxAttendees !== undefined && maxAttendees !== '') data.maxAttendees = maxAttendees;
    if (materials !== undefined && Array.isArray(materials) && materials.length > 0)
      data.materials = materials;
    if (objectives !== undefined && Array.isArray(objectives) && objectives.length > 0)
      data.objectives = objectives;

    // Validate that dates are actually valid if being updated
    if (data.startTime) {
      let isValidDate = false;
      if (data.startTime instanceof Date) {
        isValidDate = !isNaN(data.startTime.getTime());
      } else if (typeof data.startTime === 'string') {
        isValidDate = !isNaN(Date.parse(data.startTime));
      }
      if (!isValidDate) {
        res.status(400).json({ message: 'startTime must be a valid ISO string or Date' });
        return;
      }
    }

    if (data.endTime) {
      let isValidDate = false;
      if (data.endTime instanceof Date) {
        isValidDate = !isNaN(data.endTime.getTime());
      } else if (typeof data.endTime === 'string') {
        isValidDate = !isNaN(Date.parse(data.endTime));
      }
      if (!isValidDate) {
        res.status(400).json({ message: 'endTime must be a valid ISO string or Date' });
        return;
      }
    }

    // Validate time constraints if both times are being updated
    if (data.startTime && data.endTime) {
      if (data.startTime >= data.endTime) {
        res.status(400).json({ message: 'Start time must be before end time' });
        return;
      }
    }

    // Validate start time is in the future if being updated
    if (data.startTime) {
      const now = new Date();
      if (data.startTime <= now) {
        res.status(400).json({ message: 'Start time must be in the future' });
        return;
      }
    }

    // Validate max attendees if being updated
    if (data.maxAttendees !== undefined) {
      if (!Number.isInteger(data.maxAttendees) || data.maxAttendees <= 0) {
        res.status(400).json({ message: 'Max attendees must be a positive integer' });
        return;
      }
    }

    // Handle subjects update if provided
    if (subjects !== undefined) {
      if (!Array.isArray(subjects) || subjects.length === 0) {
        res.status(400).json({ message: 'At least one subject is required' });
        return;
      }
      const subjectRecords = await prisma.subject.findMany({
        where: { name: { in: subjects } },
        select: { id: true, name: true },
      });
      if (subjectRecords.length !== subjects.length) {
        const foundNames = subjectRecords.map(s => s.name);
        const missing = subjects.filter((s: string) => !foundNames.includes(s));
        res.status(400).json({ message: `Invalid subject(s): ${missing.join(', ')}` });
        return;
      }
      data.subjects = {
        set: [],
        connect: subjectRecords.map(s => ({ id: s.id })),
      };
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({ message: 'No valid fields provided for update' });
      return;
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data,
      include: {
        instructor: { select: { id: true, firstName: true, lastName: true } },
        subjects: true,
      },
    });

    res.status(200).json({ session: updatedSession });
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
  const userId = (req.user as { sub: string })?.sub;
  // Only students can join (enforced by middleware, but double-check)
  if (!userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  // Check if user is a student
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== 'STUDENT') {
    res.status(403).json({ message: 'Only students can join sessions' });
    return;
  }
  const { id } = req.params;

  // Check if session exists
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      students: { select: { id: true } },
      instructor: { select: { id: true, firstName: true, lastName: true } },
      subjects: true,
    },
  });
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }
  // Check if already joined
  if (session.students.some(student => student.id === userId)) {
    res.status(400).json({ message: 'You have already joined this session' });
    return;
  }

  // Check if session is at capacity
  if (session.maxAttendees && session.students.length >= session.maxAttendees) {
    res.status(400).json({ message: 'Session is at maximum capacity' });
    return;
  }
  // Add student to session
  const updatedSession = await prisma.session.update({
    where: { id },
    data: {
      students: {
        connect: { id: userId },
      },
    },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true } },
      subjects: true,
      students: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  res.status(200).json({ message: 'Joined session successfully', session: updatedSession });
});

/**
 * @route POST /api/sessions/:id/leave
 * @desc Leave a session
 * @access Private/Student
 */
export const leaveSession = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
  // Only students can leave (enforced by middleware, but double-check)
  if (!userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  // Check if user is a student
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== 'STUDENT') {
    res.status(403).json({ message: 'Only students can leave sessions' });
    return;
  }
  const { id } = req.params;

  // Check if session exists
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      students: { select: { id: true } },
      instructor: { select: { id: true, firstName: true, lastName: true } },
      subjects: true,
    },
  });
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }
  // Check if not joined
  if (!session.students.some(student => student.id === userId)) {
    res.status(400).json({ message: 'You are not a member of this session' });
    return;
  }
  // Remove student from session
  const updatedSession = await prisma.session.update({
    where: { id },
    data: {
      students: {
        disconnect: { id: userId },
      },
    },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true } },
      subjects: true,
      students: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  res.status(200).json({ message: 'Left session successfully', session: updatedSession });
});
