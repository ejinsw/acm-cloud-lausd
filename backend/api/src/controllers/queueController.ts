import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { notifyQueueChange } from '../services/queueNotifier';
import { zoomService } from '../services/zoomService';

export const getQueueList = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, subjects: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role !== 'INSTRUCTOR') {
      res.status(403).json({ message: 'Only instructors can view the queue' });
      return;
    }

    // Get all pending queue items with student and subject details
    const queueItems = await prisma.studentQueue.findMany({
      where: { status: 'PENDING' },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Add canTeach information to each item
    const queueItemsWithCanTeach = queueItems.map(item => ({
      ...item,
      canTeach: user.subjects.some(subject => subject.id === item.subjectId),
    }));

    res.status(200).json({ queueItems: queueItemsWithCanTeach });
  }
);

export const getStudentQueues = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const queues = await prisma.studentQueue.findMany({ 
      where: { studentId: userId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ queues });
  }
);

export const createStudentQueue = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { description, subjectId } = req.body;
    const userId = (req.user as { sub: string })?.sub;
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role !== 'STUDENT') {
      res.status(403).json({ message: 'Only students can create a queue' });
      return;
    }

    if (!description) {
      res.status(404).json({ message: 'Description not found' });
      return;
    }
    if (!subjectId) {
      res.status(404).json({ message: 'Subject ID not found' });
      return;
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });
    if (!subject) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }

    const newQueue = await prisma.studentQueue.create({
      data: { description, subjectId, studentId: userId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    // Notify WebSocket server that a student joined the queue
    notifyQueueChange({ 
      type: 'queue_join',
      queueItem: newQueue
    }).catch(err => {
      console.error('Queue notification failed:', err);
    });

    res.status(201).json({ queue: newQueue });
  }
);

export const acceptQueue = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        role: true, 
        subjects: true, 
        firstName: true, 
        lastName: true,
        email: true,
        zoomAccessToken: true,
        zoomTokenExpiresAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (user.role !== 'INSTRUCTOR') {
      res.status(403).json({ message: 'Only instructors can accept a queue' });
      return;
    }

    // Check if instructor has Zoom connected - REQUIRED for queue acceptance
    if (
      !user.zoomAccessToken ||
      !user.zoomTokenExpiresAt ||
      new Date() >= user.zoomTokenExpiresAt
    ) {
      res.status(400).json({
        message: 'Zoom account not connected. Please connect your Zoom account before accepting queue requests.',
        needsZoomConnection: true,
      });
      return;
    }

    const { id } = req.params;
    const queue = await prisma.studentQueue.findUnique({
      where: { id: Number(id) },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        subject: {
          select: { id: true, name: true, level: true },
        },
      },
    });
    if (!queue) {
      res.status(404).json({ message: 'Queue not found' });
      return;
    }

    if (queue.status !== 'PENDING') {
      res.status(400).json({ message: 'Queue is not pending' });
      return;
    }

    // Update queue status to accepted
    const updatedQueue = await prisma.studentQueue.update({
      where: { id: Number(id) },
      data: { acceptedInstructorId: userId, status: 'ACCEPTED' },
    });

    // Create a new session for the instructor and student
    const now = new Date();
    const sessionEndTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    // Create Zoom meeting for the session
    let zoomMeeting;
    try {
      console.log('[Queue Accept] Creating Zoom meeting for instructor:', user.email);
      zoomMeeting = await zoomService.createMeeting(
        user.zoomAccessToken!, // Pass the instructor's access token
        {
          topic: `Tutoring Session - ${queue.subject.name}`,
          startTime: now.toISOString(),
          duration: 60, // 1 hour
          instructorEmail: user.email,
        }
      );
      console.log('[Queue Accept] Zoom meeting created successfully:', zoomMeeting.join_url);
    } catch (error: any) {
      console.error('[Queue Accept] Failed to create Zoom meeting:', error);
      res.status(500).json({
        message: 'Failed to create Zoom meeting. Please try again.',
        error: error.message,
      });
      return;
    }

    const session = await prisma.session.create({
      data: {
        name: `Tutoring Session - ${queue.subject.name}`,
        description: queue.description,
        startTime: now,
        endTime: sessionEndTime,
        zoomLink: zoomMeeting.join_url, // Use real Zoom meeting link
        maxAttendees: 2, // Instructor + 1 student
        materials: [],
        objectives: [`Help student with ${queue.subject.name}`],
        instructorId: userId,
        subjects: {
          connect: [{ id: queue.subjectId }],
        },
        students: {
          connect: [{ id: queue.studentId }],
        },
        status: 'IN_PROGRESS', // Start the session immediately
      },
      include: {
        instructor: { select: { id: true, firstName: true, lastName: true } },
        students: { select: { id: true, firstName: true, lastName: true, email: true } },
        subjects: true,
      },
    });

    // Notify the specific student that their queue was accepted
    notifyQueueChange({ 
      type: 'queue_accepted',
      targetStudentId: queue.studentId,
      sessionId: session.id
    }).catch(err => {
      console.error('Queue notification failed:', err);
    });

    res.status(200).json({ 
      queue: updatedQueue,
      session: session,
      redirectUrl: `/sessions/${session.id}`
    });
  }
);

export const updateDescription = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;
    const { id } = req.params;
    const { description } = req.body;
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!currentUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (currentUser.role !== 'STUDENT') {
      res
        .status(403)
        .json({ message: 'You must be a student to update student queue descriptions' });
      return;
    }

    const queue = await prisma.studentQueue.findUnique({ where: { id: Number(id) } });
    if (!queue) {
      res.status(404).json({ message: 'Queue not found' });
      return;
    }
    if (queue.studentId !== userId) {
      res.status(403).json({ message: 'You do not have permission to update this queue' });
      return;
    }

    if (description === undefined || description === null || description === '') {
      res.status(400).json({ message: 'Description cannot be empty' });
      return;
    }

    const updatedQueue = await prisma.studentQueue.update({
      where: { id: Number(id) },
      data: { description },
    });
    res.status(200).json({ queue: updatedQueue });
  }
);

export const deleteQueue = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;
    const { id } = req.params;
    console.log(`Delete queue request: userId=${userId}, queueId=${id}`);

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const queue = await prisma.studentQueue.findUnique({ where: { id: Number(id) } });

    if (!queue) {
      res.status(404).json({ message: 'Queue not found' });
      return;
    }

    if (queue.studentId !== userId) {
      res.status(403).json({ message: 'You do not have permission to delete this queue' });
      return;
    }

    // Get queue details before deleting
    const studentId = queue.studentId;
    const queueId = queue.id;
    console.log(`Deleting queue ${queueId} for student: ${studentId}`);

    await prisma.studentQueue.delete({ where: { id: Number(id) } });
    console.log(`Queue ${id} deleted successfully`);

    // Notify WebSocket server that a student left the queue
    notifyQueueChange({ 
      type: 'queue_leave',
      queueId,
      studentId
    }).catch(err => {
      console.error('Queue notification failed:', err);
    });

    res.status(200).json({ message: 'Queue deleted successfully' });
  }
);
