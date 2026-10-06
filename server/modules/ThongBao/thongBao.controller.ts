import {Request, Response} from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as service from "./thongBao.service";

export const getThongBaoByVcId = async (req: AuthRequest, res: Response) => {
    try{
        const data = await service.getThongBaoByVcId(req.user!.vienChucId, {unReadOnly: false});
        res.json({success: true, ...data});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Lỗi server"});
    }
}
export const readAll = async (req: AuthRequest, res: Response) => {
    try{
        const data = await service.markAllAsRead(req.user!.vienChucId);
        res.json({success: true, data});
    }
    catch (error){
        res.status(500).json({success: false, message: "Lỗi server"});
    }
}

export const readOne = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const data = await service.markAsRead(parseInt(id), req.user!.vienChucId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
}
export const getMyUnreadCount = async (req: AuthRequest, res: Response) => {
    try {
        const count = await service.getThongBaoByVcId(req.user!.vienChucId, {unReadOnly: false});
        res.json({ success: true, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
}

export const testNotify = async (req: AuthRequest, res: Response) => {
    try {
        const { tieuDe } = req.body;
        const thongBao = await service.notifyVienChuc(req.user!.vienChucId, tieuDe, "test real time", "thong-bao", null);
        res.json({ success: true, thongBao });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
}
