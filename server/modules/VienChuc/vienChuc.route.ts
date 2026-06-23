import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getByDonVi, getAll, getById, getProfileHandler, create, update, remove, getHoSoVC } from "./vienChuc.controller";
import { getNhiemKyController } from "./NhiemKyChucVu/nhiemKyChucVu.controller";
import { checkRole } from "../../middleware/role.middleware";

const router = Router();

router.use(verifyToken);

router.get("/profile", checkRole(["PTCCT", "BGH", "VCQL", "VC"]),getProfileHandler);
router.get("/", getAll);
router.get("/don-vi", getByDonVi);
router.get("/:id/ho-so-day-du", getHoSoVC);
router.get("/:vienChucId/nhiem-ky", checkRole(["PTCCT", "BGH", "VCQL", "VC"]), getNhiemKyController);
router.get("/:id", getById);
router.post("/", checkRole(["PTCCT", "BGH"]), create);
router.put("/:id", checkRole(["PTCCT", "BGH"]), update);
router.delete("/:id", checkRole(["PTCCT", "BGH"]), remove);
export default router;
