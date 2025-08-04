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
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as { sub: string })?.sub;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (userId.role !== 'ADMIN') {
      res.status(403).json({ message: 'You must be an admin' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: 'User Deleted Successfully' });
  }
);

export const resetUserPassword = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const adminUpdateSession = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const userId = (req.user as { sub: string })?.sub;

    // Find the session
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    if (userId.role !== 'ADMIN') {
      res.status(403).json({ message: 'You must be an admin to update this session' });
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

export const adminDeleteSession = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = (req.user as { sub: string })?.sub;

    // Find the session
    const session = await prisma.session.findUnique({ where: { id } });

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    if (userId.role !== 'ADMIN') {
      res.status(403).json({ message: 'You do not have permission to delete this session' });
      return;
    }

    await prisma.session.delete({ where: { id } });
    res.status(200).json({ message: 'Session deleted successfully' });
  }
);
