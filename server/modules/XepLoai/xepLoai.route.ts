import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { createXepLoaiDangVienController, createXepLoaiVCController, deleteXepLoaiDangVienController, deleteXepLoaiVCController, getAllXepLoaiDangVienController, getAllXepLoaiVCController, getXepLoaiDangVienByVienChucIdController, getXepLoaiVCByVienChucIdController } from "./xepLoai.controller";

const router = Router();

// router.use(verifyToken);

// Xếp loại viên chức
router.get("/vien-chuc", getAllXepLoaiVCController);
router.get("/vien-chuc/:vienChucId", getXepLoaiVCByVienChucIdController);
router.post("/vien-chuc", createXepLoaiVCController);
// router.put("/vien-chuc/:id", updateXepLoaiVCController);
router.delete("/vien-chuc/:id", deleteXepLoaiVCController);

// Xếp loại đảng viên
router.get("/dang-vien", getAllXepLoaiDangVienController);
router.get("/dang-vien/:vienChucId", getXepLoaiDangVienByVienChucIdController);
router.post("/dang-vien", createXepLoaiDangVienController);
// router.put("/dang-vien/:id", updateXepLoaiDangVienController);
router.delete("/dang-vien/:id", deleteXepLoaiDangVienController);

// Check điều kiện
// router.get("/check-dieu-kien/:vienChucId", checkDieuKienQuyHoachController);

export default router;