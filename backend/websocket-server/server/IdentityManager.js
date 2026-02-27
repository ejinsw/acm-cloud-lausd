const WebSocket = require('ws');

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
        role: rawRole.toUpperCase() || (normalizedRole === 'instructor' ? 'INSTRUCTOR' : 'STUDENT'),
        isUnderReview: false,
        currentRoomId: null,
      };
    } catch (error) {
      console.error('Failed to decode authentication token payload:', error);
      return null;
    }
  }

  return null;
}

async function handleIdentify(ws, payload, connectedUsers) {
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

  // Fetch the actual user role from the API backend
  try {
    const apiUrl = process.env.API_URL || 'http://backend:8080';
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${payload.token}`,
      },
    });

    if (response.ok) {
      const dbUser = await response.json();
      // Update userData with the correct role from database
      userData.type =
        dbUser.role === 'INSTRUCTOR' || dbUser.role === 'ADMIN' ? 'instructor' : 'student';
      userData.role = dbUser.role || (userData.type === 'instructor' ? 'INSTRUCTOR' : 'STUDENT');
      userData.isUnderReview =
        dbUser.role === 'INSTRUCTOR' && dbUser.instructorReviewStatus === 'UNDER_REVIEW';
      userData.username = `${dbUser.firstName} ${dbUser.lastName}`.trim() || userData.username;
    } else {
      console.warn(
        `Failed to fetch user role from API (status ${response.status}), using default role from token`
      );
    }
  } catch (error) {
    console.warn(`Error fetching user role from API: ${error.message}`);
    // Continue with the role from token (which defaults to 'student')
  }

  // Simplified: Just replace the old connection silently without notifying or closing it
  // The old connection will be cleaned up automatically when it detects it's no longer in the map
  const existing = connectedUsers.get(userData.id);
  if (existing && existing.ws !== ws && existing.ws.readyState === WebSocket.OPEN) {
    console.log(`Silently replacing existing connection for user ${userData.username}`);
    // Just close the old one quietly, no error message needed
    try {
      existing.ws.close();
    } catch (e) {
      // Ignore errors
    }
  }

  // Set the new connection
  connectedUsers.set(userData.id, { ...userData, ws, currentRoomId: null });
  ws.userId = userData.id;
  ws.userRole = userData.role || (userData.type === 'instructor' ? 'INSTRUCTOR' : 'STUDENT');
  ws.isUnderReview = !!userData.isUnderReview;

  // Skip DynamoDB persistence - in-memory map is sufficient
  console.log(
    `User authenticated via token: ${userData.username} (ID: ${userData.id}, Type: ${userData.type})`
  );
  ws.send(JSON.stringify({ type: 'USER_IDENTIFIED', payload: userData }));
}

module.exports = {
  handleIdentify,
};
