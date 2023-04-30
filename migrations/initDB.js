require('dotenv').config();
const { resolve } = require('path');
const config = require('../utils/config');
const { reject } = require('lodash');

const Pool = require('pg').Pool;

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.NODE_ENV === 'test' ? '2345' : process.env.PG_PORT,
});


const createTableUsersPromise = new Promise(async (resolve, reject) => {
    pool.query('create table users(id serial unique not null, first_name varchar(50), last_name varchar(50), email varchar(50) unique not null, password varchar(100), token varchar(200), account_number varchar(30) unique not null, PRIMARY KEY (id, email, account_number));', (error, results) => {
        if (error) {
            throw error;
        }
    });

    resolve("User Table Created!");
});

const createTableAccountsPromise = new Promise(async(resolve, reject) => {
    pool.query('create table accounts(account_number varchar(50) primary key, account_type varchar(30) not null, balance numeric(10, 2) not null);', (error, results) => {
        if (error) {
            throw error;
        }
    });

    resolve("Accounts table created!");
});



const createTableInternalTransactionsPromise = new Promise(async(resolve, reject) => {
    pool.query('create table internal_transactions(id serial not null, source_account_number varchar(50), destination_account_number varchar(50) not null, transaction_type VARCHAR(20) NOT NULL, transaction_amount NUMERIC(10, 2) NOT NULL, transaction_date TIMESTAMP NOT NULL DEFAULT NOW(), PRIMARY KEY (id), FOREIGN KEY (source_account_number) REFERENCES accounts (account_number) ON DELETE CASCADE, FOREIGN KEY (destination_account_number) REFERENCES accounts (account_number) ON DELETE CASCADE);', (error, results) => {
        if (error) {
            throw error;
        }
    });

    resolve("Internal Transactions Table Created!");
});



const createTableExternalTransactionsPromise = new Promise(async(resolve, reject) => {
    pool.query('CREATE TABLE external_transactions(id SERIAL PRIMARY KEY, source_account_number VARCHAR(50) NOT NULL, destination_bank_name VARCHAR(100) NOT NULL, destination_account_number VARCHAR(50) NOT NULL, transaction_type VARCHAR(20) NOT NULL, transaction_amount NUMERIC(10, 2) NOT NULL, transaction_date TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (source_account_number) REFERENCES accounts (account_number) ON DELETE CASCADE);', (error, results) => {
        if (error) {
            throw error;
        }
    });

    resolve("External Transactions Created!");
});

const createAllTables = async () => {
    await createTableUsersPromise;

    await createTableAccountsPromise;

    await createTableInternalTransactionsPromise;

    await createTableExternalTransactionsPromise;
};

createAllTables();