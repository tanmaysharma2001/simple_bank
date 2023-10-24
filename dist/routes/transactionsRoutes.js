"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transactionsRouter = express_1.default.Router();
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const transactionController_1 = __importDefault(require("../controllers/transactionController"));
const middleware_1 = __importDefault(require("../utils/middleware"));
transactionsRouter.post('/transferToAccount', middleware_1.default.verifyToken, transactionController_1.default.checkBodyParameters, (0, catchAsync_1.default)(function (req, res, next) {
    transactionController_1.default.sendAmountToAnotherUserInternally(req, res, next);
    // res.status(201).send(result);
}));
transactionsRouter.post('/depositToAccount', middleware_1.default.verifyToken, transactionController_1.default.checkBodyParameters, (0, catchAsync_1.default)(function (req, res, next) {
    // res.send(transactionsQueries.depositToAccount);
    transactionController_1.default.depositToAccount(req, res, next);
    // res.status(201).send(result);
}));
exports.default = transactionsRouter;
