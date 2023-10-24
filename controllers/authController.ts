import config from "../utils/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import {Request, Response} from "express";

import pool from "../utils/pool";

// use new promise in the queries to fix code
function getUsers(req: Request, res: Response): void {
    pool.query('Select * from users order by id asc', (error: Error, results: any) => {
        if (error) {
            throw error;
        }
        res.status(200).json({
            status: 'success',
            data: results.rows
        });
    });
}

// get user by id
function getUserByID(req: Request, res: Response): void {
    const id = parseInt(req.params.id);

    pool.query('Select * from users where id = $1', [id], (error: Error, results: any) => {
        if (error) {
            throw error;
        }

        res.status(200).json({
            status: 'success',
            data: results.rows[0]
        });

    })
}

// add a user
function addUser(req: Request, res: Response): void {
    const body = req.body;

    const {
        first_name,
        last_name,
        email,
        password
    } = body;


    pool.query('Insert into users(ID, First_Name, Last_Name, Email, Password, token, account_number) values((select max(ID) from users) + 1, $1, $2, $3, $4, null, $5) returning *;',
        [first_name, last_name, email, password, Math.floor(Math.random() * 1E16)], (error: Error, results: any) => {
            if (error) {
                throw error;
            }

            res.status(201).json({
                status: 'success',
                message: `User added with ID: ${results.rows[0].id}`
            });

        });
}

// update a user
function updateUser(req: Request, res: Response): void {
    const id = parseInt(req.params.id);

    const {first_name, last_name, username, password, account_number} = req.body;

    pool.query('Update users set first_name = $1, last_name = $2, username = $3, password = $4, account_number=$6 where id = $5 returning *',
        [first_name, last_name, username, password, id, account_number], (error: Error, results: any) => {
            if (error) {
                throw error;
            }

            res.status(201).json({
                status: 'success',
                data: results.rows[0]
            });
        })
}

// delete a user
function deleteUser(req: Request, res: Response): void {
    const id = parseInt(req.params.id);

    pool.query('Delete from users where id = $1', [id], (error: Error, _results: any) => {
        if (error) {
            throw error;
        }

        res.status(200).send({
            status: 'success',
            message: `User deleted with id: ${id}`
        });
    })
}


