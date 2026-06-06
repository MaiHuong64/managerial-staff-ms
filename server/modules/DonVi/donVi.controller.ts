import { Request, Response } from "express";
import * as DonViService from "./donVi.service";

export const getAllDonVi = async (req: Request, res: Response) => {
    try {
        const data = await DonViService.getAllDonVi();
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách đơn vị", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export const getDonViById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await DonViService.getDonViById(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
};
export const createDonVi = async (req: Request, res: Response) => {
    try {
        const data = await DonViService.createDonVi(req.body);
        return res.status(201).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDonVi = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await DonViService.updateDonVi(id, req.body);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteDonVi = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await DonViService.deleteDonVi(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};