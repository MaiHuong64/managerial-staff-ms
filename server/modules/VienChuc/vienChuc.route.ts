import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getByDonVi, getAll, getById, getProfileHandler, create, update, remove, getHoSoVC } from "./vienChuc.controller";
import { getNhiemKyController } from "./NhiemKyChucVu/nhiemKyChucVu.controller";

const router = Router();

router.use(verifyToken);

router.get("/profile", getProfileHandler);
router.get("/", getAll);
router.get("/don-vi", getByDonVi);
router.get("/:id/ho-so-day-du", getHoSoVC);
router.get("/:vienChucId/nhiem-ky", getNhiemKyController);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
export default router;
