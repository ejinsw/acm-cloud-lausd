document.addEventListener('DOMContentLoaded', () => {
    const connectionStatus = document.getElementById('connection-status');
    const identifySection = document.getElementById('identify-section');
    const userIdInput = document.getElementById('user-id');
    const usernameInput = document.getElementById('username');
    const userTypeSelect = document.getElementById('user-type');
    const identifyBtn = document.getElementById('identify-btn');

    const roomManagementSection = document.getElementById('room-management-section');
    const availableRoomsList = document.getElementById('available-rooms');
    const createRoomInput = document.getElementById('create-room-input');
    const createRoomBtn = document.getElementById('create-room-btn');

    const chatSection = document.getElementById('chat-section');
    const currentRoomName = document.getElementById('current-room-name');
    const userList = document.getElementById('user-list');
    const messageContainer = document.getElementById('message-container');
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const leaveRoomBtn = document.getElementById('leave-room-btn');

    let ws;
    let currentUser = null; // { id, username, type }
    let currentRoom = null; // { id, name, users: [], messages: [] }

    function connectToServer() {
        ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            connectionStatus.textContent = 'Connected to server. Please identify yourself.';
            connectionStatus.className = 'status-connected';
            identifySection.style.display = 'block';
            roomManagementSection.style.display = 'none';
            chatSection.style.display = 'none';
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received from server:', data);

            switch (data.type) {
                case 'REQUEST_USER_INFO':
                    break;
                case 'USER_IDENTIFIED':
                    currentUser = data.payload;
                    connectionStatus.textContent = `Identified as ${currentUser.username} (${currentUser.type}).`;
                    identifySection.style.display = 'none';
                    roomManagementSection.style.display = 'block';
                    break;
                case 'ROOM_LIST_UPDATED':
                    updateAvailableRooms(data.payload);
                    break;
                case 'ROOM_JOINED':
                   currentRoom = data.payload;
                   if (!currentRoom.messages) {
                        currentRoom.messages = [];
                    }
                    enterChatRoomUI();
                    break;
                case 'USER_JOINED':
                    if (currentRoom && currentRoom.id === data.payload.roomId) {
                        if (!currentRoom.users) currentRoom.users = [];
                        if (!currentRoom.users.find(u => u.id === data.payload.user.id)) {
                            currentRoom.users.push(data.payload.user);
                        }
                        updateUserList();
                        appendNotification(`${data.payload.user.username} joined the room.`);
                    }
                    break;
                case 'NEW_MESSAGE':
                    if (currentRoom && currentRoom.id === data.payload.roomId) {
                        if (!currentRoom.messages) currentRoom.messages = [];
                        currentRoom.messages.push(data.payload);
                        appendMessage(data.payload);
                    }
                    break;
                case 'USER_LEFT':
                    if (currentRoom && currentRoom.id === data.payload.roomId) {
                        if (currentRoom.users) {
                            currentRoom.users = currentRoom.users.filter(u => u.id !== data.payload.userId);
                        }
                        updateUserList();
                        appendNotification(`${data.payload.username || data.payload.userId} left the room.`);
                    }
                    break;
                case 'MESSAGE_DELETED':
                    if (currentRoom && currentRoom.id === data.payload.roomId) {
                        const msgElement = document.getElementById(`msg-${data.payload.messageId}`);
                        if (msgElement) {
                            msgElement.classList.add('deleted');
                            msgElement.innerHTML = '<em>Message deleted.</em>';
                        }
                        if (currentRoom.messages) {
                           currentRoom.messages = currentRoom.messages.filter(m => m.id !== data.payload.messageId);
                        }
                    }
                    break;
                case 'YOU_WERE_KICKED':
                    alert(`You were kicked from room "${data.payload.roomName}". Reason: ${data.payload.reason || 'No reason given.'}`);
                    handleLeaveRoomUIUpdate();
                    break;
                case 'USER_KICKED':
                     if (currentRoom && currentRoom.id === data.payload.roomId) {
                        if (currentRoom.users) {
                            currentRoom.users = currentRoom.users.filter(u => u.id !== data.payload.kickedUserId);
                        }
                        updateUserList();
                        appendNotification(`${data.payload.kickedUsername} was kicked by an instructor.`);
                    }
                    break;
                case 'YOU_LEFT_ROOM':
                    handleLeaveRoomUIUpdate();
                    break;
                case 'ERROR':
                    console.error('Server Error:', data.payload.message);
                    alert(`Error: ${data.payload.message}`);
                    break;
                case 'SERVER_SHUTDOWN':
                    alert('Server is shutting down. You will be disconnected.');
                    ws.close();
                    break;
                default:
                    console.warn('Unknown message type from server:', data.type);
            }
        };

        ws.onclose = () => {
            connectionStatus.textContent = 'Disconnected from server. Attempting to reconnect...';
            connectionStatus.className = 'status-disconnected';
            identifySection.style.display = 'block';
            roomManagementSection.style.display = 'none';
            chatSection.style.display = 'none';
            setTimeout(connectToServer, 5000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            connectionStatus.textContent = 'Connection error.';
            connectionStatus.className = 'status-error';
        };
    }

    function sendToServer(type, payload) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type, payload }));
        } else {
            console.warn('WebSocket not connected. Cannot send message.');
        }
    }

    identifyBtn.addEventListener('click', () => {
        const userId = userIdInput.value.trim();
        const username = usernameInput.value.trim();
        const type = userTypeSelect.value;
    
        if (userId && username) {
            // Create a mock token that matches the server's mock verification format
            const mockToken = `valid-token-for-${userId}-${username}-${type}`;
            
            // Send the token instead of the user object
            sendToServer('IDENTIFY_USER', { token: mockToken });
        } else {
            alert('Please enter a User ID and Username to generate a mock token.');
        }
    });

    createRoomBtn.addEventListener('click', () => {
        const roomName = createRoomInput.value.trim();
        if (roomName && currentUser) {
            sendToServer('CREATE_ROOM', { roomName });
            createRoomInput.value = '';
        } else if (!currentUser) {
            alert('Please identify yourself before creating a room.');
        } else {
            alert('Please enter a room name.');
        }
    });

    function updateAvailableRooms(rooms) {
        availableRoomsList.innerHTML = '';
        if (!rooms || rooms.length === 0) {
            availableRoomsList.innerHTML = '<li>No rooms available. Create one!</li>';
            return;
        }
        rooms.forEach(room => {
            const li = document.createElement('li');
            li.textContent = `${room.name} (${room.userCount || 0} users)`;
            const joinBtn = document.createElement('button');
            joinBtn.textContent = 'Join';
            joinBtn.onclick = () => {
                if (currentUser) {
                    sendToServer('JOIN_ROOM', { roomId: room.id });
                } else {
                    alert('Please identify yourself before joining a room.');
                }
            };
            li.appendChild(joinBtn);
            availableRoomsList.appendChild(li);
        });
    }

    function enterChatRoomUI() {
        roomManagementSection.style.display = 'none';
        chatSection.style.display = 'block';
        currentRoomName.textContent = currentRoom.name;
        messageContainer.innerHTML = '';
        if (currentRoom.messages) {
            currentRoom.messages.forEach(appendMessage);
        }
        updateUserList();
    }
    
    function handleLeaveRoomUIUpdate() {
        currentRoom = null;
        chatSection.style.display = 'none';
        roomManagementSection.style.display = 'block';
    }
    
    leaveRoomBtn.addEventListener('click', () => {
        if (currentRoom && currentUser) {
            sendToServer('LEAVE_ROOM', { roomId: currentRoom.id });
        }
    });

    function appendMessage(message) {
        if (!message || !message.id || !message.sender || typeof message.sender.id === 'undefined' || typeof message.text === 'undefined') {
            console.error('Attempted to append malformed message:', message);
            return;
        }

        const msgDiv = document.createElement('div');
        msgDiv.id = `msg-${message.id}`;
        msgDiv.classList.add('message-item');
        if (currentUser && currentUser.id && message.sender.id === currentUser.id) {
            msgDiv.classList.add('my-message');
        }

        const senderSpan = document.createElement('span');
        senderSpan.className = 'sender';
        senderSpan.textContent = `${message.sender.username || 'Unknown User'} (${message.sender.type || 'N/A'})`;

        const textSpan = document.createElement('span');
        textSpan.className = 'text';
        textSpan.textContent = message.text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'timestamp';
        timeSpan.textContent = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'No time';

        msgDiv.appendChild(senderSpan);
        msgDiv.appendChild(textSpan);
        msgDiv.appendChild(timeSpan);

        if (currentUser && currentUser.type === 'instructor' && currentUser.id && message.sender.id !== currentUser.id) {
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-msg-btn';
            deleteBtn.onclick = () => {
                if (confirm('Are you sure you want to delete this message?')) {
                    sendToServer('DELETE_MESSAGE', { roomId: currentRoom.id, messageId: message.id });
                }
            };
            msgDiv.appendChild(deleteBtn);
        }
        messageContainer.appendChild(msgDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    function appendNotification(text) {
        const p = document.createElement('p');
        p.className = 'notification';
        p.textContent = text;
        messageContainer.appendChild(p);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    function updateUserList() {
        userList.innerHTML = '';
        if (currentRoom && currentRoom.users) {
            currentRoom.users.forEach(user => {
                if (!user || typeof user.id === 'undefined') {
                    console.warn("Skipping malformed user in user list:", user);
                    return;
                }
                const li = document.createElement('li');
                li.textContent = `${user.username || 'Unnamed User'} (${user.type || 'N/A'})`;
                if (currentUser && currentUser.type === 'instructor' && currentUser.id && user.id !== currentUser.id) {
                    const kickBtn = document.createElement('button');
                    kickBtn.textContent = 'Kick';
                    kickBtn.className = 'kick-user-btn';
                    kickBtn.onclick = () => {
                        if (confirm(`Are you sure you want to kick ${user.username || 'this user'}?`)) {
                            sendToServer('KICK_USER', { roomId: currentRoom.id, userIdToKick: user.id });
                        }
                    };
                    li.appendChild(kickBtn);
                }
                userList.appendChild(li);
            });
        }
    }

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && messageInput.value.trim() !== '' && currentRoom && currentUser) {
            sendToServer('SEND_MESSAGE', {
                roomId: currentRoom.id,
                text: messageInput.value.trim()
            });
            messageInput.value = '';
        }
    });
    
    sendMessageBtn.addEventListener('click', () => {
        if (messageInput.value.trim() !== '' && currentRoom && currentUser) {
            sendToServer('SEND_MESSAGE', {
                roomId: currentRoom.id,
                text: messageInput.value.trim()
            });
            messageInput.value = '';
        }
    });

    connectToServer();
});