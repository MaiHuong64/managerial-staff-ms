import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import {
    getAllStaff,
    getStaffById,
    getProfile,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffbyDepartment,
} from "./vienChuc.service";

export const getAll = async (req: AuthRequest, res: Response) => {
    try {
        const data = await getAllStaff();
        return res.status(200).json({ success: true, data });
    } catch {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export const getById = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await getStaffById(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

export const getProfileHandler = async (req: AuthRequest, res: Response) => {
    try {
        const uid = req.user!.id;
        const data = await getProfile(uid);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

export const create = async (req: AuthRequest, res: Response) => {
    try {
        const data = await createStaff(req.body);
        return res.status(201).json({
            success: true,
            message: "Khởi tạo hồ sơ và cấp tài khoản thành công",
            data,
        });
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(400).json({
                success: false,
                message: "Số CCCD hoặc Email đã tồn tại trong hệ thống.",
            });
        }
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export const update = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await updateStaff(id, req.body);
        return res.status(200).json({ success: true, message: "Cập nhật thành công", data });
    } catch (error: any) {
        if (error.message === "Không tìm thấy viên chức") {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message === "Không có trường hợp lệ để cập nhật") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export const remove = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        await deleteStaff(id);
        return res.status(200).json({ success: true, message: "Xóa thành công" });
    } catch {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export const getByDonVi = async (req: AuthRequest, res: Response) => {
    try {
        const donviId = req.user!.don_vi_id;
        const data = await getStaffbyDepartment(donviId);
        return res.status(200).json({success: true, data})
    } catch (error) {
         return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
