const Pool = require('pg').Pool;
const config = require('../utils/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const pool = new Pool({
    user: config.PG_USER,
    host: config.PG_HOST,
    database: config.PG_DATABASE,
    password: config.PG_PASSWORD,
    port: config.PG_PORT,
});

// use new promise in the queries to fix code

const getUsers = (req, res) => {
    pool.query('Select * from users order by id asc', (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
};

// get user by id
const getUserByID = (req, res) => {
    const id = parseInt(req.params.id);

    pool.query('Select * from users where id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }

        res.status(200).json(results.rows[0]);
    })
};

// add a user
const addUser = (req, res) => {
    const body = req.body;

    const {
        first_name,
        last_name,
        email,
        password
    } = body;


    pool.query('Insert into users(ID, First_Name, Last_Name, Email, Password, token, account_number) values((select max(ID) from users) + 1, $1, $2, $3, $4, null, $5) returning *;',
        [first_name, last_name, email, password, Math.floor(Math.random() * 1E16)], (error, results) => {
            if (error) {
                throw error;
            }

            res.status(201).send(`User added with ID: ${results.rows[0].id}`);
        });
};

// update a user
const updateUser = (req, res) => {
    const id = parseInt(req.params.id);

    const {first_name, last_name, username, password, account_number} = req.body;

    pool.query('Update users set first_name = $1, last_name = $2, username = $3, password = $4, account_number=$6 where id = $5 returning *',
        [first_name, last_name, username, password, id, account_number], (error, results) => {
            if (error) {
                throw error;
            }
            res.status(201).json(results.rows[0]);
        })
}

// delete a user
const deleteUser = (req, res) => {
    const id = parseInt(req.params.id);

    pool.query('Delete from users where id = $1', [id], (error, _results) => {
        if (error) {
            throw error;
        }

        res.status(200).send(`User deleted with id: ${id}`);
    })
}



// register user
const registerUser = async (req, res) => {
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
            res.status(400).send("All input is required.");
        }


        // checking if this user already exists
        const userCheckingPromise = new Promise((resolve, reject) => {
            pool.query('Select * from users where email = $1', [email], (error, results) => {
                if (error) {
                    reject(error);
                    throw error;
                }

                if (results.rows.length > 0) {
                    console.log("user already exists, please login");
                    res.status(409).send("user already exists, please login");
                    resolve("user already exists");
                }
                else {
                    resolve("user doesn't exist in the table, it can be created");
                }
            });
        });
        await userCheckingPromise;


        // user doesn't exist

        // encrypted password
        const encryptedPassword = await bcrypt.hash(password, 10);

        let currentUser = {
            id: {},
            first_name: {},
            last_name: {},
            email: {},
            password: {},
            token: {},
            account_number: {},

            get property() {},
            set property(value) {},
        };



        // user creation in database
        const userCreationPromise = new Promise(async (resolve, reject) => {

            // check if the user table is empty
            let userID;

            const userIDPromise = new Promise((resolve, reject) => {
                pool.query('select max(ID) from users;', (error, results) => {
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
                (error, results) => {
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
                (error, _results) => {
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
            config.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );


        // adding token to the user field: it is the first time values will be added
        const addTokenPromise = new Promise((resolve, reject) => {
            pool.query('update users set token = $1 where id = $2 returning *;', [token, currentUser.id], (error, _results) => {
                if (error) {
                    reject(error);
                    throw error;
                }

                resolve("token added for the user");
            });
        });

        await addTokenPromise;

        res.status(201).send(`User added with ID: ${currentUser.id}`);

    }
    catch (err) {
        console.log(err);
    }
}

// login user
const loginUser = async (req, res) => {
    try {
        const body = req.body;

        const {
            email,
            password
        } = body;

        if(!(email && password)) {
            res.status(400).send("All input must be present");
        }

        // const decryptedPassword = await bcrypt

        // checking if the user exists or not
        pool.query('select * from users where email = $1', [email], async (error, results) => {
            if (error) {
                throw error;
            }

            console.log(results.rows);

            if (results.rows[0].length === 0) {
                res.status(400).send("User doesn't exist");
            }
            else {
                const user = results.rows[0];
                if(await bcrypt.compare(password, user.password)) {
                    const token = jwt.sign(
                        {user_id: user.id, email },
                        config.TOKEN_KEY,
                        {
                            expiresIn: "2h",
                        }
                    );

                    pool.query('update users set token = $1 where id = $2 returning *;', [token, user.id], (error, resultss) => {
                        if (error) {
                            throw error;
                        }

                        console.log("Successfully signed up!");

                        res.status(200).json(resultss.rows[0]);
                    })
                }
                else {
                    res.status(400).send("Invalid Credentials");
                }
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}


module.exports = {
    getUsers,
    getUserByID,
    addUser,
    updateUser,
    deleteUser,
    registerUser,
    loginUser
};