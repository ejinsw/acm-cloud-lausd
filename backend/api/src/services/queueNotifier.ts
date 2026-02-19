import WebSocket from 'ws';

// WebSocket client to notify WebSocket server of queue changes
const WEBSOCKET_SERVER_URL = process.env.WEBSOCKET_SERVER_URL || 'ws://localhost:9999';

let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;

function connectToWebSocket() {
  ws = new WebSocket(WEBSOCKET_SERVER_URL);

  ws.on('open', () => {
    console.log('[Queue Notifier] Connected to WebSocket server');
  });

  ws.on('error', (error: Error) => {
    console.error('[Queue Notifier] WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('[Queue Notifier] WebSocket connection closed, reconnecting in 5s...');
    ws = null;
    
    // Reconnect after 5 seconds
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(connectToWebSocket, 5000);
  });
}

// Initialize connection
connectToWebSocket();

export async function notifyQueueChange(queueData: any) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('[Queue Notifier] WebSocket not connected, skipping notification. ReadyState:', ws?.readyState);
    console.warn('[Queue Notifier] Queue data that would have been sent:', queueData);
    return;
  }

  try {
    const message = {
      type: 'QUEUE_UPDATED',
      payload: { queueData }
    };
    console.log('[Queue Notifier] Sending queue update:', message);
    ws.send(JSON.stringify(message));
    console.log('[Queue Notifier] ✅ Queue update sent successfully');
  } catch (error) {
    console.error('[Queue Notifier] ❌ Error sending queue update:', error);
  }
}
