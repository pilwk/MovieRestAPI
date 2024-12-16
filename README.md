# MovieRestAPI assignment for Database Management and Programming IT00ED45-3001 @OAMK 2024

The db does not come with a lot of mockdata so you may want to add some yourself. If using Docker, the files inside mockdata/ are automatically added to the database.

## env
Copy or move the base env file `cp .env-example .env`  
Change values in `.env` as you please  

## Docker

If you're using docker (recommended)
Run `docker compose up -d` to start the postgres database and node server

## Node

Usage 
- `npm --prefix src/ i`
- `node src/server.js`

You can verify that the server & connection are working on `http://localhost:8000`

## Endpoints
"Working" endpoints  
```
GET /
GET /movies
GET /movies?keyword
GET /movies/:id
GET /favourites/:username
POST /favourites
POST /users
POST /reviews
POST /genres
POST /movies
DELETE /movies/:id
```