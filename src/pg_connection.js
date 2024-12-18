import dotenv from 'dotenv'
import pg from 'pg'
dotenv.config()

const pgPool = new pg.Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST_DOCKER || process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB
})

export {pgPool}