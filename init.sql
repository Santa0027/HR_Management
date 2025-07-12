-- Initialize database
CREATE DATABASE IF NOT EXISTS hr_management_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE hr_management_db TO admin;
