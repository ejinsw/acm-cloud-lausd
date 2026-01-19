import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Configuration: Define how many users and for how long
export const options = {
  vus: 10, // 10 virtual users running simultaneously
  duration: '30s',
};

// BASE_URL should be the origin (optionally including API Gateway stage like /dev)
// Examples:
// - http://localhost:8080
// - https://xxxxx.execute-api.us-west-2.amazonaws.com/dev
const BASE_URL = __ENV.BASE_URL || 'https://your-api-url.com';
const API_BASE = `${BASE_URL}/api`;

// Simple: read tokens from a JSON file (no /login calls).
// - Create `backend/api/stress/tokens.json` (you can copy `tokens.example.json`)
// - Run from repo root:
//   k6 run -e BASE_URL="http://localhost:8080" backend/api/stress/k6-session.js
//
// Optional override:
//   k6 run -e BASE_URL="http://localhost:8080" -e TOKENS_FILE="./backend/api/stress/tokens.json" backend/api/stress/k6-session.js
const TOKENS_FILE = __ENV.TOKENS_FILE || './backend/api/stress/tokens.json';

let TOKENS = {};
try {
  TOKENS = JSON.parse(open(TOKENS_FILE));
} catch (e) {
  // Keep the script runnable even if the file isn't present yet.
  console.error(`Could not read tokens file at "${TOKENS_FILE}". Using placeholder tokens.`);
  TOKENS = {};
}

const STUDENT_TOKEN = TOKENS.studentToken || 'STUDENT_TOKEN';
const INSTRUCTOR_TOKEN = TOKENS.instructorToken || 'INSTRUCTOR_TOKEN';

// Use one known Subject ID (no fetch). You can set it via env or in tokens.json.
// Example:
//   k6 run -e BASE_URL="http://localhost:8080" -e SUBJECT_ID=1 backend/api/stress/k6-session.js
const SUBJECT_ID_RAW = __ENV.SUBJECT_ID !== undefined ? __ENV.SUBJECT_ID : TOKENS.subjectId;
const SUBJECT_ID = Number(SUBJECT_ID_RAW);
if (!Number.isFinite(SUBJECT_ID)) {
  console.error(
    'Missing/invalid SUBJECT_ID. Set -e SUBJECT_ID=<number> (or add "subjectId": <number> to tokens.json).'
  );
}

function jsonHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

export default function () {
  // --- STUDENT FLOW ---
  // Define headers (e.g., Auth tokens)
  const studentParams = jsonHeaders(STUDENT_TOKEN);

  if (!Number.isFinite(SUBJECT_ID)) {
    return;
  }

  // Create a queue item (POST /api/queue requires { description, subjectId })
  const createRes = http.post(
    `${API_BASE}/queue`,
    JSON.stringify({
      description: 'k6 load test: need help with a topic',
      subjectId: SUBJECT_ID,
    }),
    studentParams
  );

  const checkCreate = check(createRes, {
    'queue created successfully': (r) => r.status === 201 || r.status === 200,
    'has queue id': (r) => r.json('queue.id') !== undefined,
  });

  if (!checkCreate) {
    console.error(`Failed to create queue. status=${createRes.status} body=${createRes.body}`);
    return; // Stop this iteration if we can't create a queue
  }

  const queueId = createRes.json('queue.id');

  // Small delay to simulate "waiting" in the queue
  sleep(1);

  // --- TEACHER FLOW ---
  const teacherParams = jsonHeaders(INSTRUCTOR_TOKEN);

  // Accept a queue item (PUT /api/queue/:id/accept)
  // Note: backend requires instructor to have Zoom connected; otherwise it returns 400 with { needsZoomConnection: true }.
  const acceptRes = http.put(`${API_BASE}/queue/${queueId}/accept`, JSON.stringify({}), teacherParams);

  check(acceptRes, {
    'teacher accepted queue (or needs zoom connection)': (r) =>
      r.status === 200 || (r.status === 400 && r.json('needsZoomConnection') === true),
    'session created (when accepted)': (r) => r.status !== 200 || r.json('session.id') !== undefined,
  });

  // Simulate them being on the /session/:id page for a bit
  sleep(2);
}