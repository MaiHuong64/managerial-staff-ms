import { Request, Response } from "express";
import { createDonViService, deleteDonViService, getAllDonViService, getDonViByIdService, updateDonViService } from "./donVi.service";

export const getAllDonViController = async (req: Request, res: Response) => {
    try {
        const data = await getAllDonViService();
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách đơn vị", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export const getDonViByIdController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await getDonViByIdService(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
};
export const createDonViController = async (req: Request, res: Response) => {
    try {
        const data = await createDonViService(req.body);
        return res.status(201).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDonViController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await updateDonViService(id, req.body);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteDonViController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await deleteDonViService(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};