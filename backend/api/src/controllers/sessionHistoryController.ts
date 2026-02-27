import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getAllSessionHistory = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const requesterId = (req.user as { sub?: string })?.sub;
    if (!requesterId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const requestedUserId = req.query.userId as string | undefined;

    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true },
    });

    const isAdmin = requester?.role === 'ADMIN';
    const targetUserId = requestedUserId && isAdmin ? requestedUserId : requesterId;

    const sessions = await prisma.sessionHistoryItem.findMany({
      where: {
        userId: targetUserId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        relatedReview: true,
      },
    });

    res.json({ sessions });
  }
);

export const getSessionHistoryById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const sessionHistoryItem = await prisma.sessionHistoryItem.findUnique({
      where: { id },
      include: {
        relatedReview: true,
      },
    });

    if (!sessionHistoryItem) {
      res.status(404).json({ message: 'Session History Item not Found' });
      return;
    }

    res.json({ sessionHistoryItem });
  }
);

export const createSessionHistory = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.sub) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const { sessionId } = req.body;
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        instructor: { select: { firstName: true, lastName: true } },
        students: { select: { firstName: true, lastName: true } },
      },
    });
    if (!session) {
      res.status(404).json({ message: 'Session not Found' });
      return;
    }
    const newSessionHistoryItem = await prisma.sessionHistoryItem.create({
      data: {
        userId: req.user?.sub,
        name: session.name,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        zoomLink: session.zoomLink,
        maxAttendees: session.maxAttendees,
        status: session.status,
        materials: session.materials,
        objectives: session.objectives,
        subjects: session.subjects,
        instructorName: session.instructor.firstName + ' ' + session.instructor.lastName,
        instructorId: session.instructorId,
        studentNames: session.students.map(student => student.firstName + ' ' + student.lastName),
      },
    });
    res.json({ sessionHistoryItem: newSessionHistoryItem });
  }
);

export const deleteSessionHistory = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await prisma.sessionHistoryItem.delete({ where: { id } });
    res.status(200).json({ message: 'Session History Item deleted successfully' });
  }
);
