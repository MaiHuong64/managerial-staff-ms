import { Request, Response } from "express";
import * as XepLoai from "./xepLoai.service";

export const getAllXepLoaiVCController = async (req: Request, res: Response) => {
    try {
        const data = await XepLoai.getDanhSachXLVC();
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getXepLoaiVCByVienChucIdController = async (req: Request, res: Response) => {
    try {
        const vienChucId = Number(req.params.vienChucId);
        const data = await XepLoai.getXepLoaiByVienChucId(vienChucId);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createXepLoaiVCController = async (req: Request, res: Response) => {
    try {
        const data = await XepLoai.createXLVC(req.body);
        return res.status(201).json({ success: true, data, message: "Thêm xếp loại thành công" });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteXepLoaiVCController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await XepLoai.deleteXLVC(id);
        return res.status(200).json({ success: true, message: "Xóa xếp loại thành công" });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// Xếp loại đảng viên (tương tự)
export const getAllXepLoaiDangVienController = async (req: Request, res: Response) => {
    try {
        const data = await XepLoai.getDanhSachXLDV();
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getXepLoaiDangVienByVienChucIdController = async (req: Request, res: Response) => {
    try {
        const vienChucId = Number(req.params.vienChucId);
        const data = await XepLoai.getXepLoaiByDVId(vienChucId);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createXepLoaiDangVienController = async (req: Request, res: Response) => {
    try {
        const data = await XepLoai.createXLDV(req.body);
        return res.status(201).json({ success: true, data, message: "Thêm xếp loại đảng viên thành công" });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
export const deleteXepLoaiDangVienController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await XepLoai.deleteXLDV(id);
        return res.status(200).json({ success: true, message: "Xóa xếp loại đảng viên thành công" });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};