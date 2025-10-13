import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// ===== CONNECTION MANAGEMENT =====
const instructorConnections = new Map<string, Response>();
const studentConnections = new Map<string, Response>();

// ===== MAIN SSE HANDLER =====
export const handleQueueSSE = (req: Request, res: Response) => {
  const userId = (req.user as { sub: string })?.sub;
  const userRole = (req.user as unknown as { role: string })?.role;

  console.log(`SSE connection attempt: userId=${userId}, role=${userRole}`);

  if (!userId || !userRole) {
    console.log('SSE connection failed: Missing user info');
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
    console.log(
      `SSE connected: Instructor ${userId} (total instructors: ${instructorConnections.size})`
    );
  } else if (userRole === 'STUDENT') {
    studentConnections.set(userId, res);
    console.log(`SSE connected: Student ${userId} (total students: ${studentConnections.size})`);
  }

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  console.log(`SSE initial message sent to ${userRole} ${userId}`);

  // Send initial data based on user role
  if (userRole === 'INSTRUCTOR') {
    // Send initial queue list to instructor
    sendInitialQueueListToInstructor(res);
  } else if (userRole === 'STUDENT') {
    // Send initial queue status to student
    sendInitialQueueStatusToStudent(userId, res);
  }

  // Handle disconnect
  req.on('close', () => {
    console.log(`SSE disconnected: ${userRole} ${userId}`);
    instructorConnections.delete(userId);
    studentConnections.delete(userId);
  });
};

// ===== INITIAL DATA FUNCTIONS =====

// Send initial queue list to a specific instructor
const sendInitialQueueListToInstructor = async (res: Response) => {
  try {
    // Get current queue list
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

    // Get instructor's subjects to determine canTeach
    const instructorId = Array.from(instructorConnections.entries())
      .find(([_, connection]) => connection === res)?.[0];
    
    let queueItemsWithCanTeach = queueItems;
    if (instructorId) {
      const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
        select: { subjects: true },
      });
      
      if (instructor) {
        queueItemsWithCanTeach = queueItems.map(item => ({
          ...item,
          canTeach: instructor.subjects.some(subject => subject.id === item.subjectId),
        }));
      }
    }

    const message = {
      type: 'queue_list_updated',
      data: { queueItems: queueItemsWithCanTeach },
      timestamp: new Date().toISOString(),
    };

    const sseMessage = `data: ${JSON.stringify(message)}\n\n`;
    res.write(sseMessage);
    console.log(`Initial queue list sent to instructor: ${queueItemsWithCanTeach.length} items`);
  } catch (error) {
    console.error('Error sending initial queue list to instructor:', error);
  }
};

// Send initial queue status to a specific student
const sendInitialQueueStatusToStudent = async (studentId: string, res: Response) => {
  try {
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
    res.write(sseMessage);
    console.log(`Initial queue status sent to student ${studentId}: inQueue=${!!studentQueue}`);
  } catch (error) {
    console.error('Error sending initial queue status to student:', error);
  }
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

  // Send to all connected instructors with their specific canTeach information
  instructorConnections.forEach(async (connection, instructorId) => {
    try {
      if (!connection.writableEnded) {
        // Get instructor's subjects to determine canTeach for each item
        const instructor = await prisma.user.findUnique({
          where: { id: instructorId },
          select: { subjects: true },
        });
        
        const queueItemsWithCanTeach = instructor 
          ? queueItems.map(item => ({
              ...item,
              canTeach: instructor.subjects.some(subject => subject.id === item.subjectId),
            }))
          : queueItems.map(item => ({ ...item, canTeach: false }));

        const message = {
          type: 'queue_list_updated',
          data: { queueItems: queueItemsWithCanTeach },
          timestamp: new Date().toISOString(),
        };

        const sseMessage = `data: ${JSON.stringify(message)}\n\n`;
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
  // Step 1: get the student's own queue record
  const studentQueue = await prisma.studentQueue.findFirst({
    where: { studentId },
    select: { createdAt: true },
  });

  if (!studentQueue) {
    // student has no queue, so position is 0
    return 0;
  }

  // Step 2: count all pending queues created before or at the same time
  const position = await prisma.studentQueue.count({
    where: {
      status: 'PENDING',
      createdAt: {
        lte: studentQueue.createdAt,
      },
    },
  });

  return position;
}

// ===== SIMPLIFIED NOTIFICATION FUNCTIONS =====

// When student joins queue
export const notifyStudentJoinedQueue = async (studentId: string) => {
  console.log(`notifyStudentJoinedQueue called for student: ${studentId}`);
  // Update instructor list
  await broadcastQueueListToInstructors();

  // Update student status
  await broadcastStudentQueueStatus(studentId);
};

// When instructor accepts queue
export const notifyQueueAccepted = async (studentId: string) => {
  console.log(`notifyQueueAccepted called for student: ${studentId}`);
  // Update instructor list (remove accepted queue)
  await broadcastQueueListToInstructors();

  // Update student status (no longer in queue)
  await broadcastStudentQueueStatus(studentId);
};

// When student leaves queue
export const notifyStudentLeftQueue = async (studentId: string) => {
  console.log(`notifyStudentLeftQueue called for student: ${studentId}`);
  // Update instructor list
  await broadcastQueueListToInstructors();

  // Update student status
  await broadcastStudentQueueStatus(studentId);
};
