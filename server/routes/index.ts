import { Router } from "express";

import authRouter from "../modules/Auth/auth.route";
import dotBoNhiemRouter from "../modules/DotBoNhiem/dotBoNhiem.route"
import vienChucRouter from "../modules/VienChuc/vienChuc.route";
import donViRouter from "../modules/DonVi/donVi.route";
import chucDanhRouter from "../modules/ChucDanh/chucDanh.route";
import quyHoachRouter from "../modules/DotQuyHoach/dotQuyHoach.route"
import phieuChuTruongRouter from "../modules/PhieuChuTruong/phieuChuTruong.route";
import phieuDeXuatRoute from "../modules/PhieuDeXuat/phieuDeXuat.route"
import phuongAnNhanSuRouter from "../modules/PhuongAnNhanSu/phuongAnNhanSu.route";
const router = Router();

router.use("/auth", authRouter);
router.use("/bo-nhiem", dotBoNhiemRouter);
router.use("/vien-chuc", vienChucRouter);
router.use("/don-vi", donViRouter);
router.use("/chuc-danh", chucDanhRouter);
router.use("/quy-hoach", quyHoachRouter);
router.use('/phieu-de-xuat', phieuDeXuatRoute)
router.use("/phieu-chu-truong", phieuChuTruongRouter)
router.use("/phuong-an-nhan-su", phuongAnNhanSuRouter);
export default router;
