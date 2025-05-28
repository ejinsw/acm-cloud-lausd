const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { Profanity, CensorType } = require('@2toad/profanity');
const dotenv = require('dotenv');

dotenv.config();

const server = new WebSocket.Server({ port: process.env.PORT || 9999 });

const profanity = new Profanity({ censorType: CensorType.FirstChar, languages: ['en', 'es', 'fr'] });


// In-memory storage
const rooms = {};
const users = {};

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; 

console.log(`WebSocket chat server started on port ${process.env.PORT || 9999}`);

// --- Helper Functions ---
function sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[&<>"']/g, function (match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match];
    });
}


function broadcastToRoom(roomId, message, excludeWs = null) {
    const room = rooms[roomId];
    if (room) {
        room.clients.forEach((clientInfo, ws) => {
            if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        });
    }
}

function broadcastToAll(message, excludeWs = null) {
    server.clients.forEach(ws => {
        if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    });
}

function getRoomList() {
    return Object.values(rooms).map(room => ({
        id: room.id,
        name: room.name,
        userCount: room.clients.size,
    }));
}

// --- Room Management ---
function createRoom(ws, roomName, user) {
    const roomId = uuidv4();
    const cleanRoomName = sanitizeInput(roomName) || `Room ${Object.keys(rooms).length + 1}`;

    if (!user || !user.id || !user.username || !user.type) {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User information is required to create a room.' } }));
        return;
    }

    rooms[roomId] = {
        id: roomId,
        name: cleanRoomName,
        clients: new Map(),
        messages: [],
        ownerId: user.id,
        lastActivity: Date.now(),
        settings: {}
    };
    console.log(`Room created: ${cleanRoomName} (ID: ${roomId}) by ${user.username}`);
    broadcastToAll({ type: 'ROOM_LIST_UPDATED', payload: getRoomList() });
    joinRoom(ws, roomId, user);
    return rooms[roomId];
}

function joinRoom(ws, roomId, user) {
    const room = rooms[roomId];
    if (!room) {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Room not found.' } }));
        return;
    }
    if (!user || !user.id || !user.username || !user.type) {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User information is required to join a room.' } }));
        return;
    }

    const existingUserEntry = users[user.id];
    if (existingUserEntry && existingUserEntry.currentRoomId && existingUserEntry.currentRoomId !== roomId) {
        leaveRoom(existingUserEntry.ws, existingUserEntry.currentRoomId, user.id, false);
    }

    room.clients.set(ws, { id: user.id, username: sanitizeInput(user.username), type: user.type });
    users[user.id] = { ws, username: sanitizeInput(user.username), type: user.type, currentRoomId: roomId };
    ws.userId = user.id;
    room.lastActivity = Date.now();

    const roomUsers = Array.from(room.clients.values());
    ws.send(JSON.stringify({
        type: 'ROOM_JOINED',
        payload: {
            id: room.id,
            name: room.name,
            users: roomUsers,
            messages: room.messages.slice(-50)
        }
    }));

    broadcastToRoom(roomId, {
        type: 'USER_JOINED',
        payload: { roomId, user: { id: user.id, username: sanitizeInput(user.username), type: user.type } }
    }, ws);

    console.log(`${user.username} (ID: ${user.id}, Type: ${user.type}) joined room: ${room.name}`);
    broadcastToAll({ type: 'ROOM_LIST_UPDATED', payload: getRoomList() });
}

function leaveRoom(ws, roomId, userId, sendYouLeftNotification = true) {
    const room = rooms[roomId];
    const userToLeave = users[userId];

    if (room && userToLeave) {
        let actualWsInRoom = null;
        for (const [socketInRoom, clientInfo] of room.clients.entries()) {
            if (clientInfo.id === userId) {
                if (socketInRoom === ws || socketInRoom === userToLeave.ws) {
                    actualWsInRoom = socketInRoom;
                    break;
                }
            }
        }
        
        if (actualWsInRoom && room.clients.has(actualWsInRoom)) {
            const userInfo = room.clients.get(actualWsInRoom);
            room.clients.delete(actualWsInRoom);
            room.lastActivity = Date.now();

            broadcastToRoom(roomId, {
                type: 'USER_LEFT',
                payload: { roomId, userId: userInfo.id, username: userInfo.username }
            });
            console.log(`${userInfo.username} (ID: ${userInfo.id}) left room: ${room.name}`);

            if (sendYouLeftNotification && actualWsInRoom.readyState === WebSocket.OPEN) {
                 actualWsInRoom.send(JSON.stringify({ type: 'YOU_LEFT_ROOM', payload: { roomId } }));
            }

            if (room.clients.size === 0) {
                console.log(`Room ${room.name} is now empty.`);
            }
        }
    }

    if (userToLeave && userToLeave.currentRoomId === roomId) {
        userToLeave.currentRoomId = null; 
    }
    broadcastToAll({ type: 'ROOM_LIST_UPDATED', payload: getRoomList() });
}


