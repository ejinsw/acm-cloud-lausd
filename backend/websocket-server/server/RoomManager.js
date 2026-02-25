const WebSocket = require('ws');
const { Profanity, CensorType } = require('@2toad/profanity');
const store = require('./daxSTORE');
const { v4: uuidv4 } = require('uuid');
const { sanitizeInput } = require('./Utilities');

function getRoomState(roomId, liveRooms, defaultName = null) {
  if (!liveRooms.has(roomId)) {
    liveRooms.set(roomId, { name: defaultName, clients: new Map(), lastActivity: Date.now() });
  }
  const state = liveRooms.get(roomId);
  if (defaultName && state && !state.name) {
    state.name = defaultName;
  }
  return state;
}

function broadcastToRoom(roomId, message, liveRooms, excludeWs = null) {
  const room = liveRooms.get(roomId);
  if (!room) return;
  room.clients.forEach((_, ws) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

function broadcastToAll(server, message, excludeWs = null) {
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

async function createRoom(ws, roomId, user) {
  try {
    await store.createRoom({
      id: roomId,
      name: roomId,
      userIds: [user.id],
    });
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

async function joinRoom(ws, roomId, user, liveRooms, connectedUsers) {
  const sanitizedUser = {
    id: user.id,
    username: sanitizeInput(user.username),
    type: user.type,
  };

  let room = await store.getRoom(roomId);
  if (!room) {
    await createRoom(ws, roomId, sanitizedUser);
    room = await store.getRoom(roomId);
  }

  const existingUserEntry = connectedUsers.get(user.id);
  if (existingUserEntry?.currentRoomId && existingUserEntry.currentRoomId !== roomId) {
    await leaveRoom(
      existingUserEntry.ws,
      existingUserEntry.currentRoomId,
      user.id,
      liveRooms,
      connectedUsers,
      false
    );
  }

  try {
    await store.addUserToRoom(roomId, sanitizedUser.id);
  } catch (err) {
    console.error('Failed to add user to room:', err);
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'Could not join the room. Please try again.' },
      })
    );
    return;
  }

  const roomState = getRoomState(roomId, liveRooms, room.name);
  roomState.clients.set(ws, sanitizedUser);
  roomState.lastActivity = Date.now();

  connectedUsers.set(user.id, { ...sanitizedUser, ws, currentRoomId: roomId });
  ws.userId = sanitizedUser.id;

  const messages = await store.fetchMessages(roomId);
  const connectedUsersList = Array.from(roomState.clients.values());

  ws.send(
    JSON.stringify({
      type: 'ROOM_JOINED',
      payload: {
        id: roomId,
        name: roomState.name,
        users: connectedUsersList,
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
    liveRooms,
    ws
  );

  console.log(`${sanitizedUser.username} joined room: ${roomState.name}`);
  await pushRoomListUpdate();
}

async function leaveRoom(
  ws,
  roomId,
  userId,
  liveRooms,
  connectedUsers,
  sendYouLeftNotification = true
) {
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
    await store.removeUserFromRoom(roomId, userId);
  } catch (err) {
    console.error(`Failed to remove user ${userId} from room:`, err);
  }

  const currentEntry = connectedUsers.get(userId);
  if (currentEntry) {
    currentEntry.currentRoomId = null;
  }

  if (sendYouLeftNotification && targetSocket && targetSocket.readyState === WebSocket.OPEN) {
    targetSocket.send(JSON.stringify({ type: 'YOU_LEFT_ROOM', payload: { roomId } }));
  }

  if (departingInfo) {
    broadcastToRoom(
      roomId,
      {
        type: 'USER_LEFT',
        payload: { roomId, userId: departingInfo.id, username: departingInfo.username },
      },
      liveRooms
    );
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

const profanity = new Profanity({
  censorType: CensorType.FirstChar,
  languages: ['en', 'es', 'fr'],
});

async function handleMessage(ws, messageData, liveRooms) {
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

async function deleteMessage(ws, roomId, messageId, liveRooms) {
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

async function kickUser(ws, roomId, userIdToKick, liveRooms, connectedUsers) {
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

  await leaveRoom(kickedUserSocket, roomId, kickedUserInfo.id, liveRooms, connectedUsers, false);

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
    liveRooms,
    kickedUserSocket
  );
  console.log(
    `${kickedUserInfo.username} kicked from ${roomState.name} by ${requesterInfo.username}`
  );
}

module.exports = {
  // Room
  broadcastToRoom,
  broadcastToAll,
  pushRoomListUpdate,
  createRoom,
  joinRoom,
  leaveRoom,
  // Messages
  handleMessage,
  deleteMessage,
  kickUser,
};
