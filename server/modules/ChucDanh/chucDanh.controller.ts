import { Request, Response } from "express";
import { getAllChucDanh } from "./chucDanh.service";

export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await getAllChucDanh();
        return res.status(200).json({ success: true, data });
    } catch {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};
