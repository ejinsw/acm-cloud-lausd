import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import {
  notifyStudentJoinedQueue,
  notifyQueueAccepted,
  notifyStudentLeftQueue,
} from './sseController';
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
    });

    // Trigger SSE notification for queue update
    notifyStudentJoinedQueue(userId).catch(err => {
      console.error('SSE notification failed:', err);
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
      select: { role: true, subjects: true, email: true, firstName: true, lastName: true },
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (user.role !== 'INSTRUCTOR') {
      res.status(403).json({ message: 'Only instructors can accept a queue' });
      return;
    }

    const { id } = req.params;
    const queue = await prisma.studentQueue.findUnique({
      where: { id: Number(id) },
      include: {
        student: { select: { firstName: true, lastName: true } },
        subject: { select: { name: true } },
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

    if (!user.subjects.some(subject => subject.id === queue.subjectId)) {
      res.status(403).json({ message: 'You do not teach this subject' });
      return;
    }

    // Create Zoom meeting for the tutoring session
    let zoomMeetingId: string | null = null;
    let zoomMeetingPassword: string | null = null;
    let zoomJoinUrl: string | null = null;
    let sessionId: string | null = null;

    try {
      const meetingTopic = `Tutoring Session: ${queue.subject.name} - ${queue.student.firstName} ${queue.student.lastName}`;
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() + 5); // Start in 5 minutes
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

      // Create Zoom meeting under the instructor's account
      const zoomMeeting = await zoomService.createMeeting({
        topic: meetingTopic,
        startTime: startTime.toISOString(),
        duration: 60, // 1 hour default
        instructorId: userId,
        instructorEmail: user.email,
      });

      zoomMeetingId = zoomMeeting.id.toString();
      zoomMeetingPassword = zoomMeeting.password || '';
      zoomJoinUrl = zoomMeeting.join_url || null;

      // Create Session in DB with Zoom fields
      const session = await prisma.session.create({
        data: {
          name: meetingTopic,
          description: queue.description || `Tutoring session for ${queue.subject.name}`,
          startTime: startTime,
          endTime: endTime,
          zoomLink: zoomJoinUrl,
          status: 'SCHEDULED',
          materials: [],
          objectives: [],
          instructorId: userId,
          students: {
            connect: { id: queue.studentId },
          },
          subjects: {
            connect: { id: queue.subjectId },
          },
        },
        include: {
          instructor: { select: { id: true, firstName: true, lastName: true, email: true } },
          students: { select: { id: true, firstName: true, lastName: true, email: true } },
          subjects: true,
        },
      });

      sessionId = session.id;

      // Update queue with session and Zoom info
      const updatedQueue = await prisma.studentQueue.update({
        where: { id: Number(id) },
        data: {
          acceptedInstructorId: userId,
          status: 'ACCEPTED',
          zoomMeetingId: zoomMeetingId,
          zoomMeetingPassword: zoomMeetingPassword,
          sessionId: sessionId,
        },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
          subject: true,
          session: {
            include: {
              instructor: { select: { id: true, firstName: true, lastName: true } },
              students: { select: { id: true, firstName: true, lastName: true } },
              subjects: true,
            },
          },
        },
      });

      // Trigger SSE notifications for both instructor and student about session creation
      notifyQueueAccepted(queue.studentId, sessionId, session).catch(err => {
        console.error('SSE notification failed:', err);
      });

      res.status(200).json({
        queue: updatedQueue,
        session: session,
        zoomMeeting: zoomMeetingId
          ? {
              meetingId: zoomMeetingId,
              password: zoomMeetingPassword,
              joinUrl: zoomJoinUrl,
            }
          : null,
      });
    } catch (error: any) {
      console.error('Failed to create Zoom meeting or session:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      if (error?.response) {
        console.error('Zoom API error response:', error.response.data);
        console.error('Zoom API error status:', error.response.status);
      }

      // Update queue status even if Zoom/Session creation fails
      const updatedQueue = await prisma.studentQueue.update({
        where: { id: Number(id) },
        data: {
          acceptedInstructorId: userId,
          status: 'ACCEPTED',
        },
      });

      // Still notify about queue acceptance
      notifyQueueAccepted(queue.studentId).catch(err => {
        console.error('SSE notification failed:', err);
      });

      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Failed to create Zoom meeting. Please try again or contact support.';

      res.status(200).json({
        queue: updatedQueue,
        error: errorMessage,
        errorDetails:
          process.env.NODE_ENV === 'development'
            ? {
                message: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
              }
            : undefined,
      });
    }
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

    // Get student ID before deleting for SSE notification
    const studentId = queue.studentId;
    console.log(`Deleting queue for student: ${studentId}`);

    await prisma.studentQueue.delete({ where: { id: Number(id) } });
    console.log(`Queue ${id} deleted successfully`);

    // Trigger SSE notification for queue update
    notifyStudentLeftQueue(studentId).catch(err => {
      console.error('SSE notification failed:', err);
    });

    res.status(200).json({ message: 'Queue deleted successfully' });
  }
);