// --- Message Handling ---
function handleMessage(ws, messageData) {
    const room = rooms[messageData.roomId];
    const senderInfo = room ? room.clients.get(ws) : null;

    if (!room || !senderInfo) {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'You are not in this room or room does not exist.' } }));
        return;
    }

    const sanitizedHtmlText = sanitizeInput(messageData.text);
    const filteredText = profanity.censor(sanitizedHtmlText);

    if (!filteredText.trim()) {
        console.log(`[${room.name}] ${senderInfo.username} sent a message that was fully filtered. Original: "${messageData.text}"`);
        return;
    }

    const message = {
        id: uuidv4(),
        text: filteredText, // Use the filtered text from the library
        sender: { id: senderInfo.id, username: senderInfo.username, type: senderInfo.type },
        roomId: messageData.roomId,
        timestamp: Date.now()
    };

    room.messages.push(message);
    if (room.messages.length > 200) { 
        room.messages.shift();
    }
    room.lastActivity = Date.now();

    broadcastToRoom(messageData.roomId, { type: 'NEW_MESSAGE', payload: message });
    if (messageData.text !== filteredText) {
        console.log(`[${room.name}] ${senderInfo.username}: ${filteredText} (Original: "${messageData.text}")`);
    } else {
        console.log(`[${room.name}] ${senderInfo.username}: ${message.text}`);
    }
}

function deleteMessage(ws, roomId, messageId) {
    const room = rooms[roomId];
    const requesterInfo = room ? room.clients.get(ws) : null;

    if (!room || !requesterInfo) {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Room not found or you are not in it.' } }));
        return;
    }

    if (requesterInfo.type !== 'instructor') {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'You are not authorized to delete messages.' } }));
        return;
    }

    const messageIndex = room.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Message not found.' } }));
        return;
    }

    room.messages.splice(messageIndex, 1);
    room.lastActivity = Date.now();

    broadcastToRoom(roomId, {
        type: 'MESSAGE_DELETED',
        payload: { roomId, messageId, deletedBy: requesterInfo.id }
    });
    console.log(`Message ${messageId} deleted from ${room.name} by ${requesterInfo.username}`);
}

function kickUser(ws, roomId, userIdToKick) {
    const room = rooms[roomId];
    const requesterInfo = room ? room.clients.get(ws) : null;

    if (!room || !requesterInfo) {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Room not found or you are not in it.' } }));
        return;
    }

    if (requesterInfo.type !== 'instructor') {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'You are not authorized to kick users.' } }));
        return;
    }

    if (requesterInfo.id === userIdToKick) {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'You cannot kick yourself.' } }));
        return;
    }

    let kickedUserSocket = null;
    let kickedUserInfo = null;

    for (const [socket, uInfo] of room.clients.entries()) {
        if (uInfo.id === userIdToKick) {
            kickedUserSocket = socket;
            kickedUserInfo = uInfo;
            break;
        }
    }

    if (!kickedUserSocket || !kickedUserInfo) {
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User to kick not found in this room.' } }));
        return;
    }

    kickedUserSocket.send(JSON.stringify({
        type: 'YOU_WERE_KICKED',
        payload: { roomId, roomName: room.name, reason: `Kicked by ${requesterInfo.username}` }
    }));
    
    leaveRoom(kickedUserSocket, roomId, kickedUserInfo.id, false); 

    broadcastToRoom(roomId, {
        type: 'USER_KICKED',
        payload: { roomId, kickedUserId: kickedUserInfo.id, kickedUsername: kickedUserInfo.username, kickedBy: requesterInfo.id }
    }, kickedUserSocket); 
    console.log(`${kickedUserInfo.username} kicked from ${room.name} by ${requesterInfo.username}`);
}


