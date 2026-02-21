# FleetFlow Project Setup Guide

This guide will help you set up the FleetFlow project on your local machine or for deployment.

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Git**
- **Firebase CLI** (`npm install -g firebase-tools`)
- **VS Code** (recommended) with these extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Firebase Explorer

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fleetflow
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Firebase Project

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "fleetflow-dev")
4. Enable Google Analytics (optional)
5. Create project

#### Enable Firebase Services

1. **Authentication**
   - Go to Authentication > Get started
   - Enable "Email/Password" sign-in method

2. **Firestore Database**
   - Go to Firestore Database > Create database
   - Start in production mode
   - Choose a location near your users

3. **Storage**
   - Go to Storage > Get started
   - Start in production mode

4. **Functions** (optional for now)
   - Will be set up later when deploying Cloud Functions

#### Get Firebase Configuration

1. Go to Project Settings > General
2. Scroll down to "Your apps"
3. Click "Add app" > Web app
4. Register app with nickname (e.g., "FleetFlow Web")
5. Copy the configuration object

### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.local.example .env.local
```

Edit `.env.local` and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Firebase Admin SDK (for API routes)

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Add to `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### 5. Initialize Firebase in Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase (select existing project)
firebase init

# Select these features:
# - Firestore
# - Storage
# - Functions (optional)
# - Hosting (if deploying to Firebase Hosting)

# When prompted:
# - Use existing project: Select your project
# - Firestore rules: Use firestore.rules
# - Firestore indexes: Use firestore.indexes.json
# - Storage rules: Use storage.rules
```

### 6. Deploy Firestore Security Rules and Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

### 7. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Development Workflow

### Using Firebase Emulators (Recommended for Development)

Firebase Emulators allow you to develop locally without affecting production data.

```bash
# Start emulators
npm run firebase:emulators

# Or manually
firebase emulators:start
```

Update `.env.local` to use emulators:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080
NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

### Available Scripts

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint errors
npm run format                # Format with Prettier
npm run type-check            # TypeScript type checking

# Firebase
npm run firebase:emulators    # Start Firebase emulators
npm run firebase:deploy       # Deploy everything
npm run firebase:deploy:functions  # Deploy functions only
npm run firebase:deploy:rules     # Deploy security rules only
```

## 📊 Setting Up Initial Data

### Create First Admin User

1. Run the development server
2. Go to Firebase Console > Authentication
3. Manually add a user with your email
4. Go to Firestore Database
5. Create a document in the `users` collection:

```json
{
  "email": "admin@example.com",
  "displayName": "Admin User",
  "role": "admin",
  "status": "active",
  "companyId": "company_001",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

Use the UID from Authentication as the document ID.

### Seed Demo Data (Optional)

You can create a seed script or manually add demo data for:
- Vehicles
- Drivers
- Orders
- Routes

## 🎨 Setting Up Google Maps (Optional)

If you want to use map features:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. Create credentials > API Key
5. Add to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect via Vercel Dashboard
# 1. Go to vercel.com
# 2. Import your Git repository
# 3. Add environment variables
# 4. Deploy
```

### Deploy to Firebase Hosting

```bash
# Build the app
npm run build

# Deploy
firebase deploy --only hosting
```

## 🔐 Security Checklist

Before going to production:

- [ ] Review and update Firestore security rules
- [ ] Review and update Storage security rules
- [ ] Set up Firebase App Check
- [ ] Enable reCAPTCHA for authentication
- [ ] Set up proper CORS policies
- [ ] Configure allowed domains in Firebase Console
- [ ] Set up monitoring and alerts
- [ ] Enable Firebase Authentication email templates customization
- [ ] Set up backup rules for Firestore
- [ ] Review and limit API keys to specific domains/IPs

## 📚 Additional Resources

- [FleetFlow README](./README.md) - Complete project documentation
- [TanStack Query Guide](./TANSTACK_QUERY_GUIDE.md) - Data fetching patterns
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

## 🐛 Common Issues

### "Firebase configuration is missing"

Make sure `.env.local` exists and has all required Firebase configuration variables.

### "Permission denied" errors

Deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

### Module not found errors

Clear cache and reinstall:
```bash
rm -rf .next node_modules
npm install
```

### Firebase emulators not starting

Make sure ports 4000, 8080, 9099, 9199 are not in use.

## 💬 Support

For issues and questions:
- Check the [README.md](./README.md)
- Review [closed issues](https://github.com/your-repo/issues?q=is%3Aissue+is%3Aclosed)
- Create a new issue with:
  - Clear description
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details

---

Happy coding! 🚀
