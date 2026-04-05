CREATE DATABASE IF NOT EXISTS violation_detection_system;
USE violation_detection_system;

CREATE TABLE IF NOT EXISTS violations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type VARCHAR(50),
    vehicle_number VARCHAR(20),
    violation_type VARCHAR(100),
    confidence FLOAT,
    image_path VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20)
    CHECK (role IN ('admin', 'analyst', 'commoner'))
);

-- seperate index for faster querying

CREATE INDEX idx_violation_type ON violations(violation_type);
CREATE INDEX idx_vehicle_number ON violations(vehicle_number);
CREATE INDEX idx_timestamp ON violations(timestamp);