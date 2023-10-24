"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRouter = express_1.default.Router();
// just a change
const authController_1 = __importDefault(require("../controllers/authController"));
authRouter.get('/users', authController_1.default.getUsers);
authRouter.delete('/users/:id', authController_1.default.deleteUser);
authRouter.post('/register', authController_1.default.registerUser);
authRouter.post('/login', authController_1.default.loginUser);
// module.exports = authRouter;
exports.default = authRouter;
