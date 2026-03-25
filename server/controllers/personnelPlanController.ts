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
            WHERE ctbn.trang_thai = 3
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

export const getAll = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT pa.*, COUNT(ct.id)::int AS so_nhan_su
                                        FROM phuong_an_nhan_su pa
                                        LEFT JOIN chi_tiet_phuong_an ct ON pa.id = ct.phuong_an_id
                                        GROUP BY pa.id
                                        ORDER BY pa.id DESC`);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Lỗi lấy danh sách phương án:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};
export const CreatePANS = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Bước 1: Tự sinh mã phương án
        const seqResult = await client.query(`SELECT COALESCE(MAX(id), 0) as max FROM phuong_an_nhan_su`);
        const nextId = Number(seqResult.rows[0].max) + 1;
        const ma_phuong_an = "PA" + nextId.toString().padStart(3, '0');

        // Bước 2: Insert bản ghi master vào phuong_an_nhan_su
        const { so_to_trinh, ngay_to_trinh, ngay_lap, ghi_chu, chi_tiet } = req.body;
        const queryPA = `
            INSERT INTO phuong_an_nhan_su (ma_phuong_an, so_to_trinh, ngay_to_trinh, ngay_lap, ghi_chu, trang_thai)
            VALUES ($1, $2, $3, $4, $5, 1) RETURNING *
        `;
        const resultPA = await client.query(queryPA, [ma_phuong_an, so_to_trinh, ngay_to_trinh, ngay_lap || new Date(), ghi_chu || null]);
        const phuong_an_id = resultPA.rows[0].id;

        const queryDetail = `INSERT INTO chi_tiet_phuong_an (phuong_an_id, chi_tiet_bn_id, loai_phuong_an, ghi_chu, trang_thai) VALUES ($1, $2, $3, $4, 1)`;
        for (const item of chi_tiet){
            await client.query(queryDetail, [
              phuong_an_id,
              item.chi_tiet_bn_id,
              item.loai_phuong_an,
              item.ghi_chu
            ])
        }

        await client.query('COMMIT');
        return res.status(201).json({
            success: true,
            message: "Lập phương án nhân sự thành công!",
            data: resultPA.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Lỗi CreatePANS:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    } finally {
        client.release();
    }
}
export default { getPassedCandidate, getAll, CreatePANS };