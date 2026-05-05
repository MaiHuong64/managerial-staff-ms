import { Request, Response } from "express";
import { getAll as getAllService, getPCTById, approvePCT, createPhieuChuTruong, rejectPCT } from "./phieuChuTruong.service";
import { toCamel } from "snake-camel";

export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await getAllService();
        return res.status(200).json({ success: true, data: data.map(toCamel) });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await getPCTById(id);
        return res.status(200).json({ success: true, data: toCamel(data) });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

export const create = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const result = await createPhieuChuTruong(req.body, user);
        res.status(201).json(result);
    } catch (error) {
        console.error("create error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const approve = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const id = Number(req.params.id);
        const result = await approvePCT(id, user);
        res.status(200).json(result);
    } catch (error) {
        console.error("approve error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
export const reject = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const id = Number(req.params.id);
        const lyDoTuChoi = req.body.lyDoTuChoi;
        const result = await rejectPCT(id, user, lyDoTuChoi);

        res.status(200).json(result);
    } catch (error) {
        console.error("reject error:", error);
        res.status(500).json({ message: "Internal server error" });
    } 
}