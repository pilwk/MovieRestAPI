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

-- Create junction table for movie <- movie_genre if needed later
CREATE TABLE movie_genre (
  movie_id INTEGER REFERENCES movie(movie_id),
  genre_id INTEGER REFERENCES genre(genre_id),
  PRIMARY KEY (movie_id, genre_id)
);

-- Create the `user` table
CREATE TABLE user_account (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    dob DATE
);

-- Create the `favourite` table
CREATE TABLE favourite (
    favourite_id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movie(movie_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES user_account(user_id)
);

-- Create the `review` table
CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_account(user_id),
    movie_id INTEGER REFERENCES movie(movie_id) ON DELETE CASCADE,
    rating INTEGER,
    review_text TEXT
);
