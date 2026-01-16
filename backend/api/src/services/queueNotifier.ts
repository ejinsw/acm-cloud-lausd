// Simple HTTP client to notify WebSocket server of queue changes
const WEBSOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:9999';

export async function notifyQueueChange(queueData: any) {
  try {
    const response = await fetch(`${WEBSOCKET_SERVER_URL}/notify-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queueData),
    });
    
    if (!response.ok) {
      console.error('Failed to notify WebSocket server:', response.statusText);
    }
  } catch (error) {
    console.error('Error notifying WebSocket server:', error);
  }
}
