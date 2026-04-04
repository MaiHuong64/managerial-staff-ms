import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { addCandidates, create, filterCandidatesHandler, getAll, getById, getCandidatesHandler } from "./dotQuyHoach.controller";

const router = Router()

router.use(verifyToken);
router.get("/candidates/:chucDanhId", getCandidatesHandler);
router.get("/filter", filterCandidatesHandler);
router.post("/", create);
router.get("/", getAll);
router.post("/:id/chi-tiet", addCandidates)
router.get("/:id", getById);

export default router;