# FleetFlow Database Schema Design

## Overview
This document outlines the complete database schema for the FleetFlow modular fleet and logistics management system.

## Database Architecture
- **Database Type**: PostgreSQL (recommended) or MySQL
- **ORM**: Prisma (for Next.js integration)
- **Indexing Strategy**: All foreign keys, search fields, and frequently queried columns
- **Soft Deletes**: Implemented across all major tables

---

## Core Tables

### 1. Users & Authentication

#### `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('super_admin', 'admin', 'manager', 'dispatcher', 'driver', 'viewer') NOT NULL,
    organization_id UUID NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
```

#### `sessions`
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
```

---

### 2. Organizations

#### `organizations`
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    industry VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    logo_url TEXT,
    subscription_tier ENUM('free', 'basic', 'professional', 'enterprise') DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    max_vehicles INTEGER,
    max_drivers INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_organizations_name ON organizations(name);
```

---

### 3. Fleet Management

#### `vehicles`
```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    color VARCHAR(50),
    vehicle_type ENUM('sedan', 'suv', 'van', 'truck', 'bus', 'trailer', 'other') NOT NULL,
    fuel_type ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'cng', 'lpg') NOT NULL,
    transmission ENUM('manual', 'automatic', 'semi-automatic'),
    engine_capacity DECIMAL(5, 2),
    seating_capacity INTEGER,
    cargo_capacity DECIMAL(10, 2),
    purchase_date DATE,
    purchase_price DECIMAL(12, 2),
    current_mileage DECIMAL(10, 2),
    last_service_mileage DECIMAL(10, 2),
    next_service_mileage DECIMAL(10, 2),
    status ENUM('active', 'maintenance', 'inactive', 'retired') DEFAULT 'active',
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    current_location_address TEXT,
    gps_device_id VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    insurance_expiry DATE,
    registration_expiry DATE,
    emission_test_expiry DATE,
    average_fuel_consumption DECIMAL(5, 2),
    notes TEXT,
    image_urls TEXT[], -- Array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_vehicles_org ON vehicles(organization_id);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