// --- WebSocket Server Event Handlers ---
server.on('connection', (ws) => {
    const connectionId = uuidv4(); 
    ws.tempId = connectionId; 
    console.log(`Client connected: ${connectionId}`);

    ws.send(JSON.stringify({ type: 'ROOM_LIST_UPDATED', payload: getRoomList() }));
    ws.send(JSON.stringify({ type: 'REQUEST_USER_INFO' }));


    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
        } catch (error) {
            console.error('Failed to parse message or message is not JSON:', message.toString());
            ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid message format.' } }));
            return;
        }

        const { type, payload } = data;
        let actingUser = null;
        if (ws.userId && users[ws.userId]) {
            actingUser = users[ws.userId]; 
        } else if (payload && payload.user && payload.user.id) {
            actingUser = payload.user;
        }
        
        console.log(`Received message type: ${type} from ${actingUser ? `${actingUser.username} (ID: ${actingUser.id})` : (ws.userId || ws.tempId)}`);

        if (type !== 'IDENTIFY_USER' && !ws.userId) { 
            if (type === 'CREATE_ROOM' || type === 'JOIN_ROOM') {
                if (!payload || !payload.user || !payload.user.id || !payload.user.username || !payload.user.type) {
                    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User identification data (id, username, type) is required in payload for this action.' } }));
                    return;
                }
            } else {
                ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'User not identified. Please identify first.' } }));
                return;
            }
        }


        switch (type) {
            case 'IDENTIFY_USER':
                if (payload && payload.id && payload.username && payload.type) {
                    const sanitizedUser = {
                        id: sanitizeInput(payload.id),
                        username: sanitizeInput(payload.username),
                        type: sanitizeInput(payload.type)
                    };
                    users[sanitizedUser.id] = { ...users[sanitizedUser.id], ws, ...sanitizedUser }; 
                    ws.userId = sanitizedUser.id;
                    delete ws.tempId; 
                    console.log(`User identified: ${sanitizedUser.username} (ID: ${sanitizedUser.id}, Type: ${sanitizedUser.type})`);
                    ws.send(JSON.stringify({ type: 'USER_IDENTIFIED', payload: sanitizedUser }));
                } else {
                    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid user identification data.' } }));
                }
                break;
            case 'CREATE_ROOM':
                if (payload && payload.roomName && payload.user && payload.user.id) {
                    if (!ws.userId) { 
                         users[payload.user.id] = { ws, ...payload.user, currentRoomId: null };
                         ws.userId = payload.user.id;
                         delete ws.tempId;
                         console.log(`User identified via CREATE_ROOM: ${payload.user.username} (ID: ${payload.user.id})`);
                         ws.send(JSON.stringify({ type: 'USER_IDENTIFIED', payload: payload.user })); 
                    }
                    createRoom(ws, payload.roomName, users[ws.userId]); 
                } else {
                     ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Room name and complete user info (with ID) are required.' } }));
                }
                break;
            case 'JOIN_ROOM':
                if (payload && payload.roomId && payload.user && payload.user.id) {
                    if (!ws.userId) { 
                        users[payload.user.id] = { ws, ...payload.user, currentRoomId: null };
                        ws.userId = payload.user.id;
                        delete ws.tempId;
                        console.log(`User identified via JOIN_ROOM: ${payload.user.username} (ID: ${payload.user.id})`);
                        ws.send(JSON.stringify({ type: 'USER_IDENTIFIED', payload: payload.user })); 
                    }
                    joinRoom(ws, payload.roomId, users[ws.userId]); 
                } else {
                    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Room ID and complete user info (with ID) are required.' } }));
                }
                break;
            case 'SEND_MESSAGE':
                if (payload && payload.roomId && typeof payload.text === 'string' && ws.userId) {
                    handleMessage(ws, payload);
                } else {
                     ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid message data or user not identified.' } }));
                }
                break;
            case 'LEAVE_ROOM':
                if (payload && payload.roomId && ws.userId) {
                    leaveRoom(ws, payload.roomId, ws.userId);
                } else {
                     ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Room ID required or user not identified.' } }));
                }
                break;
            case 'DELETE_MESSAGE':
                if (payload && payload.roomId && payload.messageId && ws.userId) {
                    deleteMessage(ws, payload.roomId, payload.messageId);
                } else {
                    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid delete message data or user not identified.' } }));
                }
                break;
            case 'KICK_USER':
                if (payload && payload.roomId && payload.userIdToKick && ws.userId) {
                    kickUser(ws, payload.roomId, payload.userIdToKick);
                } else {
                    ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid kick user data or user not identified.' } }));
                }
                break;
            default:
                console.log('Unknown message type:', type);
                ws.send(JSON.stringify({ type: 'ERROR', payload: { message: `Unknown message type: ${type}` } }));
        }
    });

    ws.on('close', () => {
        const userId = ws.userId;
        if (userId && users[userId]) {
            const user = users[userId];
            console.log(`${user.username} (ID: ${user.id}, Type: ${user.type}) disconnected (ws: ${ws.userId || ws.tempId}).`);
            if (users[userId].ws === ws) {
                if (user.currentRoomId) {
                    leaveRoom(ws, user.currentRoomId, userId, false);
                }
                delete users[userId];
                 broadcastToAll({ type: 'ROOM_LIST_UPDATED', payload: getRoomList() });
            }
        } else {
            console.log(`Client disconnected: ${ws.tempId || 'Unknown WS'} (was not fully identified or already cleaned up)`);
        }
    });

    ws.on('error', (error) => {
        const logId = ws.userId || ws.tempId || 'Unknown WS';
        console.error(`WebSocket error for client ${logId}:`, error);
    });
});

process.on('SIGINT', () => {
    console.log('Server shutting down...');
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'SERVER_SHUTDOWN', payload: { message: 'Server is shutting down.' } }));
            client.close();
        }
    });
    server.close(() => {
        console.log('WebSocket server closed.');
        process.exit(0);
    });
});
