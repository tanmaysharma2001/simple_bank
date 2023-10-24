require('dotenv').config();


const PORT: number = Number(process.env.PORT);
const TOKEN_KEY: string | undefined = process.env.TOKEN_KEY;

// Postgres
const PG_HOST: string | undefined = process.env.PG_HOST;
const PG_PORT: number = process.env.NODE_ENV === 'test' ? 2345 : Number(process.env.PG_PORT);
const PG_USER: string | undefined = process.env.PG_USER;
const PG_PASSWORD: string | undefined = process.env.PG_PASSWORD;
const PG_DATABASE: string | undefined = process.env.PG_DATABASE;


const config = {
    PORT,
    TOKEN_KEY,
    PG_HOST,
    PG_PORT,
    PG_USER,
    PG_PASSWORD,
    PG_DATABASE
};

export default config;