import { Request, Response } from "express";
import { CreateQDBN, getHoSoInfo, getQDBoNhiemById } from "./quyetDinhBoNhiem.service";

export const CreateQDBNController = async (req: Request, res: Response) => {
    try {
        const hoSoId = Number(req.params.hoSoId);
        const data = await CreateQDBN(req.body, hoSoId);
        return res.status(201).json({ success: true, data });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || "Tạo quyết định thất bại" });
    }
}

export const getQDBoNhiemByIdController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await getQDBoNhiemById(id);
        if (!result) return res.status(404).json({ message: "Không tìm thấy quyết định" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Lấy thông tin thất bại", error });
    }
}

export const getHoSoInfoController = async (req: Request, res: Response) => {
    try {
        const hoSoId = Number(req.params.hoSoId);
        const data = await getHoSoInfo(hoSoId);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Lấy thông tin hồ sơ thất bại" });
    }
}