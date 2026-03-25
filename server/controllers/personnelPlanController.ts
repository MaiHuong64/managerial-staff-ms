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
export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const masterResult = await pool.query(
            `SELECT * FROM phuong_an_nhan_su WHERE id = $1`,
            [id]
        );
        if (masterResult.rows.length === 0)
            return res.status(404).json({ success: false, message: "Không tìm thấy phương án" });

        const detailResult = await pool.query(
            `SELECT
                ctpa.id AS chi_tiet_pa_id, ctpa.loai_phuong_an, ctpa.ghi_chu, ctpa.trang_thai, ctpa.chi_tiet_bn_id,
                vc.ho_va_ten, vc.ma_vien_chuc,
                cd.ten_chuc_danh,
                dv.ten_don_vi
             FROM chi_tiet_phuong_an ctpa
             JOIN chi_tiet_bo_nhiem ctbn ON ctbn.id = ctpa.chi_tiet_bn_id
             JOIN vien_chuc vc ON vc.id = ctbn.vien_chuc_id
             JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
             JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
             JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
             JOIN don_vi dv ON dv.id = vc.don_vi_id
             WHERE ctpa.phuong_an_id = $1
             ORDER BY ctpa.id`,
            [id]
        );

        return res.status(200).json({
            success: true,
            data: {
                ...masterResult.rows[0],
                chi_tiet: detailResult.rows,
            },
        });
    } catch (error) {
        console.error("Lỗi getById PANS:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export const submitPANS = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { vai_tro } = (req as any).user;

        if (vai_tro !== 'PTCCT')
            return res.status(403).json({ success: false, message: "Chỉ PTCCT mới có quyền trình phương án" });

        const result = await pool.query(
            `UPDATE phuong_an_nhan_su SET trang_thai = 2 WHERE id = $1 AND trang_thai = 1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ success: false, message: "Không tìm thấy hoặc phương án không ở trạng thái soạn thảo" });

        return res.status(200).json({ success: true, message: "Đã trình BGH thành công", data: result.rows[0] });
    } catch (error) {
        console.error("Lỗi submitPANS:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export const approvePANS = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { trang_thai, y_kien_bgh } = req.body;
        // trang_thai: 3 = duyệt, 0 = từ chối/hủy

        const result = await pool.query(
            `UPDATE phuong_an_nhan_su
             SET trang_thai = $1,
                 y_kien_bgh = $2,
                 ngay_phe_duyet = $3
             WHERE id = $4 AND trang_thai = 2 RETURNING *`,
            [trang_thai, y_kien_bgh || null, new Date(), id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ success: false, message: "Không tìm thấy hoặc phương án chưa được trình duyệt" });

        return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Lỗi approvePANS:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

export default { getPassedCandidate, getAll, CreatePANS, getById, submitPANS, approvePANS };