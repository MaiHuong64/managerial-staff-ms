import { Request, Response } from "express";
import { getNhiemKyByStaffId } from "./nhiemKyChucVu.service";

export const getNhiemKyController = async (req: Request, res: Response) => {
    try {
        const vienChucId = Number(req.params.vienChucId);
        if (isNaN(vienChucId)) {
            return res.status(400).json({ message: "ID viên chức không hợp lệ" });
        }
        const data = await getNhiemKyByStaffId(vienChucId);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || "Lấy lịch sử nhiệm kỳ thất bại" });
    }
};
