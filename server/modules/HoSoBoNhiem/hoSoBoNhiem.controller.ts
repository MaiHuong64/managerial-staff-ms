import { Request, Response } from "express"
import * as hoSoBonhiemService from "./hoSoBoNhiem.service"

export const getAll = async(req: Request, res: Response) => {
    try {
        const data = await hoSoBonhiemService.getAllHSBN();
        return res.status(200).json({success: true, data});
    } catch (error) {
        return res.status(500).json({success: false, message: "Internal server"});
    }
} 
export const getChiTietHoSoById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await hoSoBonhiemService.getById(id);
        return res.status(200).json({success: true, data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Internal server"});
    }
}
export const getHoSoByPAId = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await hoSoBonhiemService.getByPhuongAnId(id);
        return res.status(200).json({success: true, data});
    } catch (error) {
        return res.status(500).json({success: false, message: "Internal server"});
    }
}
export const getHoSoByPhieuChuTruongId = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await hoSoBonhiemService.getByPhieuChuTruongId(id);
        return res.status(200).json({success: true, data});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Internal server"});
    }
}
export const createHSBN = async (req: Request, res: Response) => {
    try {
        const data = await hoSoBonhiemService.createHoSo(req.body);
        return res.status(200).json({success: true, data, message: "Tạo hồ sơ bổ nhiệm hồ sơ thành công"});
    } catch (error: any) {
         console.error('createHSBN error:', error.message);
        return res.status(500).json({success: false, message: error.message});
    }
}

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const hoSoId = Number(req.params.id);
        if(!req.file)
            return res.status(400).json({ success: false, message: "Chưa chọn file" });
        const payload = {
            tenTaiLieu: req.body.tenTaiLieu,
            loaiTaiLieu: Number(req.body.loaiTaiLieu),
            fileDinhKem: `/uploads/${req.file.filename}`
        }
        const data = await hoSoBonhiemService.uploadFile(hoSoId, payload);
        return res.status(201).json({ success: true, message: "Tải lên tài liệu thành công", data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}   
export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const taiLieuId = Number(req.params.taiLieuId);
        await hoSoBonhiemService.deleteTaiLieu(taiLieuId);
        return res.status(200).json({ success: true, message: "Xóa tài liệu thành công" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
export const completeDocument = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await hoSoBonhiemService.hoanThienHoSo(id);
        return res.status(200).json({ success: true, message: "Hoàn thiện hồ sơ thành công" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
