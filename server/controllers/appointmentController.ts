import { Request, Response } from "express";
import pool from "../config/db";

interface VoteItem {
    chi_tiet_bn_id: number;
    so_phieu_dong_y: number;
    so_phieu_khong_dong_y: number;
}

interface VoteInput {
    chi_tiet_dot_bo_nhiem_id: number;
    buoc_hoi_nghi: number;
    so_nguoi_trieu_tap: number;
    so_nguoi_co_mat: number;
    so_phieu_phat_ra: number;
    so_phieu_thu_ve: number;
    so_phieu_hop_le: number;
    ket_qua_ung_vien: VoteItem[];
}

const validateInput = (data: VoteInput) => {
    if (!data.chi_tiet_dot_bo_nhiem_id || !data.buoc_hoi_nghi)
        throw new Error("Thiếu thông tin bắt buộc");

    if (!data.ket_qua_ung_vien?.length)
        throw new Error("Danh sách ứng viên rỗng");

    if (data.so_nguoi_co_mat > data.so_nguoi_trieu_tap)
        throw new Error("Số người có mặt không thể lớn hơn số người triệu tập");

    // Bước 3, 4, 5 cần >= 2/3 và validate phiếu
    // Bước 2 chỉ cần số người, không cần phiếu
    if ([3, 4, 5].includes(data.buoc_hoi_nghi)) {
        const min = Math.ceil((2 / 3) * data.so_nguoi_trieu_tap);
        if (data.so_nguoi_co_mat < min)
            throw new Error(`Hội nghị cần ít nhất ${min} người tham dự (2/3 số triệu tập)`);

        if (data.so_phieu_phat_ra > data.so_nguoi_co_mat)
            throw new Error("Số phiếu phát ra không thể lớn hơn số người có mặt");
        if (data.so_phieu_thu_ve > data.so_phieu_phat_ra)
            throw new Error("Số phiếu thu về không thể lớn hơn số phiếu phát ra");
        if (data.so_phieu_hop_le > data.so_phieu_thu_ve)
            throw new Error("Số phiếu hợp lệ không thể lớn hơn số phiếu thu về");
    }
};

// Bước 2: Hội nghị lãnh đạo vòng 1
const handleStep2 = async (client: any, data: VoteInput) => {
    for (const uv of data.ket_qua_ung_vien) {
        await client.query(
            `INSERT INTO ket_qua_bo_nhiem
             (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
              so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
              so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
             VALUES ($1,$2,$3,$4,0,0,0,0,0,NULL)
             ON CONFLICT (chi_tiet_bn_id, buoc_hoi_nghi)
             DO UPDATE SET
                so_nguoi_trieu_tap = EXCLUDED.so_nguoi_trieu_tap,
                so_nguoi_co_mat    = EXCLUDED.so_nguoi_co_mat`,
            [uv.chi_tiet_bn_id, data.buoc_hoi_nghi,
             data.so_nguoi_trieu_tap, data.so_nguoi_co_mat]
        );
    }
    return { nextState: 3 };
};

