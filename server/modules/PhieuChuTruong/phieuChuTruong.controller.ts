import { Request, Response } from "express";
import * as PhieuChuTruongService from "./phieuChuTruong.service";
import { toCamel } from "snake-camel";

export const getAllPhieuChuTruong = async (req: Request, res: Response) => {
    try {
        const data = await PhieuChuTruongService.getAllPhieuChuTruong();
        return res.status(200).json({ success: true, data: data.map(toCamel) });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export const getPhieuChuTruongFollowingAppointment = async (req: Request, res: Response) => {
    try {
        const data = await PhieuChuTruongService.getPhieuChuTruongFollowingAppointment();
        return res.status(200).json({ success: true, data: data.map(toCamel) });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export const getPhieuChuTruongByDonViId = async (req: Request, res: Response) => {
    try {
        const donViId = Number(req.params.donViId);
        const data = await PhieuChuTruongService.getPhieuChuTruongByDonViId(donViId);
        return res.status(200).json({ success: true, data: data.map(toCamel) });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export const getPhieuChuTruongById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await PhieuChuTruongService.getPhieuChuTruongById(id);
        return res.status(200).json({ success: true, data: toCamel(data) });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

export const createPhieuChuTruong = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const result = await PhieuChuTruongService.createPhieuChuTruong(req.body, user);
        res.status(201).json(result);
    } catch (error) {
        console.error("create error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const approvePCT = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const id = Number(req.params.id);
        const result = await PhieuChuTruongService.approvePCT(id, user);
        res.status(200).json(result);
    } catch (error) {
        console.error("approve error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
export const rejectPCT = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const id = Number(req.params.id);
        const lyDoTuChoi = req.body.lyDoTuChoi;
        const result = await PhieuChuTruongService.rejectPCT(id, user, lyDoTuChoi);

        res.status(200).json(result);
    } catch (error) {
        console.error("reject error:", error);
        res.status(500).json({ message: "Internal server error" });
    } 
}