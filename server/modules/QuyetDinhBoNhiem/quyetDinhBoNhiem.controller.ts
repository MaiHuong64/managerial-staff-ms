import { Response } from "express";
import { CreateQDBN, getQDBoNhiemById } from "./quyetDinhBoNhiem.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export const CreateQDBNController = async (req: AuthRequest, res: Response) => {
    try {
        const hoSoId = Number(req.params.hoSoId);
        const nguoiPheDuyet = req.user?.hoVaTen || "Không xác định";
        const data = await CreateQDBN(req.body, hoSoId, nguoiPheDuyet);
        return res.status(201).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Tạo quyết định thất bại" });
    }
}
export const getQDBoNhiemByIdController = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.hoSoId);
        const result = await getQDBoNhiemById(id);
        if (!result) return res.status(404).json({ message: "Không tìm thấy quyết định" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Lấy thông tin thất bại", error });
    }
}