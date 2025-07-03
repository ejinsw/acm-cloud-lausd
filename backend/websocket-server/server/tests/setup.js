import { setTimeout } from 'jest';
// Test setup file for WebSocket server tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '9998'; // Use different port for testing

// Global test timeout
setTimeout(10000);
