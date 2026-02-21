# FleetFlow API Documentation

## Overview
This document provides comprehensive API documentation for the FleetFlow system, including all endpoints, request/response formats, authentication, and error handling.

---

## Base URL

```
Development: http://localhost:3000/api
Production:  https://fleetflow.app/api
```

---

## Authentication

### Authentication Methods

All API requests (except authentication endpoints) require authentication using JWT Bearer tokens.

```http
Authorization: Bearer <access_token>
```

### Token Lifecycle
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration

---

## 1. Authentication Endpoints

### 1.1 Register User

Create a new user account and organization.

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "SecureP@ss123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "organizationName": "ABC Logistics",
  "industry": "Logistics"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "admin@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "organization_id": "org-uuid"
    },
    "organization": {
      "id": "org-uuid",
      "name": "ABC Logistics"
    },
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc...",
      "expires_at": "2024-02-21T11:00:00Z"
    }
  },
  "message": "Registration successful. Please verify your email."
}
```

---

### 1.2 Login

Authenticate user and receive access tokens.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "SecureP@ss123"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "admin@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "organization": {
        "id": "org-uuid",
        "name": "ABC Logistics"
      }
    },
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc...",
      "expires_at": "2024-02-21T11:00:00Z"
    }
  }
}
```

**Error Response: 401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

### 1.3 Refresh Token

Get a new access token using refresh token.

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "expires_at": "2024-02-21T11:00:00Z"
  }
}
```

---

### 1.4 Logout

Invalidate current session.

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.5 Password Reset Request

```http
POST /api/auth/password-reset/request
Content-Type: application/json

{
  "email": "admin@company.com"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### 1.6 Password Reset Confirm

```http
POST /api/auth/password-reset/confirm
Content-Type: application/json

{
  "token": "reset-token",
  "password": "NewSecureP@ss123"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 2. Vehicle Endpoints

### 2.1 List Vehicles

Get all vehicles with filtering and pagination.

```http
GET /api/vehicles?page=1&limit=20&status=active&vehicle_type=truck
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20, max: 100): Items per page
- `status` (string): Filter by status (active, maintenance, inactive, retired)
- `vehicle_type` (string): Filter by type
- `search` (string): Search by vehicle number, plate, or VIN
- `sort` (string): Sort field (vehicle_number, make, year, status)
- `order` (string): Sort order (asc, desc)

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "vehicle-uuid",
        "vehicle_number": "VEH-001",
        "license_plate": "ABC-1234",
        "make": "Toyota",
        "model": "Camry",
        "year": 2023,
        "vehicle_type": "sedan",
        "fuel_type": "gasoline",
        "status": "active",
        "current_mileage": 15000,
        "next_service_mileage": 20000,
        "image_urls": ["https://..."],
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

---

### 2.2 Get Vehicle by ID

```http
GET /api/vehicles/{vehicle_id}
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "vehicle-uuid",
    "vehicle_number": "VEH-001",
    "license_plate": "ABC-1234",
    "vin": "1HGBH41JXMN109186",
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "color": "Silver",
    "vehicle_type": "sedan",
    "fuel_type": "gasoline",
    "transmission": "automatic",
    "engine_capacity": 2.5,
    "seating_capacity": 5,
    "purchase_date": "2023-01-15",
    "purchase_price": 25000.00,
    "current_mileage": 15000,
    "last_service_mileage": 14000,
    "next_service_mileage": 20000,
    "status": "active",
    "current_location": {
      "lat": 37.7749,
      "lng": -122.4194,
      "address": "123 Main St, San Francisco, CA"
    },
    "gps_device_id": "GPS-001",
    "insurance_policy_number": "INS-12345",
    "insurance_expiry": "2024-12-31",
    "registration_expiry": "2024-12-31",
    "average_fuel_consumption": 8.5,
    "image_urls": ["https://..."],
    "documents": [
      {
        "id": "doc-uuid",
        "document_type": "registration",
        "document_name": "Vehicle Registration",
        "expiry_date": "2024-12-31",
        "file_url": "https://..."
      }
    ],
    "maintenance_schedules": [
      {
        "id": "schedule-uuid",
        "service_category": "Oil Change",
        "next_service_date": "2024-03-01",
        "next_service_mileage": 20000
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-02-20T00:00:00Z"
  }
}
```

