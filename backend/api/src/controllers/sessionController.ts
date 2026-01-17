import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { zoomService } from '../services/zoomService';

// Helper function to check and expire old sessions (older than 6 hours)
async function expireOldSessions() {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  
  try {
    const result = await prisma.session.updateMany({
      where: {
        startTime: {
          lt: sixHoursAgo,
        },
        status: {
          in: ['IN_PROGRESS', 'SCHEDULED'],
        },
      },
      data: {
        status: 'COMPLETED',
      },
    });
    
    if (result.count > 0) {
      console.log(`Expired ${result.count} old sessions`);
    }
  } catch (error) {
    console.error('Failed to expire old sessions:', error);
  }
}

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
    // Expire old sessions before fetching
    await expireOldSessions();
    
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
    // Expire old sessions before fetching
    await expireOldSessions();
    
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
      maxAttendees,
      materials,
      objectives,
      subjects = [],
    } = req.body;

    // Validate required fields
    if (!name || !Array.isArray(subjects) || subjects.length === 0) {
      res.status(400).json({ message: 'Missing required fields: name and at least one subject' });
      return;
    }

    // Validate all required fields (removed zoomLink requirement - we'll create it)
    if (!description || !startTime || !endTime || !maxAttendees) {
      res.status(400).json({
        message: 'Missing required fields: description, startTime, endTime, and maxAttendees',
      });
      return;
    }

    // Validate that materials and objectives are arrays (if provided)
    if (materials && !Array.isArray(materials)) {
      res.status(400).json({ message: 'materials must be an array' });
      return;
    }

    if (objectives && !Array.isArray(objectives)) {
      res.status(400).json({ message: 'objectives must be an array' });
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

    // Check if instructor has Zoom connected - REQUIRED for session creation
    const instructor = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        zoomAccessToken: true,
        zoomTokenExpiresAt: true,
      },
    });

    if (
      !instructor?.zoomAccessToken ||
      !instructor?.zoomTokenExpiresAt ||
      new Date() >= instructor.zoomTokenExpiresAt
    ) {
      res.status(400).json({
        message: 'Zoom account not connected. Please connect your Zoom account first.',
        needsZoomConnection: true,
      });
      return;
    }

    // Create Zoom meeting - REQUIRED for embedded video
    let zoomMeeting;
    try {
      zoomMeeting = await zoomService.createMeeting({
        topic: name,
        startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        duration:
          endTime && startTime
            ? Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60)) // duration in minutes
            : 60, // default 60 minutes
        instructorEmail: instructor.email,
      });
    } catch (error: any) {
      console.error('Failed to create Zoom meeting:', error);
      res.status(500).json({
        message: 'Failed to create Zoom meeting. Please try again.',
        error: error.message,
      });
      return;
    }

    const session = await prisma.session.create({
      data: {
        name,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        zoomLink: zoomMeeting.join_url, // Always use our created Zoom meeting
        maxAttendees,
        materials: materials || [],
        objectives: objectives || [],
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

    res.status(201).json({
      session,
      zoomMeeting: {
        id: zoomMeeting.id,
        joinUrl: zoomMeeting.join_url,
        startUrl: zoomMeeting.start_url,
      },
      message: 'Session created with embedded Zoom meeting',
    });
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
 * @body {string} [status] - The updated session status (optional).
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
      status,
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
    if (status !== undefined && status !== '') data.status = status;

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

    // Validate status if being updated
    if (data.status !== undefined) {
      const validStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(data.status)) {
        res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
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

    // Update Zoom meeting if session has one and time/name changed
    try {
      if (session.zoomLink && (data.startTime || data.name)) {
        const meetingId = session.zoomLink.includes('zoom.us')
          ? session.zoomLink.split('/').pop()
          : session.zoomLink;

        if (meetingId) {
          await zoomService.updateMeeting(meetingId, {
            topic: data.name,
            startTime: data.startTime,
            duration:
              data.endTime && data.startTime
                ? Math.ceil(
                    (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) /
                      (1000 * 60)
                  )
                : undefined,
          });
        }
      }
    } catch (error) {
      console.error('Failed to update Zoom meeting:', error);
      // Continue with session update even if Zoom fails
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

    // Delete Zoom meeting if session has one
    try {
      if (session.zoomLink) {
        const meetingId = session.zoomLink.includes('zoom.us')
          ? session.zoomLink.split('/').pop()
          : session.zoomLink;

        if (meetingId) {
          await zoomService.deleteMeeting(meetingId);
        }
      }
    } catch (error) {
      console.error('Failed to delete Zoom meeting:', error);
      // Continue with session deletion even if Zoom fails
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

export const createSessionRequest = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ message: 'Session ID is required' });
    return;
  }

  // Check if session exists
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true } },
      students: { select: { id: true } },
      sessionRequests: {
        where: { studentId: userId },
        select: { id: true, status: true, studentId: true },
      },
    },
  });

  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }

  // Check if user is already a student in the session
  if (session.students.some(student => student.id === userId)) {
    res.status(400).json({ message: 'You are already a member of this session' });
    return;
  }

  // Check if user already has a pending request for this session
  const existingRequest = session.sessionRequests.find(request => request.studentId === userId);
  if (existingRequest) {
    res.status(400).json({ message: 'You already have a request for this session' });
    return;
  }

  // Create session request
  const sessionRequest = await prisma.sessionRequest.create({
    data: {
      studentId: userId,
      sessionId: sessionId,
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      session: {
        select: {
          id: true,
          name: true,
          instructor: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  res.status(201).json({
    message: 'Session request created successfully',
    sessionRequest,
  });
});

export const getSessionRequests = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  // Get user role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  let whereClause: any = {};

  if (user.role === 'INSTRUCTOR') {
    // For instructors: get requests for their sessions
    whereClause.session = {
      instructorId: userId,
    };
  } else if (user.role === 'STUDENT') {
    // For students: get their own requests
    whereClause.studentId = userId;
  } else {
    res.status(403).json({ message: 'Invalid user role' });
    return;
  }

  // Get query parameters for filtering (only for instructors)
  const { status, sessionId } = req.query;

  // Add status filter if provided
  if (status && ['PENDING', 'ACCEPTED', 'REJECTED'].includes(status as string)) {
    whereClause.status = status;
  }

  // Add session filter if provided (only for instructors)
  if (sessionId && user.role === 'INSTRUCTOR') {
    whereClause.sessionId = sessionId;
  }

  // Get session requests
  const sessionRequests = await prisma.sessionRequest.findMany({
    where: whereClause,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          grade: true,
          schoolName: true,
        },
      },
      session: {
        select: {
          id: true,
          name: true,
          description: true,
          startTime: true,
          endTime: true,
          maxAttendees: true,
          students: { select: { id: true } },
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
              averageRating: true,
            },
          },
          subjects: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json({
    message: 'Session requests retrieved successfully',
    sessionRequests,
    count: sessionRequests.length,
    userRole: user.role,
  });
});

export const deleteSessionRequest = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sessionRequests: { where: { id: id } } },
  });

  if (user?.sessionRequests.length === 0) {
    res
      .status(404)
      .json({ message: 'Session request not found or you do not have permission to delete it' });
    return;
  }

  const deletedRequest = await prisma.sessionRequest.delete({
    where: { id: id },
  });

  res.status(200).json({ message: 'Session request deleted successfully', deletedRequest });
});

