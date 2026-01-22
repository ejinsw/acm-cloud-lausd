import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { cognito } from '../lib/cognitoSDK';
import { AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminUpdateUserAttributesCommand, AdminConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

const prisma = new PrismaClient();

export const verifyInstructor = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as { sub: string; role: string });
    const { id } = req.params;

    if (!user?.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (user.role !== 'ADMIN') {
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
    const user = (req.user as { sub: string; role: string });
    const { id } = req.params;

    if (!user?.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (user.role !== 'ADMIN') {
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
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as { sub: string; role: string });
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!user?.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (user.role !== 'ADMIN') {
      res.status(403).json({ message: 'You must be an admin to reset passwords' });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters long' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { id },
      select: { id: true, email: true }
    });

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    try {
      // Reset password in Cognito
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: existingUser.email,
        Password: newPassword,
        Permanent: true
      });

      await cognito.send(setPasswordCommand);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Failed to reset password', details: error.message });
    }
  }
);

export const adminUpdateSession = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = (req.user as { sub: string; role: string });

    // Find the session
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    if (user.role !== 'ADMIN') {
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
    const user = (req.user as { sub: string; role: string });

    // Find the session
    const session = await prisma.session.findUnique({ where: { id } });

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    if (user.role !== 'ADMIN') {
      res.status(403).json({ message: 'You do not have permission to delete this session' });
      return;
    }

    await prisma.session.delete({ where: { id } });
    res.status(200).json({ message: 'Session deleted successfully' });
  }
);

// Get all users for admin management
export const getAllUsers = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as { sub: string; role: string });
    const { page = 1, limit = 10, role: roleFilter, verified, search } = req.query;

    if (!user?.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (user.role !== 'ADMIN') {
      res.status(403).json({ message: 'You must be an admin to view all users' });
      return;
    }

    try {
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build where clause for filtering
      const where: any = {};
      
      if (roleFilter && ['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(roleFilter as string)) {
        where.role = roleFilter;
      }
      
      if (verified !== undefined) {
        where.verified = verified === 'true';
      }
      
      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            verified: true,
            createdAt: true,
            updatedAt: true,
            averageRating: true,
            certificationUrls: true,
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      res.status(200).json({
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users', details: error.message });
    }
  }
);

// Get unverified instructors for document review
export const getUnverifiedInstructors = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as { sub: string; role: string });

    if (!user?.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (user.role !== 'ADMIN') {
      res.status(403).json({ message: 'You must be an admin to view unverified instructors' });
      return;
    }

    try {
      const unverifiedInstructors = await prisma.user.findMany({
        where: {
          role: 'INSTRUCTOR',
          verified: false
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          education: true,
          experience: true,
          certificationUrls: true,
          bio: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });

      res.status(200).json({ instructors: unverifiedInstructors });
    } catch (error: any) {
      console.error('Error fetching unverified instructors:', error);
      res.status(500).json({ message: 'Failed to fetch unverified instructors', details: error.message });
    }
  }
);

// Create a new admin account
export const createAdminAccount = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as { sub: string; role: string });
    const { email, firstName, lastName, password } = req.body;

    if (!user?.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (user.role !== 'ADMIN') {
      res.status(403).json({ message: 'You must be an admin to create admin accounts' });
      return;
    }

    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      res.status(400).json({ message: 'Email, first name, last name, and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters long' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    try {
      // Create user in Cognito
      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
        ],
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS' // Don't send welcome email
      });

      const cognitoResponse = await cognito.send(createUserCommand);
      const userId = cognitoResponse.User?.Username;

      if (!userId) {
        res.status(500).json({ message: 'Failed to create user in Cognito' });
        return;
      }

      // Set permanent password
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: email,
        Password: password,
        Permanent: true
      });

      await cognito.send(setPasswordCommand);

      // Create user in database
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email,
          firstName,
          lastName,
          role: 'ADMIN',
          verified: true
        }
      });

      res.status(201).json({ 
        message: 'Admin account created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      });
    } catch (error: any) {
      console.error('Error creating admin account:', error);
      res.status(500).json({ message: 'Failed to create admin account', details: error.message });
    }
  }
);

// Update user role
export const updateUserRole = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as { sub: string; role: string });
    const { id } = req.params;
    const { role: newRole } = req.body;

    if (!user?.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (user.role !== 'ADMIN') {
      res.status(403).json({ message: 'You must be an admin to update user roles' });
      return;
    }

    if (!['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(newRole)) {
      res.status(400).json({ message: 'Invalid role. Must be STUDENT, INSTRUCTOR, or ADMIN' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { id },
      select: { id: true, email: true, role: true }
    });

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    try {
      // Update role in Cognito
      const updateAttributesCommand = new AdminUpdateUserAttributesCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: existingUser.email,
        UserAttributes: [
          { Name: 'custom:role', Value: newRole }
        ]
      });

      await cognito.send(updateAttributesCommand);

      // Update role in database
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: newRole },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          verified: true
        }
      });

      res.status(200).json({ 
        message: 'User role updated successfully',
        user: updatedUser
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Failed to update user role', details: error.message });
    }
  }
);

// Get admin dashboard statistics
export const getAdminStats = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as { sub: string; role: string });

    if (!user?.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (user.role !== 'ADMIN') {
      res.status(403).json({ message: 'You must be an admin to view statistics' });
      return;
    }

    try {
      const [
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        unverifiedInstructors,
        totalSessions,
        activeSessions,
        totalReviews
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { role: 'INSTRUCTOR', verified: false } }),
        prisma.session.count(),
        prisma.session.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.review.count()
      ]);

      res.status(200).json({
        users: {
          total: totalUsers,
          students: totalStudents,
          instructors: totalInstructors,
          admins: totalAdmins,
          unverifiedInstructors
        },
        sessions: {
          total: totalSessions,
          active: activeSessions
        },
        reviews: {
          total: totalReviews
        }
      });
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch statistics', details: error.message });
    }
  }
);

// Manually confirm any user account
export const confirmUserAccount = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as { sub: string; role: string });
    const { id } = req.params;

    if (!user?.sub) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (user.role !== 'ADMIN') {
      res.status(403).json({ message: 'You must be an admin to confirm user accounts' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ 
      where: { id },
      select: { id: true, email: true, verified: true }
    });

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (existingUser.verified) {
      res.status(400).json({ message: 'User is already verified' });
      return;
    }

    try {
      // Confirm user in Cognito
      const confirmCommand = new AdminConfirmSignUpCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: existingUser.email
      });

      await cognito.send(confirmCommand);

      // Update verified status in database
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { verified: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          verified: true
        }
      });

      res.status(200).json({ 
        message: 'User account confirmed successfully',
        user: updatedUser
      });
    } catch (error: any) {
      console.error('Error confirming user account:', error);
      res.status(500).json({ message: 'Failed to confirm user account', details: error.message });
    }
  }
);
