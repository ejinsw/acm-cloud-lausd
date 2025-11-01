import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { zoomService } from '../services/zoomService';
import { ZOOM_CONFIG } from '../config/zoom.config';

/**
 * @route GET /api/zoom/sdk-signature/:queueId
 * @desc Get SDK signature for embedded Zoom SDK
 * @access Private
 */
export const getSDKSignature = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { queueId } = req.params;
  const { role = 'participant', userName, userEmail } = req.query;

  // Get queue information
  const queue = await prisma.studentQueue.findUnique({
    where: { id: Number(queueId) },
    select: {
      id: true,
      zoomMeetingId: true,
      zoomMeetingPassword: true,
      studentId: true,
      acceptedInstructorId: true,
    },
  });

  if (!queue) {
    res.status(404).json({ message: 'Queue not found' });
    return;
  }

  // Check if user is the student or instructor for this queue
  if (queue.studentId !== userId && queue.acceptedInstructorId !== userId) {
    res.status(403).json({ message: 'You do not have access to this meeting' });
    return;
  }

  if (!queue.zoomMeetingId) {
    res.status(404).json({ message: 'Zoom meeting not found for this queue' });
    return;
  }

  // Determine role number: 1 for host, 0 for participant
  const roleNumber = role === 'host' || queue.acceptedInstructorId === userId ? 1 : 0;

  // Generate SDK signature
  try {
    const signature = zoomService.generateSDKSignature(queue.zoomMeetingId, roleNumber);

    // Return SDK configuration for frontend
    res.status(200).json({
      meetingNumber: queue.zoomMeetingId,
      sdkKey: ZOOM_CONFIG.sdkKey,
      signature: signature,
      password: queue.zoomMeetingPassword || '',
      userName: userName || '',
      userEmail: userEmail || '',
      role: roleNumber,
    });
  } catch (error: any) {
    console.error('Failed to generate SDK signature:', error);
    res.status(500).json({
      message: 'Failed to generate SDK signature',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/zoom/meeting-info/:queueId
 * @desc Get Zoom meeting information for a queue
 * @access Private
 */
export const getMeetingInfo = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { queueId } = req.params;

  // Get queue information
  const queue = await prisma.studentQueue.findUnique({
    where: { id: Number(queueId) },
    select: {
      id: true,
      zoomMeetingId: true,
      zoomMeetingPassword: true,
      studentId: true,
      acceptedInstructorId: true,
    },
  });

  if (!queue) {
    res.status(404).json({ message: 'Queue not found' });
    return;
  }

  // Check if user is the student or instructor for this queue
  if (queue.studentId !== userId && queue.acceptedInstructorId !== userId) {
    res.status(403).json({ message: 'You do not have access to this meeting' });
    return;
  }

  if (!queue.zoomMeetingId) {
    res.status(404).json({ message: 'Zoom meeting not found for this queue' });
    return;
  }

  res.status(200).json({
    meetingId: queue.zoomMeetingId,
    password: queue.zoomMeetingPassword || '',
  });
});
