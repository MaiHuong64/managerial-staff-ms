import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { completeDocument, createHSBN, getAll, getChiTietHoSoById, getHoSoByPAId, uploadDocument } from "./hoSoBoNhiem.controller";
import { deleteTaiLieu } from "./hoSoBoNhiem.service";
import { upload } from "../../middleware/upload.middleware";
const router = Router();

router.use(verifyToken);

router.get('/', getAll);
router.get("/phuong-an/:id", getHoSoByPAId);
router.get("/:id", getChiTietHoSoById);
router.post("/", createHSBN);
router.post("/:id/tai-lieu", upload.single("file"), uploadDocument);
router.delete("/tai-lieu/:taiLieuId", deleteTaiLieu)
router.patch("/:id/hoan-thanh", completeDocument )
export default router;