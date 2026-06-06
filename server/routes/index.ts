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
import hoSoBoNhiemRouter from "../modules/HoSoBoNhiem/hoSoBoNhiem.route"
import quyetDinhBoNhiemRouter from "../modules/QuyetDinhBoNhiem/quyetDinhBoNhiem.route"
import dashboardRouter from "../modules/Dashboard/dashboard.route"
import xepLoaiRouter from "../modules/XepLoai/xepLoai.route";
import taiKhoanRouter from "../modules/TaiKhoan/taiKhoan.route";
import importRouter from "../modules/Import/importXL.route";
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
router.use("/ho-so-bo-nhiem", hoSoBoNhiemRouter)
router.use ("/quyet-dinh-bo-nhiem", quyetDinhBoNhiemRouter)
router.use("/xep-loai", xepLoaiRouter);
router.use("/dashboard", dashboardRouter)
router.use("/tai-khoan", taiKhoanRouter);
router.use ("/import", importRouter)

export default router;
