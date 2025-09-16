import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';

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
    queueItems.forEach(item => {
      item.canTeach = user.subjects.some(subject => subject.id === item.subjectId);
    });

    res.status(200).json({ queueItems });
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
      select: { role: true, subjects: true },
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
      select: { id: true, status: true, subjectId: true },
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

    const updatedQueue = await prisma.studentQueue.update({
      where: { id: Number(id) },
      data: { acceptedInstructorId: userId, status: 'ACCEPTED' },
    });
    res.status(200).json({ queue: updatedQueue });
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

    await prisma.studentQueue.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'Queue deleted successfully' });
  }
);
