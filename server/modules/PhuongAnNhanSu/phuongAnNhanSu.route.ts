import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as PhuongAnNSController from "./phuongAnNhanSu.controller";
import { checkRole } from "../../middleware/role.middleware";

const router = Router();

router.use(verifyToken);
router.get("/ung-vien", PhuongAnNSController.getVienChucChoPANS);
router.get("/", PhuongAnNSController.getAllPANS);
router.get("/:id", PhuongAnNSController.getPANSById);
router.post('/', checkRole(["PTCCT"]), PhuongAnNSController.createPANS);
router.patch('/:id/trinh', checkRole(["PTCCT"]),PhuongAnNSController.submitPANS);

router.patch('/:id/duyet', checkRole(["BGH"]), PhuongAnNSController.approvePANS);
router.patch('/:id/tu-choi', checkRole(["BGH"]), PhuongAnNSController.rejectPANS);

export default router;
