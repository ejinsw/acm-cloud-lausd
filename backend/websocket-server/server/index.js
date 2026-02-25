const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const store = require('./daxSTORE');
const {
  subscribeQueue,
  unsubscribeQueue,
  broadcastQueueUpdate,
  acceptQueue,
} = require('./QueueManager');
const { handleIdentify } = require('./IdentityManager');
const {
  setServer,
  pushRoomListUpdate,
  createRoom,
  joinRoom,
  handleMessage,
  leaveRoom,
  deleteMessage,
  editMessage,
  kickUser,
  notifySessionUpdate,
} = require('./RoomManager');
const { sanitizeInput } = require('./Utilities');

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

// Initialize RoomManager with server instance
setServer(server);

// Active socket bookkeeping only. All persistence lives in DynamoDB/DAX.
const liveRooms = new Map(); // roomId -> { name, clients: Map<WebSocket, User>, lastActivity }
const connectedUsers = new Map(); // userId -> { id, username, type, ws, currentRoomId }
const queueInstructors = new Map();
const queueStudents = new Map();
const queueAdmins = new Map();

const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const ROOM_CLEANUP_INTERVAL = 5 * 60 * 1000;
const PING_INTERVAL = 30 * 1000; // Send ping every 30 seconds

httpServer.listen(PORT, () => {
  console.log(`WebSocket server started on port ${PORT}`);
});

// WebSocket heartbeat mechanism to keep connections alive
const heartbeatInterval = setInterval(() => {
  server.clients.forEach(ws => {
    if (ws.isAlive === false) {
      console.log('Terminating inactive WebSocket connection');
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, PING_INTERVAL);

// --- WebSocket Server Event Handlers ---
server.on('connection', ws => {
  const connectionId = uuidv4();
  ws.tempId = connectionId;
  ws.isAlive = true; // Initialize heartbeat flag
  console.log(`Client connected: ${connectionId}`);

  // Handle pong responses for heartbeat
  ws.on('pong', () => {
    ws.isAlive = true;
  });

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

    // Allow QUEUE_UPDATED messages from API server without authentication
    if (type !== 'IDENTIFY_USER' && type !== 'QUEUE_UPDATED' && !ws.userId) {
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
        /*
         * IDENTIFICATION COMMANDS
         */
        case 'IDENTIFY_USER':
          await handleIdentify(ws, payload, connectedUsers);
          break;
        /*
         * SESSION ROOM COMMANDS
         */
        case 'CREATE_ROOM':
          await createRoom(ws, payload?.roomId, payload?.user || actingUser);
          break;
        case 'JOIN_ROOM':
          if (payload?.roomId && (payload?.user || connectedUsers.get(ws.userId))) {
            await joinRoom(
              ws,
              payload.roomId,
              payload.user || connectedUsers.get(ws.userId),
              liveRooms,
              connectedUsers
            );
          } else {
            ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Missing join data.' } }));
          }
          break;
        case 'LEAVE_ROOM':
          if (payload?.roomId && ws.userId) {
            await leaveRoom(ws, payload.roomId, ws.userId, liveRooms, connectedUsers);
          } else {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Room ID required or user not identified.' },
              })
            );
          }
          break;
        case 'SEND_MESSAGE':
          await handleMessage(ws, payload, liveRooms);
          break;
        case 'DELETE_MESSAGE':
          if (payload?.roomId && payload?.messageId && ws.userId) {
            await deleteMessage(ws, payload.roomId, payload.messageId, liveRooms);
          } else {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Invalid delete message data or user not identified.' },
              })
            );
          }
          break;
        case 'EDIT_MESSAGE':
          if (payload?.roomId && payload?.messageId && payload?.text && ws.userId) {
            await editMessage(ws, payload.roomId, payload.messageId, payload.text, liveRooms);
          } else {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Invalid edit message data or user not identified.' },
              })
            );
          }
          break;
        case 'KICK_USER':
          if (payload?.roomId && payload?.userIdToKick && ws.userId) {
            await kickUser(ws, payload.roomId, payload.userIdToKick, liveRooms, connectedUsers);
          } else {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Invalid kick user data or user not identified.' },
              })
            );
          }
          break;
        case 'UPDATE_SESSION':
          if (payload?.sessionId && ws.userId) {
            await notifySessionUpdate(payload.sessionId, ws.userId, liveRooms);
          } else {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Invalid session update data or user not identified.' },
              })
            );
          }
          break;
        /*
         * QUEUE COMMANDS
         */
        case 'SUBSCRIBE_QUEUE':
          subscribeQueue(ws, payload, queueInstructors, queueStudents, queueAdmins);
          break;
        case 'UNSUBSCRIBE_QUEUE':
          unsubscribeQueue(ws, payload, queueInstructors, queueStudents, queueAdmins);
          break;
        case 'ACCEPT_QUEUE':
          acceptQueue(ws, payload, queueInstructors, queueStudents, queueAdmins);
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

  /*
   * CLEANUP
   */
  ws.on('close', async () => {
    const userId = ws.userId;
    if (userId && connectedUsers.has(userId)) {
      const user = connectedUsers.get(userId);
      // Only clean up if this is the current active connection for this user
      if (user.ws === ws) {
        console.log(
          `${user.username} (ID: ${user.id}, Type: ${user.type}) disconnected (ws: ${ws.userId || ws.tempId}).`
        );
        if (user.currentRoomId) {
          await leaveRoom(ws, user.currentRoomId, userId, liveRooms, connectedUsers, false);
        }
        queueStudents.delete(userId);
        queueInstructors.delete(userId);
        queueAdmins.delete(userId);
        connectedUsers.delete(userId);
        // Skip DynamoDB cleanup - using in-memory map only
        try {
          await pushRoomListUpdate();
        } catch (e) {
          console.warn('Failed to push room list update:', e.message);
        }
      } else {
        console.log(`Old connection closed for user ${userId}, but newer connection exists`);
      }
    } else {
      console.log(
        `Client disconnected: ${ws.tempId || 'Unknown WS'} (was not fully identified or already cleaned up)`
      );
    }
  });

  /*
   * ERROR HANDLING
   */
  ws.on('error', error => {
    const logId = ws.userId || ws.tempId || 'Unknown WS';
    console.error(`WebSocket error for client ${logId}:`, error);
  });
});

/*
 * SIGNAL INTERRUPT HANDLER
 */
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  clearInterval(heartbeatInterval); // Clean up heartbeat interval
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

/*
 * "GARBAGE COLLECTION"
 */
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
