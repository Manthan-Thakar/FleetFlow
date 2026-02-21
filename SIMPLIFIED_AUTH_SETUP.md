# Simplified Authentication Setup

## Overview

The authentication system has been simplified to defer Firebase Admin SDK configuration for later. All critical authentication operations work through the client-side Firebase SDK.

## Current Architecture

### ✅ What Works Now

**Client-Side (Frontend):**
- User signup via `lib/services/auth.service.ts` ✅
  - Creates Firebase Auth user
  - Creates Firestore user document
  - Handles all validation
  
- User signin/signout via `lib/services/auth.service.ts` ✅
  - Firebase Authentication
  - User profile fetching
  
- TanStack Query hooks in `lib/hooks/use-auth.ts` ✅
  - `useSignUp()`, `useSignIn()`, `useSignOut()`
  - `useCurrentUser()`, `useAuthCheck()`
  - `useRequireAuth()`, `useRequireRole()`
  - `useIsAdmin()`, `useIsManager()`, etc.

**Server-Side (Backend):**
- API route validation endpoints
  - `/api/auth/signup` - Validates input, client performs actual signup
  - `/api/auth/signin` - Validates credentials, client handles auth
  - `/api/auth/verify` - Checks auth status
  - `/api/auth/signout` - Handles logout
  - `/api/auth/reset-password` - Password reset
  - `/api/auth/profile` - Profile management

### ⏳ Deferred for Later

**Firebase Admin SDK** (`lib/firebase/admin.ts`)
- Current Status: Stubbed out with placeholders
- Will be needed for:
  - Server-side user creation (if needed)
  - Bulk user operations
  - Advanced admin operations
  - When ready, environment variables needed:
    - `FIREBASE_ADMIN_PROJECT_ID`
    - `FIREBASE_ADMIN_CLIENT_EMAIL`
    - `FIREBASE_ADMIN_PRIVATE_KEY`

**Server-Side Auth Service** (`lib/services/auth.admin.service.ts`)
- Current Status: Stubbed out with placeholders
- To be implemented when Firebase Admin SDK is configured

**Storage Rules** (`storage.rules`)
- Current Status: Simplified to allow authenticated access
- Proper security rules TBD when file storage is needed

## How to Use

### Frontend Signup

```typescript
import { useSignUp } from '@/lib/hooks/use-auth';

function SignupForm() {
  const signUpMutation = useSignUp();

  const handleSignup = async (data) => {
    await signUpMutation.mutateAsync({
      email: 'user@example.com',
      password: 'password123',
      displayName: 'John Doe',
      role: 'driver',
      companyId: 'company-id',
      phoneNumber: '123456789',
    });
  };

  return (
    // Form JSX
  );
}
```

The `useSignUp()` hook:
1. Calls `lib/services/auth.service.ts` `signUp()` function
2. Creates Firebase Auth user
3. Creates Firestore user document
4. Auto-redirects to dashboard on success
5. Handles errors gracefully

### Frontend Signin

```typescript
import { useSignIn } from '@/lib/hooks/use-auth';

function SigninForm() {
  const signInMutation = useSignIn();

  const handleSignin = async (data) => {
    await signInMutation.mutateAsync({
      email: 'user@example.com',
      password: 'password123',
    });
  };

  return (
    // Form JSX
  );
}
```

### Protecting Pages

```typescript
import { useRequireAuth, useRequireRole } from '@/lib/hooks/use-auth';

function DriverDashboard() {
  // Protect page - redirect to /login if not authenticated
  useRequireAuth();

  // Or require specific role
  useRequireRole(['driver', 'manager']);

  return (
    // Dashboard JSX
  );
}
```

## Firestore Rules

Current temporary rules (in `firestore.rules`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING**: This allows all access! Before deploying to production, implement proper security rules.

## Migration Path to Firebase Admin SDK

When you're ready to add Firebase Admin SDK back:

1. **Set environment variables** in `.env.local`:
   ```
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   ```

2. **Uncomment Firebase Admin SDK** in `lib/firebase/admin.ts`:
   - Initialize admin SDK with credentials
   - Export `adminAuth`, `adminDb`, `adminStorage`

3. **Implement server functions** in `lib/services/auth.admin.service.ts`:
   - `adminSignUp()` - Server-side user creation
   - `getAdminUserByEmail()` - Lookup by email
   - `adminUpdateUser()` - Admin updates
   - `adminDeleteUser()` - Admin deletion

4. **Update API routes** to use admin service if needed

5. **Implement Storage rules** in `storage.rules`

6. **Update auth.middleware.ts** to use Firebase Admin SDK for full token verification

## Testing

Simplified testing without Firebase Admin SDK:

```bash
# Test API validation
npm run test:api     # Node.js tests
npm run test:api:ps  # PowerShell tests
```

The tests focus on:
- API route validation logic
- Error handling
- Response formatting

Full integration testing happens on the frontend with real Firebase credentials.

## Database Structure

### users collection

```typescript
{
  id: string;           // Firebase Auth UID
  email: string;        // User email
  displayName: string;  // User display name
  role: 'admin' | 'manager' | 'driver' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  companyId: string;    // Associated company
  phoneNumber?: string; // Optional phone
  photoURL?: string;    // Optional profile photo
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

## Next Steps

1. **Create frontend components** (next priority):
   - Login page
   - Signup page
   - Dashboard pages by role
   
2. **Implement other services**:
   - Drivers service & hooks
   - Vehicles service & hooks
   - Orders service & hooks
   - Routes service & hooks
   - Maintenance service & hooks

3. **Add proper Firestore rules**:
   - Role-based access control
   - Company isolation
   - Data validation rules

4. **Configure Firebase Admin SDK** when needed:
   - Server-side operations
   - Bulk imports/exports
   - Cloud Functions integration

5. **Implement Storage rules** for file uploads:
   - Profile photos
   - Document uploads
   - Vehicle images

## Troubleshooting

**Signup failing with "User not found":**
- Check that Firestore rules allow `create` operation
- Verify `companyId` is valid
- Check browser console for detailed error

**Signin failing:**
- Verify email and password match
- Check user document exists in Firestore
- Verify Firestore rules allow `read` access

**Auth hooks not working:**
- Ensure TanStack Query `QueryClientProvider` is set up in layout
- Check that auth context is properly initialized
- Verify Firebase credentials are valid

## Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `lib/firebase/config.ts` | Firebase client init | ✅ Active |
| `lib/firebase/admin.ts` | Firebase Admin SDK | ⏳ Deferred (placeholder) |
| `lib/services/auth.service.ts` | Client auth logic | ✅ Active |
| `lib/services/auth.admin.service.ts` | Server auth logic | ⏳ Deferred (placeholder) |
| `lib/hooks/use-auth.ts` | TanStack Query hooks | ✅ Active |
| `lib/middleware/auth.middleware.ts` | API route protection | ⚠️ Simplified (partial) |
| `firestore.rules` | Firestore security | ⚠️ Temporary (all access) |
| `storage.rules` | Storage security | ⏳ Deferred |

## Summary

The authentication system is **fully functional** for:
- ✅ User signup with email/password
- ✅ User signin and profile management
- ✅ Password reset
- ✅ Auth state management with TanStack Query
- ✅ Role-based route protection (frontend)

Firebase Admin SDK features are deferred but documented for future implementation when needed.
