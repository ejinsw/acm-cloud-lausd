const WebSocket = require('ws');

function sendQueueError(ws, message) {
  ws.send(JSON.stringify({ type: 'ERROR', payload: { message } }));
}

function normalizeRole(role) {
  if (typeof role !== 'string') {
    return '';
  }

  return role.toLowerCase();
}

function isRoleAuthorized(ws, requestedRole) {
  const resolvedRole = normalizeRole(ws.userRole);
  if (!resolvedRole) {
    return false;
  }

  if (requestedRole === 'admin') {
    return resolvedRole === 'admin';
  }

  if (requestedRole === 'instructor') {
    return resolvedRole === 'instructor' || resolvedRole === 'admin';
  }

  if (requestedRole === 'student') {
    return resolvedRole === 'student';
  }

  return false;
}

function isUnderReviewInstructor(ws, requestedRole) {
  return (
    requestedRole === 'instructor' &&
    String(ws.userRole || '').toUpperCase() === 'INSTRUCTOR' &&
    ws.isUnderReview === true
  );
}

function subscribeQueue(ws, payload, queueInstructors, queueStudents, queueAdmins) {
  if (!ws.userId) {
    sendQueueError(ws, 'User not identified.');
    return;
  }

  const role = normalizeRole(payload?.role);
  const { data } = payload || {};
  if (!role) {
    sendQueueError(ws, 'Queue role is required.');
    return;
  }

  if (!isRoleAuthorized(ws, role)) {
    sendQueueError(ws, 'You are not authorized to subscribe with this role.');
    return;
  }

  if (isUnderReviewInstructor(ws, role)) {
    sendQueueError(
      ws,
      'Your instructor account is under review. Queue interactions are disabled until approval.'
    );
    return;
  }

  switch (role) {
    case 'student': {
      if (!data || !data.subject || !data.description) {
        sendQueueError(ws, 'Subject and description are required to join the student queue.');
        return;
      }

      queueStudents.set(ws.userId, { id: ws.userId, ws, role, data, joinedAt: Date.now() });
      console.log(`Student ${ws.userId} subscribed to queue updates`);
      ws.send(JSON.stringify({ type: 'QUEUE_SUBSCRIBED', payload: {} }));

      // Create enriched payload without ws object (which breaks JSON serialization)
      const studentPayload = {
        id: ws.userId,
        role,
        data: {
          description: data.description,
          subject: data.subject,
          // Client-provided enriched data
          student: data.student, // { id, firstName, lastName, email, cognitoId }
        },
      };

      // NOTIFY WATCHING INSTRUCTORS
      queueInstructors.forEach(({ ws: instrWs }) => {
        if (instrWs.readyState !== WebSocket.OPEN) {
          console.log(`Instructor ${ws.userId} connection is not ready. Skipping...`);
          return;
        }
        instrWs.send(
          JSON.stringify({
            type: 'QUEUE_JOIN',
            payload: studentPayload,
          })
        );
      });

      // NOTIFY WATCHING ADMINS
      queueAdmins.forEach(({ ws: instrWs }) => {
        if (instrWs.readyState !== WebSocket.OPEN) {
          console.log(`Instructor ${ws.userId} connection is not ready. Skipping...`);
          return;
        }
        instrWs.send(
          JSON.stringify({
            type: 'QUEUE_JOIN',
            payload: studentPayload,
          })
        );
      });
      break;
    }
    case 'instructor': {
      queueInstructors.set(ws.userId, { ws, role });
      console.log(`Instructor ${ws.userId} subscribed to queue updates`);

      // Send enriched student list without ws objects
      const enrichedStudentsForInstructor = Array.from(queueStudents.values()).map(student => ({
        id: student.id,
        role: student.role,
        data: {
          description: student.data.description,
          subject: student.data.subject,
          student: student.data.student,
        },
      }));

      ws.send(
        JSON.stringify({
          type: 'QUEUE_SUBSCRIBED',
          payload: { students: enrichedStudentsForInstructor },
        })
      );
      break;
    }
    case 'admin': {
      queueAdmins.set(ws.userId, { ws, role });
      console.log(`Admin ${ws.userId} subscribed to queue updates`);

      // Send enriched student list without ws objects
      const enrichedStudentsForAdmin = Array.from(queueStudents.values()).map(student => ({
        id: student.id,
        role: student.role,
        data: {
          description: student.data.description,
          subject: student.data.subject,
          student: student.data.student,
        },
      }));

      ws.send(
        JSON.stringify({
          type: 'QUEUE_SUBSCRIBED',
          payload: { students: enrichedStudentsForAdmin },
        })
      );
      break;
    }
  }
}

