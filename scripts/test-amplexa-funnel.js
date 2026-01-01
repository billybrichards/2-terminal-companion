#!/usr/bin/env node

/**
 * Test script for Amplexa Funnel Profile API
 * 
 * This script demonstrates how to:
 * 1. Create a user via the funnel API
 * 2. Store their Amplexa funnel profile
 * 3. Send a new chat message that will use the funnel data
 * 
 * Prerequisites:
 * - Server must be running
 * - FUNNEL_API_SECRET must be set in environment
 * 
 * Usage:
 *   FUNNEL_API_SECRET=your-secret node scripts/test-amplexa-funnel.js
 */

// Validate required environment variables
if (!process.env.FUNNEL_API_SECRET) {
  console.error('❌ Error: FUNNEL_API_SECRET environment variable is required');
  console.error('\nUsage:');
  console.error('  FUNNEL_API_SECRET=your-secret node scripts/test-amplexa-funnel.js');
  process.exit(1);
}

const FUNNEL_API_SECRET = process.env.FUNNEL_API_SECRET;
const BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Test user data
const testUser = {
  email: `test-amplexa-${Date.now()}@example.com`,
  password: 'testpassword123',
  displayName: 'Alex Test',
  chatName: 'Alex',
  funnelType: 'direct',
};

// Funnel A profile (Quietly Lonely)
const amplexaProfile = {
  email: testUser.email,
  funnel: 'A',
  funnelName: 'Quietly Lonely',
  responses: [
    {
      questionId: 'q1',
      questionText: 'This is private. Why are you here right now?',
      answer: 'I feel lonely sometimes',
      answerIndex: 0,
    },
    {
      questionId: 'q2',
      questionText: 'When do you usually feel like talking?',
      answer: 'Late at night',
      answerIndex: 0,
    },
    {
      questionId: 'q3',
      questionText: 'What matters most to you?',
      answer: 'Feeling heard',
      answerIndex: 1,
    },
  ],
  profile: {
    primaryNeed: 'Connection',
    communicationStyle: 'Gentle, patient',
    pace: 'Slow',
    tags: ['Night Owl Processor', 'Validation Seeker'],
  },
  timestamp: new Date().toISOString(),
};

async function runTest() {
  console.log('🚀 Starting Amplexa Funnel API Test\n');
  
  try {
    // Step 1: Create user
    console.log('1️⃣  Creating test user...');
    const createUserResponse = await fetch(`${BASE_URL}/api/funnel/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FUNNEL_API_SECRET}`,
      },
      body: JSON.stringify(testUser),
    });
    
    if (!createUserResponse.ok) {
      const error = await createUserResponse.json();
      throw new Error(`Failed to create user: ${JSON.stringify(error)}`);
    }
    
    const userData = await createUserResponse.json();
    console.log('✅ User created successfully');
    console.log(`   User ID: ${userData.user.id}`);
    console.log(`   Email: ${userData.user.email}`);
    console.log(`   API Key: ${userData.apiKey.substring(0, 20)}...`);
    console.log('');
    
    // Step 2: Store Amplexa profile
    console.log('2️⃣  Storing Amplexa funnel profile...');
    const profileResponse = await fetch(`${BASE_URL}/api/funnel/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FUNNEL_API_SECRET}`,
      },
      body: JSON.stringify(amplexaProfile),
    });
    
    if (!profileResponse.ok) {
      const error = await profileResponse.json();
      throw new Error(`Failed to store profile: ${JSON.stringify(error)}`);
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ Profile stored successfully');
    console.log(`   Funnel: ${profileData.funnel} - ${profileData.funnelName}`);
    console.log('');
    
    // Step 3: Test new chat with funnel context
    console.log('3️⃣  Testing new chat with funnel context...');
    console.log('   Sending message: "Hi there"');
    console.log('   Expected: Short (1-2 sentence) personalized ice-breaker based on profile');
    console.log('');
    
    const chatResponse = await fetch(`${BASE_URL}/api/chat/non-streaming`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': userData.apiKey,
      },
      body: JSON.stringify({
        message: 'Hi there',
        newChat: true,
      }),
    });
    
    if (!chatResponse.ok) {
      const error = await chatResponse.json();
      throw new Error(`Failed to send chat message: ${JSON.stringify(error)}`);
    }
    
    const chatData = await chatResponse.json();
    console.log('✅ Chat response received');
    console.log('   AI Response:');
    console.log(`   "${chatData.response}"`);
    console.log('');
    console.log('   Analysis:');
    console.log(`   - Length: ${chatData.response.split('.').length - 1} sentences`);
    console.log(`   - Model: ${chatData.model}`);
    console.log(`   - Is ice-breaker: ${chatData.isNewChat}`);
    console.log('');
    
    // Verify the response is personalized
    const responseWords = chatData.response.toLowerCase();
    const hasPersonalization = 
      responseWords.includes('alex') || 
      responseWords.includes('hear') ||
      responseWords.includes('connection') ||
      responseWords.includes('understand');
    
    if (hasPersonalization) {
      console.log('✨ Response appears to be personalized based on funnel profile!');
    } else {
      console.log('⚠️  Response may not be using funnel context (this can vary)');
    }
    
    console.log('\n🎉 Test completed successfully!');
    console.log('\nNext Steps:');
    console.log('- Check that the response is 1-2 sentences (short and engaging)');
    console.log('- Verify it feels personalized for a "Quietly Lonely" user');
    console.log('- Test with different funnels (B, C, D, E, F) to see variations');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