export const acceptSessionRequest = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
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
    res.status(403).json({ message: 'Only instructors can accept session requests' });
    return;
  }

  const { id } = req.params;

  // Check if session request exists and belongs to instructor's session
  const sessionRequest = await prisma.sessionRequest.findFirst({
    where: {
      id: id,
      session: {
        instructorId: userId,
      },
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      session: {
        select: {
          id: true,
          name: true,
          maxAttendees: true,
          students: { select: { id: true } },
        },
      },
    },
  });

  if (!sessionRequest) {
    res
      .status(404)
      .json({ message: 'Session request not found or you do not have permission to accept it' });
    return;
  }

  // Allow accepting both PENDING and REJECTED requests
  if (sessionRequest.status !== 'PENDING' && sessionRequest.status !== 'REJECTED') {
    res.status(400).json({
      message:
        'Session request cannot be accepted. Only pending or rejected requests can be accepted.',
    });
    return;
  }

  // Check if session is at maximum capacity (only for new students)
  if (
    sessionRequest.status === 'PENDING' &&
    sessionRequest.session.maxAttendees &&
    sessionRequest.session.students.length >= sessionRequest.session.maxAttendees
  ) {
    res.status(400).json({ message: 'Session is at maximum capacity' });
    return;
  }

  // Check if student is already in the session (only for new students)
  if (
    sessionRequest.status === 'PENDING' &&
    sessionRequest.session.students.some(student => student.id === sessionRequest.student.id)
  ) {
    res.status(400).json({ message: 'Student is already a member of this session' });
    return;
  }

  // Use a transaction to update request status and manage student enrollment
  const result = await prisma.$transaction(async tx => {
    // Update session request status to accepted
    const updatedRequest = await tx.sessionRequest.update({
      where: { id: id },
      data: { status: 'ACCEPTED' },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        session: { select: { id: true, name: true } },
      },
    });

    let updatedSession = null;

    if (sessionRequest.status === 'PENDING') {
      // Add new student to session
      updatedSession = await tx.session.update({
        where: { id: sessionRequest.session.id },
        data: {
          students: {
            connect: { id: sessionRequest.student.id },
          },
        },
        include: {
          instructor: { select: { id: true, firstName: true, lastName: true } },
          subjects: true,
          students: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } else if (sessionRequest.status === 'REJECTED') {
      // Re-add previously rejected student to session
      updatedSession = await tx.session.update({
        where: { id: sessionRequest.session.id },
        data: {
          students: {
            connect: { id: sessionRequest.student.id },
          },
        },
        include: {
          instructor: { select: { id: true, firstName: true, lastName: true } },
          subjects: true,
          students: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    }

    return { updatedRequest, updatedSession };
  });

  res.status(200).json({
    message:
      sessionRequest.status === 'PENDING'
        ? 'Session request accepted successfully'
        : 'Student re-added to session successfully',
    sessionRequest: result.updatedRequest,
    session: result.updatedSession,
  });
});

export const rejectSessionRequest = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
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
    res.status(403).json({ message: 'Only instructors can reject session requests' });
    return;
  }

  const { id } = req.params;

  // Check if session request exists and belongs to instructor's session
  const sessionRequest = await prisma.sessionRequest.findFirst({
    where: {
      id: id,
      session: {
        instructorId: userId,
      },
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      session: {
        select: {
          id: true,
          name: true,
          students: { select: { id: true } },
        },
      },
    },
  });

  if (!sessionRequest) {
    res
      .status(404)
      .json({ message: 'Session request not found or you do not have permission to reject it' });
    return;
  }

  // Allow rejecting both PENDING and ACCEPTED requests
  if (sessionRequest.status !== 'PENDING' && sessionRequest.status !== 'ACCEPTED') {
    res.status(400).json({
      message:
        'Session request cannot be rejected. Only pending or accepted requests can be rejected.',
    });
    return;
  }

  // Use a transaction to update request status and manage student enrollment
  const result = await prisma.$transaction(async tx => {
    // Update session request status to rejected
    const updatedRequest = await tx.sessionRequest.update({
      where: { id: id },
      data: { status: 'REJECTED' },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        session: { select: { id: true, name: true } },
      },
    });

    // If the request was previously accepted, remove the student from the session
    if (sessionRequest.status === 'ACCEPTED') {
      const updatedSession = await tx.session.update({
        where: { id: sessionRequest.session.id },
        data: {
          students: {
            disconnect: { id: sessionRequest.student.id },
          },
        },
        include: {
          instructor: { select: { id: true, firstName: true, lastName: true } },
          subjects: true,
          students: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      return { updatedRequest, updatedSession };
    }

    return { updatedRequest, updatedSession: null };
  });

  res.status(200).json({
    message:
      sessionRequest.status === 'ACCEPTED'
        ? 'Student removed from session and request rejected successfully'
        : 'Session request rejected successfully',
    sessionRequest: result.updatedRequest,
    session: result.updatedSession,
  });
});

/**
 * Start a session (change status from SCHEDULED to IN_PROGRESS)
 * @route POST /sessions/:id/start
 * @access Private/Instructor
 */
export const startSession = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
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
    res.status(403).json({ message: 'Only instructors can start sessions' });
    return;
  }

  const { id } = req.params;

  // Check if session exists and belongs to instructor
  const session = await prisma.session.findFirst({
    where: {
      id: id,
      instructorId: userId,
    },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true } },
      students: { select: { id: true, firstName: true, lastName: true, email: true } },
      subjects: true,
    },
  });

  if (!session) {
    res
      .status(404)
      .json({ message: 'Session not found or you do not have permission to start it' });
    return;
  }

  // Check if session is in SCHEDULED status
  if (session.status !== 'SCHEDULED') {
    res
      .status(400)
      .json({ message: 'Session cannot be started. Only scheduled sessions can be started.' });
    return;
  }

  // Check if session has students
  if (!session.students || session.students.length === 0) {
    res.status(400).json({ message: 'Session cannot be started without students' });
    return;
  }

  // Update session status to IN_PROGRESS
  const updatedSession = await prisma.session.update({
    where: { id: id },
    data: {
      status: 'IN_PROGRESS',
      startTime: new Date(), // Set actual start time when session begins
    },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true } },
      students: { select: { id: true, firstName: true, lastName: true, email: true } },
      subjects: true,
    },
  });

  res.status(200).json({
    message: 'Session started successfully',
    session: updatedSession,
  });
});

