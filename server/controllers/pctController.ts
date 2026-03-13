import {Request, Response } from "express";
import pool from "../config/db";

const pctController = {
    getAllPTC: async (req: Request, res: Response) => { 
        const {vai_tro, don_vi_id} = (req as any).user;
        console.log( "Vai tro: ", vai_tro, don_vi_id);
        let query =`SELECT ptc.*, dv.ten_don_vi, cd.ten_chuc_danh
                    FROM phieu_chu_truong ptc 
                    LEFT JOIN don_vi dv ON ptc.don_vi_id = dv.id
                    LEFT JOIN chuc_danh_quan_ly cd ON cd.id = ptc.chuc_danh_id
                    LEFT JOIN dot_quy_hoach dqt ON dqt.id = ptc.dot_quy_hoach_id`;
        
        let result;
        try {
            if(vai_tro === 'VCQL'){
            query += ` where ptc.don_vi_id = $1`;
            result = await pool.query(query, [don_vi_id]);
        }
        else{
            result = await pool.query(query);
        }
        res.status(200).json(result.rows);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal server error")
        }
    },
    createPTC: async (req: Request, res: Response) => {
        try {
            const {vai_tro, don_vi_id} = (req as any).user;
            const uid = (req as any).user.id;
            const {so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat, so_luong_de_xuat,
                    nguon_nhan_su, dot_quy_hoach_id, chuc_danh_id} = req.body;
            
            if(vai_tro !== 'VCQL')
                return res.status(403).json({ success: false, message: "Không có quyền tạo phiếu" });
    
            const query = ` INSERT INTO phieu_chu_truong (so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat,
                            so_luong_de_xuat, nguon_nhan_su, dot_quy_hoach_id,
                            chuc_danh_id, don_vi_id, nguoi_lap_id, trang_thai) 
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
            const result = await pool.query(query, [so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat, so_luong_de_xuat,nguon_nhan_su, dot_quy_hoach_id, chuc_danh_id, don_vi_id, uid, 0]);
            
            if (result.rows[0])
                return res.status(201).json(result.rows[0]);
            else
                return res.status(400).json({ message: "Tạo phiếu thất bại" });
        } catch (error) {
            console.error("createPTC error:", error);
            return res.status(500).send("Internal server error");
        }
    },
    approvePTC: async (req: Request, res: Response) => {
        try {
            const {uid, vai_tro} = (req as any).user;
            const {id} = req.params;
            const {trang_thai, ly_do} = req.body;
            const pct = await pool.query(`select * from phieu_chu_truong where id = $1`, [id]);

            // console.log("ket qua: ", pct);
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