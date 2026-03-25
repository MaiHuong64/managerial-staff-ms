import { Router } from "express";
import { CreatePANS, getAll, getPassedCandidate, getById, submitPANS, approvePANS } from "../controllers/personnelPlanController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";
const router = Router();

router.get('/candidates', verifyToken, checkRole(['BGH', 'PTCCT']), getPassedCandidate);
router.get('/', verifyToken, checkRole(['BGH', 'PTCCT']), getAll);
router.get('/:id', verifyToken, checkRole(['BGH', 'PTCCT']), getById);
router.post('/', verifyToken, checkRole(['PTCCT']), CreatePANS);
router.put('/:id/submit', verifyToken, checkRole(['PTCCT']), submitPANS);
router.put('/:id/approve', verifyToken, checkRole(['BGH']), approvePANS);
export default router;