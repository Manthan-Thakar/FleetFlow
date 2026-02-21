// types/index.ts
import { Timestamp } from 'firebase/firestore';

// ===== Common Types =====

export interface BaseDocument {
  id: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface CompanyDocument extends BaseDocument {
  companyId: string;
}

// ===== Company Types =====

export interface Company extends BaseDocument {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  email: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  logo?: string;
  description?: string;
  industry?: string;
  adminUserId: string; // Reference to the admin user who created the company
}

// ===== User Types =====

export type UserRole = 'admin' | 'manager' | 'driver' | 'customer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User extends BaseDocument {
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  phoneNumber?: string;
  photoURL?: string;
  companyId: string;
  isProfileComplete: boolean;
  lastLoginAt?: Timestamp | Date;
}

// ===== Vehicle Types =====

export type VehicleType = 'truck' | 'van' | 'car' | 'bike';
export type VehicleStatus = 'active' | 'maintenance' | 'inactive' | 'retired';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';
export type OwnershipType = 'owned' | 'leased';

export interface VehicleLocation {
  latitude: number;
  longitude: number;
  lastUpdated: Timestamp | Date;
  address?: string;
}

export interface VehicleCapacity {
  weight: number; // in kg
  volume?: number; // in cubic meters
  passengers?: number;
}

export interface VehicleInsurance {
  provider: string;
  policyNumber: string;
  expiryDate: Timestamp | Date;
}

export interface Vehicle extends CompanyDocument {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  capacity: VehicleCapacity;
  status: VehicleStatus;
  location?: VehicleLocation;
  assignedDriverId?: string;
  fuelType: FuelType;
  fuelEfficiency?: number; // km per liter
  insurance: VehicleInsurance;
  ownership: OwnershipType;
  documents?: {
    registration?: string;
    insurance?: string;
    roadworthiness?: string;
  };
}

export interface VehicleFilters {
  status?: VehicleStatus;
  type?: VehicleType;
  companyId?: string;
  assignedDriverId?: string;
}

export type CreateVehicleInput = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;

// ===== Driver Types =====

export type DriverStatus = 'available' | 'on-trip' | 'off-duty' | 'inactive';

export interface DriverRatings {
  average: number; // 0-5 stars
  totalReviews: number;
  onTimeDelivery: number; // percentage
}

export interface DriverPerformanceMetrics {
  totalTrips: number;
  totalDistance: number; // in km
  totalHours: number;
  incidents: number;
}

export interface Driver extends CompanyDocument {
  userId: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: Timestamp | Date;
  phoneNumber: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: DriverStatus;
  currentVehicleId?: string;
  currentLocation?: VehicleLocation;
  ratings: DriverRatings;
  documents?: {
    license?: string;
    medicalCertificate?: string;
    backgroundCheck?: string;
  };
  performanceMetrics: DriverPerformanceMetrics;
}

// ===== Order Types =====

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'picked-up'
  | 'in-transit'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface OrderLocation {
  address: string;
  latitude: number;
  longitude: number;
  contactPerson?: string;
  contactPhone?: string;
  instructions?: string;
}

export interface OrderItem {
  name: string;
  description?: string;
  quantity: number;
  weight?: number; // in kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  value?: number;
  sku?: string;
}

export interface ProofOfDelivery {
  signature?: string; // Storage URL
  photo?: string; // Storage URL
  notes?: string;
  timestamp: Timestamp | Date;
  receiverName?: string;
}

export interface OrderTracking {
  status: string;
  timestamp: Timestamp | Date;
  location?: { latitude: number; longitude: number };
  notes?: string;
  updatedBy: string;
}

export interface OrderPricing {
  basePrice: number;
  distanceFee?: number;
  urgencyFee?: number;
  totalPrice: number;
  currency: string;
}

export interface Order extends CompanyDocument {
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupLocation: OrderLocation;
  deliveryLocation: OrderLocation;
  items: OrderItem[];
  totalWeight: number;
  totalValue: number;
  status: OrderStatus;
  priority: OrderPriority;
  scheduledPickupTime?: Timestamp | Date;
  scheduledDeliveryTime?: Timestamp | Date;
  actualPickupTime?: Timestamp | Date;
  actualDeliveryTime?: Timestamp | Date;
  assignedRouteId?: string;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  proofOfDelivery?: ProofOfDelivery;
  tracking: OrderTracking[];
  pricing: OrderPricing;
  paymentStatus: PaymentStatus;
  specialInstructions?: string;
}

// ===== Route Types =====

export type RouteStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';

export interface RouteLocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

export interface RouteWaypoint extends RouteLocation {
  sequenceNumber: number;
  stopDuration?: number; // in minutes
}

export interface Route extends CompanyDocument {
  name: string;
  origin: RouteLocation;
  destination: RouteLocation;
  waypoints?: RouteWaypoint[];
  distance: number; // in km
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  status: RouteStatus;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  scheduledStartTime: Timestamp | Date;
  actualStartTime?: Timestamp | Date;
  actualEndTime?: Timestamp | Date;
  orders: string[]; // Array of order IDs
  polyline?: string; // Encoded route path
  optimized: boolean;
  traffic?: {
    conditions?: string;
    delayMinutes?: number;
  };
}

// ===== Maintenance Types =====

export type MaintenanceType = 'routine' | 'repair' | 'inspection' | 'breakdown';
export type MaintenanceCategory = 'engine' | 'brakes' | 'tires' | 'electrical' | 'body' | 'other';
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

export interface MaintenanceCost {
  labor: number;
  parts: number;
  total: number;
  currency: string;
}

export interface MaintenancePart {
  name: string;
  partNumber?: string;
  quantity: number;
  cost: number;
}

export interface Maintenance extends CompanyDocument {
  vehicleId: string;
  type: MaintenanceType;
  category: MaintenanceCategory;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  scheduledDate: Timestamp | Date;
  completedDate?: Timestamp | Date;
  serviceProvider: {
    name: string;
    contact?: string;
    location?: string;
  };
  cost: MaintenanceCost;
  parts?: MaintenancePart[];
  mileage: number;
  nextServiceDue?: {
    date?: Timestamp | Date;
    mileage?: number;
  };
  documents?: string[]; // Storage URLs
  notes?: string;
  performedBy?: string;
}

// ===== Notification Types =====

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationCategory = 'order' | 'vehicle' | 'driver' | 'maintenance' | 'system';

export interface Notification extends BaseDocument {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  readAt?: Timestamp | Date;
  expiresAt?: Timestamp | Date;
}

// ===== API Response Types =====

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
