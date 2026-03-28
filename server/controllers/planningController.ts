import {Request, Response } from "express";
import pool from "../config/db";

const PlanningController = {
    submitPlanning: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                `UPDATE dot_quy_hoach SET trang_thai = 1 WHERE id = $1 AND trang_thai = 0 RETURNING *`,
                [id]
            );
            if (result.rowCount === 0)
                return res.status(400).json({ success: false, message: "Đợt quy hoạch không ở trạng thái soạn thảo" });
            res.status(200).json({ success: true, message: "Đã trình BGH phê duyệt" });
        } catch {
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    },

    approvePlanning: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { action } = req.body;
            if (!["approve", "reject"].includes(action))
                return res.status(400).json({ success: false, message: "action không hợp lệ" });

            const newStatus = action === "approve" ? 2 : 3;
            const result = await pool.query(
                `UPDATE dot_quy_hoach SET trang_thai = $1 WHERE id = $2 AND trang_thai = 1 RETURNING *`,
                [newStatus, id]
            );
            if (result.rowCount === 0)
                return res.status(400).json({ success: false, message: "Đợt quy hoạch không ở trạng thái chờ duyệt" });

            res.status(200).json({ success: true, message: action === "approve" ? "Đã phê duyệt" : "Đã từ chối" });
        } catch {
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    },

    // get all
    getAll: async (req: Request, res: Response) => {
        try {
            const query = ` select d.*, count(c.vien_chuc_id) as so_luong
                            from dot_quy_hoach d left join chi_tiet_quy_hoach c on d.id = c.dot_quy_hoach_id
                            group by d.id`;
            const result = await pool.query(query);
            res.status(200).json({ success: true, data: result.rows });
        } catch (error) {
            console.error("Error fetching staff:", error);
            res.status(500).send("Internal server error");
        }
    },
    // detail
    getDetail: async (req: Request, res: Response) => {
        const {id} = req.params;
        try {
            const query = `select d.id, d.trang_thai, d.ma_quy_hoach, d.ten_quy_hoach, d.loai_quy_hoach, d.nam_thuc_hien, d.so_qd_phe_duyet, d.ngay_qd_phe_duyet,
                            vc.ho_va_ten,
                            dv.ten_don_vi,
                            ct.id as chi_tiet_id, ct.ngay_vao_qh, ct.ngay_ra_qh, ct.so_qd_ra_khoi_quy_hoach, ct.ngay_qd_ra_khoi_quy_hoach, ct.ly_do_ra_khoi_quy_hoach, ct.trang_thai
                            from dot_quy_hoach d left join chi_tiet_quy_hoach ct on d.id = ct.dot_quy_hoach_id
                                left join vien_chuc vc on ct.vien_chuc_id = vc.id
                                left join don_vi dv on vc.don_vi_id = dv.id
                            where d.id = $1`;
            const result = await pool.query(query, [id]);
            
            // Tach du lieu
            const rows = result.rows;
            const planning = {
                id: rows[0].id,
                trang_thai: rows[0].trang_thai,
                y_kien_bgh: rows[0].y_kien_bgh,
                ma_quy_hoach: rows[0].ma_quy_hoach,
                ten_quy_hoach: rows[0].ten_quy_hoach,
                loai_quy_hoach: rows[0].loai_quy_hoach,
                nam_thuc_hien: rows[0].nam_thuc_hien,
                so_qd_phe_duyet: rows[0].so_qd_phe_duyet,
                ngay_qd_phe_duyet: rows[0].ngay_qd_phe_duyet
            };
            const staff = rows.map(r => ({
                ho_va_ten: r.ho_va_ten,
                ten_don_vi: r.ten_don_vi,
                ngay_vao_qh: r.ngay_vao_qh,
                ngay_ra_qh: r.ngay_ra_qh,
                ly_do_ra_khoi_quy_hoach: r.ly_do_ra_khoi_quy_hoach,
                trang_thai: r.trang_thai
            }));

            res.status(200).json({ success: true, planning, staff });
        } catch (error) {
            console.error("Error fetching staff:", error);
            res.status(500).send("Internal server error");
        }
    },
    // create new plan
    createPlanning: async (req: Request, res: Response) => {
        try {
            const {vai_tro} = (req as any).user
            const {ten_quy_hoach, loai_quy_hoach
                , nam_thuc_hien, nhiem_ky, so_qd_phe_duyet, ngay_qd_phe_duyet, trang_thai} = req.body;
            if(vai_tro !== 'PTCCT')
                return res.status(403).json({ success: false, message: "Không có quyền tạo phiếu" });
            
            const id = await pool.query("SELECT MAX(id) FROM dot_quy_hoach");
            const ma_quy_hoach = "QH" + (id.rows[0].max + 1).toString().padStart(3, '0');
            
            const query = `insert into dot_quy_hoach (ma_quy_hoach, ten_quy_hoach, loai_quy_hoach, nam_thuc_hien, nhiem_ky, so_qd_phe_duyet, ngay_qd_phe_duyet, trang_thai) 
                            values ($1, $2, $3, $4, $5, $6, $7, $8)returning * `; 
            const result = await pool.query(query, [ma_quy_hoach, ten_quy_hoach, loai_quy_hoach
                ,nam_thuc_hien, nhiem_ky, so_qd_phe_duyet, ngay_qd_phe_duyet, 0]);

            res.status(200).json({ success: true, data: result.rows });

            } catch (error) {
            console.error("Error fetching staff:", error);
            res.status(500).send("Internal server error");
        }
    },

    // update planning info
    updatePlanning: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { ten_quy_hoach, loai_quy_hoach, nam_thuc_hien, nhiem_ky, so_qd_phe_duyet, ngay_qd_phe_duyet } = req.body;
            const query = `UPDATE dot_quy_hoach
                           SET ten_quy_hoach = $1, loai_quy_hoach = $2, nam_thuc_hien = $3,
                               nhiem_ky = $4, so_qd_phe_duyet = $5, ngay_qd_phe_duyet = $6
                           WHERE id = $7 RETURNING *`;
            const result = await pool.query(query, [ten_quy_hoach, loai_quy_hoach, nam_thuc_hien, nhiem_ky, so_qd_phe_duyet, ngay_qd_phe_duyet, id]);
            if (result.rowCount === 0)
                return res.status(404).json({ success: false, message: "Không tìm thấy đợt quy hoạch" });
            res.status(200).json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error("Error updating planning:", error);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    },

    filterStaff: async (req: Request, res: Response) => {
        try {
            const {trinh_do_chuyen_mon, don_vi_id, dot_quy_hoach_id} = req.query;
            const query = `select id, ma_vien_chuc, ho_va_ten, trinh_do_chuyen_mon
                            from vien_chuc
                            where trinh_do_chuyen_mon = $1 and don_vi_id = $2 and id not in 
                            (select vien_chuc_id from chi_tiet_quy_hoach where dot_quy_hoach_id = $3 and trang_thai = $4)`;
            const result = await pool.query(query, [trinh_do_chuyen_mon, don_vi_id, dot_quy_hoach_id, 1]);
            
            return res.status(200).json({ success: true, data: result.rows }); 
        } catch (error) {
            console.error("Error fetching staff:", error);
            res.status(500).send("Internal server error");
        }
    },
    addCandidate: async (req: Request, res: Response) => {
        try {
            const {dot_quy_hoach_id, vien_chuc_id, chuc_danh_id} = req.body;
            const query = `insert into chi_tiet_quy_hoach (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id, ngay_vao_qh, trang_thai) values
                            ($1, $2, $3, NOW(), 1) returning *`
            const result = await pool.query(query, [dot_quy_hoach_id, vien_chuc_id, chuc_danh_id])
            res.status(201).json({ success: true, data: result.rows[0], message: "Đã thêm vào quy hoạch" });
        } catch (error) {
            console.error("Error adding candidate:", error);
            res.status(500).json({ success: false, message: "Lỗi trùng lặp hoặc server" });
        }
    },
    // remove staff to plan
    updateCandidateStatus: async (req: Request, res: Response) => {
        try {
            const { staffId } = req.params;
            const {ly_do, so_quyet_dinh} = req.body;

            const query =`update chi_tiet_quy_hoach
                        set ly_do_ra_khoi_quy_hoach = $1,
                            so_qd_ra_khoi_quy_hoach =  $2,
                            ngay_qd_ra_khoi_quy_hoach = $3,
                            trang_thai = $4
                        where id = $5 returning *`;
            const result = await pool.query(query, [ly_do, so_quyet_dinh, new Date(), 0, staffId])
            res.status(200).json({ success: true, data: result.rows[0], message: "Đã đưa ra khỏi quy hoạch" });
        } catch (error) {
            
        }
    },  
    // add vote for others
    addVoteResult: async (req: Request, res: Response) => {
        try {
            const { chi_tiet_qh_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y } = req.body;
            const ket_qua = (so_phieu_dong_y / so_phieu_hop_le) > 0.5 ? 1 : 0;
            const query = `
                insert into ket_qua_quy_hoach (chi_tiet_qh_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua) 
                values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *`;
            const result = await pool.query(query, [chi_tiet_qh_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua]);
            return res.status(200).json({ success: true, data: result.rows }); 
        } catch (error) {
             console.error(error);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }

}

export default PlanningController