import {Request, Response } from "express";
import * as DotQuyHoachService from "./dotQuyHoach.service";
import * as DotQuyHoachDTO from "./dotQuyHoach.dto";
import { submitVoteService } from "./dotQuyHoach.validate.service";

export const createDotQuyHoach = async (req: Request, res: Response) => {
    try {
        const { tenQuyHoach, loaiQuyHoach, namThucHien, nhiemKy,
                soQdPheDuyet, ngayQdPheDuyet, dotGocId } = req.body;
        const payload = { tenQuyHoach, loaiQuyHoach, namThucHien, nhiemKy, soQdPheDuyet, ngayQdPheDuyet, dotGocId, };
        const data = await DotQuyHoachService.createDotQuyHoach(payload);
        return res.status(201).json({
            success: true,
            message: "Tạo đợt quy hoạch thành công",
            data
        });
    } catch (error: any) {
        console.error("Create planning error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
export const addBulkVienChuc = async (req: Request, res: Response) => {
    // const id = Number(req.params.id)
    try {
            await DotQuyHoachService.addUngVien_QT169(req.body);        
        return res.status(201).json({ success: true, message: "Thêm viên chức thành công" });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export const getDotQuyHoachById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await DotQuyHoachService.findDotQuyHoachById(id);
        return res.status(200).json({success:true, data});
    } catch (error: any) {
            console.error("getById error:", error.message);
        return res.status(400).json({success: false, message: error.message})
    }
}
export const getAllDotQuyHoach = async (req: Request, res: Response) => {
    try {
        const data = await DotQuyHoachService.fetchAllDotQuyHoach();
        return res.status(200).json({success: true, data});
    } catch (error) {
        return res.status(500).json({success: false, message: "Lỗi server"});
    }
}
export const getDotQuyHoachGoc = async (req: Request, res: Response) => {
    try {
        const data = await DotQuyHoachService.fetchDotQuyHoachGoc();
        return res.status(200).json({success: true, data});
    } catch (error) {
        return res.status(500).json({success: false, message: "Lỗi server"});
    }
}
export const getVienChucByChucDanh  = async (req: Request, res: Response) => {
    try {
        const chucDanhId = Number(req.params.chucDanhId);
        const data = await DotQuyHoachService.fetchVienChucByChucDanh(chucDanhId);
        return res.status(200).json({success: true, data});
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }   
}
export const filterVienChuc = async (req: Request, res: Response) => {
    try {        
        const donViId = Number(req.query.donViId);
        const dotQuyHoachId = Number(req.query.dotQuyHoachId);
        const data = await DotQuyHoachService.filterVienChucQuyHoach(donViId, dotQuyHoachId);
        return res.status(200).json({success: true, data});
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}

export const submitVoteDotQuyHoach = async (req: Request, res: Response) => {
    try {
        await submitVoteService(req.body);
        return res.status(200).json({ success: true, message: "Ghi nhận kết quả thành công!" });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const approveDotQuyHoach = async (req: Request, res: Response) => {
    try {
        const dotQuyHoachId = Number(req.params.id);
        const payload: DotQuyHoachDTO.ApproveDotQuyHoachDTO = {
            soQdPheDuyet: req.body.soQdPheDuyet,
            ngayQdPheDuyet: req.body.ngayQdPheDuyet
        };
        const data = await DotQuyHoachService.approveDotQuyHoach(dotQuyHoachId, payload);
        return res.status(200).json({
            success: true,
            message: "Phê duyệt quy hoạch thành công",
            data
        });
    } catch (error: any) {
        console.error("Approve planning error:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const addUngVien = async (req:Request, res: Response) => {
    try {
        const payload: DotQuyHoachDTO.CreateUngVienDTO = {
            dotQuyHoachId: Number(req.params.id),
            vienChucId: Number(req.body.vienChucId),
            chucDanhId: Number(req.body.chucDanhId),
            donViId: Number(req.body.donViId),
            ngayVaoQH: new Date(req.body.ngayVaoQH)
        }
        const data = await DotQuyHoachService.addUngVien_QT170(payload);
        return res.status(201).json({message: "Thêm ứng viên thành công", data: data, });
    } catch (error: any) {
        console.log(error)
        return res.status(400).json({ message: error.message || "Thêm ứng viên thất bại" });
    }
}