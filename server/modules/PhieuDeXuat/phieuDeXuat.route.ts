import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getAllPhieuDeXuatNhanSu, gePhieuDeXuatNhanSutById, approvePhieuDeXuatNhanSu, createPhieuDeXuatNhanSu, rejectPhieuDeXuatNhanSu, submitPhieuDeXuatNhanSu, auditPhieuDeXuatCandidate } from "./phieuDeXuat.controller";

const router = Router();

router.use(verifyToken);

router.get("/", getAllPhieuDeXuatNhanSu);
router.get("/:id", gePhieuDeXuatNhanSutById);
router.post("/", createPhieuDeXuatNhanSu);
router.patch("/:id/submit", submitPhieuDeXuatNhanSu);
router.patch("/chi-tiet/:chiTietId/audit", auditPhieuDeXuatCandidate);
router.post("/:id/approve", approvePhieuDeXuatNhanSu);
router.post("/:id/reject", rejectPhieuDeXuatNhanSu);
export default router;