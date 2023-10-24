import express from "express";
const authRouter = express.Router();
// just a change
import authController from "../controllers/authController"

authRouter.get('/users', authController.getUsers);

authRouter.delete('/users/:id', authController.deleteUser);

authRouter.post('/register', authController.registerUser);

authRouter.post('/login', authController.loginUser);

// module.exports = authRouter;
export default authRouter;