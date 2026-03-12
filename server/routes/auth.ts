import { Router } from "express";
import authController from "../controllers/authController";
import { verifyToken as verify } from "../middleware/authMiddleware";

const router = Router();

// router.post('/register', verify, authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', verify, authController.logoutUser);

export default router;