const WebSocket = require('ws');

function broadcastQueueUpdate(updateData, queueSubscribers) {
  console.log(`Broadcasting queue update to ${queueSubscribers.size} subscribers:`, updateData);

  const { type, targetStudentId, sessionId, queueItem, queueId, studentId } = updateData;

  // Handle different update types
  if (type === 'queue_accepted' && targetStudentId) {
    // Send targeted notification to specific student
    const studentSub = Array.from(queueSubscribers.entries()).find(
      ([userId, { role }]) => userId === targetStudentId && role === 'student'
    );

    if (studentSub) {
      const [userId, { ws }] = studentSub;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'QUEUE_ACCEPTED',
            payload: { sessionId },
          })
        );
        console.log(
          `✅ Sent queue acceptance notification to student ${userId} with session ${sessionId}`
        );
      }
    } else {
      console.warn(`⚠️  Target student ${targetStudentId} not connected to WebSocket`);
    }
  } else if (type === 'queue_join' || type === 'queue_leave') {
    // Broadcast to ALL subscribers (let frontend handle role-based logic)
    queueSubscribers.forEach(({ ws }, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: type === 'queue_join' ? 'QUEUE_JOIN' : 'QUEUE_LEAVE',
            payload: { queueItem, queueId, studentId },
          })
        );
        console.log(`📢 Sent ${type} notification to user ${userId}`);
      }
    });
  }
}

function subscribeQueue(ws, actingUser, queueSubscribers) {
  if (ws.userId && actingUser) {
    queueSubscribers.set(ws.userId, { ws, role: actingUser.type });
    console.log(`${actingUser.username} subscribed to queue updates`);
    ws.send(JSON.stringify({ type: 'QUEUE_SUBSCRIBED' }));
  } else {
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User not identified.' } }));
  }
}

function unsubscribeQueue(ws, queueSubscribers) {
  if (ws.userId) {
    queueSubscribers.delete(ws.userId);
    console.log(`User ${ws.userId} unsubscribed from queue updates`);
    ws.send(JSON.stringify({ type: 'QUEUE_UNSUBSCRIBED' }));
  }
}

module.exports = {
  broadcastQueueUpdate,
  subscribeQueue,
  unsubscribeQueue,
};
