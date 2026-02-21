# FleetFlow: Fleet & Logistics Management System

A comprehensive, modern fleet and logistics management system built with **Next.js 15** and **Firebase**. FleetFlow provides vehicle management, route optimization, order tracking, driver management, and real-time analytics for transportation and logistics operations.

---

## 🚀 Features

### Core Modules

**Fleet Management**
- Vehicle inventory and real-time status tracking
- Maintenance scheduling and cost management
- Fuel consumption monitoring and efficiency tracking
- Vehicle location and availability management

**Driver Management**
- Driver profiles and credential tracking
- Performance metrics and analytics
- Shift scheduling and assignment
- Driver availability status

**Route Planning & Orders**
- Intelligent route planning and optimization
- Order and shipment management
- Real-time delivery tracking
- Proof of delivery and customer notifications

**Analytics & Reporting**
- Fleet performance dashboards
- Fuel efficiency reports
- Cost analysis and budgeting
- Driver performance metrics
- Custom report generation with real Firebase data

**Maintenance Management**
- Preventive maintenance scheduling
- Service provider and cost tracking
- Maintenance history and reminders
- Vehicle downtime management

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons

**Backend & Services:**
- Firebase Authentication
- Cloud Firestore (real-time database)
- Firebase Storage
- Cloud Functions (serverless)

**State & Data Management:**
- React Hooks (useState, useEffect, useCallback)
- Firebase Hooks (useAuth, useOrders, useMaintenance, useAnalytics)
- React Context API for global state

**Utilities:**
- React Hook Form for form handling
- Zod for validation
- shadcn/ui components
- Google Maps integration

---

## 🏗️ Project Architecture

```
Frontend (Next.js 15)
    ↓
React Hooks & Firebase Hooks
    ↓
Service Layer (Firebase Services)
    ↓
Cloud Firestore (Real-time Database)
    ↓
Real-time Updates → UI Update
```

**Key Architectural Decisions:**
- **Firebase Hooks**: Custom React hooks for state management (`useAuth`, `useOrders`, `useMaintenance`, `useAnalytics`)
- **Service Layer**: Centralized business logic (`orders.service.ts`, `maintenance.service.ts`, `analytics.service.ts`)
- **Data Cleaning**: `cleanData()` utility to prevent undefined values in Firestore
- **Real-time Sync**: Automatic synchronization with Firestore listeners
- **Type Safety**: Full TypeScript implementation with strict types

---

## 📁 Project Structure

```
fleetflow/
├── app/                              # Next.js App Router
│   ├── (auth)/                      # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   │
│   ├── (dashboard)/                 # Protected dashboard routes
│   │   ├── dashboard/               # Main dashboard
│   │   ├── fleet/                   # Vehicle management
│   │   ├── drivers/                 # Driver management
│   │   ├── orders/                  # Order management
│   │   ├── deliveries/              # Delivery tracking
│   │   ├── maintenance/             # Maintenance tracking
│   │   ├── analytics/               # Analytics dashboard
│   │   ├── reports/                 # Report generation
│   │   ├── routes/                  # Route planning
│   │   ├── schedule/                # Schedule management
│   │   ├── my-routes/               # Driver routes
│   │   ├── my-vehicle/              # Driver vehicle
│   │   ├── track-shipment/          # Shipment tracking
│   │   ├── users/                   # User management
│   │   ├── settings/                # App settings
│   │   └── layout.tsx               # Dashboard layout
│   │
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   └── globals.css                  # Global styles
│
├── firebase/                         # Firebase configuration & services
│   ├── config/
│   │   └── firebaseConfig.ts        # Firebase initialization
│   ├── context/
│   │   └── auth-context.tsx         # Auth context
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts               # Authentication
│   │   ├── useOrders.ts             # Order management
│   │   ├── useMaintenance.ts        # Maintenance management
│   │   ├── useAnalytics.ts          # Analytics data
│   │   ├── useDriver.ts             # Driver data
│   │   ├── useUser.ts               # User data
│   │   ├── useCompany.ts            # Company data
│   │   └── usePerformance.ts        # Performance data
│   └── services/                     # Firebase service layer
│       ├── auth.service.ts
│       ├── orders.service.ts
│       ├── maintenance.service.ts
│       ├── analytics.service.ts
│       ├── drivers.service.ts
│       ├── CompanyService.ts
│       ├── UserService.ts
│       └── invite.service.ts
│
├── components/                       # Reusable React components
│   ├── ui/                          # UI components
│   ├── layout/                      # Layout components
│   ├── auth/                        # Auth components
│   ├── charts/                      # Chart components
│   ├── forms/                       # Form components
│   ├── maps/                        # Map components
│   ├── tables/                      # Table components
│   └── shared/                      # Shared components
│
├── types/                            # TypeScript type definitions
│   └── index.ts                     # All type exports
│
├── public/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── firebase.json                     # Firebase configuration
├── firestore.rules                   # Firestore security rules
├── firestore.indexes.json            # Composite indexes
├── storage.rules                     # Storage security rules
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies
```

---

## 💻 Installation & Setup

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Firebase Project ([create one here](https://console.firebase.google.com/))
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fleetflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create `.env.local` with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploy Firestore**
   ```bash
   firebase login
   firebase deploy --only firestore:indexes firestore:rules storage
   ```

---

## 🚀 Running the Application

### Development
```bash
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
npm run build
npm run start
```

### Other Commands
```bash
npm run lint          # Run ESLint
npm run format        # Format with Prettier
npm run type-check    # TypeScript checking
```

---

## 📋 Implementation Summary

### Dashboard Pages Status
- ✅ **Fleet Management** - Vehicle CRUD, tracking, status
- ✅ **Driver Management** - Profile, credentials, performance
- ✅ **Orders** - Order creation, status tracking, analytics
- ✅ **Deliveries** - Real-time delivery tracking from Firebase
- ✅ **Maintenance** - Maintenance logs, scheduling, cost tracking
- ✅ **Analytics** - Fleet metrics, fuel efficiency, cost analysis
- ✅ **Reports** - Dynamic report generation from live data
- ✅ **Route Planning** - Route creation, optimization
- ✅ **My Routes** - Driver personal routes
- ✅ **My Vehicle** - Driver assigned vehicle
- 🔄 **Schedule** - Schedule management (in progress)
- 🔄 **Users** - User management (in progress)
- ✅ **Settings** - App configuration

### Firebase Integration
- ✅ Authentication & Authorization
- ✅ Real-time data synchronization
- ✅ Cloud Firestore CRUD operations
- ✅ Data validation & sanitization
- ✅ Custom hooks for state management
- ✅ Service layer for business logic
- ✅ Analytics aggregation functions
- ✅ Security rules for access control

---

## 🔒 Data Integrity

All Firebase operations use the `cleanData()` utility to prevent `undefined` values:
```typescript
const cleanedData = cleanData(data);
await setDoc(docRef, cleanedData);
```

This ensures:
- No `undefined` values in Firestore
- Validation errors prevented
- Data consistency maintained
- Type safety enforced

---

## 📞 Contact & Support

For issues or questions, please create a GitHub issue or contact the development team.
