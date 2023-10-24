import logger from "./logger"
import jwt from "jsonwebtoken"
import config from "./config"
import {Request, Response, NextFunction} from "express";


function requestLogger(request: Request, response: Response, next: NextFunction) {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

function unknownEndpoint(request: Request, response: Response) {
    response.status(404).send({ error: 'unknown endpoint' })
}

function errorHandler(error: Error, request: Request, response: Response, next: NextFunction): Response | void {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    return next(error);
}


function verifyToken(request: Request, response: Response, next: NextFunction): Response | void {
    const token = request.body.token || request.query.token || request.headers["x-access-token"];

    if(!token) {
        return response.status(403).send("A token is require for authentication");
    }

    try {
        if(!config.TOKEN_KEY) {
            throw new Error('The Token Key is not defined.');
        }
        const decoded: string | jwt.JwtPayload = jwt.verify(token, config.TOKEN_KEY);
        logger.info(decoded);
    }
    catch (err) {
        logger.error(err);
        return response.status(401).send("Invalid token");
    }
    return next();
}


const middleware = {
    requestLogger,
    verifyToken,
    unknownEndpoint,
    errorHandler
}

export default middleware;