---

### 2.3 Create Vehicle

```http
POST /api/vehicles
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicle_number": "VEH-002",
  "license_plate": "XYZ-5678",
  "vin": "1HGBH41JXMN109187",
  "make": "Ford",
  "model": "F-150",
  "year": 2023,
  "color": "Blue",
  "vehicle_type": "truck",
  "fuel_type": "diesel",
  "transmission": "automatic",
  "engine_capacity": 3.5,
  "seating_capacity": 5,
  "cargo_capacity": 1500,
  "purchase_date": "2023-06-01",
  "purchase_price": 45000.00,
  "current_mileage": 5000,
  "insurance_policy_number": "INS-67890",
  "insurance_expiry": "2024-12-31",
  "registration_expiry": "2024-12-31",
  "gps_device_id": "GPS-002",
  "notes": "Company delivery truck",
  "images": ["base64_image_data..."]
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "vehicle-uuid",
    "vehicle_number": "VEH-002",
    ...
  },
  "message": "Vehicle created successfully"
}
```

---

### 2.4 Update Vehicle

```http
PATCH /api/vehicles/{vehicle_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "maintenance",
  "current_mileage": 15234,
  "notes": "Scheduled for oil change"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "vehicle-uuid",
    ...
  },
  "message": "Vehicle updated successfully"
}
```

---

### 2.5 Delete Vehicle (Soft Delete)

