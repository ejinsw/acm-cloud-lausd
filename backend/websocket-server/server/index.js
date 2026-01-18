const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const { Profanity, CensorType } = require('@2toad/profanity');
const dotenv = require('dotenv');
const store = require('./daxSTORE');

dotenv.config();

const PORT = process.env.PORT || 9999;

// Create HTTP server for health checks only
const httpServer = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'websocket-server' }));
    return;
  }

  res.writeHead(404);
  res.end();
});

const server = new WebSocket.Server({ server: httpServer });

const profanity = new Profanity({
  censorType: CensorType.FirstChar,
  languages: ['en', 'es', 'fr'],
});

// Active socket bookkeeping only. All persistence lives in DynamoDB/DAX.
const liveRooms = new Map(); // roomId -> { name, clients: Map<WebSocket, User>, lastActivity }
const connectedUsers = new Map(); // userId -> { id, username, type, ws, currentRoomId }
const queueSubscribers = new Map(); // userId -> { ws, role }

const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const ROOM_CLEANUP_INTERVAL = 5 * 60 * 1000;

httpServer.listen(PORT, () => {
  console.log(`WebSocket server started on port ${PORT}`);
});

// --- Helper Functions ---
function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[&<>"']/g, match => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[match];
  });
}

function getRoomState(roomId, defaultName = null) {
  if (!liveRooms.has(roomId)) {
    liveRooms.set(roomId, { name: defaultName, clients: new Map(), lastActivity: Date.now() });
  }
  const state = liveRooms.get(roomId);
  if (defaultName && state && !state.name) {
    state.name = defaultName;
  }
  return state;
}

function broadcastToRoom(roomId, message, excludeWs = null) {
  const room = liveRooms.get(roomId);
  if (!room) return;
  room.clients.forEach((clientInfo, ws) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

function broadcastToAll(message, excludeWs = null) {
  server.clients.forEach(ws => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

async function pushRoomListUpdate(targetWs = null) {
  try {
    const rooms = await store.listRooms();
    const payload = { type: 'ROOM_LIST_UPDATED', payload: rooms };
    if (targetWs) {
      if (targetWs.readyState === WebSocket.OPEN) {
        targetWs.send(JSON.stringify(payload));
      }
    } else {
      broadcastToAll(payload);
    }
  } catch (err) {
    console.error('Failed to fetch room list:', err);
  }
}

function broadcastQueueUpdate(updateData) {
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
        ws.send(JSON.stringify({
          type: 'QUEUE_ACCEPTED',
          payload: { sessionId }
        }));
        console.log(`✅ Sent queue acceptance notification to student ${userId} with session ${sessionId}`);
      }
    } else {
      console.warn(`⚠️  Target student ${targetStudentId} not connected to WebSocket`);
    }
  } else if (type === 'queue_join' || type === 'queue_leave') {
    // Broadcast to all instructors to refetch queue
    queueSubscribers.forEach(({ ws, role }, userId) => {
      if (role === 'instructor' && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: type === 'queue_join' ? 'QUEUE_JOIN' : 'QUEUE_LEAVE',
          payload: { queueItem, queueId, studentId }
        }));
        console.log(`📢 Sent ${type} notification to instructor ${userId}`);
      }
    });
  }
}

function verifyToken(token) {
  if (typeof token !== 'string' || token.length === 0) {
    return null;
  }

  const mockMatch = token.match(/^valid-token-for-([^-]+)-(.+)-([A-Za-z]+)$/);
  if (mockMatch) {
    const [, id, username, type] = mockMatch;
    return {
      id,
      username,
      type:
        type.toLowerCase() === 'instructor' || type.toLowerCase() === 'admin'
          ? 'instructor'
          : 'student',
      currentRoomId: null,
    };
  }

  const segments = token.split('.');
  if (segments.length === 3) {
    try {
      const payloadSegment = segments[1];
      const padded = payloadSegment.padEnd(
        payloadSegment.length + ((4 - (payloadSegment.length % 4)) % 4),
        '='
      );
      const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = Buffer.from(base64, 'base64').toString('utf8');
      const payload = JSON.parse(decoded);

      const rawId = payload.sub || payload.id || payload.userId;
      const nameCandidate =
        payload.username ||
        payload.name ||
        [payload.firstName, payload.lastName].filter(Boolean).join(' ') ||
        payload.email;
      if (!rawId) {
        return null;
      }
      const id = String(rawId);
      const username = (nameCandidate && String(nameCandidate).trim()) || `User ${id}`;
      const rawRole = (payload.role || payload.userRole || payload.type || '')
        .toString()
        .toLowerCase();
      const normalizedRole =
        rawRole === 'instructor' || rawRole === 'admin' ? 'instructor' : 'student';

      return {
        id,
        username,
        type: normalizedRole,
        currentRoomId: null,
      };
    } catch (error) {
      console.error('Failed to decode authentication token payload:', error);
      return null;
    }
  }

  return null;
}

