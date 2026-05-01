import { Request, Response } from "express";
import { fetchAllAppointmentBatch,  findAppointmentBatchById, createAppointmentBatch, fetchCandidates} from "./dotBoNhiem.service";
import {  resolveVoteTieService, submitVoteResult } from "./dotBoNhiem.validate.service";

export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await fetchAllAppointmentBatch ();
        return res.status(200).json({ success: true, data});
    } catch (error) {
        return res.status(500).json({success: false, message:"Lỗi máy chủ"});
    }
}
export const getById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = await findAppointmentBatchById(id);
        return res.status(200).json({ success: true, data});
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
}
export const create = async (req: Request, res: Response) => {
    try {
       const { tenDotBoNhiem, ngayBatDau, ngayKetThuc, ngayPheDuyet, 
                soQuyetDinh, nguoiLap, phieuChuTruong } = req.body;
        
        const payload = {tenDotBoNhiem, ngayBatDau, ngayKetThuc, ngayPheDuyet, soQuyetDinh, nguoiLap, phieuChuTruong}
        const data = await createAppointmentBatch(payload);
        return res.status(201).json({ success: true, message: "Tạo thành công!", data});
    } catch (error: any) {
        if (error.code === '23505')
            return res.status(400).json({ success: false, message: "Mã đã tồn tại!" });
        if (error.code === '22001' || error.message?.includes('too long'))
            return res.status(400).json({ success: false, message: "Mã không được vượt quá 6 ký tự!" });
        return res.status(500).json({ success: false, message: error.message ?? "Lỗi máy chủ" });
    }
};

export const submitVoteBoNhiem = async (req: Request, res: Response) => {
    try {
        const result = await submitVoteResult(req.body);

        // Nếu có hòa phiếu, trả về thông tin để frontend xử lý
        if (result && result.isTie) {
            console.log("Tie detected! Result:", JSON.stringify(result, null, 2));
            return res.status(200).json({
                success: true,
                hoa: true,
                tieCandidates: result.danhSachHoa,
                message: "Phát hiện hòa phiếu, vui lòng chọn ứng viên được đi tiếp"
            });
        }

        return res.status(200).json({ success: true, message: "Ghi nhận kết quả thành công!" });
    } catch (error: any) {
        console.error("Error in submitVoteBoNhiem:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
}

// GET /bo-nhiem/detail/:chiTietDotId/candidates
// Trả về danh sách ứng viên của 1 chi_tiet_dot_bo_nhiem
export const getCandidates = async (req: Request, res: Response) => {
    try {
        const chiTietDotId = Number(req.params.chiTietDotId);
        const data = await fetchCandidates(chiTietDotId);
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const resolveVoteTie = async (req: Request, res: Response) => {
    try {
        const { chiTietBnId, tieCandidates } = req.body;
        await resolveVoteTieService(chiTietBnId, tieCandidates);
        return res.status(200).json({ success: true, message: "Đã cập nhật kết quả ứng viên hòa!" });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}