```http
DELETE /api/vehicles/{vehicle_id}
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

---

### 2.6 Get Vehicle Statistics

```http
GET /api/vehicles/{vehicle_id}/stats?period=30d
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "total_trips": 45,
    "total_distance": 2500.5,
    "total_fuel_cost": 850.00,
    "total_maintenance_cost": 450.00,
    "average_fuel_efficiency": 8.2,
    "utilization_rate": 75.5,
    "downtime_hours": 24,
    "charts": {
      "distance_by_day": [...],
      "fuel_consumption": [...]
    }
  }
}
```

---

## 3. Driver Endpoints

### 3.1 List Drivers

```http
GET /api/drivers?page=1&limit=20&status=active
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "drivers": [
      {
        "id": "driver-uuid",
        "employee_id": "EMP-001",
        "firstName": "Mike",
        "lastName": "Johnson",
        "email": "mike@company.com",
        "phone": "+1234567890",
        "license_number": "DL123456",
        "license_expiry_date": "2026-12-31",
        "employment_status": "active",
        "rating": 4.8,
        "total_trips": 150,
        "total_distance": 12000,
        "profile_image_url": "https://...",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "total_pages": 2
    }
  }
}
```

---

### 3.2 Get Driver by ID

```http
GET /api/drivers/{driver_id}
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "driver-uuid",
    "employee_id": "EMP-001",
    "firstName": "Mike",
    "lastName": "Johnson",
    "email": "mike@company.com",
    "phone": "+1234567890",
    "date_of_birth": "1985-05-15",
    "license_number": "DL123456",
    "license_type": "Commercial",
    "license_issue_date": "2020-01-01",
    "license_expiry_date": "2026-12-31",
    "address": {
      "line1": "123 Driver St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94102"
    },
    "emergency_contact": {
      "name": "Jane Johnson",
      "phone": "+0987654321",
      "relation": "Spouse"
    },
    "hire_date": "2023-01-15",
    "employment_status": "active",
    "hourly_rate": 25.00,
    "rating": 4.8,
    "total_trips": 150,
    "total_distance": 12000,
    "profile_image_url": "https://...",
    "documents": [...],
    "recent_trips": [...]
  }
}
```

---

### 3.3 Create Driver

```http
POST /api/drivers
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "employee_id": "EMP-002",
  "firstName": "Sarah",
  "lastName": "Williams",
  "email": "sarah@company.com",
  "phone": "+1234567891",
  "date_of_birth": "1990-08-20",
  "license_number": "DL654321",
  "license_type": "Commercial",
  "license_issue_date": "2019-01-01",
  "license_expiry_date": "2025-12-31",
  "hire_date": "2024-02-01",
  "hourly_rate": 22.50,
  "address_line1": "456 Oak Ave",
  "city": "San Francisco",
  "state": "CA",
  "postal_code": "94103"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "driver-uuid",
    ...
  },
  "message": "Driver created successfully"
}
```

---

### 3.4 Get Driver Performance

```http
GET /api/drivers/{driver_id}/performance?period=30d
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_trips": 45,
      "completed_trips": 43,
      "cancelled_trips": 2,
      "total_distance": 2800,
      "average_rating": 4.8,
      "on_time_delivery_rate": 95.5,
      "incidents": 0
    },
    "metrics": {
      "fuel_efficiency": 8.5,
      "average_trip_duration": 120,
      "trips_per_week": 11.25,
      "earnings": 2500.00
    },
    "charts": {
      "trips_by_day": [...],
      "ratings_trend": [...]
    }
  }
}
```

---

## 4. Trip Endpoints

### 4.1 List Trips

```http
GET /api/trips?page=1&limit=20&status=in_progress&driver_id=driver-uuid
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status
- `vehicle_id`: Filter by vehicle
- `driver_id`: Filter by driver
- `trip_type`: Filter by type
- `date_from`, `date_to`: Date range filter
- `search`: Search by trip number

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": "trip-uuid",
        "trip_number": "TRP-2024-0001",
        "vehicle": {
          "id": "vehicle-uuid",
          "vehicle_number": "VEH-001",
          "license_plate": "ABC-1234"
        },
        "driver": {
          "id": "driver-uuid",
          "firstName": "Mike",
          "lastName": "Johnson"
        },
        "trip_type": "delivery",
        "status": "in_progress",
        "priority": "high",
        "origin": {
          "address": "123 Warehouse St",
          "lat": 37.7749,
          "lng": -122.4194
        },
        "destination": {
          "address": "456 Customer Ave",
          "lat": 37.8044,
          "lng": -122.2712
        },
        "scheduled_start_time": "2024-02-21T14:00:00Z",
        "actual_start_time": "2024-02-21T14:05:00Z",
        "planned_distance": 25.5,
        "estimated_cost": 150.00,
        "created_at": "2024-02-21T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 4.2 Get Trip by ID

```http
GET /api/trips/{trip_id}
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "trip-uuid",
    "trip_number": "TRP-2024-0001",
    "vehicle": {...},
    "driver": {...},
    "trip_type": "delivery",
    "status": "in_progress",
    "priority": "high",
    "origin": {
      "name": "Main Warehouse",
      "address": "123 Warehouse St, City, State",
      "lat": 37.7749,
      "lng": -122.4194,
      "contact_name": "Warehouse Manager",
      "contact_phone": "+1234567890"
    },
    "destination": {
      "name": "ABC Corp",
      "address": "456 Customer Ave, City, State",
      "lat": 37.8044,
      "lng": -122.2712,
      "contact_name": "John Customer",
      "contact_phone": "+0987654321"
    },
    "waypoints": [
      {
        "id": "waypoint-uuid",
        "sequence_order": 1,
        "waypoint_type": "pickup",
        "address": "...",
        "lat": 37.7800,
        "lng": -122.4000,
        "status": "completed",
        "actual_arrival_time": "2024-02-21T14:30:00Z"
      }
    ],
    "scheduled_start_time": "2024-02-21T14:00:00Z",
    "scheduled_end_time": "2024-02-21T16:00:00Z",
    "actual_start_time": "2024-02-21T14:05:00Z",
    "estimated_duration": 120,
    "planned_distance": 25.5,
    "actual_distance": 26.2,
    "route_polyline": "encoded_polyline_string",
    "cargo_description": "Electronics package",
    "cargo_weight": 15.5,
    "estimated_cost": 150.00,
    "customer_price": 200.00,
    "payment_status": "pending",
    "instructions": "Handle with care - fragile items",
    "current_location": {
      "lat": 37.7900,
      "lng": -122.4100,
      "speed": 45.5,
      "heading": 270,
      "updated_at": "2024-02-21T15:00:00Z"
    },
    "tracking_history": [...],
    "created_by": {...},
    "created_at": "2024-02-21T10:00:00Z",
    "updated_at": "2024-02-21T15:00:00Z"
  }
}
```

