import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getAllSessionHistory = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.query;

    const where: any = {};
    if (userId) {
      where.userId = userId as string;
    }

    const sessions = await prisma.sessionHistoryItem.findMany({
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
        subjects: { select: { name: true } },
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
        subjects: session.subjects.map(subject => subject.name),
        instructorName: session.instructor.firstName + ' ' + session.instructor.lastName,
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
