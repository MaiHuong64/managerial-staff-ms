import { Request, Response } from "express";
import { createChucDanhService, deleteChucDanhService, getAllChucDanh, updateChucDanhService } from "./chucDanh.service";

export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await getAllChucDanh();
        return res.status(200).json({ success: true, data });
    } catch (err){
        console.log(err)
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};
export const createChucDanhController = async (req: Request, res: Response) => {
    try {
        const data = await createChucDanhService(req.body);
        return res.status(201).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateChucDanhController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data =  await updateChucDanhService(id, req.body);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
export const deleteChucDanhController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await deleteChucDanhService(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
