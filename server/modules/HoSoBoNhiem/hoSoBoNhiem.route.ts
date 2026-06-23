import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { completeDocument, createHSBN, deleteDocument, getAll, getChiTietHoSoById, getHoSoByPAId, getHoSoByPhieuChuTruongId, uploadDocument } from "./hoSoBoNhiem.controller";
import { upload } from "../../middleware/upload.middleware";
import { checkRole } from "../../middleware/role.middleware";
const router = Router();

router.use(verifyToken);

router.get('/', checkRole(["PTCCT", "BGH"]), getAll);
router.get("/phuong-an/:id", checkRole(["PTCCT", "BGH"]),getHoSoByPAId);
router.get("/phieu-chu-truong/:id", checkRole(["PTCCT", "BGH"]), getHoSoByPhieuChuTruongId);
router.get("/:id", checkRole(["PTCCT", "BGH"]), getChiTietHoSoById);
router.post("/", checkRole(["PTCCT", "BGH"]), createHSBN);
router.post("/:id/tai-lieu", checkRole(["PTCCT", "BGH"]), upload.single("file"), uploadDocument);
router.delete("/:id/tai-lieu/:taiLieuId", checkRole(["PTCCT", "BGH"]), deleteDocument)
router.patch("/:id/hoan-thanh", checkRole(["PTCCT", "BGH"]), completeDocument )
export default router;