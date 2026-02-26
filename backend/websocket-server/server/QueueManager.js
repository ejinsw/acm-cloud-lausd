const WebSocket = require('ws');

function subscribeQueue(ws, payload, queueInstructors, queueStudents, queueAdmins) {
  if (!ws.userId) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User not identified.' } }));
    return;
  }

  const { role, data } = payload;

  switch (role.toLowerCase()) {
    case 'student': {
      queueStudents.set(ws.userId, { id: ws.userId, ws, role, data, joinedAt: Date.now() });
      console.log(`Student ${ws.userId} subscribed to queue updates`);
      ws.send(JSON.stringify({ type: 'QUEUE_SUBSCRIBED', payload: {} }));

      // Create enriched payload without ws object (which breaks JSON serialization)
      const studentPayload = {
        id: ws.userId,
        role,
        data: {
          description: data.description,
          subjectId: data.subjectId,
          // Client-provided enriched data
          student: data.student, // { id, firstName, lastName, email, cognitoId }
          subject: data.subject, // { id, name, level, description?, category? }
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
          subjectId: student.data.subjectId,
          student: student.data.student,
          subject: student.data.subject,
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
          subjectId: student.data.subjectId,
          student: student.data.student,
          subject: student.data.subject,
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
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User not identified.' } }));
    return;
  }

  const { role } = payload;

  switch (role.toLowerCase()) {
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
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User not identified.' } }));
    return;
  }

  const { role, data } = payload;

  console.log(`Instructor ${ws.userId} accepted ${data.studentId}'s queue request`);
  const studentEntry = queueStudents.get(data.studentId);

  if (!studentEntry) {
    console.log(`Student ${data.studentId} not found in queue`);
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Student not found in queue.' } }));
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
