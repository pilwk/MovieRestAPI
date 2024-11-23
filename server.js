import express from 'express'
import dotenv from 'dotenv'
import { pgPool } from "./pg_connection.js"

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
    console.log(req.body)
    try {
        const client = await pgPool.connect()
        client.release()
        db_status = `Connected to ${process.env.POSTGRES_DB} on port ${process.env.POSTGRES_PORT}`
    } catch (err) {
        console.log(err)
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

// get all movies
app.get('/movies', async (req, res) => {
    try {
        //TBA
        res.json('foo')
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server Error' })
    }
})
// get movie (keyword)
app.get('/movies/search/:keyword', async (req, res) => {
    const { keyword } = req.params;
    try {
        //TBA
        res.json('foo')
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server Error' })
    }
});
// get movie (id)
app.get('/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        //TBA
        res.json('foo');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// get favourite (username)
app.get('/favorites/:username', async (req, res) => {
    const { username } = req.params;
    try {
        //TBA
        res.json('foo');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// add a new movie
app.post('/movies', async (req, res) => {
    const { title, year, genre, director } = req.body;
    //todo:handling for missing genres and directors(?) due to fkey constraints
    try {
        //TBA
        res.status(201).json({ message: 'Movie added successfully' });
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// add (register) a new user
app.post('/users', async (req, res) => {
    const { username, password, name, dob } = req.body;
    //todo implement password handling/hashing
    try {
        //TBA
        res.status(201).json({ message: 'User added successfully' });
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// add a new genre
app.post('/genres', async (req, res) => {
    const { genreName } = req.body;
    try {
        //TBA
        res.status(201).json({ message: 'Genre added successfully' });
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// add a new movie review
app.post('/reviews', async (req, res) => {
    const { userId, movieId, rating, reviewText } = req.body;
    try {
        //TBA
        res.status(201).json({ message: 'Review added successfully' });
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// add a new favorite movie for user
app.post('/favorites', async (req, res) => {
    const { userId, movieId } = req.body;
    try {
        //TBA
        res.status(201).json({ message: 'Favorite added successfully' });
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// remove movie with id
app.delete('/movies/:id'), async (req, res) => {
    const { id } = req.params;

    try {
        //tba

        res.json({ message: 'Movie deleted succesfully' })
    } catch (err) {
        console.log(err.stack)
        res.status(500).json({ error: 'Internal server error' })
    }
}