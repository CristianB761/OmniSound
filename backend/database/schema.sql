-- Usar la base de datos OmniSoundDB
USE OmniSoundDB;

-- ============================================
-- TABLA 1: USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    real_name VARCHAR(100) NULL,
    password_hash VARCHAR(255) NOT NULL,
    birth_date DATE,
    bio TEXT NULL,
    profile_picture_url VARCHAR(255),
    profile_url VARCHAR(100) UNIQUE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA 2: CONTADOR DE USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS user_counter (
    id INT PRIMARY KEY AUTO_INCREMENT,
    last_number BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA 3: VERIFICACIÓN DE EMAIL
-- ============================================
CREATE TABLE IF NOT EXISTS email_verifications (
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
-- TABLA 4: RESTABLECER CONTRASEÑA
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

-- ============================================
-- TABLA 5: CANCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS songs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NULL,
    artist VARCHAR(100) NOT NULL,
    genre VARCHAR(50),
    tags TEXT NULL,
    description TEXT NULL,
    privacy ENUM('public', 'private') DEFAULT 'public',
    audio_url VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    duration INT,
    likes INT DEFAULT 0,
    reposts INT DEFAULT 0,
    comments INT DEFAULT 0,
    plays INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_slug (slug)
);

-- ============================================
-- TABLA 6: LIKE EN CANCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS song_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    song_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (song_id, user_id),
    FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ============================================
-- TABLA 7: REPOST EN CANCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS song_reposts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    song_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_repost (song_id, user_id),
    FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ============================================
-- TABLA 8: COMENTARIOS EN CANCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS song_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    song_id INT NOT NULL,
    user_id INT NOT NULL,
    time_in_song INT,
    comment TEXT NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);