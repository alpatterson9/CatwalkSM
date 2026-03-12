-- Robin Howard, Andrew Patterson, Elliott Scheid
-- Initializes relational database for storing user information for catwalk.
-- Also creates administrator role meant to be used by Express server

CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users(
    id TEXT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio VARCHAR(255),
    profile_picture VARCHAR(255) UNIQUE
);

CREATE INDEX IF NOT EXISTS users_username_trgm_idx
ON users USING gin (username gin_trgm_ops);

GRANT ALL PRIVILEGES ON TABLE users TO catwalkadmin;
