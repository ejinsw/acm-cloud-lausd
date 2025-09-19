import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// ===== CONNECTION MANAGEMENT =====
const instructorConnections = new Map<string, Response>();
const studentConnections = new Map<string, Response>();

// ===== MAIN SSE HANDLER =====
export const handleQueueSSE = (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
  const userRole = (req.user as { role: string })?.role;

  if (!userId || !userRole) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Store connection
  if (userRole === 'INSTRUCTOR') {
    instructorConnections.set(userId, res);
  } else if (userRole === 'STUDENT') {
    studentConnections.set(userId, res);
  }

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Handle disconnect
  req.on('close', () => {
    instructorConnections.delete(userId);
    studentConnections.delete(userId);
  });
};

// ===== SIMPLIFIED BROADCAST FUNCTIONS =====

// Send updated queue list to ALL instructors
export const broadcastQueueListToInstructors = async () => {
  // Get current queue list (same logic as your existing getQueueList)
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

  const message = {
    type: 'queue_list_updated',
    data: { queueItems },
    timestamp: new Date().toISOString(),
  };

  const sseMessage = `data: ${JSON.stringify(message)}\n\n`;

  // Send to all connected instructors
  instructorConnections.forEach((connection, instructorId) => {
    try {
      if (!connection.writableEnded) {
        connection.write(sseMessage);
      } else {
        instructorConnections.delete(instructorId);
      }
    } catch (error) {
      instructorConnections.delete(instructorId);
    }
  });
};

// Send queue status to specific student
export const broadcastStudentQueueStatus = async (studentId: string) => {
  // Get student's current queue status
  const studentQueue = await prisma.studentQueue.findFirst({
    where: {
      studentId: studentId,
      status: 'PENDING',
    },
    include: {
      subject: {
        select: {
          name: true,
          level: true,
        },
      },
    },
  });

  const message = {
    type: 'my_queue_status',
    data: {
      inQueue: !!studentQueue,
      queue: studentQueue,
      position: studentQueue ? await getQueuePosition(studentId) : null,
    },
    timestamp: new Date().toISOString(),
  };

  const sseMessage = `data: ${JSON.stringify(message)}\n\n`;

  const connection = studentConnections.get(studentId);
  if (connection && !connection.writableEnded) {
    try {
      connection.write(sseMessage);
    } catch (error) {
      studentConnections.delete(studentId);
    }
  }
};

// Helper function to get queue position
async function getQueuePosition(studentId: string): Promise<number> {
  const position = await prisma.studentQueue.count({
    where: {
      status: 'PENDING',
      createdAt: {
        lte: await prisma.studentQueue
          .findUnique({
            where: { studentId },
            select: { createdAt: true },
          })
          .then(q => q?.createdAt),
      },
    },
  });
  return position;
}

// ===== SIMPLIFIED NOTIFICATION FUNCTIONS =====

// When student joins queue
export const notifyStudentJoinedQueue = async (studentId: string) => {
  // Update instructor list
  await broadcastQueueListToInstructors();

  // Update student status
  await broadcastStudentQueueStatus(studentId);
};

// When instructor accepts queue
export const notifyQueueAccepted = async (studentId: string) => {
  // Update instructor list (remove accepted queue)
  await broadcastQueueListToInstructors();

  // Update student status (no longer in queue)
  await broadcastStudentQueueStatus(studentId);
};

// When student leaves queue
export const notifyStudentLeftQueue = async (studentId: string) => {
  // Update instructor list
  await broadcastQueueListToInstructors();

  // Update student status
  await broadcastStudentQueueStatus(studentId);
};
