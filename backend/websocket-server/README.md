# WebSocket Chat Server

This is a WebSocket-based chat server. It supports real-time messaging between users with roles: `student` and `instructor`.

---

## Features

- Real-time messaging via WebSockets
- Role-based permissions:
  - Instructors can delete messages and kick users
  - Students can only send and receive messages
- Room-based chat
- Dynamic user list
- Frontend chat interface built with vanilla HTML/CSS/JS

---

## Technologies Used

### Backend
- **Node.js**: Server runtime
- **ws**: WebSocket library for real-time bidirectional communication

### Frontend
- **HTML / CSS**: Structured UI with responsive layout
- **Vanilla JavaScript**: Handles WebSocket connection and UI interactivity

---

## Project Structure

```
websocket-server/
├── client
    ├── client.js      # Client-side JS for interacting with the server
    ├── index.html         # Main HTML UI
├── server
    ├── index.js           # WebSocket server logic
    ├── package.json       # Node dependencies and metadata
├── README.md          # This file
```

---

## Setup and Running

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the WebSocket server:
   ```bash
   node index.js
   ```

3. Open `index.html` in a browser.

The server will listen on `ws://localhost:3000` by default.

---

## Assumptions & Notes
- **IMPORTANT**
- Identity is **assumed to be trusted** — there is no authentication system. It currently uses a dummy verification system, until integration with the real one. 
- Two roles: `student` and `instructor`
- **Instructors** always have authority to:
  - Delete messages
  - Kick users from rooms
- These roles are assigned manually via dropdown in the UI (prototype only)
- The client assumes a single open room per user session.

---

## Future Improvements

- Persistent message history
- User authentication system
- UI improvements and accessibility
- Admin panel for instructors
- Logging and moderation dashboard