// Bước 3: Hội nghị lãnh đạo vòng 2
const handleStep3 = async (client: any, data: VoteInput) => {
    const results: (VoteItem & { ti_le: number; ket_qua: number })[] = [];

    for (const uv of data.ket_qua_ung_vien) {
        if (uv.so_phieu_dong_y + uv.so_phieu_khong_dong_y !== data.so_phieu_hop_le)
            throw new Error(`Ứng viên ${uv.chi_tiet_bn_id}: tổng phiếu không khớp phiếu hợp lệ`);

        const ti_le = data.so_phieu_hop_le > 0 ? uv.so_phieu_dong_y / data.so_phieu_hop_le : 0;

        results.push({ ...uv, ti_le: Math.round(ti_le * 100), ket_qua: 0 });
    }

    const maxPhieu = Math.max(...results.map(r => r.so_phieu_dong_y));

    for (const r of results) {
        r.ket_qua = (r.so_phieu_dong_y === maxPhieu && r.ti_le > 50) ? 1 : 0;
    }

    for (const r of results) {
        await client.query(
            `INSERT INTO ket_qua_bo_nhiem
            (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
             so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
             so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [r.chi_tiet_bn_id, data.buoc_hoi_nghi, data.so_nguoi_trieu_tap,
             data.so_nguoi_co_mat, data.so_phieu_phat_ra, data.so_phieu_thu_ve,
             data.so_phieu_hop_le, r.so_phieu_dong_y, r.so_phieu_khong_dong_y, r.ket_qua]
        );
    }

    const qualified = results.filter(r => r.ket_qua === 1);
    if (qualified.length === 0) return { nextState: 0 };
    if (qualified.length > 1) return { nextState: 0 };

    return { nextState: 4 };
};

// Bước 4: Hội nghị cán bộ chủ chốt
const handleStep4 = async (client: any, data: VoteInput) => {
    for (const uv of data.ket_qua_ung_vien) {
        if (uv.so_phieu_dong_y + uv.so_phieu_khong_dong_y !== data.so_phieu_hop_le)
            throw new Error(`Ứng viên ${uv.chi_tiet_bn_id}: tổng phiếu không khớp phiếu hợp lệ`);

        await client.query(
            `INSERT INTO ket_qua_bo_nhiem
            (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
             so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
             so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NULL)`,
            [uv.chi_tiet_bn_id, data.buoc_hoi_nghi, data.so_nguoi_trieu_tap,
             data.so_nguoi_co_mat, data.so_phieu_phat_ra, data.so_phieu_thu_ve,
             data.so_phieu_hop_le, uv.so_phieu_dong_y, uv.so_phieu_khong_dong_y]
        );
    }
    return { nextState: 5 };
};

// Bước 5: Hội nghị lãnh đạo vòng cuối
const handleStep5 = async (client: any, data: VoteInput) => {
    const results: (VoteItem & { ti_le: number; ket_qua: number })[] = [];

    for (const uv of data.ket_qua_ung_vien) {
        if (uv.so_phieu_dong_y + uv.so_phieu_khong_dong_y !== data.so_phieu_hop_le)
            throw new Error(`Ứng viên ${uv.chi_tiet_bn_id}: tổng phiếu không khớp phiếu hợp lệ`);

        const ti_le = data.so_nguoi_trieu_tap > 0
            ? uv.so_phieu_dong_y / data.so_nguoi_trieu_tap
            : 0;

        results.push({ ...uv, ti_le: Math.round(ti_le * 100), ket_qua: ti_le > 0.5 ? 1 : 0 });
    }

    for (const r of results) {
        await client.query(
            `INSERT INTO ket_qua_bo_nhiem
            (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
             so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
             so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [r.chi_tiet_bn_id, data.buoc_hoi_nghi, data.so_nguoi_trieu_tap,
             data.so_nguoi_co_mat, data.so_phieu_phat_ra, data.so_phieu_thu_ve,
             data.so_phieu_hop_le, r.so_phieu_dong_y, r.so_phieu_khong_dong_y, r.ket_qua]
        );
    }

    const qualified = results.filter(r => r.ket_qua === 1);

    if (qualified.length === 0) return { nextState: 0 };

    if (qualified.length > 1) {
        const maxPhieu = Math.max(...qualified.map(r => r.so_phieu_dong_y));
        const hoa = qualified.filter(r => r.so_phieu_dong_y === maxPhieu);
        if (hoa.length > 1) return { nextState: 5 };
    }

    for (const r of results) {
        await client.query(
            `UPDATE chi_tiet_bo_nhiem SET trang_thai = $1 WHERE id = $2`,
            [r.ket_qua === 1 ? 3 : 2, r.chi_tiet_bn_id]
        );
    }

    return { nextState: 6 };
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// GET /appointments
export const getAll = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
                `SELECT 
                    dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.trang_thai,
                    dbn.ngay_bat_dau, dbn.ngay_ket_thuc,
                    COUNT(DISTINCT ctdbn.id) AS so_chuc_danh,
                    COUNT(DISTINCT ctbn.id) AS so_ung_vien
                FROM dot_bo_nhiem dbn
                LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.dot_bo_nhiem_id = dbn.id
                LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.chi_tiet_dot_bo_nhiem_id = ctdbn.id
                AND ctbn.trang_thai != 0
                GROUP BY dbn.id
                ORDER BY dbn.id DESC`
        );
        return res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

// GET /appointments/:id
export const getByID = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.trang_thai, dbn.ngay_bat_dau, dbn.ngay_ket_thuc,
                ctdbn.id AS chi_tiet_dot_id,
                pct.id AS phieu_chu_truong_id, pct.so_luong_de_xuat,
                cd.ten_chuc_danh,
                dv.ten_don_vi,
                COUNT(ctbn.id)  AS so_ung_vien,
                ctdbn.buoc_hien_tai 
            FROM dot_bo_nhiem dbn
            LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.dot_bo_nhiem_id = dbn.id
            LEFT JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
            LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
            LEFT JOIN don_vi dv ON dv.id = pct.don_vi_id
            LEFT JOIN chi_tiet_bo_nhiem ctbn
                ON ctbn.chi_tiet_dot_bo_nhiem_id = ctdbn.id
                AND ctbn.trang_thai != 0
            WHERE dbn.id = $1
            GROUP BY dbn.id, ctdbn.id, pct.id, cd.ten_chuc_danh, dv.ten_don_vi
        `, [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ success: false, message: "Không tìm thấy đợt bổ nhiệm" });
 
        const rows = result.rows;
        const batchInfo = {
            id: rows[0].id,
            ma_dot_bo_nhiem: rows[0].ma_dot_bo_nhiem,
            ten_dot_bo_nhiem: rows[0].ten_dot_bo_nhiem,
            trang_thai: rows[0].trang_thai,
            chuc_danh_list: rows
                .filter(r => r.chi_tiet_dot_id)
                .map(r => ({
                    chi_tiet_dot_id: r.chi_tiet_dot_id,
                    phieu_chu_truong_id: r.phieu_chu_truong_id,
                    ten_chuc_danh: r.ten_chuc_danh,
                    ten_don_vi: r.ten_don_vi,
                    so_luong_de_xuat: r.so_luong_de_xuat,
                    so_ung_vien: r.so_ung_vien,
                    buoc_hien_tai: r.buoc_hien_tai
                }))
        };

        return res.json({ success: true, data: batchInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

// GET /appointments/detail/:appointmentId/candidates
export const getCandidates = async (req: Request, res: Response) => {
    try {
        const { chiTietDotId } = req.params;
        console.log("getCandidates called, chiTietDotId:", chiTietDotId); 
        const detailQuery = `
            SELECT
                ctbn.id as chi_tiet_bn_id,
                vc.id as vien_chuc_id, vc.ma_vien_chuc, vc.ho_va_ten, vc.ngay_sinh, vc.gioi_tinh,
                vc.dan_toc, vc.ngach, vc.trinh_do_chuyen_mon, vc.trinh_do_ly_luan_CT, vc.trinh_do_ngoai_ngu, vc.trinh_do_tin_hoc, vc.ngay_chinh_thuc,
                dv.ten_don_vi,
                nk.ten_chuc_danh,
                CASE
                    WHEN ctbn.chi_tiet_qh_id IS NOT NULL THEN 'Nguồn tại chỗ'
                    ELSE 'Nguồn nơi khác'
                END as nguon_vien_chuc,
                ctbn.trang_thai
            FROM chi_tiet_bo_nhiem ctbn
            LEFT JOIN vien_chuc vc ON ctbn.vien_chuc_id = vc.id
            LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
            LEFT JOIN (
                SELECT nkcv.vien_chuc_id, cd.ten_chuc_danh
                FROM nhiem_ky_chuc_vu nkcv
                JOIN chuc_danh_quan_ly cd ON nkcv.chuc_danh_id = cd.id
                WHERE nkcv.trang_thai = 1
            ) nk ON vc.id = nk.vien_chuc_id
            WHERE ctbn.chi_tiet_dot_bo_nhiem_id = $1 AND ctbn.trang_thai != 0
            ORDER BY ctbn.id DESC
        `;
        
        const result = await pool.query(detailQuery, [chiTietDotId]);
        console.log(result.rows[0])
        return res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

// GET /appointments/:id/current-step
export const getCurrentStep = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT trang_thai FROM dot_bo_nhiem WHERE id = $1", [id]
        );
        if (result.rowCount === 0)
            return res.status(404).json({ success: false, message: "Không tìm thấy" });

        return res.json({
            success: true,
            data: { currentStep: Number(result.rows[0].trang_thai) }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};
// GET /appointments/planning-candidates?chuc_danh_id=1
export const getPlanningCandidates = async (req: Request, res: Response) => {
    try {
        const { chuc_danh_id } = req.query;
        if (!chuc_danh_id)
            return res.status(400).json({ success: false, message: "Thiếu chuc_danh_id" });

        const result = await pool.query(
            `SELECT vc.id, vc.ma_vien_chuc, vc.ho_va_ten,
                    dv.ten_don_vi, ctqh.id as chi_tiet_qh_id
             FROM chi_tiet_quy_hoach ctqh
             JOIN vien_chuc vc ON ctqh.vien_chuc_id = vc.id
             JOIN don_vi dv ON vc.don_vi_id = dv.id
             WHERE ctqh.chuc_danh_id = $1 AND ctqh.trang_thai = 1`,
            [chuc_danh_id]
        );
        return res.json({ success: true, data: result.rows });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};
// GET /appointments/:id/planning-source
export const getPlanningSrc = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT vc.id, vc.ma_vien_chuc, vc.ho_va_ten,
                    dv.ten_don_vi, dqh.ten_quy_hoach, ctqh.id as chi_tiet_qh_id
             FROM chi_tiet_quy_hoach ctqh
             LEFT JOIN vien_chuc vc ON ctqh.vien_chuc_id = vc.id
             LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
             LEFT JOIN dot_quy_hoach dqh ON ctqh.dot_quy_hoach_id = dqh.id
             WHERE ctqh.trang_thai = 1
             AND ctqh.chuc_danh_id = (
                 SELECT pct.chuc_danh_id FROM dot_bo_nhiem dbn
                 LEFT JOIN phieu_chu_truong pct ON dbn.phieu_chu_truong_id = pct.id
                 WHERE dbn.id = $1
             )
             AND vc.id NOT IN (
                 SELECT vien_chuc_id FROM chi_tiet_bo_nhiem
                 WHERE dot_bo_nhiem_id = $1 AND vien_chuc_id IS NOT NULL
             )`,
            [id]
        );
        return res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Không thể lấy danh sách nguồn quy hoạch" });
    }
};

