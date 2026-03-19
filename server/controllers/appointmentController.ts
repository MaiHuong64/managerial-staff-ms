import {Request, Response } from "express";
import pool from "../config/db";

export const getAll =  async (req: Request, res: Response) => {
    try {
        const query = `SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.trang_thai,
                        pct.so_luong_de_xuat, cd.ten_chuc_danh, dv.ten_don_vi 
                        FROM dot_bo_nhiem dbn 
                        JOIN phieu_chu_truong pct ON dbn.phieu_chu_truong_id = pct.id
                        JOIN chuc_danh_quan_ly cd ON pct.chuc_danh_id = cd.id
                        JOIN don_vi dv ON pct.don_vi_id = dv.id`
        const result = await pool.query(query);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.log(error);
    }
}
export const getByID =  async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const batchQuery = `SELECT id, ma_dot_bo_nhiem, ten_dot_bo_nhiem, trang_thai 
                            FROM dot_bo_nhiem 
                            WHERE id = $1 `
        const detailQuery = `SELECT 
                        ctbn.id, vc.id, vc.ma_vien_chuc, vc.ho_va_ten,
                        dv.ten_don_vi,
                        nk.ten_chuc_danh,
                        CASE
                            WHEN ctbn.id IS NOT NULL THEN 'Nguồn tại chỗ'
                            ELSE 'Nguồn nơi khác' 
                        END as nguon_vien_chuc,
                        ctbn.trang_thai
                        FROM chi_tiet_bo_nhiem ctbn LEFT JOIN vien_chuc vc on ctbn.vien_chuc_id = vc.id
                        LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
                        LEFT JOIN (SELECT nkcv.vien_chuc_id, cd.ten_chuc_danh
                                FROM nhiem_ky_chuc_vu nkcv JOIN chuc_danh_quan_ly cd on nkcv.chuc_danh_id = cd.id
                                WHERE nkcv.trang_thai = 1) nk ON vc.id = nk.vien_chuc_id
                        WHERE ctbn.dot_bo_nhiem_id = $1 AND ctbn.trang_thai = 1`

        const [batchInfo, candidates] = await Promise.all([
            await pool.query(batchQuery, [id]),
            await pool.query(detailQuery, [id])
        ]);
        if(batchInfo.rows.length === 0){
            return res.status(404).json({ success: false, message: "Không tìm thấy đợt bổ nhiệm" });
        }
        res.status(200).json({ success: true, data: {
            batchInfo: batchInfo.rows,
            candidates: candidates.rows
        } });
    } catch (error) {
        console.log(error);
    }
}

