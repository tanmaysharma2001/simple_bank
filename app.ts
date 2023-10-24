import express, {Request, Response} from "express";
import path from "path";
const app = express();

import cors from "cors";
import middleware from "./utils/middleware";
import morgan from "morgan";

// Routers
import authRouter from "./routes/authRoutes";
import transactionsRouter from "./routes/transactionsRoutes";

// import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "./swagger.json"


import AppError from "./utils/appError";
import ErrorController from "./controllers/errorController";

// new changes made
// other changes made

// Middlewares
app.use(cors());
app.use(morgan('dev'))
app.use(express.json());

// to make express show static content
const dir = path.join(__dirname + 'dev-data/Images');
app.use(express.static(dir));



// routes
app.use('/api/v1/', authRouter);
app.use('/api/v1/users', transactionsRouter);

// app.use(
//     '/api/v1/doc',
//     swaggerUi.serve,
//     swaggerUi.setup(swaggerDocument)
// );


// welcomec
app.post("/api/v1/welcome", middleware.verifyToken, (req: Request, res: Response) => {
    res.status(200).send("Welcome 🙌 ");
});

// unhandled routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(ErrorController);
// Old Middlewares
// app.use(middleware.unknownEndpoint);
// app.use(middleware.errorHandler);

export default app;