// POST /appointments
export const createBatch = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc } = req.body;

        if (!ma_dot_bo_nhiem || !ten_dot_bo_nhiem) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin bắt buộc: mã đợt bổ nhiệm, tên đợt bổ nhiệm" 
            });
        }

        if (ma_dot_bo_nhiem.length > 6) {
            return res.status(400).json({
                success: false,
                message: "Mã đợt bổ nhiệm không được vượt quá 6 ký tự"
            });
        }

        await client.query('BEGIN');

        const duplicateCheck = await client.query(
            'SELECT id FROM dot_bo_nhiem WHERE ma_dot_bo_nhiem = $1',
            [ma_dot_bo_nhiem]
        );

        if (duplicateCheck.rowCount && duplicateCheck.rowCount > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "Mã đợt bổ nhiệm đã tồn tại!"
            });
        }

        const batchQuery = `
            INSERT INTO dot_bo_nhiem (ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, trang_thai)
            VALUES ($1, $2, $3, $4, 1)
            RETURNING *
        `;
        
        const batchResult = await client.query(batchQuery, [
            ma_dot_bo_nhiem,
            ten_dot_bo_nhiem,
            ngay_bat_dau || null,
            ngay_ket_thuc || null
        ]);

        const newBatchId = batchResult.rows[0].id;

        const detailQuery = `
            INSERT INTO chi_tiet_dot_bo_nhiem (dot_bo_nhiem_id, phieu_chu_truong_id, trang_thai)
            VALUES ($1, NULL, 1)
        `;
        
        await client.query(detailQuery, [newBatchId]);

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: "Tạo đợt bổ nhiệm thành công!",
            data: batchResult.rows[0]
        });

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error("Lỗi khi tạo đợt bổ nhiệm:", error);
        
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: "Mã đợt bổ nhiệm đã tồn tại!"
            });
        }
        
        if (error.code === '22001' || error.message?.includes('too long')) {
            return res.status(400).json({
                success: false,
                message: "Mã đợt bổ nhiệm không được vượt quá 6 ký tự!"
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        });
    } finally {
        client.release();
    }
};

