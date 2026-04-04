import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { addCandidates, create, getAll, getById, getCandidatesHandler } from "./dotQuyHoach.controller";

const router = Router()

router.use(verifyToken);
router.get("/candidates/:chucDanhId", getCandidatesHandler);
router.post("/", create);
router.post("/:id/chi-tiet", addCandidates)
router.get("/", getAll);
router.get("/:id", getById);


export default router;