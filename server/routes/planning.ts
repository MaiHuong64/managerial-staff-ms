import { Router } from "express";
import planningController from "../controllers/planningController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";
const router = Router();

router.get('/filter', verifyToken, checkRole(["PTCCT"]), planningController.filterStaff);
router.get('/', verifyToken, checkRole(["PTCCT", "BGH"]), planningController.getAll);
router.get('/:id', verifyToken, checkRole(["PTCCT", "BGH"]), planningController.getDetail);

router.post('/', verifyToken, checkRole(["PTCCT"]), planningController.createPlanning);
router.put('/:id', verifyToken, checkRole(["PTCCT"]), planningController.updatePlanning);
router.patch('/:id/submit', verifyToken, checkRole(["PTCCT"]), planningController.submitPlanning);
router.patch('/:id/approve', verifyToken, checkRole(["BGH"]), planningController.approvePlanning);

router.post('/:id/candidate', verifyToken, checkRole(["PTCCT"]), planningController.addCandidate);
router.post('/:id/vote', verifyToken, checkRole(["PTCCT"]), planningController.addVoteResult);
router.patch('/:planningId/candidates/:staffId', verifyToken, checkRole(["PTCCT"]), planningController.updateCandidateStatus);

export default router
