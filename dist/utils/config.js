"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const PORT = Number(process.env.PORT);
const TOKEN_KEY = process.env.TOKEN_KEY;
// Postgres
const PG_HOST = process.env.PG_HOST;
const PG_PORT = process.env.NODE_ENV === 'test' ? 2345 : Number(process.env.PG_PORT);
const PG_USER = process.env.PG_USER;
const PG_PASSWORD = process.env.PG_PASSWORD;
const PG_DATABASE = process.env.PG_DATABASE;
const config = {
    PORT,
    TOKEN_KEY,
    PG_HOST,
    PG_PORT,
    PG_USER,
    PG_PASSWORD,
    PG_DATABASE
};
exports.default = config;
