import { Request, Response } from "express";
import { fetchAllAppointmentBatch,  findAppointmentBatchById, createAppointmentBatch} from "./dotBoNhiem.service";
import { submitVoteResult } from "./dotBoNhiem.validate.service";

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
        await submitVoteResult(req.body);
        return res.status(200).json({ success: true, message: "Ghi nhận kết quả thành công!" });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

// GET /bo-nhiem/detail/:chiTietDotId/candidates
// Trả về danh sách ứng viên của 1 chi_tiet_dot_bo_nhiem
export const getCandidates = async (req: Request, res: Response) => {
    const chiTietDotId = Number(req.params.chiTietDotId);
    // TODO: implement getCandidatesByChiTietDot(chiTietDotId)
    return res.status(501).json({ success: false, message: "Chưa implement" });
}

// Thêm 1 ứng viên thủ công vào chi_tiet_dot_bo_nhiem
// body: { vien_chuc_id, ly_do_vao, chi_tiet_qh_id }
export const addCandidate = async (req: Request, res: Response) => {
    const chiTietDotId = Number(req.params.chiTietDotId);
    const { vienChucId, lyDoVao, chiTietQhId } = req.body;
    // TODO: implement addCandidateToChiTietDot(chiTietDotId, { vien_chuc_id, ly_do_vao, chi_tiet_qh_id })
    return res.status(501).json({ success: false, message: "Chưa implement" });
}

// POST /bo-nhiem/:id/start-voting
// Bắt đầu quy trình bỏ phiếu: set buoc_hien_tai = 2 cho tất cả chi_tiet_dot_bo_nhiem
export const startVoting = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    // TODO: implement startVotingProcess(id)
    return res.status(501).json({ success: false, message: "Chưa implement" });
}
