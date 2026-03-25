import { Router } from "express";
import {addPersonnelPlan, getAll} from "../controllers/personnelPlanController";
import { verifyToken } from "../middleware/authMiddleware";
const router = Router();

router.get('/passedCandidate', verifyToken, addPersonnelPlan);
router.get('/', verifyToken, getAll);

export default router;