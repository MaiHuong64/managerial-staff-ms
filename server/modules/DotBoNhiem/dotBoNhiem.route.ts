import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as DotBoNhiemController from "./dotBoNhiem.controller"
import { checkRole } from "../../middleware/role.middleware";


const router = Router();
router.use(verifyToken);
router.get('/', checkRole(["PTCCT", "BGH", "VCQL"]),DotBoNhiemController.getAllDotBoNhiem)
router.post('/', checkRole(["PTCCT"]), DotBoNhiemController.createDotBoNhiem)
router.post('/submit' , checkRole(["PTCCT", "BGH", "VCQL"]), DotBoNhiemController.submitVoteDotBoNhiem)
router.get('/detail/:chiTietDotId/candidates', checkRole(["PTCCT", "BGH", "VCQL"]), DotBoNhiemController.getUngVienByChiTietDotId)
router.post('/detail/:chiTietDotId/candidates/resolve-tie', checkRole(["PTCCT", "BGH", "VCQL"]), DotBoNhiemController.resolveHoaPhieuBoNhiem)
router.get('/:id', checkRole(["PTCCT", "BGH", "VCQL"]), DotBoNhiemController.getDotBoNhiemById)
export default router;
