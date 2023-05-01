const express = require('express');
const transactionsRouter = express.Router();

const transactionsQueries = require('./../Queries/transactionQueries');
const middleware = require("../utils/middleware");


transactionsRouter.post('/transferToAccount', middleware.verifyToken, function(req, res) {
    transactionsQueries.sendAmountToAnotherUserInternally(req, res);
    // res.status(201).send(result);
});

transactionsRouter.post('/depositToAccount', middleware.verifyToken, function(req, res) {
    // res.send(transactionsQueries.depositToAccount);
    transactionsQueries.depositToAccount(req, res);
    // res.status(201).send(result);
});

module.exports = transactionsRouter;