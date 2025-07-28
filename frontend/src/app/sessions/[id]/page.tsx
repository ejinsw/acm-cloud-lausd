'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

// Basic type definitions (refine these based on your actual server data)
interface User {
  id: string;
  username: string;
  type: 'student' | 'instructor';
}

interface MessagePayload {
  id: string;
  roomId: string;
  sender: User; // Assuming sender is an object with id, username, type
  text: string;
  timestamp: string; // ISO string or similar
}

interface RoomUser {
  id: string;
  username: string;
  type: string; // Assuming type can be 'student' or 'instructor'
}

interface Room {
  id: string;
  name: string;
  users: RoomUser[];
  messages: MessagePayload[]; // Store full messages
  userCount?: number;
}

interface DisplayMessage extends MessagePayload {
  isMyMessage: boolean;
  isDeleted?: boolean;
  type: 'message'; // Add the 'type' property to match NotificationMessage
}

interface NotificationMessage {
  id: string; // Use Date.now().toString() or a UUID
  type: 'notification';
  text: string;
  timestamp: string;
}


const ChatPage: React.FC = () => {
  // Connection Status State
  const [connectionStatusText, setConnectionStatusText] = useState('Connecting...');
  const [connectionStatusClass, setConnectionStatusClass] = useState(''); // e.g., 'status-connected', 'status-disconnected'

  // UI Section Visibility States
  const [showIdentifySection, setShowIdentifySection] = useState(false);
  const [showRoomManagementSection, setShowRoomManagementSection] = useState(false);
  const [showChatSection, setShowChatSection] = useState(false);

  // Input Field States
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState<'student' | 'instructor'>('student');
  const [createRoomInput, setCreateRoomInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // Core Application State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null); // Stores the full room object when joined
  const [currentRoomDisplayName, setCurrentRoomDisplayName] = useState(''); // For displaying the current room's name

  // Data List States
  const [availableRooms, setAvailableRooms] = useState<Array<{ id: string; name: string; userCount?: number }>>([]);
  const [chatMessages, setChatMessages] = useState<Array<DisplayMessage | NotificationMessage>>([]); // Holds both regular and notification messages
  const [usersInRoomList, setUsersInRoomList] = useState<RoomUser[]>([]); // Users currently in the joined room

  // WebSocket Reference
  const wsRef = useRef<WebSocket | null>(null);
  // Ref for scrolling message container
  const messageContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Sends a JSON message to the WebSocket server.
   * @param type - The message type.
   * @param payload - The message payload.
   */
  const sendToServer = useCallback((type: string, payload: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected. Cannot send message:', type, payload);
      // Optionally, implement a user-facing notification for this case
    }
  }, []);

  /**
   * Establishes and manages the WebSocket connection.
   */
  const connectToServer = useCallback(() => {
    // Prevent multiple connections if one is already open or connecting
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        console.log("WebSocket already open or connecting.");
        return;
    }

    wsRef.current = new WebSocket('ws://localhost:8080'); // Ensure this URL is correct for your server

    wsRef.current.onopen = () => {
      setConnectionStatusText('Connected. Please identify yourself.');
      setConnectionStatusClass('status-connected');
      setShowIdentifySection(true);
      setShowRoomManagementSection(false);
      setShowChatSection(false);
      // Server might send initial ROOM_LIST_UPDATED here or after identification
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        console.log('Received from server:', data);

        switch (data.type) {
          case 'USER_IDENTIFIED':
            setCurrentUser(data.payload as User);
            setConnectionStatusText(`Identified as ${data.payload.username} (${data.payload.type}).`);
            setShowIdentifySection(false);
            setShowRoomManagementSection(true);
            // Server should ideally send ROOM_LIST_UPDATED now if not sent onopen
            break;
          case 'ROOM_LIST_UPDATED':
            setAvailableRooms(data.payload as Array<{ id: string; name: string; userCount?: number }>);
            break;
          case 'ROOM_JOINED': {
            const joinedRoom = data.payload as Room;
            setCurrentRoom(joinedRoom);
            setCurrentRoomDisplayName(joinedRoom.name);
            setUsersInRoomList(joinedRoom.users || []); // Ensure users array exists
            setChatMessages(
              (joinedRoom.messages || []).map(msg => ({ // Ensure messages array exists
                ...msg,
                isMyMessage: currentUser?.id === msg.sender.id, // Check against potentially stale currentUser
                type: 'message', // Add the required 'type' property
              }))
            );
            setShowRoomManagementSection(false);
            setShowChatSection(true);
            break;
          }
          case 'USER_JOINED':
            // Check if the user joined the room this client is currently in
            if (currentRoom && currentRoom.id === data.payload.roomId) {
              const joinedUser = data.payload.user as RoomUser;
              setUsersInRoomList(prevUsers => {
                if (!prevUsers.find(u => u.id === joinedUser.id)) { // Avoid duplicates
                  return [...prevUsers, joinedUser];
                }
                return prevUsers;
              });
              setChatMessages(prev => [...prev, {id: Date.now().toString(), type: 'notification', text: `${joinedUser.username} joined the room.`, timestamp: new Date().toISOString()}]);
            }
            break;
          case 'NEW_MESSAGE':
            if (currentRoom && currentRoom.id === data.payload.roomId) {
              const newMessage = data.payload as MessagePayload;
              setChatMessages(prev => [...prev, { ...newMessage, isMyMessage: currentUser?.id === newMessage.sender.id, type: 'message' }]);
            }
            break;
          case 'USER_LEFT':
            if (currentRoom && currentRoom.id === data.payload.roomId) {
              const { userId: leftUserId, username: leftUsername } = data.payload;
              setUsersInRoomList(prevUsers => prevUsers.filter(u => u.id !== leftUserId));
              setChatMessages(prev => [...prev, {id: Date.now().toString(), type: 'notification', text: `${leftUsername || leftUserId} left the room.`, timestamp: new Date().toISOString()}]);
            }
            break;
          case 'MESSAGE_DELETED':
            if (currentRoom && currentRoom.id === data.payload.roomId) {
              const { messageId } = data.payload;
              setChatMessages(prevMsgs =>
                prevMsgs.map(msg => {
                  if (msg.id === messageId && 'isMyMessage' in msg) { // Ensure it's a DisplayMessage
                    return { ...(msg as DisplayMessage), text: 'Message deleted.', isDeleted: true, sender: {id:'system', username: 'System', type:'instructor'} };
                  }
                  return msg;
                })
              );
            }
            break;
          case 'YOU_WERE_KICKED':
            alert(`You were kicked from room "${data.payload.roomName}". Reason: ${data.payload.reason || 'No reason given.'}`);
            setCurrentRoom(null);
            setCurrentRoomDisplayName('');
            setShowChatSection(false);
            setShowRoomManagementSection(true);
            setChatMessages([]);
            setUsersInRoomList([]);
            break;
          case 'USER_KICKED':
             if (currentRoom && currentRoom.id === data.payload.roomId) {
                const { kickedUserId, kickedUsername } = data.payload;
                setUsersInRoomList(prevUsers => prevUsers.filter(u => u.id !== kickedUserId));
                setChatMessages(prev => [...prev, {id: Date.now().toString(), type: 'notification', text: `${kickedUsername} was kicked by an instructor.`, timestamp: new Date().toISOString()}]);
              }
            break;
          case 'YOU_LEFT_ROOM':
            setCurrentRoom(null);
            setCurrentRoomDisplayName('');
            setShowChatSection(false);
            setShowRoomManagementSection(true);
            setChatMessages([]);
            setUsersInRoomList([]);
            break;
          case 'ERROR':
            console.error('Server Error:', data.payload.message);
            alert(`Error: ${data.payload.message}`); // Consider a less intrusive notification
            break;
          case 'SERVER_SHUTDOWN':
            alert('Server is shutting down. You will be disconnected.');
            if (wsRef.current) wsRef.current.close();
            break;
          default:
            console.warn('Unknown message type from server:', data.type);
        }
      } catch (error) {
          console.error("Failed to parse WebSocket message or handle it:", event.data, error);
      }
    };

    wsRef.current.onclose = () => {
      setConnectionStatusText('Disconnected. Attempting to reconnect in 5s...');
      setConnectionStatusClass('status-disconnected');
      // Reset states that depend on a live connection
      setCurrentUser(null);
      setCurrentRoom(null);
      setShowIdentifySection(true); // Default to identify section on disconnect
      setShowRoomManagementSection(false);
      setShowChatSection(false);
      wsRef.current = null; // Clear the ref to allow a new connection object
      setTimeout(connectToServer, 5000); // Attempt to reconnect
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setConnectionStatusText('Connection error.');
      setConnectionStatusClass('status-error');
      // Potentially add more robust error handling or UI feedback
    };
  // `currentUser` and `currentRoom` are intentionally omitted from deps here,
  // as they are context for message handling, not for re-establishing the connection itself.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to establish WebSocket connection on component mount
  useEffect(() => {
    connectToServer();
    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent the onclose handler from firing during unmount (to avoid reconnect attempts)
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectToServer]); // connectToServer is stable due to useCallback

  // Effect to scroll message container to bottom when new messages are added
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [chatMessages]); // Dependency: chatMessages array

  // --- Event Handlers for UI Interactions ---
  const handleIdentify = () => {
    if (userId.trim() && username.trim()) {
      sendToServer('IDENTIFY_USER', { id: userId.trim(), username: username.trim(), type: userType });
    } else {
      alert('Please enter User ID and Username.');
    }
  };

  const handleCreateRoom = () => {
    if (createRoomInput.trim() && currentUser) {
      // Server will use the user associated with the WebSocket connection (currentUser)
      sendToServer('CREATE_ROOM', { roomName: createRoomInput.trim(), user: currentUser });
      setCreateRoomInput(''); // Clear input after sending
    } else if (!currentUser) {
      alert('Please identify yourself before creating a room.');
    } else {
      alert('Please enter a room name.');
    }
  };

  const handleJoinRoom = (roomIdToJoin: string) => {
    if (currentUser) {
      sendToServer('JOIN_ROOM', { roomId: roomIdToJoin, user: currentUser });
    } else {
      alert('Please identify yourself before joining a room.');
    }
  };

  const handleLeaveRoom = () => {
    if (currentRoom && currentUser) {
      sendToServer('LEAVE_ROOM', { roomId: currentRoom.id, userId: currentUser.id });
      // UI updates will be triggered by server messages like YOU_LEFT_ROOM
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && currentRoom && currentUser) {
      sendToServer('SEND_MESSAGE', {
        roomId: currentRoom.id,
        text: messageInput.trim(),
        // Server will determine the sender based on the WebSocket connection
      });
      setMessageInput(''); // Clear input after sending
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (currentRoom && currentUser && currentUser.type === 'instructor') {
       if (confirm('Are you sure you want to delete this message?')) { // Consider custom modal for confirm
        sendToServer('DELETE_MESSAGE', { roomId: currentRoom.id, messageId });
      }
    }
  };

  const handleKickUser = (userIdToKick: string) => {
    if (currentRoom && currentUser && currentUser.type === 'instructor') {
      // Optionally, find username for a more descriptive confirmation
      const userToKickDetails = usersInRoomList.find(u => u.id === userIdToKick);
      const confirmMessage = userToKickDetails
        ? `Are you sure you want to kick ${userToKickDetails.username}?`
        : 'Are you sure you want to kick this user?';
      if (confirm(confirmMessage)) { // Consider custom modal
        sendToServer('KICK_USER', { roomId: currentRoom.id, userIdToKick });
      }
    }
  };

  // --- JSX for Rendering ---
  return (
    <>
      {/* Global styles using styled-jsx. Ensure this is appropriate for your project structure. */}
      <style jsx global>{`
        body {
            font-family: Arial, sans-serif;
            margin: 15px;
            background-color: #f9f9f9;
        }
        /* More specific div styling */
        #identify-section, #room-management-section, #chat-section, #connection-status {
             margin-bottom: 12px;
             padding: 8px;
             border: 1px solid #e0e0e0;
             background-color: #fff;
             border-radius: 4px;
        }
        h1, h2, h3 {
            margin-top: 0;
            color: #333;
        }
        label {
            display: inline-block;
            margin-right: 5px;
            margin-bottom: 3px;
        }
        input[type="text"], select {
            padding: 6px;
            margin-right: 8px;
            margin-bottom: 8px;
            border: 1px solid #ccc;
            border-radius: 3px;
            box-sizing: border-box;
        }
        button {
            padding: 6px 10px;
            margin-right: 5px;
            cursor: pointer;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 3px;
        }
        button:hover {
            background-color: #0056b3;
        }
        #connection-status {
            text-align: center;
            font-weight: bold;
        }
        .status-connected { background-color: #d4edda !important; color: #155724 !important; border-color: #c3e6cb !important; }
        .status-disconnected { background-color: #f8d7da !important; color: #721c24 !important; border-color: #f5c6cb !important;}
        .status-error { background-color: #fff3cd !important; color: #856404 !important; border-color: #ffeeba !important;}

        #chat-section {
            border: 1px solid #bbb;
            padding: 10px;
        }
        #chat-area {
            display: flex;
            border: none; padding: 0; margin-bottom: 0; background-color: transparent; border-radius: 0;
        }
        #chat-sidebar {
            width: 200px; /* Slightly wider for better readability */
            padding-right: 10px;
            border-right: 1px solid #ddd;
            margin-right: 10px;
            height: 300px; /* Increased height */
            overflow-y: auto;
            padding: 8px;
            background-color: #fdfdfd; /* Added background for clarity */
        }
        #main-chat {
            flex: 1; border: none; padding: 0; margin-bottom: 0; background-color: transparent;
        }
        #message-container {
            height: 250px; /* Increased height */
            border: 1px solid #ddd;
            overflow-y: auto;
            padding: 8px;
            margin-bottom: 8px;
            background-color: #fdfdfd;
        }
        .message-item {
            border-bottom: 1px solid #f0f0f0;
            padding: 5px 3px;
            margin-bottom: 3px;
            background-color: #fff; /* Default background for messages */
            word-wrap: break-word; /* Ensure long messages wrap */
        }
        .message-item:last-child { border-bottom: none; }
        .message-item.my-message { background-color: #e6f2ff; } /* For messages sent by the current user */
        .message-item .sender { font-weight: bold; font-size: 0.95em; color: #2c3e50; margin-right: 5px;}
        .message-item .text { margin-left: 5px; }
        .message-item .timestamp { font-size: 0.75em; color: #7f8c8d; margin-left: 10px; }
        .message-item.deleted .text { font-style: italic; color: #95a5a6; }
        .message-item.deleted { background-color: #ecf0f1; } /* Style for deleted messages */

        .notification-message {
            font-style: italic;
            color: #34495e;
            text-align: center;
            padding: 5px 0;
            background-color: #f0f0f0;
            border-radius: 3px;
            margin: 4px 0;
            border-bottom: 1px solid #e0e0e0;
            word-wrap: break-word;
        }
         .notification-message:last-child { border-bottom: none; }

        ul { list-style-type: none; padding-left: 0; margin-top: 5px; }
        #available-rooms li, #user-list li {
            padding: 6px 2px; /* Increased padding */
            border-bottom: 1px solid #eee;
            display: flex; justify-content: space-between; align-items: center;
            word-wrap: break-word; /* Ensure long room/user names wrap */
        }
         #available-rooms li:last-child, #user-list li:last-child { border-bottom: none; }
        #available-rooms li button, #user-list li button {
            font-size: 0.8em; padding: 3px 5px; margin-left: 8px; background-color: #6c757d; flex-shrink: 0; /* Prevent button from shrinking */
        }
         #available-rooms li button:hover, #user-list li button:hover { background-color: #5a6268; }
        .delete-msg-btn, .kick-user-btn { background-color: #ffc107; color: #212529; }
        .delete-msg-btn:hover, .kick-user-btn:hover { background-color: #e0a800; }
        #message-input-area { display: flex; border: none; padding: 0; margin-bottom: 0; background-color: transparent; }
        #message-input { flex-grow: 1; margin-right: 5px; /* Added margin */}
      `}</style>

      <h1>Teacher Student Chat Room</h1>
      <div id="connection-status" className={connectionStatusClass}>
        {connectionStatusText}
      </div>

      {showIdentifySection && (
        <div id="identify-section">
          <h2>Sign in</h2>
          <div>
            <label htmlFor="user-id">User ID:</label>
            <input type="text" id="user-id" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          <div>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label htmlFor="user-type">User Type:</label>
            <select id="user-type" value={userType} onChange={(e) => setUserType(e.target.value as 'student' | 'instructor')}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>
          <button id="identify-btn" onClick={handleIdentify}>Identify</button>
        </div>
      )}

      {showRoomManagementSection && (
        <div id="room-management-section">
          <h2>Room Management</h2>
          <div>
            <label htmlFor="create-room-input">New Room:</label>
            <input type="text" id="create-room-input" placeholder="Room Name" value={createRoomInput} onChange={(e) => setCreateRoomInput(e.target.value)} />
            <button id="create-room-btn" onClick={handleCreateRoom}>Create Room</button>
          </div>
          <h3>Available Rooms:</h3>
          <ul id="available-rooms">
            {availableRooms.length === 0 ? (
              <li>No rooms available. Create one!</li>
            ) : (
              availableRooms.map(room => (
                <li key={room.id}>
                  <span>{room.name} ({room.userCount || 0} users)</span>
                  <button onClick={() => handleJoinRoom(room.id)}>Join</button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {showChatSection && currentRoom && currentUser && (
        <div id="chat-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 id="current-room-name" style={{ margin: 0 }}>
              {currentRoomDisplayName}
            </h2>
            <button id="leave-room-btn" onClick={handleLeaveRoom}>Leave Room</button>
          </div>

          <div id="chat-area">
            <div id="chat-sidebar">
              <h3>Users Online</h3>
              <ul id="user-list">
                {usersInRoomList.map(user => (
                  <li key={user.id}>
                    <span>{user.username} ({user.type})</span>
                    {currentUser.type === 'instructor' && user.id !== currentUser.id && (
                      <button className="kick-user-btn" onClick={() => handleKickUser(user.id)}>Kick</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div id="main-chat">
              <div id="message-container" ref={messageContainerRef}>
                {chatMessages.map((msg) => {
                  if (msg.type === 'notification') {
                    return (
                      <div key={msg.id} className="notification-message">
                        <span className="text">{msg.text}</span>
                      </div>
                    );
                  }
                  // It's a DisplayMessage
                  return (
                    <div
                      key={msg.id}
                      className={`message-item ${'isMyMessage' in msg && msg.isMyMessage ? 'my-message' : ''} ${'isDeleted' in msg && msg.isDeleted ? 'deleted' : ''}`}
                    >
                      {'isDeleted' in msg && !msg.isDeleted && <span className="sender">{msg.sender.username || 'Unknown'}{msg.sender.type ? ` (${msg.sender.type})` : ''}:</span>}
                      <span className="text">{msg.text}</span>
                      {'isDeleted' in msg && !msg.isDeleted && <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>}
                      {currentUser.type === 'instructor' && 'isMyMessage' in msg && !msg.isMyMessage && !msg.isDeleted && (
                        <button
                          className="delete-msg-btn"
                          style={{ fontSize: '0.8em', padding: '2px 4px', marginLeft: '10px' }}
                          onClick={() => handleDeleteMessage(msg.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div id="message-input-area">
                <input
                  type="text"
                  id="message-input"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button id="send-message-btn" onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;
