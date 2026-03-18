-- Migration: 001_initial_schema.sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Bicycles table
CREATE TABLE bicycles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    total_mileage DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bicycles_user_id ON bicycles(user_id);
CREATE INDEX idx_bicycles_deleted_at ON bicycles(deleted_at);

-- Component categories enum
CREATE TYPE component_category AS ENUM ('Drivetrain', 'Brakes', 'Wheels', 'Suspension', 'Other');
CREATE TYPE component_sub_category AS ENUM ('Chain', 'Cassette', 'Chainring', 'Pads', 'Rotors', 'Cables', 'Tires', 'Rims', 'Fork', 'Shock');
CREATE TYPE component_status AS ENUM ('Green', 'Yellow', 'Red');

-- Components table
CREATE TABLE components (
    id UUID PRIMARY KEY,
    bike_id UUID NOT NULL REFERENCES bicycles(id) ON DELETE CASCADE,
    category component_category NOT NULL,
    sub_category component_sub_category,
    name VARCHAR(255) NOT NULL,
    current_mileage DECIMAL(10, 2) DEFAULT 0,
    max_resource_km DECIMAL(10, 2) NOT NULL,
    status component_status DEFAULT 'Green',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_components_bike_id ON components(bike_id);
CREATE INDEX idx_components_deleted_at ON components(deleted_at);

-- Sync log table
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

CREATE INDEX idx_sync_logs_user_device ON sync_logs(user_id, device_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bicycles_updated_at BEFORE UPDATE ON bicycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