async function createRoom(ws, roomName, user) {
  const roomId = uuidv4();
  const cleanRoomName = sanitizeInput(roomName) || `Room-${roomId.slice(0, 6)}`;

  try {
    await store.createRoom({
      id: roomId,
      name: cleanRoomName,
      ownerId: user.id,
      settings: {},
    });
    console.log(`Room created: ${cleanRoomName} (ID: ${roomId}) by ${user.username}`);
    await joinRoom(ws, roomId, user);
  } catch (err) {
    console.error('Failed to create room:', err);
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'Failed to create room. Please try again.' },
      })
    );
  }
}

async function joinRoom(ws, roomId, user) {
  const room = await store.getRoom(roomId);
  if (!room) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Room not found.' } }));
    return;
  }
  const sanitizedUser = {
    id: user.id,
    username: sanitizeInput(user.username),
    type: user.type,
  };

  const existingUserEntry = connectedUsers.get(user.id);
  if (
    existingUserEntry &&
    existingUserEntry.currentRoomId &&
    existingUserEntry.currentRoomId !== roomId
  ) {
    await leaveRoom(existingUserEntry.ws, existingUserEntry.currentRoomId, user.id, false);
  }

  try {
    await store.addMember(roomId, sanitizedUser);
    await store.setUserSession({ ...sanitizedUser, currentRoomId: roomId });
  } catch (err) {
    console.error('Failed to persist membership record:', err);
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'Could not join the room. Please try again.' },
      })
    );
    return;
  }

  const roomState = getRoomState(roomId, room.name);
  roomState.clients.set(ws, sanitizedUser);
  roomState.lastActivity = Date.now();
  connectedUsers.set(user.id, { ...sanitizedUser, ws, currentRoomId: roomId });
  ws.userId = sanitizedUser.id;

  const [members, messages] = await Promise.all([
    store.listMembers(roomId),
    store.fetchMessages(roomId),
  ]);

  ws.send(
    JSON.stringify({
      type: 'ROOM_JOINED',
      payload: {
        id: roomId,
        name: roomState.name,
        users: members,
        messages,
      },
    })
  );

  broadcastToRoom(
    roomId,
    {
      type: 'USER_JOINED',
      payload: {
        roomId,
        user: sanitizedUser,
      },
    },
    ws
  );

  console.log(
    `${sanitizedUser.username} (ID: ${sanitizedUser.id}, Type: ${sanitizedUser.type}) joined room: ${roomState.name}`
  );
  await pushRoomListUpdate();
}

async function leaveRoom(ws, roomId, userId, sendYouLeftNotification = true) {
  const roomState = liveRooms.get(roomId);
  const activeUser = connectedUsers.get(userId);

  let targetSocket = ws;
  let departingInfo = activeUser || null;

  if (roomState) {
    for (const [socket, clientInfo] of roomState.clients.entries()) {
      if (clientInfo.id === userId) {
        if (!targetSocket) targetSocket = socket;
        departingInfo = clientInfo;
        roomState.clients.delete(socket);
        break;
      }
    }
    roomState.lastActivity = Date.now();
    if (roomState.clients.size === 0) {
      liveRooms.delete(roomId);
    }
  }

  try {
    await store.removeMember(roomId, userId);
    await store.setUserSession({
      id: userId,
      username: departingInfo?.username || activeUser?.username || `User ${userId}`,
      type: departingInfo?.type || activeUser?.type || 'student',
      currentRoomId: null,
    });
  } catch (err) {
    console.error(`Failed to update membership/session for user ${userId}:`, err);
  }

  const currentEntry = connectedUsers.get(userId);
  if (currentEntry) {
    currentEntry.currentRoomId = null;
  }

  if (sendYouLeftNotification && targetSocket && targetSocket.readyState === WebSocket.OPEN) {
    targetSocket.send(JSON.stringify({ type: 'YOU_LEFT_ROOM', payload: { roomId } }));
  }

  if (departingInfo) {
    broadcastToRoom(roomId, {
      type: 'USER_LEFT',
      payload: { roomId, userId: departingInfo.id, username: departingInfo.username },
    });
    console.log(
      `${departingInfo.username} (ID: ${departingInfo.id}) left room: ${roomState?.name || roomId}`
    );
  }

  const updatedRoom = await store.getRoom(roomId);
  if (!updatedRoom || (updatedRoom.participantCount || 0) <= 0) {
    await store.expireRoom(roomId);
  }

  await pushRoomListUpdate();
}

