import express, {NextFunction, Request, Response} from "express";
const transactionsRouter = express.Router();

import catchAsync from "../utils/catchAsync";
import transactionController from "../controllers/transactionController";
import middleware from "../utils/middleware";

transactionsRouter.post('/transferToAccount', middleware.verifyToken, transactionController.checkBodyParameters, catchAsync(function(req: Request, res: Response, next: NextFunction) {
    transactionController.sendAmountToAnotherUserInternally(req, res, next);
    // res.status(201).send(result);
}));

transactionsRouter.post('/depositToAccount', middleware.verifyToken, transactionController.checkBodyParameters, catchAsync(function(req: Request, res: Response, next: NextFunction) {
    // res.send(transactionsQueries.depositToAccount);
    transactionController.depositToAccount(req, res, next);
    // res.status(201).send(result);
}));

export default transactionsRouter;