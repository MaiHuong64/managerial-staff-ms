import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as XepLoaiController from "./xepLoai.controller";

const router = Router();

// router.use(verifyToken);

// Xếp loại viên chức
router.get("/vien-chuc", XepLoaiController.getAllXepLoaiVCController);
router.get("/vien-chuc/:vienChucId", XepLoaiController.getXepLoaiVCByVienChucIdController);
router.post("/vien-chuc", XepLoaiController.createXepLoaiVCController);
// router.put("/vien-chuc/:id", XepLoaiController.updateXepLoaiVCController);
router.delete("/vien-chuc/:id", XepLoaiController.deleteXepLoaiVCController);

// Xếp loại đảng viên
router.get("/dang-vien", XepLoaiController.getAllXepLoaiDangVienController);
router.get("/dang-vien/:vienChucId", XepLoaiController.getXepLoaiDangVienByVienChucIdController);
router.post("/dang-vien", XepLoaiController.createXepLoaiDangVienController);
// router.put("/dang-vien/:id", XepLoaiController.updateXepLoaiDangVienController);
router.delete("/dang-vien/:id", XepLoaiController.deleteXepLoaiDangVienController);


export default router;