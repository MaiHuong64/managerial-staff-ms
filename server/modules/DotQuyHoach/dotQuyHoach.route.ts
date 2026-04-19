import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { addCandidates, create, filterCandidatesHandler, getAll, getById, getCandidatesHandler, getRoot, submitVoteQuyHoach } from "./dotQuyHoach.controller";

const router = Router()

router.use(verifyToken);
router.get("/candidates/:chucDanhId", getCandidatesHandler);
router.get("/filter", filterCandidatesHandler);
router.get("/root", getRoot);

router.post("/submit", submitVoteQuyHoach);
router.post("/", create);
router.post("/:id/chi-tiet", addCandidates);

router.get("/", getAll);       // list
router.get("/:id", getById);   // detail

export default router;