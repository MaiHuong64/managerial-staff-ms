import { Router } from "express";
import {getAll, getByID, removeCandidate, addCandidate, addVoteResult, createDecision, getPlanningSrc, createPersonnelProposal, createDossier} from "../controllers/appointmentController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";
const router = Router();

router.get('/', verifyToken, checkRole(['PTCCT', 'BGH']), getAll);
router.get('/:id', verifyToken, getByID);
router.get('/:id/planning-sources', verifyToken, getPlanningSrc);

router.post('/:id/candidates', verifyToken, checkRole(['PTCCT']), addCandidate);
router.patch('/:id/candidates/:candidateId', verifyToken, checkRole(['PTCCT']), removeCandidate);

router.post('/:id/vote-results', verifyToken, checkRole(['PTCCT']), addVoteResult);
router.post('/:id/personnel-proposals', verifyToken, checkRole(['PTCCT']), createPersonnelProposal);
router.post('/:id/dossiers', verifyToken, checkRole(['PTCCT']), createDossier);

router.post('/:id/decisions', verifyToken, checkRole(['PTCCT', 'BGH']), createDecision);

export default router