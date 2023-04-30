const express = require('express');
const transactionsRouter = express.Router();

const transactionsQueries = require('./../Queries/transactionQueries');
const middleware = require("../utils/middleware");


transactionsRouter.post('/transferToAccount', middleware.verifyToken, function(req, res) {
    transactionsQueries.sendAmountToAnotherUserInternally
});

transactionsRouter.post('/depositToAccount', middleware.verifyToken, function(req, res) {
    transactionsQueries.depositToAccount
});

module.exports = transactionsRouter;