/**
 * Stop/Complete a session (change status from IN_PROGRESS to COMPLETED)
 * @route POST /sessions/:id/stop
 * @access Private/Instructor
 */
export const stopSession = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
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
    res.status(403).json({ message: 'Only instructors can stop sessions' });
    return;
  }

  const { id } = req.params;
  const { notes } = req.body;

  // Check if session exists and belongs to instructor
  const session = await prisma.session.findFirst({
    where: {
      id: id,
      instructorId: userId,
    },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true } },
      students: { select: { id: true, firstName: true, lastName: true, email: true } },
      subjects: true,
    },
  });

  if (!session) {
    res.status(404).json({ message: 'Session not found or you do not have permission to stop it' });
    return;
  }

  // Check if session is in IN_PROGRESS status
  if (session.status !== 'IN_PROGRESS') {
    res
      .status(400)
      .json({ message: 'Session cannot be stopped. Only sessions in progress can be stopped.' });
    return;
  }

  // Update session status to COMPLETED and set end time
  const updatedSession = await prisma.session.update({
    where: { id: id },
    data: {
      status: 'COMPLETED',
      endTime: new Date(), // Set actual end time when session ends
    },
    include: {
      instructor: { select: { id: true, firstName: true, lastName: true } },
      students: { select: { id: true, firstName: true, lastName: true, email: true } },
      subjects: true,
    },
  });

  // TODO: Store session notes in a separate table if needed
  // For now, we'll just log them
  if (notes) {
    console.log(`Session ${id} notes: ${notes}`);
  }

  res.status(200).json({
    message: 'Session completed successfully',
    session: updatedSession,
  });
});

