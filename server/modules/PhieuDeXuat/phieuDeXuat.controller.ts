import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as PhieuDeXuatService from "./phieuDeXuat.service";
import { getVienChucByRole } from "../TaiKhoan/taiKhoan.repository";
import { createThongBao, sendPhieuDeXuat } from "../ThongBao/thongBao.service";
import { getTenDonVi } from "../DonVi/donVi.service";

export const getAllPhieuDeXuatNhanSu = async (req: AuthRequest, res: Response) => {
    try {
        const data = await PhieuDeXuatService.getList();
        return res.status(200).json({ success: true, data });
    } catch {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}

export const getPhieuDeXuatNhanSutById = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await PhieuDeXuatService.getDetail(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

export const createPhieuDeXuatNhanSu = async (req: AuthRequest, res: Response) => {
    try {
        const data = await PhieuDeXuatService.createPhieuDeXuat(req.body, req.user);
        const tenDonVi = await getTenDonVi(req.user!.donViId);
        const PTCCT = await getVienChucByRole("PTCCT");
        sendPhieuDeXuat(PTCCT.map(vc => vc.id), data.id, tenDonVi);
        return res.status(201).json({ success: true, data });
    } catch {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}

export const submitPhieuDeXuatNhanSu = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await PhieuDeXuatService.submitPDX(id, req.user);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const auditPhieuDeXuatCandidate = async (req: AuthRequest, res: Response) => {
    try {
        const chiTietId = Number(req.params.chiTietId);
        const data = await PhieuDeXuatService.CheckCandidateCondition(chiTietId, req.user, req.body);
        return res.status(200).json({ success: true, message: "Đã cập nhật tiêu chuẩn", data });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const approvePhieuDeXuatNhanSu = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await PhieuDeXuatService.approvePDX(id, req.user, req.body);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const rejectPhieuDeXuatNhanSu = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await PhieuDeXuatService.rejectPDX(id, req.user, req.body);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