---

### 4.3 Create Trip

```http
POST /api/trips
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "trip_type": "delivery",
  "priority": "high",
  "origin": {
    "name": "Main Warehouse",
    "address": "123 Warehouse St, City, State",
    "lat": 37.7749,
    "lng": -122.4194,
    "contact_name": "Warehouse Manager",
    "contact_phone": "+1234567890"
  },
  "destination": {
    "name": "ABC Corp",
    "address": "456 Customer Ave, City, State",
    "lat": 37.8044,
    "lng": -122.2712,
    "contact_name": "John Customer",
    "contact_phone": "+0987654321"
  },
  "waypoints": [
    {
      "sequence_order": 1,
      "waypoint_type": "pickup",
      "address": "789 Pickup St",
      "lat": 37.7800,
      "lng": -122.4000
    }
  ],
  "scheduled_start_time": "2024-02-22T09:00:00Z",
  "cargo_description": "Office supplies",
  "cargo_weight": 25.0,
  "customer_price": 175.00,
  "instructions": "Call on arrival"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "trip-uuid",
    "trip_number": "TRP-2024-0002",
    "planned_distance": 28.5,
    "estimated_duration": 135,
    "estimated_cost": 120.00,
    ...
  },
  "message": "Trip created successfully"
}
```

---

### 4.4 Assign Trip

```http
POST /api/trips/{trip_id}/assign
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicle_id": "vehicle-uuid",
  "driver_id": "driver-uuid"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "trip-uuid",
    "status": "scheduled",
    "vehicle": {...},
    "driver": {...}
  },
  "message": "Trip assigned successfully. Driver notified."
}
```

---

### 4.5 Update Trip Status

```http
PATCH /api/trips/{trip_id}/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "in_progress",
  "actual_start_time": "2024-02-21T14:05:00Z",
  "notes": "Started trip"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "trip-uuid",
    "status": "in_progress",
    ...
  },
  "message": "Trip status updated"
}
```

---

### 4.6 Complete Trip

```http
POST /api/trips/{trip_id}/complete
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "actual_end_time": "2024-02-21T16:30:00Z",
  "actual_distance": 26.2,
  "actual_cost": 155.00,
  "notes": "Delivered successfully",
  "proof_of_delivery": {
    "signature": "base64_signature_image",
    "photos": ["base64_image_1", "base64_image_2"]
  }
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "trip-uuid",
    "status": "completed",
    ...
  },
  "message": "Trip completed successfully"
}
```

---

### 4.7 Track Trip (Real-time Location)

```http
POST /api/trips/{trip_id}/track
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "lat": 37.7900,
  "lng": -122.4100,
  "speed": 45.5,
  "heading": 270,
  "accuracy": 10.5,
  "recorded_at": "2024-02-21T15:00:00Z"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Location updated"
}
```

---

### 4.8 Get Trip Tracking History

```http
GET /api/trips/{trip_id}/tracking
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "tracking_points": [
      {
        "lat": 37.7749,
        "lng": -122.4194,
        "speed": 0,
        "recorded_at": "2024-02-21T14:05:00Z"
      },
      {
        "lat": 37.7800,
        "lng": -122.4150,
        "speed": 35.5,
        "recorded_at": "2024-02-21T14:10:00Z"
      }
    ]
  }
}
```

