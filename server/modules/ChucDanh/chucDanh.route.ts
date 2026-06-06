import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as ChucDanhController from "./chucDanh.controller";
import { checkRole } from "../../middleware/role.middleware";

const router = Router();

router.use(verifyToken);

router.get("/", checkRole(["PTCCT", "BGH", "VCQL"]),ChucDanhController.getAllChucDanh);
router.post("/", checkRole(["PTCCT", "BGH", "VCQL"]), ChucDanhController.createChucDanh);
router.put("/:id", checkRole(["PTCCT", "BGH", "VCQL"]), ChucDanhController.updateChucDanh);
router.delete("/:id", checkRole(["PTCCT", "BGH", "VCQL"]), ChucDanhController.deleteChucDanh);
export default router;
