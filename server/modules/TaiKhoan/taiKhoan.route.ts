import { Router } from "express";
import { TaiKhoanController } from "./taiKhoan.controller";
import { verifyToken } from "../../middleware/auth.middleware";
import { checkRole } from "../../middleware/role.middleware";

const router = Router();

router.get( "/vien-chuc/:vienChucId", verifyToken,  checkRole(["PTCCT", "BGH", "ADMIN"]), TaiKhoanController.getByVienChucId);
router.get("/", TaiKhoanController.getAll)
router.patch("/:id/vai-tro", verifyToken, checkRole(["PTCCT", "ADMIN"]), TaiKhoanController.updateVaiTro);
router.patch("/:id/mat-khau", verifyToken, checkRole(["ADMIN"]), TaiKhoanController.doiMatKhau);
router.patch("/:id/trang-thai", verifyToken, checkRole(["ADMIN"]), TaiKhoanController.updateTrangThai);

export default router;
