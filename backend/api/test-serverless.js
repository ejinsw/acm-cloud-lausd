const { handler } = require('./dist/app');

// Test the handler locally
const testEvent = {
  httpMethod: 'GET',
  path: '/api/health',
  headers: {},
  queryStringParameters: null,
  body: null,
  isBase64Encoded: false,
};

const testContext = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'test',
  functionVersion: 'test',
  invokedFunctionArn: 'test',
  memoryLimitInMB: '512',
  awsRequestId: 'test',
  logGroupName: 'test',
  logStreamName: 'test',
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
};

async function testHandler() {
  try {
    console.log('Testing serverless handler...');
    const result = await handler(testEvent, testContext);
    console.log('Handler result:', result);
  } catch (error) {
    console.error('Handler error:', error);
  }
}

testHandler();