// POST /appointments/:id/candidates
export const addCandidate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // chi_tiet_dot_bo_nhiem_id
        const { vien_chuc_id, ly_do_vao, chi_tiet_qh_id } = req.body;
        
        const result = await pool.query(
            `INSERT INTO chi_tiet_bo_nhiem
             (ly_do_vao, chi_tiet_dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id, trang_thai)
             VALUES ($1, $2, $3, $4, 1) RETURNING *`,
            [ly_do_vao, id, vien_chuc_id, chi_tiet_qh_id || null]
        );
        return res.status(201).json({ success: true, message: "Đã thêm ứng viên thành công", data: result.rows[0] });
    } catch (error: unknown) {
        const err = error as { code?: string };
        if (err.code === "23505")
            return res.status(400).json({ success: false, message: "Viên chức này đã tồn tại trong đợt bổ nhiệm!" });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi thêm ứng viên" });
    }
};

// DELETE /appointments/:chi_tiet_dot_bo_nhiem_id/candidates/:vien_chuc_id
export const removeCandidate = async (req: Request, res: Response) => {
    try {
        const { chi_tiet_dot_bo_nhiem_id, vien_chuc_id } = req.params;
        const result = await pool.query(
            `UPDATE chi_tiet_bo_nhiem SET trang_thai = 0
             WHERE chi_tiet_dot_bo_nhiem_id = $1 AND vien_chuc_id = $2 AND trang_thai = 1 RETURNING *`,
            [chi_tiet_dot_bo_nhiem_id, vien_chuc_id]
        );
        if (result.rowCount === 0)
            return res.status(404).json({ success: false, message: "Không tìm thấy ứng viên đang hoạt động" });
        return res.json({ success: true, message: "Đã loại ứng viên khỏi đợt bổ nhiệm", data: result.rows[0] });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

// POST /appointments/:id/start-voting
export const startVotingProcess = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        const batchCheck = await client.query(
            "SELECT id, trang_thai FROM dot_bo_nhiem WHERE id = $1", [id]
        );
        if (batchCheck.rowCount === 0)
            return res.status(404).json({ success: false, message: "Đợt bổ nhiệm không tồn tại" });

        const batch = batchCheck.rows[0];
        if (Number(batch.trang_thai) !== 1)
            return res.status(400).json({ success: false, message: "Đợt bổ nhiệm không ở trạng thái soạn thảo" });

        const candidateCount = await client.query(
            "SELECT COUNT(*) as count FROM chi_tiet_bo_nhiem WHERE chi_tiet_dot_bo_nhiem_id IN (SELECT id FROM chi_tiet_dot_bo_nhiem WHERE dot_bo_nhiem_id = $1) AND trang_thai = 1", [id]
        );
        const validCount = parseInt(candidateCount.rows[0].count);
        if (validCount === 0)
            return res.status(400).json({ success: false, message: "Cần ít nhất 1 ứng viên hợp lệ" });

        await client.query("UPDATE dot_bo_nhiem SET trang_thai = 2 WHERE id = $1", [id]);

        return res.json({
            success: true,
            message: "Bắt đầu quy trình! Chuyển sang Hội nghị lãnh đạo vòng 1",
            data: { trang_thai_moi: 2, so_ung_vien_hop_le: validCount }
        });
    } catch (error: unknown) {
        const err = error as Error;
        return res.status(500).json({ success: false, message: err.message });
    } finally {
        client.release();
    }
};

