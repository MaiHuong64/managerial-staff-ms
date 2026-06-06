import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as DotQuyHoachController from "./dotQuyHoach.controller";

const router = Router()

router.use(verifyToken);
router.get("/candidates/:chucDanhId", DotQuyHoachController.getVienChucByChucDanh);
router.get("/filter", DotQuyHoachController.filterVienChuc);
router.get("/root", DotQuyHoachController.getDotQuyHoachGoc);


router.post("/submit", DotQuyHoachController.submitVoteDotQuyHoach);
router.post("/", DotQuyHoachController.createDotQuyHoach);
router.post("/:id/chi-tiet", DotQuyHoachController.addBulkVienChuc);
router.post("/:id/chi-tiet/170",DotQuyHoachController.addUngVien);

router.patch("/:id/phe-duyet", DotQuyHoachController.approveDotQuyHoach);

router.get("/", DotQuyHoachController.getAllDotQuyHoach);       // list
router.get("/:id", DotQuyHoachController.getDotQuyHoachById);   // detail

export default router;