import { Request, Response } from "express";
import multer from "multer";
import { xepLoaiVienChuc } from "./importXL.service";

export const upload = multer({ storage: multer.memoryStorage() });

export const importXepLoaiController = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Vui lòng upload file Excel" });
        }

        const result = await xepLoaiVienChuc(req.file.buffer);

        return res.status(200).json({ success: true, message: `Import thành công ${result.count}/${result.total} bản ghi!`, data: result});
    } catch (error: any) {
        console.error("Lỗi import:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Lỗi khi import dữ liệu" 
        });
    }
};