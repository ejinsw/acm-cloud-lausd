import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyInstructor = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (userId.role !== 'ADMIN') {
      res.status(403).json({ message: 'You must be an admin to verify an instructor' });
      return;
    }

    const instructor = await prisma.user.findUnique({
      where: { id },
    });
    if (!instructor) {
      res.status(404).json({ message: 'Instructor not found' });
      return;
    }
    if (instructor.role !== 'INSTRUCTOR') {
      res.status(400).json({ message: 'User is not an instructor' });
      return;
    }

    if (instructor.verified) {
      res.status(400).json({ message: 'Instructor is already verified' });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: {
        verified: true,
      },
    });
    res.status(200).json({ message: 'Instructor verified successfully' });
  }
);

export const adminDeleteUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const resetUserPassword = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const adminUpdateSession = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const adminDeleteSession = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
