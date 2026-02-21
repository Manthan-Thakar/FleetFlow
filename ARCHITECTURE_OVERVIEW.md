# Architecture Overview - Simplified Setup

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Next.js)                     │
│┌────────────────────────────────────────────────────────────────┐│
││  Pages: Login, Signup, Dashboards                              ││
││  ↓↓↓                                                             ││
││  ┌─────────────────────────────────────────────────────────┐   ││
││  │  TanStack Query Hooks (use-auth.ts)                     │   ││
││  │  • useSignUp, useSignIn, useSignOut                      │   ││
││  │  • useCurrentUser, useAuthCheck                          │   ││
││  │  • useRequireAuth, useRequireRole                        │   ││
││  └─────────────────────────────────────────────────────────┘   ││
││  ↓↓↓                                                             ││
││  ┌─────────────────────────────────────────────────────────┐   ││
││  │  Service Layer (auth.service.ts) ✅ ACTIVE               │   ││
││  │  • signUp() - Creates Firebase Auth + Firestore doc      │   ││
││  │  • signIn() - Authenticates and loads profile            │   ││
││  │  • signOut() - Clears authentication                     │   ││
││  │  • resetPassword() - Sends reset email                   │   ││
││  │  • getCurrentUser() - Gets current auth user             │   ││
││  │  • updateUserProfile() - Updates user info               │   ││
││  └─────────────────────────────────────────────────────────┘   ││
││  ↓↓↓                                                             ││
└└─────────────────────────────────────────────────────────────────┘┘
        │
        │ (Client-side Firebase SDK)
        ↓
┌─────────────────────────────────────────────────────────────────┐
│              FIREBASE (Authentication & Firestore)               │
│                                                                  │
│  ┌──────────────────┐    ┌────────────────────┐                │
│  │ Firebase Auth    │    │ Firestore Database │                │
│  │                  │    │                    │                │
│  │ • Auth users     │    │ • users collection │                │
│  │ • Sessions       │    │ • User documents   │                │
│  │ • Tokens         │    │ • Company data     │                │
│  └──────────────────┘    └────────────────────┘                │
│                                                                  │
│  Rules: allow read, write: if true (⚠️ Temporary)               │
└─────────────────────────────────────────────────────────────────┘

---

