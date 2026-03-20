import { Router } from "express";
import {getAllPetitions, createPetition, updatePetition, deletePetition} from "../controllers/appointmentController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";

const router = Router();

// Routes
router.get('/', verifyToken, checkRole(['PTCCT', 'BGH']), getAllPetitions);
router.post('/', verifyToken, checkRole(['PTCCT']), createPetition);
router.put('/:id', verifyToken, checkRole(['PTCCT']), updatePetition);
router.delete('/:id', verifyToken, checkRole(['PTCCT']), deletePetition);

export default router;
