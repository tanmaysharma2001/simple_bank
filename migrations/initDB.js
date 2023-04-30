require('dotenv').config();
const config = require('../utils/config');

const Pool = require('pg').Pool;

const pool = new Pool({
    user: config.PG_USER,
    host: config.PG_HOST,
    database: config.PG_DATABASE,
    password: config.PG_PASSWORD,
    port: config.PG_PORT,
});


const createTableUsers = () => {
    pool.query('create table users(id serial unique not null, first_name varchar(50), last_name varchar(50), email varchar(50) unique not null, password varchar(100), token varchar(200), account_number varchar(30) unique not null, PRIMARY KEY (id, email, account_number));', (error, results) => {
        if (error) {
            throw error;
        }
    });
}

createTableUsers();

