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
const config_1 = __importDefault(require("../utils/config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pool_1 = __importDefault(require("../utils/pool"));
// use new promise in the queries to fix code
function getUsers(req, res) {
    pool_1.default.query('Select * from users order by id asc', (error, results) => {
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
function getUserByID(req, res) {
    const id = parseInt(req.params.id);
    pool_1.default.query('Select * from users where id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json({
            status: 'success',
            data: results.rows[0]
        });
    });
}
// add a user
function addUser(req, res) {
    const body = req.body;
    const { first_name, last_name, email, password } = body;
    pool_1.default.query('Insert into users(ID, First_Name, Last_Name, Email, Password, token, account_number) values((select max(ID) from users) + 1, $1, $2, $3, $4, null, $5) returning *;', [first_name, last_name, email, password, Math.floor(Math.random() * 1E16)], (error, results) => {
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
function updateUser(req, res) {
    const id = parseInt(req.params.id);
    const { first_name, last_name, username, password, account_number } = req.body;
    pool_1.default.query('Update users set first_name = $1, last_name = $2, username = $3, password = $4, account_number=$6 where id = $5 returning *', [first_name, last_name, username, password, id, account_number], (error, results) => {
        if (error) {
            throw error;
        }
        res.status(201).json({
            status: 'success',
            data: results.rows[0]
        });
    });
}
// delete a user
function deleteUser(req, res) {
    const id = parseInt(req.params.id);
    pool_1.default.query('Delete from users where id = $1', [id], (error, _results) => {
        if (error) {
            throw error;
        }
        res.status(200).send({
            status: 'success',
            message: `User deleted with id: ${id}`
        });
    });
}
// register user
function registerUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const { first_name, last_name, email, password, account_type } = body;
            if (!(first_name && last_name && email && password && account_type)) {
                res.status(400).send({
                    status: 'fail',
                    message: 'All Input is required'
                });
            }
            let userExists = false;
            // checking if this user already exists
            const userCheckingPromise = new Promise((resolve, reject) => {
                pool_1.default.query('Select * from users where email = $1', [email], (error, results) => {
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
                    }
                    else {
                        resolve("user doesn't exist in the table, it can be created");
                    }
                });
            });
            yield userCheckingPromise;
            if (userExists) {
                return;
            }
            // user doesn't exist
            // encrypted password
            const encryptedPassword = yield bcryptjs_1.default.hash(password, 10);
            class User {
                constructor(id, first_name, last_name, email, password, token, account_number) {
                    this.id = id;
                    this.first_name = first_name;
                    this.last_name = last_name;
                    this.email = email;
                    this.password = password;
                    this.token = token;
                    this.account_number = account_number;
                }
            }
            let currentUser = { account_number: "", email: "", first_name: "", id: 0, last_name: "", password: "", token: "" };
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
            const userCreationPromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                // check if the user table is empty
                let userID;
                const userIDPromise = new Promise((resolve, reject) => {
                    pool_1.default.query('select max(ID) from users;', (error, results) => {
                        if (error) {
                            reject(error);
                            throw error;
                        }
                        if (results.rows.length === 0) {
                            userID = 1;
                        }
                        else {
                            userID = results.rows[0].max + 1;
                        }
                        resolve(userID);
                    });
                });
                yield userIDPromise;
                pool_1.default.query('Insert into users(ID, First_Name, Last_Name, Email, Password, account_number) values($1, $2, $3, $4, $5, $6) returning *;', [userID, first_name, last_name, email, encryptedPassword, Math.floor(Math.random() * 1E16)], (error, results) => {
                    if (error) {
                        reject(error);
                        throw error;
                    }
                    currentUser = results.rows[0];
                    resolve("User created");
                });
            }));
            yield userCreationPromise;
            // account creation in database
            const accountCreationPromise = new Promise((resolve, reject) => {
                pool_1.default.query('insert into accounts(account_number, account_type, balance) values($1, $2, $3);', [currentUser.account_number, account_type, 0.0], (error, _results) => {
                    if (error) {
                        reject(error);
                        throw error;
                    }
                });
                resolve("Account Created");
            });
            yield accountCreationPromise;
            // signing token
            const token = jsonwebtoken_1.default.sign({ user_id: currentUser.id, email }, config_1.default.TOKEN_KEY, {
                expiresIn: "2h",
            });
            // adding token to the user field: it is the first time values will be added
            const addTokenPromise = new Promise((resolve, reject) => {
                pool_1.default.query('update users set token = $1 where id = $2 returning *;', [token, currentUser.id], (error, _results) => {
                    if (error) {
                        reject(error);
                        throw error;
                    }
                    resolve("token added for the user");
                });
            });
            yield addTokenPromise;
            res.status(201).send({
                status: 'success',
                message: `User added with ID: ${currentUser.id}`
            });
        }
        catch (err) {
            console.log(err);
        }
    });
}
// login user
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const { email, password } = body;
            if (!(email && password)) {
                res.status(400).send({
                    status: 'fail',
                    message: 'All Input is required'
                });
            }
            // const decryptedPassword = await bcrypt
            // checking if the user exists or not
            pool_1.default.query('select * from users where email = $1', [email], (error, results) => __awaiter(this, void 0, void 0, function* () {
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
                    if (yield bcryptjs_1.default.compare(password, user.password)) {
                        const token = jsonwebtoken_1.default.sign({ user_id: user.id, email }, config_1.default.TOKEN_KEY, {
                            expiresIn: "2h",
                        });
                        pool_1.default.query('update users set token = $1 where id = $2 returning *;', [token, user.id], (error, resultss) => {
                            if (error) {
                                throw error;
                            }
                            console.log("Successfully signed up!");
                            res.status(200).send({
                                status: 'success',
                                data: resultss.rows[0]
                            });
                        });
                    }
                    else {
                        res.status(400).send({
                            status: 'fail',
                            message: 'Invalid Credentials'
                        });
                    }
                }
            }));
        }
        catch (error) {
            console.log(error);
        }
    });
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
exports.default = authController;
