import { Router } from "express";
import { importXepLoaiController } from "./importXL.controller";
import { verifyToken } from "../../middleware/auth.middleware";
import { uploadExcel } from "../../middleware/upload.middleware";

const router = Router();

router.use(verifyToken);
router.post("/xep-loai", uploadExcel.single("file"), importXepLoaiController);

export default router;