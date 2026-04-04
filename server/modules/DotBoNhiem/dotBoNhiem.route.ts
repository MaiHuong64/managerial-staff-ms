import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { create, getAll, submitVote, getById, getCandidates, addCandidate, startVoting } from "./dotBoNhiem.controller"

const router = Router();

router.use(verifyToken);
router.get('/', getAll)
router.post('/', create)
router.post('/submit', submitVote)
router.get('/detail/:chiTietDotId/candidates', getCandidates)
router.post('/detail/:chiTietDotId/candidates', addCandidate)
router.post('/:id/start-voting', startVoting)
router.get('/:id', getById)
export default router;
