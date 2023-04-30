const express = require('express');
const transactionsRouter = express.Router();

const transactionsQueries = require('./../Queries/transactionQueries');
const middleware = require("../utils/middleware");


transactionsRouter.post('/transferToAccount', transactionsQueries.sendAmountToAnotherUserInternally);

transactionsRouter.post('/depositToAccount', transactionsQueries.depositToAccount);

module.exports = transactionsRouter;