import { Router } from "express";
import {getAll, getByID, removeCandidate, addCandidate, addVoteResult, getPlanningSrc, createBatch, startVotingProcess, getCurrentStep, getCandidates} from "../controllers/appointmentController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";

const router = Router();

// Routes
router.post('/:id/candidates', verifyToken, checkRole(['PTCCT']), addCandidate);
router.get('/:id/planning-sources', verifyToken, getPlanningSrc);
router.get('/', verifyToken, checkRole(['PTCCT', 'BGH']), getAll);
router.get('/:id', verifyToken, getByID);
router.post('/', verifyToken, checkRole(['PTCCT']), createBatch);
router.post('/:id/start-voting', verifyToken, checkRole(['PTCCT']), startVotingProcess);
router.patch('/:id/candidates/:candidateId', verifyToken, checkRole(['PTCCT']), removeCandidate);
router.get("/detail/:chiTietDotId/candidates", getCandidates);
router.post('/:id/vote-results', verifyToken, checkRole(['PTCCT']), addVoteResult);
router.get('/:id/current-step', getCurrentStep);
export default router