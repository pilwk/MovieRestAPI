import express from 'express'
import dotenv from 'dotenv'
import { pgPool } from "./pg_connection.js"
import { body, check, validationResult } from 'express-validator'

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
        `);
    } else {
        res.json({
            message: `Server is running on port ${port}`,
            databaseStatus: db_status
        });
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
        if (!keyword) {
            //return all movies
            return res.status(500).json({ queryReturn: 'all movies' })
        }
        //return movies by keyword
        return res.json(filtered)
    } catch (error) {
        return res.status(500).json({ error: 'Internal server Error' })
    }
});

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
    const { id } = req.params;
    const idNum = parseInt(id)
    try {
        //TBA query
        return res.json({ msg: 'search by id', id: id });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

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
    const { username } = req.params;
    const filtered = { username }
    try {
        //TBA
        res.json({ username });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// add a new movie
app.post('/movies', [
    body('title').notEmpty().withMessage('title is required'),
    body('year').notEmpty().withMessage('year is required')
], async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Invalid content type. Expected application/json' })
    }
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { title, year, genre, director } = req.body;
    const filtered = { title, year, genre: genre || 'Uncategorized', director: director || 'Unknown' }
    //todo:handling for missing genres and directors(?) due to fkey constraints
    try {
        //TBA
        return res.status(201).json({ message: 'Movie added successfully', movie: filtered });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

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
    const { username, password, name, dob } = req.body;
    const filtered = { username, password, name, dob }
    //todo implement password handling/hashing
    try {
        //TBA query for adding user
        return res.status(201).json({ message: 'User added successfully', user: filtered });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

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
    const { genreName } = req.body;
    const filtered = { genreName }
    try {
        //TBA genre query
        return res.status(201).json({ message: 'Genre added successfully', genreName });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// add a new movie review
app.post('/reviews', [
    body('userId').optional(),
    body('movieId').notEmpty().withMessage('movieId must be included'),
    body('rating').isFloat({ min: 0, max: 10 }).withMessage('Rating must be a number between 0 and 5'),
    body('reviewText').optional().isString()
], async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Invalid content type. Expected application/json' })
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { userId, movieId, rating, reviewText } = req.body;
    // checking if userId is valid (?), movieId exists.
    const filtered = { userId, movieId, rating, reviewText }
    try {
        //TBA add review query
        return res.status(201).json({ message: 'Review added successfully', review: filtered });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

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
    const { userId, movieId } = req.body;
    const filtered = { userId, movieId }
    try {
        //TBA query
        return res.status(201).json({ message: 'Favorite added successfully', filtered });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// remove movie with id
app.delete('/movies/:id'), [
    check('id').notEmpty().isInt().withMessage('invalid id')
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { id } = req.params;
    const filtered = { id }

    //check if movie exists
    //check token or permission(?)
    try {
        //tba movie removal & check if exists
        return res.json({ message: 'Movie deleted succesfully', filtered })
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' })
    }
}