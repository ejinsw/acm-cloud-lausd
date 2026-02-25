const WebSocket = require('ws');

function subscribeQueue(ws, payload, queueInstructors, queueStudents, queueAdmins) {
  if (!ws.userId) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User not identified.' } }));
    return;
  }

  const { role, data } = payload;

  switch (role.toLower()) {
    case 'student':
      queueStudents.set(ws.userId, { id: ws.userId, ws, role, data });
      console.log(`Student ${ws.userId} subscribed to queue updates`);
      ws.send(JSON.stringify({ type: 'QUEUE_SUBSCRIBED', payload: {} }));

      // NOTIFY WATCHING INSTRUCTORS
      queueInstructors.forEach(({ ws: instrWs }) => {
        if (instrWs.readyState !== WebSocket.OPEN) {
          console.log(`Instructor ${ws.userId} connection is not ready. Skipping...`);
          return;
        }
        instrWs.send(
          JSON.stringify({
            type: 'QUEUE_JOIN',
            payload: { id: ws.userId, ws, role, data },
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
            payload: { id: ws.userId, ws, role, data },
          })
        );
      });
      break;
    case 'instructor':
      queueInstructors.set(ws.userId, { ws, role });
      console.log(`Instructor ${ws.userId} subscribed to queue updates`);
      ws.send(
        JSON.stringify({ type: 'QUEUE_SUBSCRIBED', payload: { students: queueStudents.values() } })
      );
      break;
    case 'admin':
      queueAdmins.set(ws.userId, { ws, role });
      console.log(`Student ${ws.userId} subscribed to queue updates`);
      ws.send(
        JSON.stringify({ type: 'QUEUE_SUBSCRIBED', payload: { students: queueStudents.values() } })
      );
      break;
  }
}

function unsubscribeQueue(ws, payload, queueInstructors, queueStudents, queueAdmins) {
  if (!ws.userId) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User not identified.' } }));
    return;
  }

  const { role, data } = payload;

  switch (role.toLower()) {
    case 'student':
      queueStudents.delete(ws.userId);
      console.log(`Student ${ws.userId} subscribed to queue updates`);
      ws.send(JSON.stringify({ type: 'QUEUE_UNSUBSCRIBED', payload: {} }));

      // NOTIFY WATCHING INSTRUCTORS
      queueInstructors.forEach(({ ws: instrWs }) => {
        if (instrWs.readyState !== WebSocket.OPEN) {
          console.log(`Instructor ${ws.userId} connection is not ready. Skipping...`);
          return;
        }
        instrWs.send(
          JSON.stringify({
            type: 'QUEUE_LEAVE',
            payload: { id: ws.userId, ws, role },
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
            type: 'QUEUE_LEAVE',
            payload: { id: ws.userId, ws, role },
          })
        );
      });
      break;
    case 'instructor':
      queueInstructors.delete(ws.userId);
      console.log(`Instructor ${ws.userId} subscribed to queue updates`);
      ws.send(JSON.stringify({ type: 'QUEUE_UNSUBSCRIBED', payload: {} }));
      break;
    case 'admin':
      queueAdmins.delete(ws.userId);
      console.log(`Student ${ws.userId} subscribed to queue updates`);
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
  const student = queueStudents[data.studentId].ws;

  // NOTIFY WAITING STUDENT
  if (student.readyState !== WebSocket.OPEN) {
    console.log(`Instructor ${ws.userId} connection is not ready. Skipping...`);
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

module.exports = {
  subscribeQueue,
  unsubscribeQueue,
  acceptQueue,
};
