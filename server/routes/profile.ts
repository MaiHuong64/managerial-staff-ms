import { Router } from "express";
import { verifyToken as verify } from "../middleware/authMiddleware";
import { getProfile } from "../controllers/profileController";

const router = Router();

router.get('/', verify, getProfile);
// router.get('/', getProfile);
export default router;