/**
 * Get Zoom SDK token for joining a session
 * @route GET /sessions/:id/zoom-token
 * @access Private
 */
export const getZoomToken = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Get session details
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, firstName: true, lastName: true, email: true } },
        students: { select: { id: true } },
      },
    });

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    // Check if user is authorized to join (instructor or enrolled student)
    const isInstructor = session.instructorId === userId;
    const isStudent = session.students.some(student => student.id === userId);

    if (!isInstructor && !isStudent) {
      res.status(403).json({ message: 'You are not authorized to join this session' });
      return;
    }

    // Check if session has a Zoom meeting ID
    if (!session.zoomLink) {
      res.status(400).json({ message: 'Session does not have a Zoom meeting' });
      return;
    }

    try {
      // Extract meeting ID from zoomLink (our created meeting)
      const meetingId = session.zoomLink.includes('zoom.us')
        ? session.zoomLink.split('/').pop()
        : session.zoomLink;

      if (!meetingId) {
        res.status(400).json({ message: 'Invalid Zoom meeting ID' });
        return;
      }

      // Determine user role for Zoom
      const role = isInstructor ? 'host' : 'participant';

      // Generate SDK token for embedded video
      const sdkData = await zoomService.generateSDKToken(meetingId, role);

      res.json({
        success: true,
        sdkData,
        meetingId,
        role,
        sessionName: session.name,
      });
    } catch (error: any) {
      console.error('Zoom SDK token error:', error);
      res.status(500).json({
        message: 'Failed to generate Zoom token',
        error: error.message,
      });
    }
  }
);
