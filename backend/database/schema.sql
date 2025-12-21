-- Usar la base de datos OmniSoundDB
USE OmniSoundDB;

-- ============================================
-- TABLA 1: USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    real_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    birth_date DATE,
    bio TEXT,
    profile_image_url VARCHAR(255),
    profile_url VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA 2: VERIFICACIÓN DE EMAIL
-- ============================================
CREATE TABLE IF NOT EXISTS email_verification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT(
        CURRENT_TIMESTAMP + INTERVAL 10 MINUTE
    ),
    INDEX idx_email (email),
    INDEX idx_expires (expires_at)
);

-- ============================================
-- TABLA 3: RESTABLECER CONTRASEÑA
-- ============================================
CREATE TABLE IF NOT EXISTS password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT(
        CURRENT_TIMESTAMP + INTERVAL 1 HOUR
    ),
    INDEX idx_token (token),
    INDEX idx_email (email)
);