import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { approvePDX, CheckCandidateCondition, createPhieuDeXuat, getDetail, getList, rejectPDX, submitPDX } from "./phieuDeXuat.service";

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
        console.log("1. Kiểm tra req.user tại Controller:", req.user); // Xem có dữ liệu không hay undefined?
        console.log("2. Kiểm tra req.body tại Controller:", req.body);
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
export const auditPhieuDeXuatCandidate = async (req: AuthRequest, res: Response) => {
    try {
        const chiTietId = Number(req.params.chiTietId);
        const data = await CheckCandidateCondition(chiTietId, req.user, req.body);
        return res.status(200).json({ success: true, message: "Đã cập nhật tiêu chuẩn", data });
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
