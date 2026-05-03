import { Router } from "express";
import { importXepLoaiController, upload } from "./importXL.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

router.use(verifyToken);
router.post("/xep-loai", upload.single("file"), importXepLoaiController);

export default router;