---

## 5. Maintenance Endpoints

### 5.1 List Maintenance Records

```http
GET /api/maintenance/records?vehicle_id=vehicle-uuid&page=1&limit=20
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "record-uuid",
        "vehicle": {...},
        "maintenance_type": "routine",
        "service_category": "Oil Change",
        "description": "Full synthetic oil change",
        "service_date": "2024-02-15",
        "service_mileage": 15000,
        "provider_name": "ABC Auto Service",
        "parts_cost": 50.00,
        "labor_cost": 75.00,
        "total_cost": 125.00,
        "status": "completed",
        "created_at": "2024-02-10T00:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 5.2 Create Maintenance Record

```http
POST /api/maintenance/records
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicle_id": "vehicle-uuid",
  "maintenance_type": "routine",
  "service_category": "Tire Rotation",
  "description": "Rotated all four tires",
  "service_date": "2024-02-21",
  "service_mileage": 15234,
  "provider_type": "in_house",
  "provider_name": "Company Garage",
  "parts_cost": 0,
  "labor_cost": 50.00,
  "total_cost": 50.00,
  "downtime_hours": 1.5,
  "notes": "All tires in good condition"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "record-uuid",
    ...
  },
  "message": "Maintenance record created successfully"
}
```

---

### 5.3 List Maintenance Schedules

```http
GET /api/maintenance/schedules?vehicle_id=vehicle-uuid
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "schedule-uuid",
        "vehicle": {...},
        "service_category": "Oil Change",
        "maintenance_type": "routine",
        "frequency_type": "mileage",
        "frequency_interval": 5000,
        "frequency_unit": "km",
        "last_service_date": "2024-02-15",
        "last_service_mileage": 15000,
        "next_service_date": "2024-05-15",
        "next_service_mileage": 20000,
        "is_active": true,
        "reminder_days": 7
      }
    ]
  }
}
```

---

### 5.4 Create Maintenance Schedule

```http
POST /api/maintenance/schedules
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicle_id": "vehicle-uuid",
  "service_category": "Brake Inspection",
  "maintenance_type": "preventive",
  "frequency_type": "time",
  "frequency_interval": 6,
  "frequency_unit": "months",
  "last_service_date": "2024-02-21",
  "reminder_days": 14
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "schedule-uuid",
    "next_service_date": "2024-08-21",
    ...
  },
  "message": "Maintenance schedule created"
}
```

---

## 6. Fuel Endpoints

### 6.1 List Fuel Records

```http
GET /api/fuel/records?vehicle_id=vehicle-uuid&page=1&limit=20
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "fuel-uuid",
        "vehicle": {...},
        "driver": {...},
        "fuel_date": "2024-02-20",
        "fuel_time": "10:30:00",
        "fuel_type": "diesel",
        "quantity": 45.5,
        "unit": "liters",
        "price_per_unit": 1.85,
        "total_cost": 84.18,
        "odometer_reading": 15234,
        "distance_since_last_fuel": 450,
        "fuel_efficiency": 9.89,
        "station_name": "Shell Station",
        "payment_method": "fuel_card",
        "receipt_url": "https://...",
        "created_at": "2024-02-20T10:35:00Z"
      }
    ],
    "pagination": {...},
    "summary": {
      "total_fuel_cost": 2450.00,
      "total_quantity": 1200.5,
      "average_efficiency": 9.2
    }
  }
}
```

---

### 6.2 Create Fuel Record

```http
POST /api/fuel/records
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicle_id": "vehicle-uuid",
  "driver_id": "driver-uuid",
  "fuel_date": "2024-02-21",
  "fuel_time": "14:30:00",
  "fuel_type": "diesel",
  "quantity": 50.0,
  "price_per_unit": 1.90,
  "total_cost": 95.00,
  "odometer_reading": 15684,
  "station_name": "BP Gas Station",
  "payment_method": "card",
  "payment_reference": "TXN-123456",
  "is_full_tank": true,
  "receipt_image": "base64_image_data"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "fuel-uuid",
    "distance_since_last_fuel": 450,
    "fuel_efficiency": 9.0,
    ...
  },
  "message": "Fuel record created successfully"
}
```

---

## 7. Expense Endpoints

### 7.1 List Expenses

```http
GET /api/expenses?page=1&limit=20&category=maintenance&date_from=2024-02-01
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "expense-uuid",
        "vehicle": {...},
        "expense_category": "maintenance",
        "expense_type": "Repair",
        "description": "Engine repair",
        "expense_date": "2024-02-15",
        "amount": 450.00,
        "payment_method": "bank_transfer",
        "payment_status": "paid",
        "vendor_name": "ABC Auto Repair",
        "receipt_number": "RCP-001",
        "created_at": "2024-02-15T00:00:00Z"
      }
    ],
    "pagination": {...},
    "summary": {
      "total_amount": 5450.00,
      "by_category": {
        "maintenance": 2000.00,
        "fuel": 3000.00,
        "toll": 450.00
      }
    }
  }
}
```

---

### 7.2 Create Expense

```http
POST /api/expenses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicle_id": "vehicle-uuid",
  "expense_category": "toll",
  "expense_type": "Highway Toll",
  "description": "Toll charges for delivery route",
  "expense_date": "2024-02-21",
  "amount": 25.00,
  "payment_method": "cash",
  "vendor_name": "Highway Authority",
  "trip_id": "trip-uuid",
  "receipt_image": "base64_image_data"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "expense-uuid",
    ...
  },
  "message": "Expense recorded successfully"
}
```

---

## 8. Incident Endpoints

### 8.1 List Incidents

```http
GET /api/incidents?page=1&limit=20&status=reported
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "incidents": [
      {
        "id": "incident-uuid",
        "incident_number": "INC-2024-0001",
        "vehicle": {...},
        "driver": {...},
        "incident_type": "accident",
        "severity": "moderate",
        "incident_date": "2024-02-20",
        "incident_time": "15:30:00",
        "location_address": "123 Main St, City",
        "description": "Minor collision at intersection",
        "status": "under_investigation",
        "created_at": "2024-02-20T15:45:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 8.2 Create Incident Report

```http
POST /api/incidents
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "vehicle_id": "vehicle-uuid",
  "driver_id": "driver-uuid",
  "trip_id": "trip-uuid",
  "incident_type": "breakdown",
  "severity": "minor",
  "incident_date": "2024-02-21",
  "incident_time": "10:15:00",
  "location_address": "Highway 101, Mile 45",
  "location_lat": 37.7500,
  "location_lng": -122.4000,
  "description": "Engine overheating, pulled over safely",
  "cause": "Coolant leak",
  "weather_conditions": "Clear",
  "road_conditions": "Good",
  "injuries": false,
  "other_parties_involved": false,
  "photos": ["base64_image_1", "base64_image_2"]
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "incident-uuid",
    "incident_number": "INC-2024-0002",
    ...
  },
  "message": "Incident reported successfully. Management has been notified."
}
```

---

## 9. Report Endpoints

### 9.1 Generate Report

```http
POST /api/reports/generate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "report_type": "fleet_utilization",
  "report_name": "Monthly Fleet Report - Feb 2024",
  "period_start": "2024-02-01",
  "period_end": "2024-02-29",
  "filters": {
    "vehicle_ids": ["v1", "v2"],
    "include_charts": true
  },
  "format": "pdf"
}
```

**Response: 202 Accepted**
```json
{
  "success": true,
  "data": {
    "report_id": "report-uuid",
    "status": "processing",
    "message": "Report generation started. You will be notified when ready."
  }
}
```

---

### 9.2 Download Report

```http
GET /api/reports/{report_id}/download
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="fleet-report-2024-02.pdf"

[Binary PDF Data]
```

---

### 9.3 List Reports

```http
GET /api/reports?page=1&limit=20
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report-uuid",
        "report_type": "driver_performance",
        "report_name": "Driver Performance - Q1 2024",
        "period_start": "2024-01-01",
        "period_end": "2024-03-31",
        "generated_at": "2024-02-21T10:00:00Z",
        "file_url": "https://...",
        "file_format": "pdf"
      }
    ],
    "pagination": {...}
  }
}
```

---

## 10. Notification Endpoints

### 10.1 List Notifications

```http
GET /api/notifications?page=1&limit=20&is_read=false
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-uuid",
        "notification_type": "maintenance_due",
        "priority": "high",
        "title": "Maintenance Due: VEH-001",
        "message": "Oil change is due on 2024-03-01",
        "action_url": "/vehicles/vehicle-uuid",
        "is_read": false,
        "created_at": "2024-02-21T06:00:00Z"
      }
    ],
    "pagination": {...},
    "unread_count": 5
  }
}
```

---

### 10.2 Mark Notification as Read

```http
PATCH /api/notifications/{notification_id}/read
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 10.3 Mark All as Read

```http
POST /api/notifications/mark-all-read
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 11. Dashboard & Analytics

### 11.1 Get Dashboard Stats

```http
GET /api/dashboard/stats?period=30d
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "fleet_summary": {
      "total_vehicles": 45,
      "active_vehicles": 38,
      "in_maintenance": 5,
      "inactive": 2
    },
    "driver_summary": {
      "total_drivers": 52,
      "active_drivers": 48,
      "on_trip": 15
    },
    "trip_summary": {
      "total_trips": 450,
      "completed": 425,
      "in_progress": 15,
      "scheduled": 10,
      "completion_rate": 94.4
    },
    "financial_summary": {
      "total_revenue": 125000.00,
      "total_expenses": 45000.00,
      "fuel_cost": 28000.00,
      "maintenance_cost": 12000.00,
      "profit": 80000.00
    },
    "performance": {
      "total_distance": 25000,
      "average_trip_distance": 55.5,
      "fleet_utilization_rate": 78.5,
      "on_time_delivery_rate": 92.5
    },
    "alerts": {
      "maintenance_due": 8,
      "documents_expiring": 3,
      "low_fuel_efficiency": 2
    }
  }
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `UNAUTHORIZED` | 401 | No valid authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Rate Limiting

- **Standard Users**: 100 requests per minute
- **Premium Users**: 500 requests per minute
- **Tracking Endpoints**: 1000 requests per minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708531200
```

---

## Webhooks

### Configure Webhook

```http
POST /api/webhooks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["trip.completed", "incident.reported"],
  "secret": "your_webhook_secret"
}
```

### Webhook Payload Example

```json
{
  "event": "trip.completed",
  "timestamp": "2024-02-21T16:30:00Z",
  "data": {
    "trip_id": "trip-uuid",
    "trip_number": "TRP-2024-0001",
    "status": "completed",
    ...
  }
}
```

---

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('wss://fleetflow.app/ws');
ws.send(JSON.stringify({
  action: 'authenticate',
  token: 'access_token'
}));
```

### Subscribe to Trip Updates

```javascript
ws.send(JSON.stringify({
  action: 'subscribe',
  channel: 'trip',
  trip_id: 'trip-uuid'
}));
```

### Receive Real-time Updates

```json
{
  "channel": "trip",
  "event": "location_update",
  "data": {
    "trip_id": "trip-uuid",
    "lat": 37.7900,
    "lng": -122.4100,
    "speed": 45.5,
    "timestamp": "2024-02-21T15:00:00Z"
  }
}
```

---

## Next Steps

1. Implement API endpoints using Next.js API routes
2. Add request validation using Zod schemas
3. Implement authentication middleware
4. Set up rate limiting
5. Add comprehensive error handling
6. Create API documentation with Swagger/OpenAPI
7. Set up API testing suite

This API documentation provides a complete reference for building and integrating with the FleetFlow system.
