require('dotenv').config();

import {NextFunction, Request, Response} from "express";
import pool from "../utils/pool";


function checkBodyParameters(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    const {
        amount,
        source_account_number,
        destination_account_number
    } = body;

    if (!amount || !source_account_number || !destination_account_number) {
        res.status(400).send(
            {
                status: 'fail',
                message: "All input is required.",
            }
        )
    }

    next();
}


async function sendAmountToAnotherUserInternally(req: Request, res: Response, next: NextFunction) {
        const body = req.body;

        const {
            amount,
            source_account_number,
            destination_account_number
        } = body;

        let result;

        // currently we have the same currency
        // everything including transactions
        const transactionPromise = new Promise(async (resolve, reject) => {
            // deducting that amount from source account
            pool.query('Update accounts set balance=(balance-$1) where account_number=$2;', [amount, source_account_number], (error: Error, results: any) => {
                if (error) {
                    reject(error);
                    throw error;
                }
            });


            // adding that amount to destination account
            pool.query('Update accounts set balance=(balance+$1) where account_number=$2;', [amount, destination_account_number], (error: Error, results: any) => {
                if (error) {
                    reject(error);
                    throw error;
                }
            });

            result = await storeInternalTransactions({
                source_account_number: source_account_number,
                destination_account_number: destination_account_number,
                transaction_type: 'TRANSFER',
                transaction_amount: amount
            });

            resolve("Transaction Completed!");
        });

        await transactionPromise;

        res.status(201).send(result);

}

async function depositToAccount(req: Request, res: Response, next: NextFunction) {

    const body = req.body;

    const {
        amount,
        source_account_number,
        account_number
    } = body;


    let result;


    const transactionPromise = new Promise(async (resolve, reject) => {
        pool.query('Update accounts set balance=(balance+$1) where account_number=$2;', [amount, account_number], (error: Error, results: any) => {
            if (error) {
                reject(error);
                throw error;
            }
        });

        result = await storeInternalTransactions({
            source_account_number: null,
            destination_account_number: account_number,
            transaction_type: 'DEPOSIT',
            transaction_amount: amount
        });

        resolve(result);
    });

    await transactionPromise;

    res.status(201).send(result);
};

async function withdrawalFromAccount(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    const {
        amount,
        account_number
    } = body;


    let result;

    const transactionPromise = new Promise(async (resolve, reject) => {
        pool.query('Update accounts set amount=(amount-$1) where account_number=$2;', [amount, account_number], (error: Error, results: any) => {
            if (error) {
                reject(error);
                throw error;
            }
        });

        result = await storeInternalTransactions({
            source_account_number: null,
            destination_account_number: account_number,
            transaction_type: 'WITHDRAWAL',
            transaction_amount: amount
        });

        resolve(result);
    });

    await transactionPromise;

    res.status(201).send(result);
}


async function storeInternalTransactions(params: any) {

    const {
        source_account_number,
        destination_account_number,
        transaction_type,
        transaction_amount
    } = params;

    let transactionID: number;

    // retrieving the transaction id
    const transactionIDPromise = new Promise((resolve, reject) => {
        pool.query('select max(id) from internal_transactions;', (error: Error, results: any) => {
            if (error) {
                reject(error);
                throw error;
            }

            if (results.rows.length === 0) {
                transactionID = 1;
            } else {
                transactionID = results.rows[0].max + 1;
            }

            resolve(transactionID);
        });
    });

    await transactionIDPromise;

    return new Promise((resolve, reject) => {
        pool.query('Insert into internal_transactions(id, source_account_number, destination_account_number, transaction_type, transaction_amount) values($1, $2, $3, $4, $5);', [transactionID, source_account_number, destination_account_number, transaction_type, transaction_amount], (error: Error, results: any) => {
            if (error) {
                reject(error);
                throw error;
            }

            resolve(`Transaction record added with id:${transactionID}`);
        });

    });
}


const transactionsQueries = {
    checkBodyParameters,
    sendAmountToAnotherUserInternally,
    depositToAccount,
    withdrawalFromAccount
}

export default transactionsQueries;