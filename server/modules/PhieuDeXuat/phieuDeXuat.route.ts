import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as PhieuDeXuatController from "./phieuDeXuat.controller";
import { checkRole } from "../../middleware/role.middleware";

const router = Router();

router.use(verifyToken);

router.get("/", PhieuDeXuatController.getAllPhieuDeXuatNhanSu);
router.get("/:id", PhieuDeXuatController.getPhieuDeXuatNhanSutById);
router.post("/", checkRole(['VCQL']), PhieuDeXuatController.createPhieuDeXuatNhanSu);
router.patch("/:id/submit", PhieuDeXuatController.submitPhieuDeXuatNhanSu);
router.patch("/chi-tiet/:chiTietId/audit", PhieuDeXuatController.auditPhieuDeXuatCandidate);
router.post("/:id/approve", checkRole(['PTCCT']), PhieuDeXuatController.approvePhieuDeXuatNhanSu);
router.post("/:id/reject", checkRole(['PTCCT']), PhieuDeXuatController.rejectPhieuDeXuatNhanSu);
export default router;