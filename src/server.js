import express from 'express'
import dotenv from 'dotenv'
import { pgPool } from "./pg_connection.js"
import { body, check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
const saltRounds = 10

dotenv.config()
const app = express()

const port = process.env.PORT || 3001


app.set('port', port)

app.use(express.json())

app.listen(app.get('port'), () => {
    console.log(`Server running in ${port}`)
})

// front / default api get
app.get('/', async (req, res) => {
    let db_status
    try {
        const client = await pgPool.connect()
        client.release()
        db_status = `Connected to ${process.env.POSTGRES_DB} on port ${process.env.POSTGRES_PORT}`
    } catch (err) {
        db_status = `${err}`
    }
    if (req.headers.accept.includes('text/html')) {
        res.send(`
          <p>Server listening on port ${port}</p>
          <p>Database status: ${db_status}</p>
        `)
    } else {
        res.json({
            message: `Server is running on port ${port}`,
            databaseStatus: db_status
        })
    }
})

// remove movie with id
app.delete('/movies/:id', [
    check('id').notEmpty().isInt().withMessage('invalid id')
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { id } = req.params

    try {
        const client = await pgPool.connect()

        //check if movie exists
        const checkQuery = 'SELECT * FROM movie WHERE movie_id = $1'
        const checkResult = await client.query(checkQuery, [id])

        if (checkResult.rows.length === 0){
            client.release()
            return res.status(400).json({ error: 'Movie not found'})
        }
        
        //check token or permission(?) left out since it's out of scope for current work, could have made added a permission toggle in user_account
        //del query
        const delQuery = 'DELETE FROM movie WHERE movie_id = $1 RETURNING *'
        const delResult = await client.query(delQuery, [id])
        client.release()

        return res.json({ message: 'Movie deleted succesfully', movie: delResult.rows[0] })
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

//get all movies/keyword query
app.get('/movies', [
    check('keyword')
        .optional()
        .trim()
        .notEmpty()
        .escape()
        .isLength({ min: 3 }),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { keyword } = await req.query
    const filtered = { msg: 'keyword search', keyword }

    try {
        const client = await pgPool.connect()

        let query
        if (!keyword) {
            query = 'SELECT * FROM movie'
        } else {
            query = `
            SELECT * FROM movie 
            WHERE title ILIKE $1
            OR genre_name ILIKE $1
            OR director_name ILIKE $1`
        }

        const values = keyword ? [`%${keyword}%`] : []

        const result = await client.query(query, values)
        client.release()

        return res.json({movies: result.rows})
    } catch (error) {
        return res.status(500).json({ error: 'Internal server Error' })
    }
})

// get movie (id)
app.get('/movies/:id', [
    check('id')
        .trim()
        .isInt()
        .notEmpty()
        .withMessage('invalid id')
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { id } = req.params
    const idNum = parseInt(id)
    try {
        const client = await pgPool.connect()
        let query = 'SELECT * FROM movie WHERE movie_id = $1;'
        const values = [idNum]
        const result = await client.query(query, values)
        client.release()
        
        if (result.rows.length === 0){
            return res.status(404).json({ message: 'No movie found'})
        }

        return res.json({movies: result.rows})
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})

// get favourite (username)
app.get('/favorites/:username', [
    check('username')
        .trim()
        .matches(/^[a-zA-Z0-9_\s-]+$/)
        .withMessage('Invalid username')
        .isLength({ min: 3 }),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { username } = req.params

    try {
        const client = await pgPool.connect()
        //get user_id from user_account table first
        const userQuery = 'SELECT user_id FROM user_account WHERE username = $1'
        const userResult = await client.query(userQuery, [username])

        if (userResult.rows.length === 0) {
            client.release()
            return res.status(404).json({error: 'User not found'})
        }

        const userId = userResult.rows[0].user_id

        //join all columns of matching movies from movie table
        const favQuery = `
            SELECT movie.* FROM movie
            JOIN favourite ON movie.movie_id = favourite.movie_id
            WHERE favourite.user_id = $1;
        `
        const favResult = await client.query(favQuery, [userId])
        client.release()

        res.json(favResult.rows)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// add a new movie
app.post('/movies', [
    body('title').notEmpty().withMessage('title is required'),
    body('year').notEmpty().withMessage('year is required').isInt().withMessage('year must be a valid year'),
    body('genre').notEmpty().withMessage('genre is required'),
    body('director').notEmpty().withMessage('director is required')
], async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Invalid content type. Expected application/json' })
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { title, year, genre, director } = req.body
    try {
        const client = await pgPool.connect()

        const genreQuery = 'SELECT * FROM genre WHERE genre_name = $1'
        const genreResult = await client.query(genreQuery, [genre])

        if (genreResult.rows.length === 0){
            const insertGenreQuery = `
                INSERT INTO genre (genre_name)
                VALUES ($1)
                RETURNING genre_id
            `
            await client.query(insertGenreQuery, [genre])
        }

        const directorQuery = 'SELECT * FROM director WHERE director_name = $1'
        const directorResult = await client.query(directorQuery, [director])

        if (directorResult.rows.length === 0) {
            const insertDirectorQuery = `
                INSERT INTO director (director_name)
                VALUES ($1)
                RETURNING director_name;
            `
            await client.query(insertDirectorQuery, [director])
        }

        const checkMovieQuery = `
            SELECT * FROM movie
            WHERE title = $1 AND year = $2 AND director_name = $3
        `
        const checkMovieResult = await client.query(checkMovieQuery, [title, year, director])

        if (checkMovieResult.rows.length > 0){
            client.release()
            return res.status(409).json({ error: 'Movie already exists in database'})
        }

        const movieQuery = `
            INSERT INTO movie (title, year, genre_name, director_name)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `
        const movieValues = [title, year, genre, director]

        const movieResult = await client.query(movieQuery, movieValues)
        client.release()

        return res.status(201).json({ message: 'Movie added successfully', movie: movieResult.rows[0] })
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

// add (register) a new user
app.post('/users', [
    body('username').matches(/^[a-zA-Z0-9_\s-]+$/).withMessage('Invalid username character'),
    body('username').isLength({ min: 3 }).withMessage('Username too short'),
    body('username').isLength({ max: 16 }).withMessage('Username too long'),
    body('password').isLength({ min: 6 }).withMessage('Password too short, minimum 6 characters'),
    body('name').optional(),
    body('dob').optional()
], async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Invalid content type. Expected application/json' })
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { username, password, name, dob } = req.body
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const client = await pgPool.connect()
        const query = `
            INSERT INTO user_account (username, password_hash, name, dob)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
            `

        const values = [username, hashedPassword, name, dob]

        const result = await client.query(query, values)
        client.release()

        return res.status(201).json({ message: 'User added successfully', user: result.rows[0]})
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

// add a new genre
app.post('/genres', [
    body('genreName').notEmpty().withMessage('Invalid genre name length')
], async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Invalid content type. Expected application/json' })
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { genreName } = req.body
    try {
        const client = await pgPool.connect()

        const genreQuery = 'SELECT * FROM genre WHERE genre_name = $1'
        const genreResult = await client.query(genreQuery, [genreName])

        if (genreResult.rows.length > 0){
            client.release()
            return res.status(409).json({ error: 'Genre already exists'})
        }

        const insertGenreQuery = `
            INSERT INTO genre (genre_name)
            VALUES ($1)
            RETURNING *
        `
        const insertGenreResult = await client.query(insertGenreQuery, [genreName])
        client.release()

        return res.status(201).json({ message: 'Genre added successfully', genre: insertGenreResult.rows[0] })
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

// add a new movie review
app.post('/reviews', [
    body('userId').optional(),
    body('movieId').notEmpty().withMessage('movieId must be included'),
    body('rating').isInt({ min: 0, max: 10 }).withMessage('Rating must be an integer between 0 and 10'),
    body('reviewText').optional().isString()
], async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Invalid content type. Expected application/json' })
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { userId, movieId, rating, reviewText } = req.body

    try {
        const client = await pgPool.connect()

        const movieQuery = 'SELECT * FROM movie WHERE movie_id = $1'
        const movieResult = await client.query(movieQuery, [movieId])
    
        if (movieResult.rows.length === 0){
            client.release()
            return res.status(404).json({ error: 'Movie not found'})
        }

        if (userId) {
            const userQuery = 'SELECT * FROM user_account WHERE user_id = $1'
            const userResult = await client.query(userQuery, [userId])

            if (userResult.rows.length === 0){
                client.release()
                return res.status(404).json({ error: 'User not found'})
            }
        }

        const reviewQuery = `
            INSERT INTO review (user_id, movie_id, rating, review_text)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `
        const values = [userId, movieId, rating, reviewText]

        const reviewResult = await client.query(reviewQuery, values)
        client.release()

        return res.status(201).json({ message: 'Review added successfully', review: reviewResult.rows[0] })
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

// add a new favorite movie for user
app.post('/favorites', [
    body('userId').notEmpty().withMessage('userId cannot be empty'),
    body('movieId').notEmpty().withMessage('movieId cannot be empty')
], async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Invalid content type. Expected application/json' })
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { userId, movieId } = req.body
    try {
        const client = await pgPool.connect()
        const query = `
            INSERT INTO favourite (movie_id, user_id)
            VALUES ($1, $2)
            RETURNING *;
            `
        const values = [movieId, userId]
        const result = await client.query(query, values)
        client.release()

        return res.status(201).json({ message: 'Favorite added successfully', favorite: result.rows[0] })
    } catch (err) {
        if (err.code === '23503'){
            return res.status(400).json({ error: 'User ID or Movie ID does not exist'})
        }
        return res.status(500).json({ error: 'Internal server error' })
    }
})