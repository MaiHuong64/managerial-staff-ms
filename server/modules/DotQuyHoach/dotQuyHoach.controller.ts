import {Request, Response } from "express";
import { addPlanningCandidates, createPlanningBatch, fetchAllPlanning, findPlanningBatchById, fetchCandidatesForChucDanh, filterPlanningCandidates } from "./dotQuyHoach.service";
import { AddPlanningBatchDetailDTO } from "./dotQuyHoach.dto";
import { submitVoteResult } from "./dotQuyHoach.validate.service";

export const create = async (req: Request, res: Response) => {
    try {
        const { tenQuyHoach, loaiQuyHoach, namThucHien, nhiemKy,
                soQdPheDuyet, ngayQdPheDuyet, dotGocId } = req.body;
        const payload = { tenQuyHoach, loaiQuyHoach, namThucHien, nhiemKy, soQdPheDuyet, ngayQdPheDuyet, dotGocId, };
        const data = await createPlanningBatch(payload);
        return res.status(201).json({
            success: true,
            message: "Tạo đợt quy hoạch thành công",
            data
        });
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu bị trùng (vi phạm ràng buộc duy nhất)"
            });
        }
        console.error("Create planning error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
export const addCandidates = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        for(const item of req.body) {
            const payload: AddPlanningBatchDetailDTO = {
                dotQuyHoachId: id,
                chucDanhId: item.chucDanhId,
                vienChucId: item.vienChucId,
                donViId: item.donViId
            }
            await addPlanningCandidates(payload);
        }
        
        return res.status(201).json({ success: true, message: "Thêm viên chức thành công" });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await findPlanningBatchById(id);
        return res.status(200).json({success:true, data});
    } catch (error: any) {
            console.error("getById error:", error.message);
        return res.status(400).json({success: false, message: error.message})
    }
}
export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await fetchAllPlanning();
        return res.status(200).json({success: true, data});
    } catch (error) {
        return res.status(500).json({success: false, message: "Lỗi server"});
    }
}
export const getCandidatesHandler  = async (req: Request, res: Response) => {
    try {
        const chucDanhId = Number(req.params.chucDanhId);
        const data = await fetchCandidatesForChucDanh(chucDanhId);
        return res.status(200).json({success: true, data});
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }   
}
export const filterCandidatesHandler = async (req: Request, res: Response) => {
    try {        
        const donViId = Number(req.query.donViId);
        const trinhDoChuyenMon = String(req.query.trinhDoChuyenMon);
        const dotQuyHoachId = Number(req.query.dotQuyHoachId);
        const data = await filterPlanningCandidates(donViId, trinhDoChuyenMon, dotQuyHoachId);
        return res.status(200).json({success: true, data});
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}

export const submitVoteQuyHoach = async (req: Request, res: Response) => {
    try {
        await submitVoteResult(req.body)
         return res.status(200).json({ success: true, message: "Ghi nhận kết quả thành công!" });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}