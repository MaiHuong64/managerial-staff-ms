import { Router } from "express";
import * as AuthController from "./auth.controller";
import { verifyToken } from "../../middleware/auth.middleware";
const router = Router();

router.post("/login", AuthController.loginUser);
router.post("/register", AuthController.registerUser);
router.post("/logout", verifyToken, AuthController.logoutUser);

export default router;