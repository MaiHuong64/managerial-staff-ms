import { Request, Response } from "express";
import pool from "../config/db";

export const createPersonnelPlan = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const dot_bo_nhiem_id = req.params.id;
        const {ten_phuong_an, so_to_trinh, ngay_to_trinh, ghi_chu, danh_sach_ung_vien } = req.body;

        if (!ten_phuong_an || !so_to_trinh || !danh_sach_ung_vien?.length)
        return res.status(400).json({
            success: false,
            message: "Thiếu tên phương án, số tờ trình hoặc danh sách ứng viên"
        });

        await client.query("BEGIN");

        // Kiểm tra đợt tồn tại và đã hoàn thành
        const batchCheck = await client.query(
            "SELECT id, trang_thai FROM dot_bo_nhiem WHERE id = $1",
            [dot_bo_nhiem_id]
        );

        if (batchCheck.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, message: "Đợt bổ nhiệm không tồn tại" });
        }

        if (Number(batchCheck.rows[0].trang_thai) !== 6) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "Đợt bổ nhiệm chưa hoàn thành quy trình bỏ phiếu"
            });
        }

        // Kiểm tra ứng viên hợp lệ (trang_thai=3, thuộc đợt này)
        for (const uv of danh_sach_ung_vien) {
            if (!uv.loai_phuong_an)
                return res.status(400).json({
                    success: false,
                    message: `Thiếu loại phương án cho ứng viên ${uv.chi_tiet_bn_id}`
                });

            const check = await client.query(
                `SELECT id FROM chi_tiet_bo_nhiem 
                 WHERE id = $1 AND dot_bo_nhiem_id = $2 AND trang_thai = 3`,
                [uv.chi_tiet_bn_id, dot_bo_nhiem_id]
            );

            if (check.rowCount === 0) {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    success: false,
                    message: `Ứng viên ${uv.chi_tiet_bn_id} không đạt yêu cầu để lập phương án (trạng thái phải là 3 - Đạt)`
                });
            }
        }

        // Tạo mã PA tự động
        const idResult = await client.query("SELECT MAX(id) FROM phuong_an_nhan_su");
        const maxid = idResult.rows[0].max || 0;
        const ma_phuong_an = "PA" + (Number(maxid) + 1).toString().padStart(3, "0");


        const result = await client.query(`INSERT INTO phuong_an_nhan_su 
             (ma_phuong_an, ten_phuong_an, so_to_trinh, ngay_to_trinh, ngay_lap, ghi_chu, trang_thai, dot_bo_nhiem_id)
             VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 1, $6) RETURNING *`,
            [ma_phuong_an, ten_phuong_an, so_to_trinh, ngay_to_trinh, ghi_chu || "", dot_bo_nhiem_id]
        );

        const phuong_an_id = result.rows[0].id;

        // Insert chi tiết
        for (const uv of danh_sach_ung_vien) {
            await client.query(
                `INSERT INTO chi_tiet_phuong_an
                 (loai_phuong_an, ghi_chu, trang_thai, phuong_an_id, chi_tiet_bn_id)
                 VALUES ($1, $2, 1, $3, $4)`,
                [uv.loai_phuong_an, uv.ghi_chu || "", phuong_an_id, uv.chi_tiet_bn_id]
            );
        }

        await client.query("COMMIT");
        return res.status(201).json({
            success: true,
            message: "Lập phương án nhân sự thành công!",
            data: { phuong_an_id, ma_phuong_an }
        });

    } catch (error: unknown) {
        await client.query("ROLLBACK");
        const err = error as Error;
        return res.status(500).json({ success: false, message: err.message });
    } finally {
        client.release();
    }
};

export const getPersonnelPlans = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT pa.id, pa.ma_phuong_an, pa.ten_phuong_an,
                    pa.ngay_lap, pa.ghi_chu, pa.trang_thai,
                    COUNT(ctpa.id) as so_luong_ung_vien
             FROM phuong_an_nhan_su pa
             LEFT JOIN chi_tiet_phuong_an ctpa ON pa.id = ctpa.phuong_an_id
             WHERE pa.dot_bo_nhiem_id = $1
             GROUP BY pa.id
             ORDER BY pa.ngay_lap DESC`,
            [id]
        );
        return res.json({ success: true, data: result.rows });
    } catch (error: unknown) {
        const err = error as Error;
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getPersonnelPlanDetail = async (req: Request, res: Response) => {
    try {
        const { id, planId } = req.params;

        const planResult = await pool.query(
            `SELECT id, ma_phuong_an, ten_phuong_an, ngay_lap, ghi_chu, trang_thai
             FROM phuong_an_nhan_su WHERE id = $1 AND dot_bo_nhiem_id = $2`,
            [planId, id]
        );

        if (planResult.rowCount === 0)
            return res.status(404).json({ success: false, message: "Không tìm thấy phương án" });

        const detailResult = await pool.query(
            `SELECT ctpa.id, ctpa.loai_phuong_an, ctpa.ghi_chu, ctpa.trang_thai,
                    vc.ma_vien_chuc, vc.ho_va_ten,
                    dv.ten_don_vi,
                    cd.ten_chuc_danh as chuc_danh_bo_nhiem,
                    nk.ten_chuc_danh as chuc_danh_hien_tai
             FROM chi_tiet_phuong_an ctpa
             JOIN chi_tiet_bo_nhiem ctbn ON ctpa.chi_tiet_bn_id = ctbn.id
             JOIN dot_bo_nhiem dbn ON ctbn.dot_bo_nhiem_id = dbn.id
             JOIN phieu_chu_truong pct ON dbn.phieu_chu_truong_id = pct.id
             JOIN chuc_danh_quan_ly cd ON pct.chuc_danh_id = cd.id
             JOIN vien_chuc vc ON ctbn.vien_chuc_id = vc.id
             LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
             LEFT JOIN (
                 SELECT nkcv.vien_chuc_id, cdql.ten_chuc_danh
                 FROM nhiem_ky_chuc_vu nkcv
                 JOIN chuc_danh_quan_ly cdql ON nkcv.chuc_danh_id = cdql.id
                 WHERE nkcv.trang_thai = 1
             ) nk ON vc.id = nk.vien_chuc_id
             WHERE ctpa.phuong_an_id = $1
             ORDER BY ctpa.loai_phuong_an, vc.ho_va_ten`,
            [planId]
        );

        return res.json({
            success: true,
            data: {
                thongTinPA: planResult.rows[0],
                danhSachUngVien: detailResult.rows
            }
        });

    } catch (error: unknown) {
        const err = error as Error;
        return res.status(500).json({ success: false, message: err.message });
    }
};