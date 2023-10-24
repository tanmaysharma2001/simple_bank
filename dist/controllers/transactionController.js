"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const pool_1 = __importDefault(require("../utils/pool"));
function checkBodyParameters(req, res, next) {
    const body = req.body;
    const { amount, source_account_number, destination_account_number } = body;
    if (!amount || !source_account_number || !destination_account_number) {
        res.status(400).send({
            status: 'fail',
            message: "All input is required.",
        });
    }
    next();
}
function sendAmountToAnotherUserInternally(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const { amount, source_account_number, destination_account_number } = body;
        let result;
        // currently we have the same currency
        // everything including transactions
        const transactionPromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            // deducting that amount from source account
            pool_1.default.query('Update accounts set balance=(balance-$1) where account_number=$2;', [amount, source_account_number], (error, results) => {
                if (error) {
                    reject(error);
                    throw error;
                }
            });
            // adding that amount to destination account
            pool_1.default.query('Update accounts set balance=(balance+$1) where account_number=$2;', [amount, destination_account_number], (error, results) => {
                if (error) {
                    reject(error);
                    throw error;
                }
            });
            result = yield storeInternalTransactions({
                source_account_number: source_account_number,
                destination_account_number: destination_account_number,
                transaction_type: 'TRANSFER',
                transaction_amount: amount
            });
            resolve("Transaction Completed!");
        }));
        yield transactionPromise;
        res.status(201).send(result);
    });
}
function depositToAccount(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const { amount, source_account_number, account_number } = body;
        let result;
        const transactionPromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            pool_1.default.query('Update accounts set balance=(balance+$1) where account_number=$2;', [amount, account_number], (error, results) => {
                if (error) {
                    reject(error);
                    throw error;
                }
            });
            result = yield storeInternalTransactions({
                source_account_number: null,
                destination_account_number: account_number,
                transaction_type: 'DEPOSIT',
                transaction_amount: amount
            });
            resolve(result);
        }));
        yield transactionPromise;
        res.status(201).send(result);
    });
}
;
function withdrawalFromAccount(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const { amount, account_number } = body;
        let result;
        const transactionPromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            pool_1.default.query('Update accounts set amount=(amount-$1) where account_number=$2;', [amount, account_number], (error, results) => {
                if (error) {
                    reject(error);
                    throw error;
                }
            });
            result = yield storeInternalTransactions({
                source_account_number: null,
                destination_account_number: account_number,
                transaction_type: 'WITHDRAWAL',
                transaction_amount: amount
            });
            resolve(result);
        }));
        yield transactionPromise;
        res.status(201).send(result);
    });
}
function storeInternalTransactions(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { source_account_number, destination_account_number, transaction_type, transaction_amount } = params;
        let transactionID;
        // retrieving the transaction id
        const transactionIDPromise = new Promise((resolve, reject) => {
            pool_1.default.query('select max(id) from internal_transactions;', (error, results) => {
                if (error) {
                    reject(error);
                    throw error;
                }
                if (results.rows.length === 0) {
                    transactionID = 1;
                }
                else {
                    transactionID = results.rows[0].max + 1;
                }
                resolve(transactionID);
            });
        });
        yield transactionIDPromise;
        return new Promise((resolve, reject) => {
            pool_1.default.query('Insert into internal_transactions(id, source_account_number, destination_account_number, transaction_type, transaction_amount) values($1, $2, $3, $4, $5);', [transactionID, source_account_number, destination_account_number, transaction_type, transaction_amount], (error, results) => {
                if (error) {
                    reject(error);
                    throw error;
                }
                resolve(`Transaction record added with id:${transactionID}`);
            });
        });
    });
}
const transactionsQueries = {
    checkBodyParameters,
    sendAmountToAnotherUserInternally,
    depositToAccount,
    withdrawalFromAccount
};
exports.default = transactionsQueries;
