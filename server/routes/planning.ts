import { Router } from "express";
import planningController from "../controllers/plainningController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";
const router = Router();

router.post('/filter', verifyToken, checkRole(["PTCCT"]), planningController.filterStaff);   
router.get('/', verifyToken, checkRole(["PTCCT"]), planningController.getAll);
router.get('/:id', verifyToken, checkRole(["PTCCT"]), planningController.getDetail);

router.post('/', verifyToken, checkRole(["PTCCT"]), planningController.createPlanning);
router.post('/:id/ung-vien', verifyToken, checkRole(["PTCCT"]), planningController.addCandidate);
router.post('/:id/phieu', verifyToken, checkRole(["PTCCT"]), planningController.addVoteResult);
router.put('/:id/loai-bo', verifyToken, checkRole(["PTCCT"]), planningController.removeCandidate);

export default router