async function handleMessage(ws, messageData) {
  const roomState = liveRooms.get(messageData.roomId);
  const senderInfo = roomState ? roomState.clients.get(ws) : null;

  if (!roomState || !senderInfo) {
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'You are not in this room or room does not exist.' },
      })
    );
    return;
  }

  const sanitizedHtmlText = sanitizeInput(messageData.text);
  const filteredText = profanity.censor(sanitizedHtmlText);

  if (!filteredText.trim()) {
    console.log(
      `[${roomState.name}] ${senderInfo.username} sent a message that was fully filtered. Original: "${messageData.text}"`
    );
    return;
  }

  const message = {
    id: uuidv4(),
    text: filteredText,
    sender: { id: senderInfo.id, username: senderInfo.username, type: senderInfo.type },
    roomId: messageData.roomId,
  };

  try {
    const savedMessage = await store.saveMessage(messageData.roomId, message);
    roomState.lastActivity = Date.now();
    broadcastToRoom(messageData.roomId, { type: 'NEW_MESSAGE', payload: savedMessage });
    if (messageData.text !== filteredText) {
      console.log(
        `[${roomState.name}] ${senderInfo.username}: ${filteredText} (Original: "${messageData.text}")`
      );
    } else {
      console.log(`[${roomState.name}] ${senderInfo.username}: ${message.text}`);
    }
  } catch (err) {
    console.error('Failed to persist message:', err);
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Message failed to send.' } }));
  }
}

async function deleteMessage(ws, roomId, messageId) {
  const roomState = liveRooms.get(roomId);
  const requesterInfo = roomState ? roomState.clients.get(ws) : null;

  if (!roomState || !requesterInfo) {
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'Room not found or you are not in it.' },
      })
    );
    return;
  }

  if (requesterInfo.type !== 'instructor') {
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'You are not authorized to delete messages.' },
      })
    );
    return;
  }

  const deleted = await store.deleteMessage(roomId, messageId);
  if (!deleted) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Message not found.' } }));
    return;
  }

  broadcastToRoom(roomId, {
    type: 'MESSAGE_DELETED',
    payload: { roomId, messageId, deletedBy: requesterInfo.id },
  });
  console.log(`Message ${messageId} deleted from ${roomState.name} by ${requesterInfo.username}`);
}

async function kickUser(ws, roomId, userIdToKick) {
  const roomState = liveRooms.get(roomId);
  const requesterInfo = roomState ? roomState.clients.get(ws) : null;

  if (!roomState || !requesterInfo) {
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'Room not found or you are not in it.' },
      })
    );
    return;
  }

  if (requesterInfo.type !== 'instructor') {
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'You are not authorized to kick users.' },
      })
    );
    return;
  }

  if (requesterInfo.id === userIdToKick) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'You cannot kick yourself.' } }));
    return;
  }

  let kickedUserSocket = null;
  let kickedUserInfo = null;

  for (const [socket, uInfo] of roomState.clients.entries()) {
    if (uInfo.id === userIdToKick) {
      kickedUserSocket = socket;
      kickedUserInfo = uInfo;
      break;
    }
  }

  if (!kickedUserSocket || !kickedUserInfo) {
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'User to kick not found in this room.' },
      })
    );
    return;
  }

  kickedUserSocket.send(
    JSON.stringify({
      type: 'YOU_WERE_KICKED',
      payload: { roomId, roomName: roomState.name, reason: `Kicked by ${requesterInfo.username}` },
    })
  );

  await leaveRoom(kickedUserSocket, roomId, kickedUserInfo.id, false);

  broadcastToRoom(
    roomId,
    {
      type: 'USER_KICKED',
      payload: {
        roomId,
        kickedUserId: kickedUserInfo.id,
        kickedUsername: kickedUserInfo.username,
        kickedBy: requesterInfo.id,
      },
    },
    kickedUserSocket
  );
  console.log(
    `${kickedUserInfo.username} kicked from ${roomState.name} by ${requesterInfo.username}`
  );
}

