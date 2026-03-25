import { Request, Response } from "express";
import pool from "../config/db";

export const getPassedCandidate = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT
                ctbn.id AS chi_tiet_bn_id,
                vc.ho_va_ten, 
                cd.ten_chuc_danh,
                dv.ten_don_vi
            FROM chi_tiet_bo_nhiem ctbn
            JOIN vien_chuc vc ON vc.id = ctbn.vien_chuc_id
            JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
            JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
            JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
            JOIN don_vi dv ON dv.id = vc.don_vi_id
            WHERE ctbn.trang_thai = 1
              AND ctbn.id NOT IN (
                  SELECT chi_tiet_bn_id FROM chi_tiet_phuong_an
              )
        `;
        const result = await pool.query(query);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Lỗi lấy danh sách nhân sự:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export const addPersonnelPlan = async (req: Request, res: Response) => {
    const client = await pool.connect();
    const { thong_tin_chung, chi_tiet } = req.body;
    try {
        await client.query("BEGIN");

        const insertMasterInfo = `
            INSERT INTO phuong_an_nhan_su
                (ma_phuong_an, so_to_trinh, ngay_to_trinh, ngay_lap, ghi_chu, trang_thai)
            VALUES ($1, $2, $3, $4, $5, 1)
            RETURNING *
        `;
        const masterValues = [
            thong_tin_chung.ma_phuong_an,
            thong_tin_chung.so_to_trinh,
            thong_tin_chung.ngay_to_trinh,
            thong_tin_chung.ngay_lap || new Date(),
            thong_tin_chung.ghi_chu || null,
        ];
        const masterResult = await client.query(insertMasterInfo, masterValues);
        const planningId = masterResult.rows[0].id;

        const insertDetailQuery = `
            INSERT INTO chi_tiet_phuong_an
                (phuong_an_id, chi_tiet_bn_id, loai_phuong_an, ghi_chu, trang_thai)
            VALUES ($1, $2, $3, $4, 1)
        `;
        for (const item of chi_tiet) {
            await client.query(insertDetailQuery, [
                planningId,
                item.chi_tiet_bn_id,
                item.loai_phuong_an,
                item.ghi_chu || null,
            ]);
        }

        await client.query("COMMIT");
        return res.status(201).json({
            success: true,
            message: "Lập phương án nhân sự thành công!",
            data: masterResult.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Lỗi khi lập phương án:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    } finally {
        client.release();
    }
};

export const getAll = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM phuong_an_nhan_su`);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Lỗi lấy danh sách phương án:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export default { getPassedCandidate, addPersonnelPlan, getAll };