import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getAllPhieuDeXuatNhanSu, gePhieuDeXuatNhanSutById, approvePhieuDeXuatNhanSu, createPhieuDeXuatNhanSu, rejectPhieuDeXuatNhanSu } from "./phieuDeXuat.controller";

const router = Router();

router.use(verifyToken);

router.get("/", getAllPhieuDeXuatNhanSu);
router.get("/:id", gePhieuDeXuatNhanSutById);
router.post("/", createPhieuDeXuatNhanSu);
router.post("/:id/approve", approvePhieuDeXuatNhanSu);
router.post("/:id/reject", rejectPhieuDeXuatNhanSu);
export default router;