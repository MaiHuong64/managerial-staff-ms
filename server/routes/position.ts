import { Router } from "express";
import getAllPosition from "../controllers/positionController";
import { verifyToken } from "../middleware/authMiddleware";
const router = Router();

router.get('/', verifyToken, getAllPosition);

export default router;