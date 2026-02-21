# 🧪 Testing FleetFlow Authentication API

## Prerequisites

1. Start the development server:
```bash
npm run dev
```

2. Make sure Firebase is configured in `.env.local`

---

## 🎯 Testing Methods

### Method 1: Browser-Based Testing (Easiest) ✨

Open this URL in your browser:
```
http://localhost:3000/api-tester.html
```

This provides a **visual interface** to test all authentication endpoints with forms and colored response displays.

**Features:**
- ✅ Pre-filled test data
- ✅ Beautiful UI with color-coded responses
- ✅ Easy to modify test values
- ✅ No command-line needed!

---

### Method 2: PowerShell Script (Windows) 🔷

Run the included PowerShell test script:

```powershell
.\test-auth-api.ps1
```

Or use the npm script:
```bash
npm run test:api:ps
```

**What it does:**
- Tests all 5 authentication endpoints
- Color-coded console output
- Shows success/failure for each test

---

### Method 3: Node.js Script 🟢

Run the Node.js test script:

```bash
node test-auth-api.js
```

Or use the npm script:
```bash
npm run test:api
```

**What it does:**
- Uses native Node.js fetch API
- Tests all endpoints automatically
- Formatted console output

---

### Method 4: PowerShell Manual Commands 💻

Test individual endpoints with PowerShell commands:

#### Sign Up
```powershell
$body = @{
    email = "test@company.com"
    password = "Test123456"
    displayName = "Test Manager"
    role = "manager"
    companyId = "company_001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

#### Sign In
```powershell
$loginBody = @{
    email = "test@company.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signin" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"
```

#### Verify User
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/verify" -Method GET
```

#### Reset Password
```powershell
$resetBody = @{
    email = "test@company.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/reset-password" `
    -Method POST `
    -Body $resetBody `
    -ContentType "application/json"
```

#### Sign Out
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signout" -Method POST
```

---

### Method 5: VS Code REST Client Extension 📝

If you have the REST Client extension installed, create a `.http` file:

```http
### Sign Up
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "email": "test@company.com",
  "password": "Test123456",
  "displayName": "Test Manager",
  "role": "manager",
  "companyId": "company_001"
}

### Sign In
POST http://localhost:3000/api/auth/signin
Content-Type: application/json

{
  "email": "test@company.com",
  "password": "Test123456"
}

### Verify User
GET http://localhost:3000/api/auth/verify

### Reset Password
POST http://localhost:3000/api/auth/reset-password
Content-Type: application/json

{
  "email": "test@company.com"
}

### Sign Out
POST http://localhost:3000/api/auth/signout
```

Click "Send Request" above each request to test.

---

### Method 6: Postman / Insomnia 📮

Import these collections into Postman or Insomnia:

**Base URL:** `http://localhost:3000`

**Endpoints:**
1. **POST** `/api/auth/signup` - Create account
2. **POST** `/api/auth/signin` - Sign in
3. **GET** `/api/auth/verify` - Verify user
4. **POST** `/api/auth/reset-password` - Reset password
5. **POST** `/api/auth/signout` - Sign out
6. **GET** `/api/auth/profile` - Get profile
7. **PUT** `/api/auth/profile` - Update profile

---

## 📊 Expected Responses

### Success Response (201/200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "email": "test@company.com",
      "displayName": "Test Manager",
      "role": "manager",
      "companyId": "company_001"
    }
  },
  "message": "Account created successfully"
}
```

### Error Response (400/401/500)
```json
{
  "success": false,
  "error": "Authentication failed",
  "message": "Invalid email or password"
}
```

---

## 🎨 Recommended Method

**🌟 For the easiest testing experience, use Method 1 (Browser UI):**

1. Start your dev server: `npm run dev`
2. Open: `http://localhost:3000/api-tester.html`
3. Click buttons to test each endpoint
4. See results instantly with color-coded responses!

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Firebase Not Configured
Make sure `.env.local` exists with Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
# ... etc
```

### CORS Errors
If testing from external tools, make sure your Next.js dev server is running on `localhost:3000`.

---

## 📝 Test Data

Default test credentials:
- **Email:** testuser@company.com
- **Password:** SecurePass123
- **Display Name:** Test User
- **Role:** manager
- **Company ID:** company_001
- **Phone:** +1234567890

---

## ✅ What to Test

1. ✅ **Sign Up** - Create new user account
2. ✅ **Sign In** - Authenticate existing user
3. ✅ **Verify** - Check authentication status
4. ✅ **Reset Password** - Send reset email
5. ✅ **Sign Out** - Clear authentication
6. ✅ **Profile** - Get/update user profile

All endpoints should return proper success/error responses!
