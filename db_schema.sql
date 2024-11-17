-- Active: 1731861477590@@127.0.0.1@5432@postgres
-- Create the `genre` table
CREATE TABLE genre (
    genre_id SERIAL PRIMARY KEY,
    genre_name VARCHAR(100) UNIQUE NOT NULL
);

-- Create the `director` table
CREATE TABLE director (
    director_id SERIAL PRIMARY KEY,
    director_name VARCHAR(100) UNIQUE NOT NULL
);

-- Create the `movie` table
CREATE TABLE movie (
    movie_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INTEGER,
    genre_name VARCHAR(100) REFERENCES genre(genre_name),
    director_name VARCHAR(100) REFERENCES director(director_name)
);

-- limitation to single genre per movie
-- add junction table for movie <- movie_genre if needed later


-- Create the `user` table
CREATE TABLE user_account (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    dob DATE
);

-- Create the `favourite` table
CREATE TABLE favourite (
    favourite_id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movie(movie_id),
    user_id INTEGER REFERENCES user_account(user_id)
);

-- Create the `review` table
CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_account(user_id),
    movie_id INTEGER REFERENCES movie(movie_id),
    rating INTEGER,
    review_text TEXT
);