```

#### `vehicle_documents`
```sql
CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    document_type ENUM('registration', 'insurance', 'inspection', 'permit', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_number VARCHAR(100),
    file_url TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(255),
    notes TEXT,
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_vehicle_docs_vehicle ON vehicle_documents(vehicle_id);
CREATE INDEX idx_vehicle_docs_expiry ON vehicle_documents(expiry_date);
```

---

### 4. Driver Management

#### `drivers`
```sql
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID UNIQUE, -- Links to users table if driver has login access
    employee_id VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    national_id VARCHAR(50),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_type VARCHAR(50),
    license_issue_date DATE,
    license_expiry_date DATE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    hire_date DATE,
    employment_status ENUM('active', 'inactive', 'suspended', 'terminated') DEFAULT 'active',
    hourly_rate DECIMAL(10, 2),
    blood_group VARCHAR(5),
    medical_conditions TEXT,
    profile_image_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.00, -- Average rating 0-5
    total_trips INTEGER DEFAULT 0,
    total_distance DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_drivers_org ON drivers(organization_id);
CREATE INDEX idx_drivers_license ON drivers(license_number);
CREATE INDEX idx_drivers_status ON drivers(employment_status);
```

#### `driver_documents`
```sql
CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    document_type ENUM('license', 'passport', 'national_id', 'medical_cert', 'training_cert', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_number VARCHAR(100),
    file_url TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(255),
    notes TEXT,
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_driver_docs_driver ON driver_documents(driver_id);
CREATE INDEX idx_driver_docs_expiry ON driver_documents(expiry_date);
```

---

### 5. Trip & Dispatch Management

#### `trips`
```sql
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    trip_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    trip_type ENUM('delivery', 'pickup', 'passenger', 'service', 'other') NOT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed') DEFAULT 'scheduled',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    
    -- Origin
    origin_name VARCHAR(255),
    origin_address TEXT NOT NULL,
    origin_lat DECIMAL(10, 8) NOT NULL,
    origin_lng DECIMAL(11, 8) NOT NULL,
    origin_contact_name VARCHAR(200),
    origin_contact_phone VARCHAR(20),
    
    -- Destination
    destination_name VARCHAR(255),
    destination_address TEXT NOT NULL,
    destination_lat DECIMAL(10, 8) NOT NULL,
    destination_lng DECIMAL(11, 8) NOT NULL,
    destination_contact_name VARCHAR(200),
    destination_contact_phone VARCHAR(20),
    
    -- Timing
    scheduled_start_time TIMESTAMP NOT NULL,
    scheduled_end_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    
    -- Distance & Route
    planned_distance DECIMAL(10, 2), -- in km
    actual_distance DECIMAL(10, 2), -- in km
    route_polyline TEXT, -- Encoded polyline for map display
    
    -- Cargo/Passenger Details
    cargo_description TEXT,
    cargo_weight DECIMAL(10, 2),
    cargo_dimensions VARCHAR(100),
    passenger_count INTEGER,
    
    -- Financial
    estimated_cost DECIMAL(12, 2),
    actual_cost DECIMAL(12, 2),
    customer_price DECIMAL(12, 2),
    payment_status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
    
    -- Additional Info
    customer_id UUID, -- If applicable
    order_reference VARCHAR(100),
    instructions TEXT,
    notes TEXT,
    
    -- Ratings & Feedback
    rating INTEGER, -- 1-5
    feedback TEXT,
    
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_trips_org ON trips(organization_id);
CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_scheduled_start ON trips(scheduled_start_time);
CREATE INDEX idx_trips_trip_number ON trips(trip_number);
```

#### `trip_waypoints`
```sql
CREATE TABLE trip_waypoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    sequence_order INTEGER NOT NULL,
    waypoint_type ENUM('pickup', 'dropoff', 'stop', 'checkpoint') NOT NULL,
    name VARCHAR(255),
    address TEXT NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    contact_name VARCHAR(200),
    contact_phone VARCHAR(20),
    scheduled_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    actual_departure_time TIMESTAMP,
    status ENUM('pending', 'reached', 'completed', 'skipped') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE INDEX idx_waypoints_trip ON trip_waypoints(trip_id);
CREATE INDEX idx_waypoints_sequence ON trip_waypoints(trip_id, sequence_order);
```

#### `trip_tracking`
```sql
CREATE TABLE trip_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2), -- km/h
    heading DECIMAL(5, 2), -- degrees
    accuracy DECIMAL(6, 2), -- meters
    altitude DECIMAL(8, 2), -- meters
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE INDEX idx_tracking_trip ON trip_tracking(trip_id);
CREATE INDEX idx_tracking_recorded ON trip_tracking(recorded_at);
```

---

### 6. Maintenance Management

#### `maintenance_schedules`
```sql
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    maintenance_type ENUM('routine', 'preventive', 'corrective', 'inspection', 'emergency') NOT NULL,
    service_category VARCHAR(100) NOT NULL, -- Oil change, Tire rotation, etc.
    description TEXT,
    frequency_type ENUM('mileage', 'time', 'both') NOT NULL,
    frequency_interval INTEGER, -- Value depends on frequency_type
    frequency_unit ENUM('days', 'weeks', 'months', 'km', 'miles'),
    last_service_date DATE,
    last_service_mileage DECIMAL(10, 2),
    next_service_date DATE,
    next_service_mileage DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    reminder_days INTEGER DEFAULT 7, -- Days before to send reminder
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE INDEX idx_maintenance_schedule_vehicle ON maintenance_schedules(vehicle_id);
CREATE INDEX idx_maintenance_schedule_next_date ON maintenance_schedules(next_service_date);
```

#### `maintenance_records`
```sql
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    schedule_id UUID, -- Null if unscheduled maintenance
    maintenance_type ENUM('routine', 'preventive', 'corrective', 'inspection', 'emergency') NOT NULL,
    service_category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    service_date DATE NOT NULL,
    service_mileage DECIMAL(10, 2),
    
    -- Service Provider
    provider_type ENUM('in_house', 'external') NOT NULL,
    provider_name VARCHAR(255),
    provider_contact VARCHAR(20),
    provider_address TEXT,
    
    -- Parts & Labor
    parts_cost DECIMAL(12, 2) DEFAULT 0,
    labor_cost DECIMAL(12, 2) DEFAULT 0,
    other_cost DECIMAL(12, 2) DEFAULT 0,
    total_cost DECIMAL(12, 2) NOT NULL,
    
    -- Duration
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    downtime_hours DECIMAL(6, 2),
    
    -- Status & Outcome
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    work_order_number VARCHAR(50),
    invoice_number VARCHAR(50),
    warranty_valid_until DATE,
    
    -- Additional Info
    parts_replaced TEXT[], -- Array of part names
    technician_name VARCHAR(200),
    notes TEXT,
    attachments TEXT[], -- Array of file URLs
    
    performed_by UUID,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (schedule_id) REFERENCES maintenance_schedules(id),
    FOREIGN KEY (performed_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_maintenance_records_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_records_date ON maintenance_records(service_date);
CREATE INDEX idx_maintenance_records_status ON maintenance_records(status);
```

---

### 7. Fuel Management

#### `fuel_records`
```sql
CREATE TABLE fuel_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_id UUID,
    
    -- Fuel Details
    fuel_date DATE NOT NULL,
    fuel_time TIME,
    fuel_type ENUM('gasoline', 'diesel', 'electric', 'cng', 'lpg') NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL, -- Liters or kWh
    unit ENUM('liters', 'gallons', 'kwh') DEFAULT 'liters',
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    
    -- Odometer
    odometer_reading DECIMAL(10, 2) NOT NULL,
    distance_since_last_fuel DECIMAL(10, 2),
    fuel_efficiency DECIMAL(6, 2), -- km/liter or km/kwh
    
    -- Location
    station_name VARCHAR(255),
    station_location TEXT,
    station_lat DECIMAL(10, 8),
    station_lng DECIMAL(11, 8),
    
    -- Payment
    payment_method ENUM('cash', 'card', 'fuel_card', 'account', 'voucher') NOT NULL,
    payment_reference VARCHAR(100),
    receipt_number VARCHAR(100),
    receipt_url TEXT,
    
    -- Additional
    is_full_tank BOOLEAN DEFAULT true,
    notes TEXT,
    
    recorded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE INDEX idx_fuel_records_vehicle ON fuel_records(vehicle_id);
CREATE INDEX idx_fuel_records_date ON fuel_records(fuel_date);
CREATE INDEX idx_fuel_records_driver ON fuel_records(driver_id);
```

---

### 8. Expense Management

#### `expenses`
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vehicle_id UUID,
    driver_id UUID,
    trip_id UUID,
    
    -- Expense Details
    expense_category ENUM('fuel', 'maintenance', 'insurance', 'toll', 'parking', 'fine', 'salary', 'other') NOT NULL,
    expense_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment
    payment_method ENUM('cash', 'card', 'bank_transfer', 'cheque', 'other'),
    payment_reference VARCHAR(100),
    payment_status ENUM('pending', 'paid', 'approved', 'rejected') DEFAULT 'pending',
    
    -- Documentation
    receipt_number VARCHAR(100),
    invoice_number VARCHAR(100),
    vendor_name VARCHAR(255),
    attachments TEXT[], -- Array of file URLs
    
    -- Approval
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP,
    approval_notes TEXT,
    
    notes TEXT,
    recorded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (trip_id) REFERENCES trips(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX idx_expenses_org ON expenses(organization_id);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
CREATE INDEX idx_expenses_driver ON expenses(driver_id);
CREATE INDEX idx_expenses_category ON expenses(expense_category);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
```

---

### 9. Incident & Accident Management

#### `incidents`
```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    trip_id UUID,
    
    -- Incident Details
    incident_type ENUM('accident', 'breakdown', 'theft', 'damage', 'violation', 'other') NOT NULL,
    severity ENUM('minor', 'moderate', 'major', 'critical') NOT NULL,
    incident_date DATE NOT NULL,
    incident_time TIME NOT NULL,
    
    -- Location
    location_address TEXT NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    
    -- Description
    description TEXT NOT NULL,
    cause TEXT,
    weather_conditions VARCHAR(100),
    road_conditions VARCHAR(100),
    
    -- Parties Involved
    other_parties_involved BOOLEAN DEFAULT false,
    other_party_details TEXT,
    witnesses TEXT,
    injuries BOOLEAN DEFAULT false,
    injury_details TEXT,
    fatalities BOOLEAN DEFAULT false,
    
    -- Actions Taken
    police_report_filed BOOLEAN DEFAULT false,
    police_report_number VARCHAR(100),
    police_station VARCHAR(255),
    insurance_claim_filed BOOLEAN DEFAULT false,
    insurance_claim_number VARCHAR(100),
    
    -- Financial
    estimated_damage_cost DECIMAL(12, 2),
    actual_repair_cost DECIMAL(12, 2),
    insurance_payout DECIMAL(12, 2),
    
    -- Status
    status ENUM('reported', 'under_investigation', 'resolved', 'closed') DEFAULT 'reported',
    resolution TEXT,
    
    -- Documentation
    attachments TEXT[], -- Photos, videos, documents
    
    reported_by UUID NOT NULL,
    assigned_to UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (trip_id) REFERENCES trips(id),
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE INDEX idx_incidents_org ON incidents(organization_id);
CREATE INDEX idx_incidents_vehicle ON incidents(vehicle_id);
CREATE INDEX idx_incidents_driver ON incidents(driver_id);
CREATE INDEX idx_incidents_date ON incidents(incident_date);
CREATE INDEX idx_incidents_status ON incidents(status);
```

---

### 10. Notifications & Alerts

#### `notifications`
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID,
    notification_type ENUM('maintenance_due', 'document_expiry', 'trip_alert', 'incident', 'compliance', 'general') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    related_entity_type VARCHAR(50), -- vehicle, driver, trip, etc.
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    sent_via_email BOOLEAN DEFAULT false,
    sent_via_sms BOOLEAN DEFAULT false,
    sent_via_push BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

#### `alert_rules`
```sql
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_type ENUM('maintenance', 'document_expiry', 'geofence', 'speed', 'idle', 'fuel', 'custom') NOT NULL,
    conditions JSONB NOT NULL, -- Flexible conditions storage
    notification_channels TEXT[], -- ['email', 'sms', 'push', 'dashboard']
    recipient_roles TEXT[], -- ['admin', 'manager', 'driver']
    recipient_users UUID[], -- Specific user IDs
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_alert_rules_org ON alert_rules(organization_id);
CREATE INDEX idx_alert_rules_type ON alert_rules(rule_type);
```

---

### 11. Reports & Analytics

#### `reports`
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    report_type VARCHAR(100) NOT NULL, -- fleet_utilization, cost_analysis, driver_performance, etc.
    report_name VARCHAR(255) NOT NULL,
    report_period_start DATE,
    report_period_end DATE,
    filters JSONB,
    generated_by UUID NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_url TEXT,
    file_format VARCHAR(10), -- pdf, csv, xlsx
    is_scheduled BOOLEAN DEFAULT false,
    schedule_frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (generated_by) REFERENCES users(id)
);

CREATE INDEX idx_reports_org ON reports(organization_id);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_generated ON reports(generated_at);
```

---

### 12. Audit & Activity Logs

#### `activity_logs`
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID,
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout, etc.
    entity_type VARCHAR(50) NOT NULL, -- vehicle, driver, trip, etc.
    entity_id UUID,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_activity_logs_org ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
```

---

### 13. Settings & Configuration

#### `organization_settings`
```sql
CREATE TABLE organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID UNIQUE NOT NULL,
    
    -- General Settings
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(20) DEFAULT '24h',
    currency VARCHAR(3) DEFAULT 'USD',
    distance_unit ENUM('km', 'miles') DEFAULT 'km',
    fuel_unit ENUM('liters', 'gallons') DEFAULT 'liters',
    
    -- Notification Settings
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    
    -- Business Hours
    business_hours_start TIME DEFAULT '09:00:00',
    business_hours_end TIME DEFAULT '17:00:00',
    working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
    
    -- Maintenance Reminders
    maintenance_reminder_days INTEGER DEFAULT 7,
    document_expiry_reminder_days INTEGER DEFAULT 30,
    
    -- Trip Settings
    auto_assign_drivers BOOLEAN DEFAULT false,
    require_trip_approval BOOLEAN DEFAULT false,
    allow_driver_trip_edits BOOLEAN DEFAULT true,
    
    -- Geofencing
    enable_geofencing BOOLEAN DEFAULT false,
    
    -- Integrations
    google_maps_api_key TEXT,
    twilio_settings JSONB,
    stripe_settings JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
```

---

## Relationships Summary

### One-to-Many Relationships:
- Organizations → Users
- Organizations → Vehicles
- Organizations → Drivers
- Organizations → Trips
- Organizations → Expenses
- Organizations → Incidents
- Organizations → Notifications
- Vehicles → Maintenance Records
- Vehicles → Fuel Records
- Vehicles → Vehicle Documents
- Drivers → Driver Documents
- Drivers → Trips
- Trips → Trip Waypoints
- Trips → Trip Tracking

### Many-to-One Relationships:
- Users → Organizations
- Drivers → Organizations
- Vehicles → Organizations
- Trips → Vehicles
- Trips → Drivers

### Optional Relationships:
- Drivers ↔ Users (driver may or may not have login access)
- Maintenance Records → Maintenance Schedules (may be unscheduled)
- Expenses → Vehicles (may not be vehicle-specific)
- Expenses → Drivers (may not be driver-specific)

---

## Indexing Strategy

### Primary Indexes:
- All primary keys (UUID)
- All foreign keys
- Unique constraints (email, license_plate, license_number, etc.)

### Secondary Indexes:
- Status fields (for filtering)
- Date/Time fields (for range queries)
- Search fields (names, numbers)
- Geospatial fields (lat/lng for location-based queries)

---

## Data Retention & Archival

### Soft Deletes:
All major tables include a `deleted_at` timestamp for soft deletion, allowing data recovery and audit trails.

### Archival Strategy:
- Trip data: Archive after 1 year
- Tracking data: Archive after 6 months
- Activity logs: Archive after 1 year
- Notifications: Delete after 3 months

---

## Security Considerations

1. **Password Storage**: Use bcrypt/argon2 for hashing
2. **API Keys**: Encrypt sensitive API keys
3. **PII Data**: Consider encryption at rest for sensitive personal information
4. **Access Control**: Implement row-level security based on organization_id
5. **Audit Trail**: Maintain comprehensive activity logs

---

## Scalability Considerations

1. **Partitioning**: Consider partitioning large tables (trips, tracking, activity_logs) by date
2. **Read Replicas**: Set up read replicas for analytics and reporting
3. **Caching**: Implement Redis for frequently accessed data
4. **CDN**: Use CDN for document storage and retrieval

---

## Next Steps

1. Implement using Prisma ORM for Next.js
2. Set up database migrations
3. Create seed data for development
4. Implement API layer with proper validation
5. Set up automated backups
