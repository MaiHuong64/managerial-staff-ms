import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as DotQuyHoachController from "./dotQuyHoach.controller";
import { checkRole } from "../../middleware/role.middleware";

const router = Router()

router.use(verifyToken);
router.get("/candidates/:chucDanhId", checkRole(["PTCCT"]),  DotQuyHoachController.getVienChucByChucDanh);
router.get("/filter", checkRole(["PTCCT"]), DotQuyHoachController.filterVienChuc);
router.get("/root", checkRole(["PTCCT"]), DotQuyHoachController.getDotQuyHoachGoc);
router.get('/hien-tai', checkRole(["PTCCT"]), DotQuyHoachController.getDotQuyHoachHienTai);

router.post("/submit", checkRole(["PTCCT"]), DotQuyHoachController.submitVoteDotQuyHoach);
router.post("/", checkRole(["PTCCT"]), DotQuyHoachController.createDotQuyHoach);
router.post("/:id/chi-tiet", checkRole(["PTCCT"]), DotQuyHoachController.addBulkVienChuc);
router.post("/:id/chi-tiet/170", checkRole(["PTCCT"]), DotQuyHoachController.addUngVien);

router.patch("/:id/phe-duyet", checkRole(["BGH"]), DotQuyHoachController.approveDotQuyHoach);

router.get("/", checkRole(["PTCCT"]), DotQuyHoachController.getAllDotQuyHoach);       // list
router.get("/:id", checkRole(["PTCCT"]), DotQuyHoachController.getDotQuyHoachById);   // detail
router.get("/:id/export-excel", checkRole(["PTCCT"]), DotQuyHoachController.exportExcelDSNhanSu);

export default router;