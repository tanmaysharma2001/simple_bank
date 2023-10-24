"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const middleware_1 = __importDefault(require("./utils/middleware"));
const morgan_1 = __importDefault(require("morgan"));
// Routers
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const transactionsRoutes_1 = __importDefault(require("./routes/transactionsRoutes"));
// import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "./swagger.json"
const appError_1 = __importDefault(require("./utils/appError"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
// new changes made
// other changes made
// Middlewares
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// to make express show static content
const dir = path_1.default.join(__dirname + 'dev-data/Images');
app.use(express_1.default.static(dir));
// routes
app.use('/api/v1/', authRoutes_1.default);
app.use('/api/v1/users', transactionsRoutes_1.default);
// app.use(
//     '/api/v1/doc',
//     swaggerUi.serve,
//     swaggerUi.setup(swaggerDocument)
// );
// welcomec
app.post("/api/v1/welcome", middleware_1.default.verifyToken, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});
// unhandled routes
app.all('*', (req, res, next) => {
    next(new appError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorController_1.default);
// Old Middlewares
// app.use(middleware.unknownEndpoint);
// app.use(middleware.errorHandler);
exports.default = app;
