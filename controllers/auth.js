const express = require('express');
const authRouter = express.Router();

const authQueries = require('../Queries/authQueries.js');

authRouter.get('/getUsers', authQueries.getUsers);

authRouter.post('/deleteUser/:id', authQueries.deleteUser);

authRouter.post('/register', authQueries.registerUser);

authRouter.post('/login', authQueries.loginUser);

module.exports = authRouter;