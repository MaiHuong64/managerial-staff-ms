import { Request, Response } from "express";
import { getAllDonVi, getDonViById } from "./donVi.service";

export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await getAllDonVi();
        return res.status(200).json({ success: true, data });
    } catch {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await getDonViById(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
};