export const getPlanningSrc = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const query = `SELECT vc.id, vc.ma_vien_chuc, vc.ho_va_ten,
                        dv.ten_don_vi,
                        dqh.ten_quy_hoach, ctqh.id
                        FROM chi_tiet_quy_hoach ctqh LEFT JOIN vien_chuc vc ON ctqh.vien_chuc_id = vc.id
                        LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
                        LEFT JOIN dot_quy_hoach dqh ON ctqh.dot_quy_hoach_id = dqh.id
                        WHERE ctqh.trang_thai = 1
                        AND ctqh.chuc_danh_id = (SELECT pct.chuc_danh_id 
                        FROM dot_bo_nhiem dbn LEFT JOIN phieu_chu_truong pct ON dbn.phieu_chu_truong_id = pct.id WHERE dbn.id = $1)
                        AND vc.id NOT IN (SELECT vien_chuc_id FROM chi_tiet_bo_nhiem WHERE dot_bo_nhiem_id = $1 AND vien_chuc_id IS NOT NULL)`;
        
        const result = await pool.query(query, [id]);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Lỗi getPlanningSrc:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Không thể lấy danh sách nguồn quy hoạch" 
        });
    }
}
//add new candidate from other place
export const addCandidate = async (req: Request, res: Response) => {
    try {
        const {vien_chuc_id, dot_bo_nhiem_id, ly_do_vao, chi_tiet_qh_id} = req.body;
        const query = `INSERT INTO chi_tiet_bo_nhiem (ly_do_vao, dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await pool.query(query, [ly_do_vao, dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id || null]);

        return res.status(201).json({ success: true, message: "Đã thêm ứng viên thành công", data: result.rows[0] });
    } catch (error: any) {
        console.error("Lỗi addCandidate:", error);
        
        if (error.code === '23505') {
            return res.status(400).json({ 
                success: false, 
                message: "Viên chức này đã tồn tại trong đợt bổ nhiệm!" 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi máy chủ khi thêm ứng viên" 
        });
    }
}   
export const removeCandidate = async (req: Request, res: Response) => {
    try {
        const {ly_do_ra, dot_bo_nhiem_id, vien_chuc_id} = req.body; 
        const query  = `UPDATE chi_tiet_bo_nhiem 
                        SET trang_thai = 0, ly_do_ra = $1
                        WHERE dot_bo_nhiem_id = $2 AND vien_chuc_id = $3 AND trang_thai = 1 RETURNING *`;
        const result = await pool.query(query, [ly_do_ra, dot_bo_nhiem_id, vien_chuc_id])

        if (result.rowCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy ứng viên đang hoạt động trong đợt này" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Đã xác nhận ứng viên rời khỏi đợt bổ nhiệm",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Lỗi removeCandidate:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
}
export const addVoteResult = async (req: Request, res: Response) => {
    try {
        const {chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_dong_y, so_phieu_thu_ve, ket_qua} = req.body;
        const query = `INSERT INTO ket_qua_bo_nhiem 
                    (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_dong_y, so_phieu_thu_ve, ket_qua)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        
        const result = await pool.query(query, [chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_dong_y, so_phieu_thu_ve, ket_qua]);
        res.status(200).json({ success: true, data: result.rows[0] });         
    } catch (error) {
        console.error("Lỗi addVoteResult:", error);
        res.status(500).json({ success: false, message: "Lỗi khi lưu kết quả bỏ phiếu" });
    }
}
// Tạo phương án nhân sự
export const createPersonnelProposal = async (req:Request, res: Response) => {
    const client = await pool.connect();
    try
    {
        await client.query('BEGIN');
        const dot_bo_nhiem_id = req.params.id;
        const {so_to_trinh, ngay_to_trinh, ghi_chu, danh_sach_ung_vien} = req.body;

        if(!danh_sach_ung_vien || danh_sach_ung_vien.length === 0)
            throw new Error("tờ trình này rỗng");

        // Tạo id tự động
        const idResult = await client.query("SELECT MAX(id) FROM phuong_an_nhan_su")
        const maxid = idResult.rows[0].id || 0;
        const ma_phuong_an = "PA" + (maxid + 1).toString().padStart(3, "0");

        const query = `INSERT INTO phuong_an_nhan_su (ma_phuong_an, so_to_trinh, ngay_to_trinh, ngay_lap, ghi_chu, trang_thai, dot_bo_nhiem_id)
                        VALUES ($1, $2, $3, CURRENT_DATE, $4, 1, $5) RETURNING *`;
        const result = await client.query(query, [ma_phuong_an, so_to_trinh, ngay_to_trinh, ghi_chu, dot_bo_nhiem_id]);

        // Lấy id để insert vào chi tiết phương án 
        const phuong_an_id = result.rows[0].id;

        const insertDetail = `INSERT INTO chi_tiet_phuong_an (loai_phuong_an, ghi_chu, trang_thai, phuong_an_id, chi_tiet_bn_id)
                            VALUES ($1, $2, 1, $3, $4)`
        for (const ungVien of danh_sach_ung_vien){
           await client.query(insertDetail, 
            [ungVien.loai_phuong_an,
            ungVien.ghi_chu_ung_vien,
            phuong_an_id,         
            ungVien.chi_tiet_bn_id]);
        }
        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            message: "Đã lập phương án nhân sự thành công!",
            data: { 
                phuong_an_id: phuong_an_id, 
                ma_phuong_an: ma_phuong_an,
                so_luong_nhan_su: danh_sach_ung_vien.length
            }
        });

    } catch (error: any) {
        await client.query('ROLLBACK'); 
        console.error("Lỗi khi tạo phương án:", error);
        
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi lập phương án nhân sự"
        });
    } finally{client.release()}
}
// Tạo hồ sơ bổ nhiệm
export const createDossier = async (req: Request, res:Response) => {
    try {
        
    } catch (error) {
        
    }
}
export const createDecision = async (req: Request, res: Response) => {
    try {
        const {ho_so_bo_nhiem, ma_bo_nhiem, so_quyet_dinh, ngay_quyet_dinh, ngay_co_hieu_luc, thoi_han} = req.body;
        const client = await pool.connect();
        client.query("BEGIN")
        
        client.query ("COMMIT");
    } catch (error) {
        
    }
}


export default {getAll, getByID, removeCandidate, addCandidate, addVoteResult, createDecision, getPlanningSrc, createPersonnelProposal, createDossier}