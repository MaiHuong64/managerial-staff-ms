import { Router } from "express";
import { loginUser, registerUser, logoutUser } from "./auth.controller";
import { checkRole } from "../../middleware/role.middleware";
import { verifyToken } from "../../middleware/auth.middleware";
const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", verifyToken, logoutUser);

export default router;