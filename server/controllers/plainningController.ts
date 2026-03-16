import {Request, Response } from "express";
import pool from "../config/db";

const PlanningController = {

    // get all
    getAll: async (req: Request, res: Response) => {
        try {
            const query = `select d.*, count(c.vien_chuc_id)
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
            const query = `select d.ma_quy_hoach, d.loai_quy_hoach, d.nam_thuc_hien, d.so_qd_phe_duyet, d.ngay_qd_phe_duyet, vc.ho_va_ten, dv.ten_don_vi, ct.ngay_vao_qh, ct.ngay_ra_qh, ct.so_qd_ra_khoi_quy_hoach, ct.ngay_qd_ra_khoi_quy_hoach, ct.ly_do_ra_khoi_quy_hoach
                            from dot_quy_hoach d left join chi_tiet_quy_hoach ct on d.id = ct.dot_quy_hoach_id
                                left join vien_chuc vc on ct.vien_chuc_id = vc.id
                                left join don_vi dv on vc.don_vi_id = dv.id
                            where d.id = $1`;
            const result = await pool.query(query, [id]);
            res.status(200).json({ success: true, data: result.rows });
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

    filterStaff: async (req: Request, res: Response) => {
        try {
            const {trinh_do_chuyen_mon, don_vi_id, dot_quy_hoach_id} = req.body;
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
            const query = `insert into chi_tiet_quy_hoach (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id, ngay_vao_quy_hoach, trang_thai) values
                            ($1, $2, $3, NOW(), 1) returning *`
            const result = await pool.query(query, [dot_quy_hoach_id, vien_chuc_id, chuc_danh_id])
            res.status(201).json({ success: true, data: result.rows[0], message: "Đã thêm vào quy hoạch" });
        } catch (error) {
            console.error("Error adding candidate:", error);
            res.status(500).json({ success: false, message: "Lỗi trùng lặp hoặc server" });
        }
    },
    // remove staff to plan
    removeCandidate: async (req: Request, res: Response) => {
        try {
            const {id}  = req.params;
            const {ly_do, so_quyet_dinh} = req. body;

            const query =`update chi_tiet_quy_hoach 
                        set ly_do_ra_khoi_quy_hoach = $1,
                            so_qd_ra_khoi_quy_hoach =  $2,
                            ngay_qd_ra_khoi_quy_hoach = $3,
                            trang_thai = $4
                        where id = $5 returning *`;
            const result = await pool.query(query, [ly_do, so_quyet_dinh, new Date(),0, id])
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