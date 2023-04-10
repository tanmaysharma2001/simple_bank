const logger = require('./logger');
const jwt = require('jsonwebtoken');
const config = require('./config');

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
};

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
};

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    return next(error);
};

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    if(!token) {
        return res.status(403).send("A token is require for authentication");
    }

    try {
        if(!config.TOKEN_KEY) {
            throw new Error('The Token Key is not defined.');
        }
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        logger.info(decoded);
        // req.user = decoded;
    }
    catch (err) {
        logger.error(err);
        return res.status(401).send("Invalid token");
    }
    return next();
};


module.exports = {
    requestLogger,
    verifyToken,
    unknownEndpoint,
    errorHandler
}