// POST /appointments/:id/vote-results
export const addVoteResult = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const data: VoteInput = req.body;
        console.log("Request body:", data);

        validateInput(data);

        await client.query("BEGIN");
        //Lấy chi tiêt đợt bổ nhiệm và bước hiện tại (lấy chức danh đang bầu)
        const batchDetail = await client.query(`SELECT dot_bo_nhiem_id, buoc_hien_tai FROM chi_tiet_dot_bo_nhiem WHERE id = $1 FOR UPDATE`, [data.chi_tiet_dot_bo_nhiem_id]);
        // console.log("batchDetail rows:", batchDetail.rows);

        const dot_bo_nhiem_id = batchDetail.rows[0].dot_bo_nhiem_id;
        // console.log("dot_bo_nhiem_id:", dot_bo_nhiem_id);

        const batchRow = await client.query(
            "SELECT trang_thai FROM dot_bo_nhiem WHERE id = $1 FOR UPDATE",
            [dot_bo_nhiem_id]
        );
        console.log("batchDetail rows:", batchDetail.rows);
        console.log("buoc_hien_tai raw:", batchDetail.rows[0]?.buoc_hien_tai);
        console.log("buocHienTai parsed:", Number(batchDetail.rows[0]?.buoc_hien_tai));
        console.log("data.buoc_hoi_nghi:", data.buoc_hoi_nghi, typeof data.buoc_hoi_nghi);

        // Bước của đợt bổ nhiệm chức danh
        const currentStep = Number(batchDetail.rows[0].buoc_hien_tai);

        if(currentStep !== data.buoc_hoi_nghi)
            throw new Error(`Bước hiện tại đang ở ${currentStep}`);

        let result;
        switch(data.buoc_hoi_nghi){
            case 2: result = await handleStep2(client, data); break;
            case 3: result = await handleStep3(client, data); break;
            case 4: result = await handleStep4(client, data); break;
            case 5: result = await handleStep5(client, data); break;
            default: throw new Error("Bước không hợp lệ");
        }
        // update chi tiết đợt bổ nhiệm đang chọn
        await client.query( `UPDATE chi_tiet_dot_bo_nhiem  SET buoc_hien_tai = $1 WHERE id = $2`,[result.nextState, data.chi_tiet_dot_bo_nhiem_id])

        // Kiểm tra đợt bổ nhiệm này hoàn thành chưa.
        const checkDoneQuery = `SELECT COUNT (*) as total, COUNT(*) FILTER (WHERE buoc_hien_tai = 6) AS done
                                FROM chi_tiet_dot_bo_nhiem 
                                WHERE dot_bo_nhiem_id = $1`;
        const allDone = await client.query(checkDoneQuery, [dot_bo_nhiem_id]);
        const checkAllPosition = Number(allDone.rows[0].total) === Number(allDone.rows[0].done)
        if(checkAllPosition){
            await client.query(`UPDATE dot_bo_nhiem SET trang_thai = 6 WHERE id = $1`, [dot_bo_nhiem_id]);
        }

        await client.query("COMMIT");
        return res.json({success: true});
    } catch (err: unknown) {
        await client.query("ROLLBACK");
        const error = err as Error;
        return res.status(400).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

export const createBatchWithCandidates = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { ma_dot_bo_nhiem, ten_dot_bo_nhiem, nguoi_lap,
                ngay_bat_dau, ngay_ket_thuc, chuc_danh_list } = req.body;

        await client.query("BEGIN");

        // Tạo đợt
        const batchRes = await client.query(
            `INSERT INTO dot_bo_nhiem 
             (ma_dot_bo_nhiem, ten_dot_bo_nhiem, nguoi_lap, ngay_bat_dau, ngay_ket_thuc, trang_thai)
             VALUES ($1,$2,$3,$4,$5,1) RETURNING id`,
            [ma_dot_bo_nhiem, ten_dot_bo_nhiem, nguoi_lap, ngay_bat_dau, ngay_ket_thuc]
        );
        const batchId = batchRes.rows[0].id;

        // Tạo chi_tiet_dot_bo_nhiem + ứng viên cho từng chức danh
        for (const cd of chuc_danh_list) {
            const detailRes = await client.query(
                `INSERT INTO chi_tiet_dot_bo_nhiem 
                 (dot_bo_nhiem_id, phieu_chu_truong_id, trang_thai, buoc_hien_tai)
                 VALUES ($1,$2,1,2) RETURNING id`,
                [batchId, cd.pct_id ?? null]
            );
            const chiTietId = detailRes.rows[0].id;

            for (const uv of cd.ung_vien) {
                await client.query(
                    `INSERT INTO chi_tiet_bo_nhiem 
                     (chi_tiet_dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id, trang_thai)
                     VALUES ($1,$2,$3,1)`,
                    [chiTietId, uv.vien_chuc_id, uv.chi_tiet_qh_id ?? null]
                );
            }
        }

        await client.query("COMMIT");
        return res.status(201).json({ success: true, message: "Tạo đợt bổ nhiệm thành công!" });

    } catch (error: any) {
        await client.query("ROLLBACK");
        if (error.code === "23505")
            return res.status(400).json({ success: false, message: "Mã đợt bổ nhiệm đã tồn tại!" });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    } finally {
        client.release();
    }
};
export default {
    getAll,
    getByID,
    getCurrentStep,
    getPlanningSrc,
    addCandidate,
    removeCandidate,
    createBatch,
    startVotingProcess,
    addVoteResult,
    getCandidates,
    getPlanningCandidates,
    createBatchWithCandidates
};
