"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("./config"));
function requestLogger(request, response, next) {
    logger_1.default.info('Method:', request.method);
    logger_1.default.info('Path:  ', request.path);
    logger_1.default.info('Body:  ', request.body);
    logger_1.default.info('---');
    next();
}
function unknownEndpoint(request, response) {
    response.status(404).send({ error: 'unknown endpoint' });
}
function errorHandler(error, request, response, next) {
    logger_1.default.error(error.message);
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }
    return next(error);
}
function verifyToken(request, response, next) {
    const token = request.body.token || request.query.token || request.headers["x-access-token"];
    if (!token) {
        return response.status(403).send("A token is require for authentication");
    }
    try {
        if (!config_1.default.TOKEN_KEY) {
            throw new Error('The Token Key is not defined.');
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.TOKEN_KEY);
        logger_1.default.info(decoded);
    }
    catch (err) {
        logger_1.default.error(err);
        return response.status(401).send("Invalid token");
    }
    return next();
}
const middleware = {
    requestLogger,
    verifyToken,
    unknownEndpoint,
    errorHandler
};
exports.default = middleware;
