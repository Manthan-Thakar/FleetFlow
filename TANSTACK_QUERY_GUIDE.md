# TanStack Query Integration Guide for FleetFlow

This guide explains how to use TanStack Query (React Query) with Firebase in the FleetFlow project.

## 📋 Overview

FleetFlow uses **TanStack Query v5** as the primary data fetching and state management solution for all Firebase interactions. This provides:

- ✅ Automatic caching and cache invalidation
- ✅ Built-in loading and error states
- ✅ Optimistic updates support
- ✅ Request deduplication
- ✅ Background refetching
- ✅ Real-time data synchronization with Firestore
- ✅ Significantly reduced boilerplate code

## 🏗️ Architecture Pattern

### Two-Layer Architecture

```
Component
    ↓
TanStack Query Hook (lib/hooks/)
    ↓
Service Layer (lib/services/)
    ↓
Firebase SDK
```

### Directory Structure

```
lib/
├── services/                    # Firebase service layer (pure functions)
│   ├── vehicle.service.ts      # CRUD operations for vehicles
│   ├── driver.service.ts       # CRUD operations for drivers
│   ├── order.service.ts        # CRUD operations for orders
│   ├── route.service.ts        # CRUD operations for routes
│   └── maintenance.service.ts  # CRUD operations for maintenance
│
└── hooks/                       # TanStack Query hooks
    ├── use-vehicles.ts         # Vehicle queries and mutations
    ├── use-drivers.ts          # Driver queries and mutations
    ├── use-orders.ts           # Order queries and mutations
    ├── use-routes.ts           # Route queries and mutations
    ├── use-maintenance.ts      # Maintenance queries and mutations
    ├── use-auth.ts             # Authentication hooks
    └── use-realtime-collection.ts  # Generic realtime hook
```

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Configure QueryClient Provider

```typescript
// app/layout.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        cacheTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

## 📝 Implementation Patterns

### Pattern 1: Service Layer (Pure Functions)

Create pure Firebase functions without React dependencies:

```typescript
// lib/services/vehicle.service.ts
import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Vehicle, VehicleFilters, CreateVehicleInput } from '@/types/vehicle.types';

export async function getVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
  let q = query(collection(db, 'vehicles'));
  
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters?.type) {
    q = query(q, where('type', '==', filters.type));
  }
  
  q = query(q, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Vehicle[];
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  const docRef = doc(db, 'vehicles', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Vehicle not found');
  }
  
  return { id: docSnap.id, ...docSnap.data() } as Vehicle;
}

export async function createVehicle(data: CreateVehicleInput): Promise<string> {
  const docRef = await addDoc(collection(db, 'vehicles'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
  const docRef = doc(db, 'vehicles', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteVehicle(id: string): Promise<void> {
  await deleteDoc(doc(db, 'vehicles', id));
}
```

### Pattern 2: Query Keys Factory

Define query keys using a factory pattern for consistency:

```typescript
// lib/hooks/use-vehicles.ts
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (filters: VehicleFilters) => [...vehicleKeys.lists(), filters] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
  realtime: (id: string) => [...vehicleKeys.detail(id), 'realtime'] as const,
};
```

### Pattern 3: Query Hooks

Wrap service functions with useQuery:

```typescript
// lib/hooks/use-vehicles.ts
import { useQuery } from '@tanstack/react-query';
import * as vehicleService from '@/lib/services/vehicle.service';
import { vehicleKeys } from './query-keys';

export function useVehicles(filters?: VehicleFilters) {
  return useQuery({
    queryKey: vehicleKeys.list(filters || {}),
    queryFn: () => vehicleService.getVehicles(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => vehicleService.getVehicleById(id),
    enabled: !!id, // Only run query if ID exists
  });
}
```

### Pattern 4: Mutation Hooks

Wrap service functions with useMutation and handle cache invalidation:

```typescript
// lib/hooks/use-vehicles.ts (continued)
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: vehicleService.createVehicle,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      toast.success('Vehicle created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create vehicle');
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) => 
      vehicleService.updateVehicle(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific detail and all lists
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      toast.success('Vehicle updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update vehicle');
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: vehicleService.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      toast.success('Vehicle deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete vehicle');
    },
  });
}
```

### Pattern 5: Optimistic Updates

Implement optimistic updates for better UX:

```typescript
export function useUpdateVehicleOptimistic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) => 
      vehicleService.updateVehicle(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: vehicleKeys.detail(id) });
      
      // Snapshot previous value
      const previousVehicle = queryClient.getQueryData(vehicleKeys.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(vehicleKeys.detail(id), (old: Vehicle) => ({
        ...old,
        ...data,
      }));
      
      return { previousVehicle };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousVehicle) {
        queryClient.setQueryData(
          vehicleKeys.detail(variables.id),
          context.previousVehicle
        );
      }
      toast.error('Failed to update vehicle');
    },
    
    // Always refetch after success or error
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.id) });
    },
  });
}
```

### Pattern 6: Real-time Subscriptions

Wrap Firestore onSnapshot in useQuery:

```typescript
// lib/hooks/use-realtime-vehicle.ts
import { useQuery } from '@tanstack/react-query';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Vehicle } from '@/types/vehicle.types';

