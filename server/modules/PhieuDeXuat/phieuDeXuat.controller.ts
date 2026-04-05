import { Request, Response } from "express";
import { createPhieuDeXuat, getDetail, getList, rejectPDX } from "./phieuDeXuat.service";
export const getAllPhieu = async (req: Request, res: Response) => {
    try {
        const data = getList();
        return res.status(200).json({success: true, data});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await getDetail(id);
        return res.status(200).json({success: true, data});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export const create = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const data = await createPhieuDeXuat(req.body, user);
        return res.status(200).json({success: true, data});
    } catch (error) {
        return res.status(500).json({success: false, message:"Internal server"});
    }
}
export const approve = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const id = Number(req.params.id)
        if(!id)
            throw new Error ("Không tìm thấy phiếu")
        const result = rejectPDX(id, user, req.body);
        return result
    } catch (error) {
        throw error;
    }
}
export const reject = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const id = Number(req.params.id)
        if(!id)
            throw new Error ("Không tìm thấy phiếu")
        const result = rejectPDX(id, user, req.body);
        return result;
    } catch (error) {
        throw error;
    }
}