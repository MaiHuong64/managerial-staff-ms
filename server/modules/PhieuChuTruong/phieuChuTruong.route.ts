import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as PhieuChuTruongController from "./phieuChuTruong.controller";
import { checkRole } from "../../middleware/role.middleware";

const router = Router();
 
router.use(verifyToken);

router.get("/", PhieuChuTruongController.getAllPhieuChuTruong);
router.get("/don-vi/:donViId", PhieuChuTruongController.getPhieuChuTruongByDonViId);
router.get("/following-appointment", PhieuChuTruongController.getPhieuChuTruongFollowingAppointment);
router.get("/:id", PhieuChuTruongController.getPhieuChuTruongById);
router.post("/",checkRole(['VCQL']), PhieuChuTruongController.createPhieuChuTruong);
router.post("/:id/approve", checkRole(['BGH']), PhieuChuTruongController.approvePCT);
router.post("/:id/reject", checkRole(['BGH']), PhieuChuTruongController.rejectPCT);
export default router;