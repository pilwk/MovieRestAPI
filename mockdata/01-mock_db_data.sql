-- Insert data into the genre table
INSERT INTO genre (genre_name)
VALUES
  ('Drama'),
  ('Comedy'),
  ('Sci-Fi'),
  ('Action'),
  ('Adventure'),
  ('Horror'),
  ('Crime');

-- Insert data into the director table
INSERT INTO director (director_name)
VALUES
  ('Christopher Nolan'),
  ('Quentin Tarantino'),
  ('Steven Spielberg'),
  ('Martin Scorsese'),
  ('Alfred Hitchcock'),
  ('Francis Ford Coppola'),
  ('Frank Darabont'),
  ('David Fincher');

-- Insert data into the movie table
INSERT INTO movie (title, year, genre_name, director_name)
VALUES
  ('Inception', 2010, 'Sci-Fi', 'Christopher Nolan'),
  ('Pulp Fiction', 1994, 'Crime', 'Quentin Tarantino'),
  ('Jurassic Park', 1993, 'Sci-Fi', 'Steven Spielberg'),
  ('The Godfather', 1972, 'Crime', 'Francis Ford Coppola'),
  ('Psycho', 1960, 'Horror', 'Alfred Hitchcock'),
  ('Fight Club', 1999, 'Drama', 'David Fincher'),
  ('The Shawshank Redemption', 1994, 'Drama', 'Frank Darabont');