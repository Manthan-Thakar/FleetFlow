// test-auth-api.js
// Run this with: node test-auth-api.js
// Make sure your dev server is running: npm run dev

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

async function testAPI() {
  console.log(`${colors.cyan}=== FleetFlow Authentication API Tests ===${colors.reset}`);
  console.log(`${colors.gray}Note: Signup happens client-side. Use lib/hooks/use-auth.ts for frontend.\n${colors.reset}`);

  // Test 1: Sign Up Validation Validation
  console.log(`${colors.yellow}1. Testing Sign Up Validation...${colors.reset}`);
  try {
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@company.com',
        password: 'SecurePass123',
        displayName: 'Test User',
        role: 'manager',
        companyId: 'company_001',
        phoneNumber: '+1234567890',
      }),
    });

    const signupData = await signupResponse.json();
    
    if (signupResponse.ok) {
      console.log(`${colors.green}✅ Sign Up Validation Passed!${colors.reset}`);
      console.log(`${colors.gray}Note: Actual signup happens client-side via Firebase Auth${colors.reset}`);
      console.log(`${colors.gray}Message: ${signupData.message}${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Sign Up Validation Failed: ${signupData.message}${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Sign Up Error: ${error.message}${colors.reset}\n`);
  }

  // Test 2: Sign In (requires user created via Firebase Console or client signup)
  console.log(`${colors.yellow}2. Testing Sign In...${colors.reset}`);
  console.log(`${colors.gray}Note: User must exist in Firebase Auth. Create via client signup or Firebase Console.${colors.reset}`);
  try {
    const signinResponse = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@company.com',
        password: 'SecurePass123',
      }),
    });

    const signinData = await signinResponse.json();
    
    if (signinResponse.ok) {
      console.log(`${colors.green}✅ Sign In Success!${colors.reset}`);
      console.log(`${colors.gray}User: ${signinData.data.user.displayName}${colors.reset}`);
      console.log(`${colors.gray}Role: ${signinData.data.user.role}${colors.reset}`);
      console.log(`${colors.gray}Status: ${signinData.data.user.status}${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Sign In Failed: ${signinData.message || signinData.error}${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Sign In Error: ${error.message}${colors.reset}\n`);
  }

  // Test 3: Verify User
  console.log(`${colors.yellow}3. Testing Verify User...${colors.reset}`);
  try {
    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify`);
    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.ok) {
      console.log(`${colors.green}✅ Verify Success!${colors.reset}`);
      console.log(`${colors.gray}User: ${verifyData.data.user.displayName}${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Verify Failed: ${verifyData.message}${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Verify Error: ${error.message}${colors.reset}\n`);
  }

  // Test 4: Reset Password
  console.log(`${colors.yellow}4. Testing Reset Password...${colors.reset}`);
  try {
    const resetResponse = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@company.com',
      }),
    });

    const resetData = await resetResponse.json();
    
    if (resetResponse.ok) {
      console.log(`${colors.green}✅ Reset Password Success!${colors.reset}`);
      console.log(`${colors.gray}Message: ${resetData.message}${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Reset Password Failed: ${resetData.message}${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Reset Password Error: ${error.message}${colors.reset}\n`);
  }

  // Test 5: Sign Out
  console.log(`${colors.yellow}5. Testing Sign Out...${colors.reset}`);
  try {
    const signoutResponse = await fetch(`${BASE_URL}/api/auth/signout`, {
      method: 'POST',
    });

    const signoutData = await signoutResponse.json();
    
    if (signoutResponse.ok) {
      console.log(`${colors.green}✅ Sign Out Success!${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Sign Out Failed: ${signoutData.message}${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Sign Out Error: ${error.message}${colors.reset}\n`);
  }

  console.log(`${colors.cyan}=== All Tests Completed ===${colors.reset}`);
  
  console.log(`\n${colors.cyan}=== Testing Notes ===${colors.reset}`);
  console.log(`${colors.gray}Architecture: Simplified (Client-side Authentication)${colors.reset}`);
  console.log(`${colors.gray}1. Signup validation: ✅ Server validates input${colors.reset}`);
  console.log(`${colors.gray}2. User creation: Client-side (Firebase Auth + Firestore)${colors.reset}`);
  console.log(`${colors.gray}3. To test Sign In:${colors.reset}`);
  console.log(`${colors.gray}   - Use http://localhost:3000/signup to create a user via frontend${colors.reset}`);
  console.log(`${colors.gray}   - OR create user manually in Firebase Console${colors.reset}`);
  console.log(`${colors.gray}   - Then run this test again${colors.reset}`);
  console.log(`${colors.gray}\nDocumentation: See SIMPLIFIED_AUTH_SETUP.md${colors.reset}\n`);
}

// Run tests
testAPI();
