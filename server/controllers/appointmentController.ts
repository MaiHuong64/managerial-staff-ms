import { Request, Response } from "express";
import pool from "../config/db";

interface VoteItem {
    chi_tiet_bn_id: number;
    so_phieu_dong_y: number;
    so_phieu_khong_dong_y: number;
}

interface VoteInput {
    dot_bo_nhiem_id: number;
    buoc_hoi_nghi: number;
    so_nguoi_trieu_tap: number;
    so_nguoi_co_mat: number;
    so_phieu_phat_ra: number;
    so_phieu_thu_ve: number;
    so_phieu_hop_le: number;
    ket_qua_ung_vien: VoteItem[];
}
const validateInput = (data: VoteInput) => {
    if (!data.dot_bo_nhiem_id || !data.buoc_hoi_nghi)
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

// ─── Step Handlers ────────────────────────────────────────────────────────────

// Bước 2: Hội nghị lãnh đạo vòng 1
// KHÔNG có phiếu - chỉ thảo luận, ghi biên bản
// → chuyển sang bước 3
const handleStep2 = async (client: any, data: VoteInput) => {
    for (const uv of data.ket_qua_ung_vien) {
        await client.query(
            `INSERT INTO ket_qua_bo_nhiem
            (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
             so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
             so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
            VALUES ($1, $2, $3, $4, 0, 0, 0, 0, 0, NULL)`,
            [uv.chi_tiet_bn_id, data.buoc_hoi_nghi,
             data.so_nguoi_trieu_tap, data.so_nguoi_co_mat]
        );
    }
    return { nextState: 3 };
};

// Bước 3: Hội nghị lãnh đạo vòng 2
// CÓ phiếu kín - tính trên phiếu hợp lệ
// Người đạt: phiếu CAO NHẤT và > 50% phiếu hợp lệ
// Hòa (2 người cùng cao nhất, cùng > 50%) → dừng
// Không ai > 50% → dừng
const handleStep3 = async (client: any, data: VoteInput) => {
    const results: (VoteItem & { ti_le: number; ket_qua: number })[] = [];

    for (const uv of data.ket_qua_ung_vien) {
        if (uv.so_phieu_dong_y + uv.so_phieu_khong_dong_y !== data.so_phieu_hop_le)
            throw new Error(`Ứng viên ${uv.chi_tiet_bn_id}: tổng phiếu không khớp phiếu hợp lệ`);

        const ti_le = data.so_phieu_hop_le > 0
            ? uv.so_phieu_dong_y / data.so_phieu_hop_le
            : 0;

        results.push({ ...uv, ti_le: Math.round(ti_le * 100), ket_qua: 0 });
    }

    // Tìm phiếu cao nhất
    const maxPhieu = Math.max(...results.map(r => r.so_phieu_dong_y));

    // Đạt: phiếu cao nhất VÀ > 50% phiếu hợp lệ
    for (const r of results) {
        r.ket_qua = (r.so_phieu_dong_y === maxPhieu && r.ti_le > 50) ? 1 : 0;
    }

    // Lưu kết quả
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
    if (qualified.length === 0) return { nextState: 0 }; // Không ai đạt → dừng
    if (qualified.length > 1)   return { nextState: 0 }; // Hòa → dừng

    return { nextState: 4 };
};

// Bước 4: Hội nghị cán bộ chủ chốt
// CÓ phiếu - chỉ lấy ý kiến tín nhiệm
// KHÔNG tính đạt/không đạt, KHÔNG công bố kết quả
// ket_qua = NULL
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
// CÓ phiếu - tính trên tổng số TRIỆU TẬP (không phải phiếu hợp lệ)
// Đạt: > 50% tổng triệu tập
// Hòa (>= 2 người cùng > 50% và bằng phiếu) → giữ bước 5 chờ xử lý thủ công
// Không ai đạt → dừng
const handleStep5 = async (client: any, data: VoteInput) => {
    const results: (VoteItem & { ti_le: number; ket_qua: number })[] = [];

    for (const uv of data.ket_qua_ung_vien) {
        if (uv.so_phieu_dong_y + uv.so_phieu_khong_dong_y !== data.so_phieu_hop_le)
            throw new Error(`Ứng viên ${uv.chi_tiet_bn_id}: tổng phiếu không khớp phiếu hợp lệ`);

        // Bước 5 tính trên tổng TRIỆU TẬP
        const ti_le = data.so_nguoi_trieu_tap > 0
            ? uv.so_phieu_dong_y / data.so_nguoi_trieu_tap
            : 0;

        results.push({ ...uv, ti_le: Math.round(ti_le * 100), ket_qua: ti_le > 0.5 ? 1 : 0 });
    }

    // Lưu kết quả
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

    // Không ai đạt → dừng
    if (qualified.length === 0) return { nextState: 0 };

    // Hòa phiếu: >= 2 người cùng > 50% và bằng phiếu
    // → giữ bước 5, người đứng đầu quyết định thủ công
    if (qualified.length > 1) {
        const maxPhieu = Math.max(...qualified.map(r => r.so_phieu_dong_y));
        const hoa = qualified.filter(r => r.so_phieu_dong_y === maxPhieu);
        if (hoa.length > 1) return { nextState: 5 };
    }

    // Cập nhật trang_thai ứng viên
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
            `SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.trang_thai,
                    pct.so_luong_de_xuat, cd.ten_chuc_danh, dv.ten_don_vi,
                    COUNT(ctbn.id) as so_luong_thuc_te
             FROM dot_bo_nhiem dbn
             LEFT JOIN phieu_chu_truong pct ON dbn.phieu_chu_truong_id = pct.id
             LEFT JOIN chuc_danh_quan_ly cd ON pct.chuc_danh_id = cd.id
             LEFT JOIN don_vi dv ON pct.don_vi_id = dv.id
             LEFT JOIN chi_tiet_bo_nhiem ctbn ON dbn.id = ctbn.dot_bo_nhiem_id
             GROUP BY dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.trang_thai,
                      pct.so_luong_de_xuat, cd.ten_chuc_danh, dv.ten_don_vi
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

        const batchQuery = `
            SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.trang_thai,
                   pct.so_luong_de_xuat, cd.ten_chuc_danh, dv.ten_don_vi
            FROM dot_bo_nhiem dbn
            LEFT JOIN phieu_chu_truong pct ON dbn.phieu_chu_truong_id = pct.id
            LEFT JOIN chuc_danh_quan_ly cd ON pct.chuc_danh_id = cd.id
            LEFT JOIN don_vi dv ON pct.don_vi_id = dv.id
            WHERE dbn.id = $1`;

        const detailQuery = `
            SELECT
                ctbn.id as chi_tiet_bn_id,
                vc.id as vien_chuc_id,
                vc.ma_vien_chuc,
                vc.ho_va_ten,
                vc.ngay_sinh,
                vc.gioi_tinh,
                vc.dan_toc,
                vc.ngach,
                vc.trinh_do_chuyen_mon,
                vc.trinh_do_ly_luan_CT,
                vc.trinh_do_ngoai_ngu,
                vc.trinh_do_tin_hoc,
                vc.ngay_chinh_thuc,
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
            WHERE ctbn.dot_bo_nhiem_id = $1`;

        const [batchInfo, candidates] = await Promise.all([
            pool.query(batchQuery, [id]),
            pool.query(detailQuery, [id]),
        ]);

        if (batchInfo.rows.length === 0)
            return res.status(404).json({ success: false, message: "Không tìm thấy đợt bổ nhiệm" });

        return res.json({
            success: true,
            data: { batchInfo: batchInfo.rows[0], candidates: candidates.rows }
        });
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
        const { ma_dot_bo_nhiem, ten_dot_bo_nhiem, phieu_chu_truong_id, ngay_bat_dau, ngay_ket_thuc } = req.body;

        if (!ma_dot_bo_nhiem || !ten_dot_bo_nhiem)
            return res.status(400).json({ success: false, message: "Thiếu mã hoặc tên đợt bổ nhiệm" });

        await client.query("BEGIN");

        // Kiểm tra phiếu chủ trương nếu có
        if (phieu_chu_truong_id) {
            const petitionCheck = await client.query(
                "SELECT id FROM phieu_chu_truong WHERE id = $1 AND trang_thai = 1",
                [phieu_chu_truong_id]
            );
            if (petitionCheck.rowCount === 0) {
                await client.query("ROLLBACK");
                return res.status(400).json({ success: false, message: "Phiếu chủ trương không hợp lệ" });
            }

            const usedCheck = await client.query(
                "SELECT id FROM dot_bo_nhiem WHERE phieu_chu_truong_id = $1",
                [phieu_chu_truong_id]
            );
            if (usedCheck.rowCount && usedCheck.rowCount > 0) {
                await client.query("ROLLBACK");
                return res.status(400).json({ success: false, message: "Phiếu chủ trương đã được sử dụng" });
            }
        }

        const result = await client.query(
            `INSERT INTO dot_bo_nhiem
             (ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, trang_thai, phieu_chu_truong_id)
             VALUES ($1, $2, $3, $4, 1, $5) RETURNING *`,
            [ma_dot_bo_nhiem, ten_dot_bo_nhiem,
             ngay_bat_dau || null, ngay_ket_thuc || null,
             phieu_chu_truong_id || null]
        );

        await client.query("COMMIT");
        return res.status(201).json({ success: true, message: "Tạo đợt bổ nhiệm thành công!", data: result.rows[0] });

    } catch (error: unknown) {
        await client.query("ROLLBACK");
        const err = error as { code?: string; message?: string };
        if (err.code === "23505")
            return res.status(400).json({ success: false, message: "Mã đợt bổ nhiệm đã tồn tại!" });
        return res.status(500).json({ success: false, message: err.message || "Lỗi máy chủ" });
    } finally {
        client.release();
    }
};

// POST /appointments/:id/candidates
export const addCandidate = async (req: Request, res: Response) => {
    try {
        const { vien_chuc_id, dot_bo_nhiem_id, ly_do_vao, chi_tiet_qh_id } = req.body;
        const result = await pool.query(
            `INSERT INTO chi_tiet_bo_nhiem
             (ly_do_vao, dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id, trang_thai)
             VALUES ($1, $2, $3, $4, 1) RETURNING *`,
            [ly_do_vao, dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id || null]
        );
        return res.status(201).json({ success: true, message: "Đã thêm ứng viên thành công", data: result.rows[0] });
    } catch (error: unknown) {
        const err = error as { code?: string };
        if (err.code === "23505")
            return res.status(400).json({ success: false, message: "Viên chức này đã tồn tại trong đợt bổ nhiệm!" });
        return res.status(500).json({ success: false, message: "Lỗi máy chủ khi thêm ứng viên" });
    }
};

// DELETE /appointments/:dot_bo_nhiem_id/candidates/:vien_chuc_id
export const removeCandidate = async (req: Request, res: Response) => {
    try {
        const { dot_bo_nhiem_id, vien_chuc_id } = req.params;
        const result = await pool.query(
            `UPDATE chi_tiet_bo_nhiem SET trang_thai = 0
             WHERE dot_bo_nhiem_id = $1 AND vien_chuc_id = $2 AND trang_thai = 1 RETURNING *`,
            [dot_bo_nhiem_id, vien_chuc_id]
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
            "SELECT id, trang_thai, phieu_chu_truong_id FROM dot_bo_nhiem WHERE id = $1", [id]
        );
        if (batchCheck.rowCount === 0)
            return res.status(404).json({ success: false, message: "Đợt bổ nhiệm không tồn tại" });

        const batch = batchCheck.rows[0];
        if (Number(batch.trang_thai) !== 1)
            return res.status(400).json({ success: false, message: "Đợt bổ nhiệm không ở trạng thái soạn thảo" });

        const candidateCount = await client.query(
            "SELECT COUNT(*) as count FROM chi_tiet_bo_nhiem WHERE dot_bo_nhiem_id = $1 AND trang_thai = 1", [id]
        );
        const validCount = parseInt(candidateCount.rows[0].count);
        if (validCount === 0)
            return res.status(400).json({ success: false, message: "Cần ít nhất 1 ứng viên hợp lệ" });

        // Kiểm tra đủ số lượng đề xuất nếu có phiếu chủ trương
        if (batch.phieu_chu_truong_id) {
            const petition = await client.query(
                "SELECT so_luong_de_xuat FROM phieu_chu_truong WHERE id = $1",
                [batch.phieu_chu_truong_id]
            );
            const required = petition.rows[0]?.so_luong_de_xuat || 1;
            if (validCount < required)
                return res.status(400).json({
                    success: false,
                    message: `Cần ít nhất ${required} ứng viên (hiện có: ${validCount})`
                });
        }

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

        validateInput(data);

        await client.query("BEGIN");

        const batch = await client.query(
            "SELECT trang_thai FROM dot_bo_nhiem WHERE id = $1 FOR UPDATE",
            [data.dot_bo_nhiem_id]
        );
        if (batch.rowCount === 0) throw new Error("Đợt không tồn tại");

        const currentState = Number(batch.rows[0].trang_thai);
        if (currentState !== data.buoc_hoi_nghi)
            throw new Error(`Sai bước hội nghị. Hiện tại đang ở bước ${currentState}`);

        let result;
        switch (data.buoc_hoi_nghi) {
            case 2: result = await handleStep2(client, data); break;
            case 3: result = await handleStep3(client, data); break;
            case 4: result = await handleStep4(client, data); break;
            case 5: result = await handleStep5(client, data); break;
            default: throw new Error("Bước không hợp lệ");
        }

        // Cập nhật trang_thai đợt bổ nhiệm
        await client.query(
            "UPDATE dot_bo_nhiem SET trang_thai = $1 WHERE id = $2",
            [result.nextState, data.dot_bo_nhiem_id]
        );

        await client.query("COMMIT");

        return res.json({
            success: true,
            message: result.nextState === 0
                ? "Quy trình đã dừng do không đủ điều kiện"
                : result.nextState === 6
                    ? "Hoàn thành quy trình bổ nhiệm!"
                    : "Ghi nhận kết quả thành công!",
            nextState: result.nextState
        });

    } catch (err: unknown) {
        await client.query("ROLLBACK");
        const error = err as Error;
        return res.status(400).json({ success: false, message: error.message });
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
};