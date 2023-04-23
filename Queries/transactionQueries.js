require('dotenv').config();

const Pool = require('pg').Pool;

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});


const sendAmountToAnotherUserInternally = async (req, res) => {

    const body = req.body;

    const {
        amount,
        source_account_number,
        destination_account_number
    } = body;

    if (!(amount && source_account_number && destination_account_number)) {
        res.status(400).send("All input is required.");
        return;
    }

    let result;

    // currently we have the same currency
    // everything including transactions
    const transactionPromise = new Promise(async (resolve, reject) => {

        // we use the basic concept of transactions
        // we need begin and rollback as we are carrying
        // out many transactions in one query.
        pool.query("BEGIN;")
            .then((results) => {
            return pool.query(
                "UPDATE accounts SET balance=(balance-$1) WHERE account_number=$2;",
                [amount, source_account_number]
            );
            })
            .then((results) => {
                return pool.query(
                    'Update accounts set balance=(balance+$1) where account_number=$2;',
                    [amount, destination_account_number]
                );
            })
            .then((results) => {
                return pool.query("COMMIT;");
            })
            .then((results) => {
                console.log('transaction completed');
            })
            .catch((err) => {
                console.error('error while querying:', err);
                return pool.query('rollback')
            })
            .catch((err) => {
                console.error('error while rolling back transaction:', err);
            })

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

};

const depositToAccount = async (req, res) => {
    const body = req.body;

    const {
        amount,
        account_number
    } = body;

    if(!(amount && account_number)) {
        res.status(400).send("All input is required.");
        return;
    }

    let result;


    const transactionPromise = new Promise(async (resolve, reject) => {
        pool.query('Update accounts set balance=(balance+$1) where account_number=$2;', [amount, account_number], (error, results) => {
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

const withdrawalFromAccount = async (req, res) => {
    const body = req.body;

    const {
        amount,
        account_number
    } = body;

    if(!(amount && account_number)) {
        res.status(400).send("All input is required.");
        return;
    }

    let result;

    const transactionPromise = new Promise(async (resolve, reject) => {
        pool.query('Update accounts set amount=(amount-$1) where account_number=$2;', [amount, account_number], (error, results) => {
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


const storeInternalTransactions = async (params) => {

    const {
        source_account_number,
        destination_account_number,
        transaction_type,
        transaction_amount
    } = params;

    let transactionID;

    // retrieving the transaction id
    const transactionIDPromise = new Promise((resolve, reject) => {
        pool.query('select max(id) from internal_transactions;', (error, results) => {
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
        pool.query('Insert into internal_transactions(id, source_account_number, destination_account_number, transaction_type, transaction_amount) values($1, $2, $3, $4, $5);', [transactionID, source_account_number, destination_account_number, transaction_type, transaction_amount], (error, results) => {
            if (error) {
                reject(error);
                throw error;
            }

            resolve(`Transaction record added with id:${transactionID}`);
        });

    });
}


module.exports = {
    sendAmountToAnotherUserInternally,
    depositToAccount,
    withdrawalFromAccount
}