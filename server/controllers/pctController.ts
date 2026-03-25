import {Request, Response } from "express";
import pool from "../config/db";

const pctController = {
    getAllPTC: async (req: Request, res: Response) => {
        const { vai_tro, don_vi_id } = (req as any).user;
        console.log("Vai tro: ", vai_tro, "Don vi ID: ", don_vi_id);
        
        let query = `
            SELECT ptc.*, dv.ten_don_vi, cd.ten_chuc_danh
            FROM phieu_chu_truong ptc 
            LEFT JOIN don_vi dv ON ptc.don_vi_id = dv.id
            LEFT JOIN chuc_danh_quan_ly cd ON cd.id = ptc.chuc_danh_id
            LEFT JOIN dot_quy_hoach dqt ON dqt.id = ptc.dot_quy_hoach_id`;
        
        const queryParams: any[] = [];
        
        try {
            if (vai_tro === 'VCQL') {
                query += ` WHERE ptc.don_vi_id = $1`;
                queryParams.push(don_vi_id);
            }
            query += ` ORDER BY ptc.id DESC`;

            const result = await pool.query(query, queryParams);
            
            return res.status(200).json({ success: true, data: result.rows });
        } catch (error) {
            console.error("Lỗi getAllPTC: ", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    createPTC: async (req: Request, res: Response) => {
        try {
            const {vai_tro, don_vi_id} = (req as any).user;
            const nguoi_lap = (req as any).user.ho_va_ten;
            const {so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat, so_luong_de_xuat,
                    nguon_nhan_su, dot_quy_hoach_id, chuc_danh_id} = req.body;
            
            if(vai_tro !== 'VCQL')
                return res.status(403).json({ success: false, message: "Không có quyền tạo phiếu" });
    
            const seqResult = await pool.query(`SELECT COALESCE(MAX(id), 0) as max FROM phieu_chu_truong`);
            const ma_phieu = 'PCT' + (Number(seqResult.rows[0].max) + 1).toString().padStart(3, '0');

            const query = `INSERT INTO phieu_chu_truong (ma_phieu, so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat,
                                so_luong_de_xuat, nguon_nhan_su, dot_quy_hoach_id,
                            chuc_danh_id, don_vi_id, nguoi_lap, trang_thai) 
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
            const result = await pool.query(query, [ma_phieu, so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat, so_luong_de_xuat, nguon_nhan_su, dot_quy_hoach_id ?? null, chuc_danh_id, don_vi_id, nguoi_lap, 0]);
            
            if (result.rows[0])
                return res.status(201).json(result.rows[0]);
            else
                return res.status(400).json({ message: "Tạo phiếu thất bại" });
        } catch (error) {
            console.error("createPTC error:", error);
            return res.status(500).send("Internal server error");
        }
    },
    getDotQuyHoach: async (req: Request, res: Response) => {
        try {
            const result = await pool.query(
                `SELECT id, ten_quy_hoach FROM dot_quy_hoach ORDER BY id DESC`
            );
            return res.status(200).json({ success: true, data: result.rows });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    approvePTC: async (req: Request, res: Response) => {
        try {
            const {uid, vai_tro} = (req as any).user;
            const {id} = req.params;
            const {trang_thai, ly_do} = req.body;
            const pct = await pool.query(`select * from phieu_chu_truong where id = $1`, [id]);

            console.log("ket qua: ", pct);
            if (pct.rows.length === 0)  return res.status(404).json({ message: 'Không tìm thấy phiếu' });

            if (vai_tro === "BGH"){
                const query = `update phieu_chu_truong
                                set trang_thai = $1,
                                    ly_do_de_xuat = $2,
                                    ngay_phe_duyet = $3
                                    where id = $4 RETURNING *`
                const result = await pool.query(query, [trang_thai, ly_do, new Date(), id]);

                console.log("rows:", result.rows); 
                console.log("rowCount:", result.rowCount);

                return res.status(200).json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }
}
export default pctController