function unsubscribeQueue(ws, payload, queueInstructors, queueStudents, queueAdmins) {
  if (!ws.userId) {
    sendQueueError(ws, 'User not identified.');
    return;
  }

  const role = normalizeRole(payload?.role);
  if (!role) {
    sendQueueError(ws, 'Queue role is required.');
    return;
  }

  if (!isRoleAuthorized(ws, role)) {
    sendQueueError(ws, 'You are not authorized to unsubscribe with this role.');
    return;
  }

  switch (role) {
    case 'student': {
      queueStudents.delete(ws.userId);
      console.log(`Student ${ws.userId} unsubscribed from queue updates`);
      ws.send(JSON.stringify({ type: 'QUEUE_UNSUBSCRIBED', payload: {} }));

      // Create payload without ws object
      const leavePayload = {
        id: ws.userId,
        role,
      };

      // NOTIFY WATCHING INSTRUCTORS
      queueInstructors.forEach(({ ws: instrWs }) => {
        if (instrWs.readyState !== WebSocket.OPEN) {
          console.log(`Instructor connection is not ready. Skipping...`);
          return;
        }
        instrWs.send(
          JSON.stringify({
            type: 'QUEUE_LEAVE',
            payload: leavePayload,
          })
        );
      });

      // NOTIFY WATCHING ADMINS
      queueAdmins.forEach(({ ws: instrWs }) => {
        if (instrWs.readyState !== WebSocket.OPEN) {
          console.log(`Admin connection is not ready. Skipping...`);
          return;
        }
        instrWs.send(
          JSON.stringify({
            type: 'QUEUE_LEAVE',
            payload: leavePayload,
          })
        );
      });
      break;
    }
    case 'instructor':
      queueInstructors.delete(ws.userId);
      console.log(`Instructor ${ws.userId} unsubscribed from queue updates`);
      ws.send(JSON.stringify({ type: 'QUEUE_UNSUBSCRIBED', payload: {} }));
      break;
    case 'admin':
      queueAdmins.delete(ws.userId);
      console.log(`Admin ${ws.userId} unsubscribed from queue updates`);
      ws.send(JSON.stringify({ type: 'QUEUE_UNSUBSCRIBED', payload: {} }));
      break;
  }
}

function acceptQueue(ws, payload, queueInstructors, queueStudents, queueAdmins) {
  if (!ws.userId) {
    sendQueueError(ws, 'User not identified.');
    return;
  }

  const role = normalizeRole(payload?.role);
  const { data } = payload || {};
  if (!role || !data) {
    sendQueueError(ws, 'Queue accept payload is invalid.');
    return;
  }

  if (!isRoleAuthorized(ws, role)) {
    sendQueueError(ws, 'You are not authorized to accept queue entries with this role.');
    return;
  }

  if (isUnderReviewInstructor(ws, role)) {
    sendQueueError(
      ws,
      'Your instructor account is under review. Queue interactions are disabled until approval.'
    );
    return;
  }

  if (!data.studentId || !data.sessionId) {
    sendQueueError(ws, 'studentId and sessionId are required to accept queue entries.');
    return;
  }

  console.log(`Instructor ${ws.userId} accepted ${data.studentId}'s queue request`);
  const studentEntry = queueStudents.get(data.studentId);

  if (!studentEntry) {
    console.log(`Student ${data.studentId} not found in queue`);
    sendQueueError(ws, 'Student not found in queue.');
    return;
  }

  const student = studentEntry.ws;

  // NOTIFY WAITING STUDENT
  if (student.readyState !== WebSocket.OPEN) {
    console.log(`Student ${data.studentId} connection is not ready. Skipping...`);
    return;
  }
  student.send(
    JSON.stringify({
      type: 'QUEUE_ACCEPTED',
      payload: { data },
    })
  );

  queueStudents.delete(data.studentId);

  if (role === 'instructor') {
    queueInstructors.delete(ws.userId);
  } else if (role === 'admin') {
    queueAdmins.delete(ws.userId);
  }

  ws.send(JSON.stringify({ type: 'QUEUE_ACCEPTED', payload: { data } }));
}

/**
 * Remove student queue entries that have been waiting longer than maxWaitMs.
 * Notifies removed students and broadcasts QUEUE_LEAVE to instructors and admins.
 */
function removeStaleStudentQueues(queueStudents, queueInstructors, queueAdmins, maxWaitMs) {
  const now = Date.now();
  const toRemove = [];

  for (const [userId, entry] of queueStudents.entries()) {
    const joinedAt = entry.joinedAt != null ? entry.joinedAt : now;
    if (now - joinedAt >= maxWaitMs) {
      toRemove.push({ userId, entry });
    }
  }

  for (const { userId, entry } of toRemove) {
    queueStudents.delete(userId);
    if (entry.ws && entry.ws.readyState === WebSocket.OPEN) {
      entry.ws.send(
        JSON.stringify({
          type: 'QUEUE_LEAVE',
          payload: { id: userId, role: 'student', reason: 'timeout' },
        })
      );
    }
    const leavePayload = { id: userId, role: 'student' };
    queueInstructors.forEach(({ ws: instrWs }) => {
      if (instrWs.readyState === WebSocket.OPEN) {
        instrWs.send(JSON.stringify({ type: 'QUEUE_LEAVE', payload: leavePayload }));
      }
    });
    queueAdmins.forEach(({ ws: adminWs }) => {
      if (adminWs.readyState === WebSocket.OPEN) {
        adminWs.send(JSON.stringify({ type: 'QUEUE_LEAVE', payload: leavePayload }));
      }
    });
  }

  if (toRemove.length > 0) {
    console.log(
      `Removed ${toRemove.length} student queue entries (wait time > ${maxWaitMs / 60000} min)`
    );
  }
}

module.exports = {
  subscribeQueue,
  unsubscribeQueue,
  acceptQueue,
  removeStaleStudentQueues,
};
