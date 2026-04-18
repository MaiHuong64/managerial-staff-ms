import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { addCandidates, create, filterCandidatesHandler, getAll, getById, getCandidatesHandler, getRoot, submitVoteQuyHoach } from "./dotQuyHoach.controller";

const router = Router()

// router.use(verifyToken);
router.get("/candidates/:chucDanhId", getCandidatesHandler);
router.get("/filter", filterCandidatesHandler);
router.post('/submit', submitVoteQuyHoach)
router.post("/", create);
router.get("/", getAll);
router.get("/root", getRoot);
router.post("/:id/chi-tiet", addCandidates)
router.get("/:id", getById);

export default router;