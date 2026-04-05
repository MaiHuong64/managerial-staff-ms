import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { approvePDX, createPhieuDeXuat, getDetail, getList, rejectPDX, submitPDX } from "./phieuDeXuat.service";

export const getAllPhieuDeXuatNhanSu = async (req: AuthRequest, res: Response) => {
    try {
        const data = await getList();
        return res.status(200).json({ success: true, data });
    } catch {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}

export const gePhieuDeXuatNhanSutById = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await getDetail(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

export const createPhieuDeXuatNhanSu = async (req: AuthRequest, res: Response) => {
    try {
        const data = await createPhieuDeXuat(req.body, req.user);
        return res.status(201).json({ success: true, data });
    } catch {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}

export const submitPhieuDeXuatNhanSu = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await submitPDX(id, req.user);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const approvePhieuDeXuatNhanSu = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await approvePDX(id, req.user, req.body);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const rejectPhieuDeXuatNhanSu = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await rejectPDX(id, req.user, req.body);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
