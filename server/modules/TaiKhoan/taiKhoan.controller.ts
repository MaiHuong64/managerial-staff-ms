import { Request, Response } from "express";
import { TaiKhoanService } from "./taiKhoan.service";

export const TaiKhoanController = {
    updateVaiTro: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { vaiTro } = req.body;

            if (!vaiTro) {
                return res.status(400).json({
                    success: false,
                    message: "Vai trò không được để trống"
                });
            }

            const result = await TaiKhoanService.updateVaiTro(Number(id), vaiTro);

            return res.status(200).json({
                success: true,
                message: "Cập nhật vai trò thành công",
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Lỗi khi cập nhật vai trò"
            });
        }
    },

    getByVienChucId: async (req: Request, res: Response) => {
        try {
            const { vienChucId } = req.params;
            const result = await TaiKhoanService.getByVienChucId(Number(vienChucId));

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tài khoản"
                });
            }

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Lỗi khi lấy thông tin tài khoản"
            });
        }
    },
    getAll: async (req: Request, res: Response) => {
        try {
            const data = await TaiKhoanService.getAll();
            return res.status(200).json({ success: true, data });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Lỗi khi lấy danh sách tài khoản",
            });
        }
    },
    updateTrangThai: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { trangThai } = req.body;
 
            if (trangThai === undefined || trangThai === null) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu trường trangThai",
                });
            }
 
            const result = await TaiKhoanService.updateTrangThai(
                Number(id),
                Number(trangThai) as 0 | 1
            );
 
            const action = trangThai === 1 ? "Mở khoá" : "Khoá";
            return res.status(200).json({
                success: true,
                message: `${action} tài khoản thành công`,
                data: result,
            });
        } catch (error: any) {
            const isNotFound = error.message?.includes("Không tìm thấy");
            return res.status(isNotFound ? 404 : 500).json({
                success: false,
                message: error.message || "Lỗi khi cập nhật trạng thái",
            });
        }
    },
 
    doiMatKhau: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { matKhauCu, matKhauMoi } = req.body;
 
            if (!matKhauCu || !matKhauMoi) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới",
                });
            }
 
            await TaiKhoanService.doiMatKhau(Number(id), matKhauCu, matKhauMoi);
 
            return res.status(200).json({
                success: true,
                message: "Đổi mật khẩu thành công",
            });
        } catch (error: any) {
            const isClientError =
                error.message?.includes("không đúng") ||
                error.message?.includes("ít nhất") ||
                error.message?.includes("Không tìm thấy");
 
            return res.status(isClientError ? 400 : 500).json({
                success: false,
                message: error.message || "Lỗi khi đổi mật khẩu",
            });
        }
    },
};