export function useRealtimeVehicle(vehicleId: string) {
  return useQuery({
    queryKey: ['vehicles', vehicleId, 'realtime'],
    queryFn: () => {
      return new Promise<Vehicle>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          doc(db, 'vehicles', vehicleId),
          (snapshot) => {
            if (snapshot.exists()) {
              resolve({ id: snapshot.id, ...snapshot.data() } as Vehicle);
            } else {
              reject(new Error('Vehicle not found'));
            }
          },
          reject
        );
        
        // Cleanup handled by React Query
        return () => unsubscribe();
      });
    },
    staleTime: Infinity, // Keep subscription active
    cacheTime: 0,        // Clean up when component unmounts
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Generic realtime collection hook
export function useRealtimeCollection<T>(
  collectionName: string,
  queryKey: readonly unknown[],
  constraints: QueryConstraint[] = []
) {
  return useQuery({
    queryKey,
    queryFn: () => {
      return new Promise<T[]>((resolve, reject) => {
        const q = query(collection(db, collectionName), ...constraints);
        
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as T[];
            resolve(items);
          },
          reject
        );
        
        return () => unsubscribe();
      });
    },
    staleTime: Infinity,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
```

### Pattern 7: Infinite Queries (Pagination)

Implement infinite scroll with useInfiniteQuery:

```typescript
// lib/hooks/use-orders-infinite.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter,
  getDocs 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const ORDERS_PER_PAGE = 20;

export function useOrdersInfinite(filters?: { status?: string }) {
  return useInfiniteQuery({
    queryKey: ['orders', 'infinite', filters],
    queryFn: async ({ pageParam = null }) => {
      const constraints = [
        orderBy('createdAt', 'desc'),
        limit(ORDERS_PER_PAGE)
      ];
      
      if (pageParam) {
        constraints.push(startAfter(pageParam));
      }
      
      const q = query(collection(db, 'orders'), ...constraints);
      const snapshot = await getDocs(q);
      
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      return {
        orders,
        nextCursor: lastDoc,
        hasMore: snapshot.docs.length === ORDERS_PER_PAGE,
      };
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}
```

## 💡 Usage in Components

### Basic Query

```typescript
function VehiclesPage() {
  const { data: vehicles, isLoading, error } = useVehicles({ status: 'active' });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {vehicles?.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
```

### Mutations

```typescript
function CreateVehicleForm() {
  const createMutation = useCreateVehicle();
  
  const handleSubmit = (data: CreateVehicleInput) => {
    createMutation.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button 
        type="submit" 
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating...' : 'Create Vehicle'}
      </button>
    </form>
  );
}
```

### Real-time Tracking

```typescript
function VehicleTracker({ vehicleId }: { vehicleId: string }) {
  const { data: vehicle, isLoading } = useRealtimeVehicle(vehicleId);
  
  if (isLoading) return <LoadingSpinner />;
  if (!vehicle?.location) return <div>No location data</div>;
  
  return (
    <GoogleMap
      center={{
        lat: vehicle.location.latitude,
        lng: vehicle.location.longitude,
      }}
      zoom={15}
    >
      <Marker position={vehicle.location} />
    </GoogleMap>
  );
}
```

### Infinite Scroll

```typescript
function OrdersList() {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useOrdersInfinite({ status: 'pending' });
  
  const orders = data?.pages.flatMap(page => page.orders) ?? [];
  
  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## 🎯 Best Practices

### ✅ DO

1. **Use query key factories** for consistent keys
2. **Separate service layer** from React hooks
3. **Invalidate queries** after mutations
4. **Use optimistic updates** for better UX
5. **Handle loading and error states** appropriately
6. **Use TypeScript** for type safety
7. **Configure staleTime** based on data freshness needs
8. **Use React Query DevTools** during development

### ❌ DON'T

1. **Don't call services directly** from components
2. **Don't use inline query keys** - use factories
3. **Don't forget to handle errors**
4. **Don't over-fetch** - use pagination for large lists
5. **Don't ignore cache invalidation** after mutations
6. **Don't mix useState with TanStack Query** for server data
7. **Don't use useEffect** for data fetching - use useQuery

## 📚 Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Firebase with React Query](https://tkdodo.eu/blog/using-web-sockets-with-react-query)

## 🔗 Related Files

- `app/layout.tsx` - QueryClient provider setup
- `lib/services/*.service.ts` - Firebase service functions
- `lib/hooks/use-*.ts` - TanStack Query hooks
- `types/*.types.ts` - TypeScript type definitions
