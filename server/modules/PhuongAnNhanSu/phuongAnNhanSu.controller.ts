import { Request, Response } from "express";
import { getAll as getAllService, getById as getByIdService, createPANS, updateStatusPANS, submitPANS, getCandidatesList } from "./phuongAnNhanSu.service";
import { TrangThaiPANS } from "./phuongAnNhanSu.type";

export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await getAllService();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await getByIdService(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

export const create = async (req: Request, res: Response) => {
    try {
        const data = await createPANS(req.body);
        res.status(201).json({ success: true, message: "Tạo phương án nhân sự thành công", data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const submit = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        await submitPANS(id);
        res.status(200).json({ success: true, message: "Trình phương án lên BGH thành công" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const approve = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { yKienBGH } = req.body;
    try {
        await updateStatusPANS(id, TrangThaiPANS.daPheDuyet, yKienBGH);
        res.status(200).json({ success: true, message: "Phê duyệt thành công" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const reject = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { yKienBGH } = req.body;
    try {
        await updateStatusPANS(id, TrangThaiPANS.tuChoi, yKienBGH);
        res.status(200).json({ success: true, message: "Từ chối thành công" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
export const getCandidates = async (req: Request, res: Response) => {
    try {
        const data = await getCandidatesList();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