// register user
async function registerUser(req: Request, res: Response) {
    try {
        const body = req.body;

        const {
            first_name,
            last_name,
            email,
            password,
            account_type
        } = body;


        if (!(first_name && last_name && email && password && account_type)) {
            res.status(400).send({
                status: 'fail',
                message: 'All Input is required'
            });
        }


        let userExists = false;
        // checking if this user already exists
        const userCheckingPromise = new Promise((resolve, reject) => {
            pool.query('Select * from users where email = $1', [email], (error: Error, results: any) => {
                if (error) {
                    reject(error);
                    throw error;
                }

                if (results.rows.length > 0) {
                    console.log("user already exists, please login");
                    res.status(409).send({
                        status: 'fail',
                        message: 'user already exists, please login'
                    });
                    resolve("user already exists");
                    userExists = true;
                } else {
                    resolve("user doesn't exist in the table, it can be created");
                }
            });
        });
        await userCheckingPromise;

        if (userExists) {
            return;
        }


        // user doesn't exist

        // encrypted password
        const encryptedPassword = await bcrypt.hash(password, 10);

        class User {
            public id: number;
            public first_name: string;
            public last_name: string;
            public email: string;
            public password: string;
            public token: string;
            public account_number: string;

            constructor(
                id: number,
                first_name: string,
                last_name: string,
                email: string,
                password: string,
                token: string,
                account_number: string) {

                this.id = id;
                this.first_name = first_name;
                this.last_name = last_name;
                this.email = email;
                this.password = password;
                this.token = token;
                this.account_number = account_number;

            }
        }

        let currentUser: User = {account_number: "", email: "", first_name: "", id: 0, last_name: "", password: "", token: ""}

        // let currentUser = {
        //     id: {},
        //     first_name: {},
        //     last_name: {},
        //     email: {},
        //     password: {},
        //     token: {},
        //     account_number: {},
        //
        //     get property() {
        //     },
        //     set property(value) {
        //     },
        // };


        // user creation in database
        const userCreationPromise = new Promise(async (resolve, reject) => {

            // check if the user table is empty
            let userID;

            const userIDPromise = new Promise((resolve, reject) => {
                pool.query('select max(ID) from users;', (error: Error, results: any) => {
                    if (error) {
                        reject(error);
                        throw error;
                    }

                    if (results.rows.length === 0) {
                        userID = 1;
                    } else {
                        userID = results.rows[0].max + 1;
                    }

                    resolve(userID);
                });
            });

            await userIDPromise;


            pool.query('Insert into users(ID, First_Name, Last_Name, Email, Password, account_number) values($1, $2, $3, $4, $5, $6) returning *;',
                [userID, first_name, last_name, email, encryptedPassword, Math.floor(Math.random() * 1E16)],
                (error: Error, results: any) => {
                    if (error) {
                        reject(error);
                        throw error;
                    }

                    currentUser = results.rows[0];

                    resolve("User created");
                });
        });

        await userCreationPromise;


        // account creation in database
        const accountCreationPromise = new Promise((resolve, reject) => {

            pool.query('insert into accounts(account_number, account_type, balance) values($1, $2, $3);',
                [currentUser.account_number, account_type, 0.0],
                (error: Error, _results: any) => {
                    if (error) {
                        reject(error);
                        throw error;
                    }
                });

            resolve("Account Created");

        });

        await accountCreationPromise;


        // signing token
        const token = jwt.sign(
            {user_id: currentUser.id, email},
            config.TOKEN_KEY as string,
            {
                expiresIn: "2h",
            }
        );


        // adding token to the user field: it is the first time values will be added
        const addTokenPromise = new Promise((resolve, reject) => {
            pool.query('update users set token = $1 where id = $2 returning *;', [token, currentUser.id], (error: Error, _results: any) => {
                if (error) {
                    reject(error);
                    throw error;
                }

                resolve("token added for the user");
            });
        });

        await addTokenPromise;

        res.status(201).send({
            status: 'success',
            message: `User added with ID: ${currentUser.id}`
        });

    } catch (err) {
        console.log(err);
    }
}

// login user
async function loginUser(req: Request, res: Response) {
    try {
        const body = req.body;

        const {
            email,
            password
        } = body;

        if(!(email && password)) {
            res.status(400).send({
                status: 'fail',
                message: 'All Input is required'
            });
        }

        // const decryptedPassword = await bcrypt

        // checking if the user exists or not
        pool.query('select * from users where email = $1', [email], async (error: Error, results: any) => {
            if (error) {
                throw error;
            }

            console.log(results.rows);

            if (results.rows[0].length === 0) {
                res.status(400).send({
                    status: 'fail',
                    message: `User doesn't exists`
                });
            }
            else {
                const user = results.rows[0];
                if(await bcrypt.compare(password, user.password)) {
                    const token = jwt.sign(
                        {user_id: user.id, email },
                        config.TOKEN_KEY as string,
                        {
                            expiresIn: "2h",
                        }
                    );

                    pool.query('update users set token = $1 where id = $2 returning *;', [token, user.id], (error: Error, resultss: any) => {
                        if (error) {
                            throw error;
                        }

                        console.log("Successfully signed up!");

                        res.status(200).send({
                            status: 'success',
                            data: resultss.rows[0]
                        });
                    })
                }
                else {
                    res.status(400).send({
                        status: 'fail',
                        message: 'Invalid Credentials'
                    });
                }
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}


const authController = {
    getUsers,
    getUserByID,
    addUser,
    updateUser,
    deleteUser,
    registerUser,
    loginUser
};

export default authController;