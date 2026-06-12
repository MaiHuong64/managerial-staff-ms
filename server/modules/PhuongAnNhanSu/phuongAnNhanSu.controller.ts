import { Request, Response } from "express";
import * as PhuongAnNhanSuService from "./phuongAnNhanSu.service";
import { TrangThaiPANS } from "./phuongAnNhanSu.type";

export const getAllPANS = async (req: Request, res: Response) => {
    try {
        const data = await PhuongAnNhanSuService.getAllPANS();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export const getPANSById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await PhuongAnNhanSuService.getPANSById(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

export const createPANS = async (req: Request, res: Response) => {
    try {
        const data = await PhuongAnNhanSuService.createPANS(req.body);
        res.status(201).json({ success: true, message: "Tạo phương án nhân sự thành công", data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const submitPANS = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        await PhuongAnNhanSuService.submitPANS(id);
        res.status(200).json({ success: true, message: "Trình phương án lên BGH thành công" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const approvePANS = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { yKienBGH } = req.body;
    try {
        await PhuongAnNhanSuService.approvePANS(id, yKienBGH);
        res.status(200).json({ success: true, message: "Phê duyệt thành công" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const rejectPANS = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { yKienBGH } = req.body;
    try {
        await PhuongAnNhanSuService.rejectPANS(id, yKienBGH);
        res.status(200).json({ success: true, message: "Từ chối thành công" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const getVienChucChoPANS = async (req: Request, res: Response) => {
    try {
        const data = await PhuongAnNhanSuService.getVienChucChoPANS();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
