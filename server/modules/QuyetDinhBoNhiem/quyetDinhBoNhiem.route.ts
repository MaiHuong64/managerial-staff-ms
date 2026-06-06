import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as QDBoNhiemController from "./quyetDinhBoNhiem.controller";

const router = Router();

router.use(verifyToken);

router.get("/ho-so/:hoSoId/info", QDBoNhiemController.getHoSoInfoController);
router.post("/ho-so-bo-nhiem/:hoSoId/quyet-dinh", QDBoNhiemController.CreateQDBNController);
router.get("/:id", QDBoNhiemController.getQDBoNhiemByIdController);

export default router;