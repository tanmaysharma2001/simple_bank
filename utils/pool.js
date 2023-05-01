const config = require('../utils/config');

const Pool = require('pg').Pool;

const pool = new Pool({
    user: config.PG_USER,
    host: config.PG_HOST,
    database: config.PG_DATABASE,
    password: config.PG_PASSWORD,
    port: config.PG_PORT,
});

module.exports = pool;