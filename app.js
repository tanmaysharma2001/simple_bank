const express = require("express");
const app = express();

const cors = require('cors');
const middleware = require("./utils/middleware");

// Routers
const authRouter = require("./controllers/auth");
const transactionsRouter = require("./controllers/transactions");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
// const swaggerJsDoc = require("swagger-jsdoc");


// Middlewares
app.use(cors());
app.use(express.json());

// outputs every request to console that is
// being sent over network
app.use(middleware.requestLogger);

// to make express show static content
app.use(express.static('build'));



// routes
app.use('/', authRouter);

app.use('/users', transactionsRouter);

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);


// welcome
app.post("/welcome", middleware.verifyToken, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;

