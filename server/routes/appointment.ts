import { Router } from "express";
import {getAll, getByID, removeCandidate, addCandidate, addVoteResult, createDecision, getPlanningSrc, createDossier, createAppointmentBatch, getAvailablePetitions} from "../controllers/appointmentController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";

const router = Router();

// Routes
router.get('/', verifyToken, checkRole(['PTCCT', 'BGH']), getAll);
router.get('/:id', verifyToken, getByID);
router.get('/:id/planning-sources', verifyToken, getPlanningSrc);

// Lấy danh sách phiếu chủ trưởng có sẵn
router.get('/petitions/available', verifyToken, checkRole(['PTCCT']), getAvailablePetitions);

// Tạo đợt bổ nhiệm mới
router.post('/', verifyToken, checkRole(['PTCCT']), createAppointmentBatch);

router.post('/:id/candidates', verifyToken, checkRole(['PTCCT']), addCandidate);
router.patch('/:id/candidates/:candidateId', verifyToken, checkRole(['PTCCT']), removeCandidate);

router.post('/:id/vote-results', verifyToken, checkRole(['PTCCT']), addVoteResult);
// router.post('/:id/personnel-proposals', verifyToken, checkRole(['PTCCT']), createPersonnelProposal);
router.post('/:id/dossiers', verifyToken, checkRole(['PTCCT']), createDossier);

router.post('/:id/decisions', verifyToken, checkRole(['PTCCT', 'BGH']), createDecision);

export default router