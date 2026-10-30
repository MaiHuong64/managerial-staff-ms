import {Response} from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as service from "./thongBao.service";

export const getThongBaoByVcId = async (req: AuthRequest, res: Response) => {
    try{
        const data = await service.getThongBaoByVcId(req.user!.vienChucId);
        res.json({success: true, data});
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
        const count = await service.countUnread(req.user!.vienChucId);
        res.json({ success: true, count }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
}