async function handleIdentify(ws, payload) {
  if (!payload?.token) {
    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Token required.' } }));
    return;
  }

  let userData;
  try {
    userData = verifyToken(payload.token);
  } catch {
    userData = null;
  }

  if (!userData) {
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'Invalid authentication token.' },
      })
    );
    ws.close();
    return;
  }

  const existing = connectedUsers.get(userData.id);
  if (existing && existing.ws !== ws) {
    try {
      existing.ws.send(
        JSON.stringify({
          type: 'ERROR',
          payload: {
            message:
              'You have logged in from another location. This session is being disconnected.',
          },
        })
      );
    } catch (sendError) {
      console.warn(
        `Failed to notify existing session for user ${userData.username} (${userData.id}) about duplicate login:`,
        sendError
      );
    }
    try {
      existing.ws.close();
    } catch (closeError) {
      console.warn(
        `Failed to close existing session for user ${userData.username} (${userData.id}):`,
        closeError
      );
    }
  }

  connectedUsers.set(userData.id, { ...userData, ws, currentRoomId: null });
  ws.userId = userData.id;

  await store.setUserSession({ ...userData, currentRoomId: null });
  console.log(`User authenticated via token: ${userData.username} (ID: ${userData.id})`);
  ws.send(JSON.stringify({ type: 'USER_IDENTIFIED', payload: userData }));
}

