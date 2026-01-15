/**
 * Simple test to verify Zoom integration
 * Run this after setting up environment variables
 */

const axios = require('axios');

// Test configuration
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN; // You'll need to get this from your auth system

async function testZoomIntegration() {
  console.log('🧪 Testing Zoom Integration...\n');

  try {
    // Test 1: Check if Zoom config is loaded
    console.log('1. Testing Zoom configuration...');
    const config = require('./dist/src/config/zoom.config');
    console.log('✅ Zoom config loaded successfully');
    console.log(`   - Client ID: ${config.ZOOM_CONFIG.clientId ? 'Set' : 'Not set'}`);
    console.log(`   - Base URL: ${config.ZOOM_CONFIG.baseUrl}\n`);

    // Test 2: Test Zoom service (without actual API calls)
    console.log('2. Testing Zoom service...');
    const { ZoomService } = require('./dist/src/services/zoomService');
    const zoomService = new ZoomService();
    console.log('✅ Zoom service initialized successfully\n');

    // Test 3: Test session creation with Zoom (if token provided)
    if (TEST_USER_TOKEN) {
      console.log('3. Testing session creation with Zoom...');
      try {
        const sessionData = {
          name: 'Test Zoom Session',
          description: 'Testing Zoom integration',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
          maxAttendees: 10,
          subjects: ['Mathematics'],
          materials: ['Test materials'],
          objectives: ['Test objective'],
        };

        const response = await axios.post(`${API_BASE}/api/sessions`, sessionData, {
          headers: {
            Authorization: `Bearer ${TEST_USER_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.zoomMeeting) {
          console.log('✅ Session created with Zoom meeting');
          console.log(`   - Meeting ID: ${response.data.zoomMeeting.id}`);
          console.log(`   - Join URL: ${response.data.zoomMeeting.joinUrl}`);
        } else {
          console.log(
            '⚠️  Session created but no Zoom meeting (instructor may not have Zoom connected)'
          );
        }
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.needsZoomConnection) {
          console.log(
            '⚠️  Session creation requires Zoom connection (expected for new instructors)'
          );
        } else {
          console.log(
            '❌ Session creation failed:',
            error.response?.data?.message || error.message
          );
        }
      }
    } else {
      console.log('3. Skipping session creation test (no test token provided)');
    }

    console.log('\n🎉 Zoom integration test completed!');
    console.log('\nNext steps:');
    console.log('1. Run: npx prisma migrate dev --name add-zoom-fields');
    console.log('2. Set up your Zoom app credentials in .env');
    console.log('3. Test the OAuth flow in your frontend');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure all dependencies are installed: npm install');
    console.log('2. Check that your .env file has the required Zoom credentials');
    console.log('3. Verify your database is running and accessible');
  }
}

// Run the test
testZoomIntegration();
