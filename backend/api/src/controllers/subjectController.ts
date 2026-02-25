import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';

// Types
interface SubjectData {
  name: string;
  description?: string;
  category?: string;
  level?: string;
}

/**
 * Get all subjects.
 * Retrieves a list of all available subjects.
 *
 * @route GET /subjects
 */
export const getAllSubjects = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subjects = await prisma.subject.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          level: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      res.json(subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  }
);

/**
 * Get a specific subject by its name.
 *
 * @route GET /subjects/:name
 * @param {string} name - The name of the subject.
 */
export const getSubjectByName = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Hello World!' });
  }
);

/**
 * @route POST /api/subjects
 * @desc Create a new subject
 * @access Private/Admin
 */
export const createSubject = expressAsyncHandler(async (req: Request, res: Response) => {
  const { name, description, category, level } = req.body as SubjectData;

  if (!name) {
    res.status(400).json({ error: 'Subject name is required' });
    return;
  }

  try {
    const existingSubject = await prisma.subject.findUnique({
      where: { name },
    });

    if (existingSubject) {
      res.status(409).json({ error: 'Subject with this name already exists' });
      return;
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        description,
        category,
        level,
      },
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

/**
 * @route GET /api/subjects/:id
 * @desc Get subject by ID
 * @access Private
 */
export const getSubject = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        level: true,
      },
    });

    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

/**
 * @route PUT /api/subjects/:id
 * @desc Update subject
 * @access Private/Admin
 */
export const updateSubject = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, category, level } = req.body as SubjectData;

  try {
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    if (name && name !== existingSubject.name) {
      const duplicateSubject = await prisma.subject.findUnique({
        where: { name },
      });

      if (duplicateSubject) {
        res.status(409).json({ error: 'Subject with this name already exists' });
        return;
      }
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(level !== undefined && { level }),
      },
    });

    res.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

/**
 * @route DELETE /api/subjects/:id
 * @desc Delete subject
 * @access Private/Admin
 */
export const deleteSubject = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    await prisma.subject.delete({
      where: { id },
    });

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

/**
 * @route GET /api/subjects
 * @desc Get all subjects
 * @access Private
 */
export const getSubjects = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        level: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});
