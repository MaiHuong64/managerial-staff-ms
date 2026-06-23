import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as QDBoNhiemController from "./quyetDinhBoNhiem.controller";
import { checkRole } from "../../middleware/role.middleware";

const router = Router();

router.use(verifyToken);

router.get("/ho-so/:hoSoId/info", checkRole(["PTCCT"]), QDBoNhiemController.getHoSoInfoController);
router.post("/ho-so-bo-nhiem/:hoSoId/quyet-dinh", checkRole(["PTCCT"]), QDBoNhiemController.CreateQDBNController);
router.get("/:id", checkRole(["PTCCT"]), QDBoNhiemController.getQDBoNhiemByIdController);

export default router;