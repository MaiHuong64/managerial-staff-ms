import { Request, Response } from "express";
import * as ChucDanhService from "./chucDanh.service";

export const getAllChucDanh = async (req: Request, res: Response) => {
    try {
        const data = await ChucDanhService.getAllChucDanh();
        return res.status(200).json({ success: true, data });
    } catch (err){
        console.log(err)
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};
export const createChucDanh = async (req: Request, res: Response) => {
    try {
        const data = await ChucDanhService.createChucDanh(req.body);
        return res.status(201).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateChucDanh = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data =  await ChucDanhService.updateChucDanh(id, req.body);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
export const deleteChucDanh = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await ChucDanhService.deleteChucDanh(id);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
