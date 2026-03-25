import { Router } from "express";
import { CreatePANS, getAll, getPassedCandidate} from "../controllers/personnelPlanController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";
const router = Router();

router.get('/candidates',verifyToken,checkRole(['BGH', 'PTCCT']), getPassedCandidate);
router.get('/', verifyToken, getAll);
router.post('/', CreatePANS)
export default router;