Optional Backend Layer (⏳ Deferred - Firebase Admin SDK):
┌─────────────────────────────────────────────────────────────────┐
│            API Routes (app/api/auth/*) - Validation Only         │
│                                                                  │
│  • POST /api/auth/signup - Validates input, client does signup  │
│  • POST /api/auth/signin - Validates creds, client authenticates│
│  • POST /api/auth/signout - Handles request, client clears auth │
│  • GET  /api/auth/verify - Checks if authenticated              │
│  • POST /api/auth/reset-password - Sends reset email            │
│  • GET  /api/auth/profile - Gets user profile (requires auth)   │
│  • PUT  /api/auth/profile - Updates profile (requires auth)     │
│                                                                  │
│  Note: When Firebase Admin SDK is configured, these can         │
│  perform server-side operations (bulk imports, etc)             │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Signup Flow
```
User Form
   ↓
useSignUp() hook
   ↓
auth.service.ts → signUp()
   ├─ Firebase Auth: createUserWithEmailAndPassword()
   ├─ Firestore: Create user document with role, company, etc.
   └─ Return: User object with ID, email, role
   ↓
Auto-redirect to dashboard
   ↓
TanStack Query caches user data
   ↓
useCurrentUser() provides cached data to components
```

### Signin Flow
```
Login Form
   ↓
useSignIn() hook
   ↓
auth.service.ts → signIn()
   ├─ Firebase Auth: signInWithEmailAndPassword()
   ├─ Firestore: Fetch user document
   └─ Return: User object with profile
   ↓
Auto-redirect to role-based dashboard
   ↓
TanStack Query caches user data
   ↓
useCurrentUser() provides cached data to components
```

### Page Protection Flow
```
Component Mounts
   ↓
useRequireAuth() / useRequireRole()
   ↓
Check TanStack Query cache for user
   ├─ If authenticated: Show component ✅
   └─ If not authenticated: Redirect to /login ❌
   ↓
If role mismatch: Redirect to appropriate dashboard
```

## Component Architecture

```
App Layout (RootLayout)
│
├─ QueryClientProvider (TanStack Query)
│
├─ Auth Context (if using context)
│
└─ Routes
   ├─ /login
   │  └─ LoginForm → useSignIn()
   │
   ├─ /signup
   │  └─ SignupForm → useSignUp()
   │
   ├─ /dashboard/admin
   │  └─ AdminDashboard ← useRequireRole(['admin'])
   │
   ├─ /dashboard/manager
   │  └─ ManagerDashboard ← useRequireRole(['manager', 'admin'])
   │
   ├─ /dashboard/driver
   │  └─ DriverDashboard ← useRequireRole(['driver'])
   │
   └─ /profile
      └─ ProfilePage ← useRequireAuth()
```

## State Management

### TanStack Query Cache Keys
```
auth.keys = {
  all: ['auth']                                  // Top level
  - currentUser: () => ['auth', 'current-user'] // Active user
  - verify: () => ['auth', 'verify']            // Auth check
}
```

### Automatic Refetch Triggers
- Window focus (user switches back to app)
- Network reconnection
- Query stale time expiration
- Manual invalidation (after logout)
- Manual refetch calls

### Cache Lifecycle
```
1. User signs in
   → useSignIn() fetches and caches user
   → Cache duration: 5 minutes (default)
   
2. While in app
   → useCurrentUser() returns cached data
   → Background refetch on stale data
   
3. User navigates away and back
   → Auto-refetch if cache expired
   
4. User signs out
   → useSignOut() invalidates all auth cache
   → Redirects to /login
```

## File Dependencies

```
Components
  ↓
lib/hooks/use-auth.ts
  ├─ Depends: lib/services/auth.service.ts
  ├─ Depends: @tanstack/react-query
  └─ Depends: next/navigation
  
lib/services/auth.service.ts
  ├─ Depends: lib/firebase/config.ts
  ├─ Depends: firebase/auth
  ├─ Depends: firebase/firestore
  └─ Depends: @/types
  
lib/firebase/config.ts
  ├─ Depends: firebase/app
  ├─ Depends: firebase/auth
  ├─ Depends: firebase/firestore
  ├─ Depends: firebase/storage
  └─ Depends: environment variables

lib/firebase/admin.ts (⏳ PLACEHOLDER)
  └─ To be configured when needed

lib/middleware/auth.middleware.ts
  ├─ Depends: next/server
  └─ Depends: @/types
  
app/api/auth/* routes
  ├─ Depends: lib/services/auth.service.ts
  ├─ Depends: next/server
  └─ Depends: @/types
```

## Environment Requirements

### Required (Current)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Optional (Deferred)
- `FIREBASE_ADMIN_PROJECT_ID` (Admin SDK)
- `FIREBASE_ADMIN_CLIENT_EMAIL` (Admin SDK)
- `FIREBASE_ADMIN_PRIVATE_KEY` (Admin SDK)

## Current Limitations & Notes

### ✅ Working
- Client-side signup with validation
- Email/password authentication
- User profile creation in Firestore
- Session management via Firebase Auth
- TanStack Query integration
- Frontend route protection
- Password reset emails

### ⚠️ Development Mode (Temp)
- Firestore rules: allow all (needs proper rules)
- Storage rules: allow authenticated users only
- No server-side user creation (admin SDK deferred)
- No rate limiting on auth endpoints
- No email verification on signup

### ⏳ Not Yet Implemented
- Two-factor authentication
- Social authentication (Google, GitHub)
- Server-side bulk operations
- Rate limiting
- Advanced audit logging
- Account recovery flows
- Session timeout

## Migration Path

When ready to implement Firebase Admin SDK:

1. Set environment variables for admin credentials
2. Uncomment initialization in `lib/firebase/admin.ts`
3. Implement functions in `lib/services/auth.admin.service.ts`
4. Update API routes to use admin service where needed
5. Implement proper security rules in `firestore.rules`
6. Configure storage rules in `storage.rules`
7. Update middleware to use full token verification

See `SIMPLIFIED_AUTH_SETUP.md` for detailed migration instructions.

---

**Status**: Authentication backend is ✅ **fully functional** for client-side operations.
Ready for frontend component development.
