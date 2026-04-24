import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { CreateQDBNController, getHoSoInfoController, getQDBoNhiemByIdController } from "./quyetDinhBoNhiem.controller";

const router = Router();

router.use(verifyToken);

router.get("/ho-so/:hoSoId/info", getHoSoInfoController);
router.post("/ho-so-bo-nhiem/:hoSoId/quyet-dinh", CreateQDBNController);
router.get("/:id", getQDBoNhiemByIdController);

export default router;