// --- WebSocket Server Event Handlers ---
server.on('connection', ws => {
  const connectionId = uuidv4();
  ws.tempId = connectionId;
  console.log(`Client connected: ${connectionId}`);

  pushRoomListUpdate(ws);
  ws.send(JSON.stringify({ type: 'REQUEST_USER_INFO' }));

  ws.on('message', async rawMessage => {
    let data;
    try {
      data = JSON.parse(rawMessage.toString());
    } catch (error) {
      console.error('Failed to parse message or message is not JSON:', rawMessage.toString());
      ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid message format.' } }));
      return;
    }

    const { type, payload } = data;
    const actingUser = ws.userId ? connectedUsers.get(ws.userId) : payload?.user;

    console.log(
      `Received message type: ${type} from ${
        actingUser ? `${actingUser.username} (ID: ${actingUser.id})` : ws.userId || ws.tempId
      }`
    );

    if (type !== 'IDENTIFY_USER' && !ws.userId) {
      if (
        (type === 'CREATE_ROOM' || type === 'JOIN_ROOM') &&
        payload?.user?.id &&
        payload?.user?.username &&
        payload?.user?.type
      ) {
        ws.userId = payload.user.id;
        connectedUsers.set(payload.user.id, {
          id: payload.user.id,
          username: sanitizeInput(payload.user.username),
          type: payload.user.type,
          ws,
          currentRoomId: null,
        });
      } else {
        ws.send(
          JSON.stringify({
            type: 'ERROR',
            payload: { message: 'User not identified. Please identify first.' },
          })
        );
        return;
      }
    }

    try {
      switch (type) {
        case 'IDENTIFY_USER':
          await handleIdentify(ws, payload);
          break;
        case 'CREATE_ROOM':
          await createRoom(ws, payload?.roomName, payload?.user || actingUser);
          break;
        case 'JOIN_ROOM':
          if (payload?.roomId && (payload?.user || connectedUsers.get(ws.userId))) {
            await joinRoom(ws, payload.roomId, payload.user || connectedUsers.get(ws.userId));
          } else {
            ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Missing join data.' } }));
          }
          break;
        case 'SEND_MESSAGE':
          await handleMessage(ws, payload);
          break;
        case 'LEAVE_ROOM':
          if (payload?.roomId && ws.userId) {
            await leaveRoom(ws, payload.roomId, ws.userId);
          } else {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Room ID required or user not identified.' },
              })
            );
          }
          break;
        case 'DELETE_MESSAGE':
          if (payload?.roomId && payload?.messageId && ws.userId) {
            await deleteMessage(ws, payload.roomId, payload.messageId);
          } else {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Invalid delete message data or user not identified.' },
              })
            );
          }
          break;
        case 'KICK_USER':
          if (payload?.roomId && payload?.userIdToKick && ws.userId) {
            await kickUser(ws, payload.roomId, payload.userIdToKick);
          } else {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Invalid kick user data or user not identified.' },
              })
            );
          }
          break;
        case 'SUBSCRIBE_QUEUE':
          if (ws.userId && actingUser) {
            queueSubscribers.set(ws.userId, { ws, role: actingUser.type });
            console.log(`${actingUser.username} subscribed to queue updates`);
            ws.send(JSON.stringify({ type: 'QUEUE_SUBSCRIBED' }));
          } else {
            ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User not identified.' } }));
          }
          break;
        case 'UNSUBSCRIBE_QUEUE':
          if (ws.userId) {
            queueSubscribers.delete(ws.userId);
            console.log(`User ${ws.userId} unsubscribed from queue updates`);
            ws.send(JSON.stringify({ type: 'QUEUE_UNSUBSCRIBED' }));
          }
          break;
        case 'QUEUE_UPDATED':
          // This message comes from the API server when queue changes
          console.log('📨 Received QUEUE_UPDATED message:', JSON.stringify(data, null, 2));
          if (payload?.queueData) {
            console.log('📢 Broadcasting queue update to subscribers...');
            broadcastQueueUpdate(payload.queueData);
          } else {
            console.warn('⚠️  QUEUE_UPDATED message missing queueData:', payload);
          }
          break;
        default:
          console.log('Unknown message type:', type);
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              payload: { message: `Unknown message type: ${type}` },
            })
          );
          break;
      }
    } catch (err) {
      console.error(`Error handling message type ${type}:`, err);
      ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Unexpected server error.' } }));
    }
  });

  ws.on('close', async () => {
    const userId = ws.userId;
    if (userId && connectedUsers.has(userId)) {
      const user = connectedUsers.get(userId);
      console.log(
        `${user.username} (ID: ${user.id}, Type: ${user.type}) disconnected (ws: ${ws.userId || ws.tempId}).`
      );
      if (user.ws === ws) {
        if (user.currentRoomId) {
          await leaveRoom(ws, user.currentRoomId, userId, false);
        }
        queueSubscribers.delete(userId);
        connectedUsers.delete(userId);
        await store.removeUserSession(userId);
        await pushRoomListUpdate();
      }
    } else {
      console.log(
        `Client disconnected: ${ws.tempId || 'Unknown WS'} (was not fully identified or already cleaned up)`
      );
    }
  });

  ws.on('error', error => {
    const logId = ws.userId || ws.tempId || 'Unknown WS';
    console.error(`WebSocket error for client ${logId}:`, error);
  });
});

process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'SERVER_SHUTDOWN',
          payload: { message: 'Server is shutting down.' },
        })
      );
      client.close();
    }
  });
  httpServer.close(() => {
    console.log('HTTP and WebSocket server closed.');
    process.exit(0);
  });
});

setInterval(() => {
  (async () => {
    const now = Date.now();
    const expiredRooms = [];
    for (const [roomId, state] of liveRooms.entries()) {
      if (state.clients.size === 0 && now - state.lastActivity > INACTIVITY_TIMEOUT) {
        expiredRooms.push(roomId);
      }
    }

    if (expiredRooms.length === 0) {
      return;
    }

    console.log('Running inactivity cleanup for rooms:', expiredRooms.join(', '));
    for (const roomId of expiredRooms) {
      liveRooms.delete(roomId);
      try {
        await store.expireRoom(roomId);
      } catch (err) {
        console.error(`Failed to expire room ${roomId}:`, err);
      }
    }
    await pushRoomListUpdate();
  })().catch(err => console.error('Room cleanup loop failed:', err));
}, ROOM_CLEANUP_INTERVAL);
