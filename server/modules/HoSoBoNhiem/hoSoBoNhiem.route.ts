import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { completeDocument, createHSBN, deleteDocument, getAll, getChiTietHoSoById, getHoSoByPAId, getHoSoByPhieuChuTruongId, uploadDocument } from "./hoSoBoNhiem.controller";
import { upload } from "../../middleware/upload.middleware";
const router = Router();

router.use(verifyToken);

router.get('/', getAll);
router.get("/phuong-an/:id", getHoSoByPAId);
router.get("/phieu-chu-truong/:id", getHoSoByPhieuChuTruongId);
router.get("/:id", getChiTietHoSoById);
router.post("/", createHSBN);
router.post("/:id/tai-lieu", upload.single("file"), uploadDocument);
router.delete("/:id/tai-lieu/:taiLieuId", deleteDocument)
router.patch("/:id/hoan-thanh", completeDocument )
export default router;