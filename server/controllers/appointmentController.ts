import {Request, Response } from "express";
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

interface CalcResult {
    ti_le: number;
    dat: boolean;
}

const calculateVote = (
    so_phieu_dong_y: number,
    input: VoteInput
): CalcResult => {

    let ti_le = 0;

    if (input.buoc_hoi_nghi === 5) {
        // bước 5 (Vote vòng 2) tính trên tổng triệu tập
        ti_le = so_phieu_dong_y / input.so_nguoi_trieu_tap;
    } else {
        // bước 2, 3, 4 tính trên phiếu hợp lệ
        ti_le = so_phieu_dong_y / input.so_phieu_hop_le;
    }

    return {
        ti_le: Math.round(ti_le * 100),
        dat: ti_le > 0.5
    };
};
export const getAll =  async (req: Request, res: Response) => {
    try {
        const query = `SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.trang_thai,
                        pct.so_luong_de_xuat, cd.ten_chuc_danh, dv.ten_don_vi,
                        COUNT(ctbn.id) as so_luong_thuc_te
                        FROM dot_bo_nhiem dbn 
                        JOIN phieu_chu_truong pct ON dbn.phieu_chu_truong_id = pct.id
                        JOIN chuc_danh_quan_ly cd ON pct.chuc_danh_id = cd.id
                        JOIN don_vi dv ON pct.don_vi_id = dv.id
                        LEFT JOIN chi_tiet_bo_nhiem ctbn ON dbn.id = ctbn.dot_bo_nhiem_id
                        GROUP BY dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.trang_thai,
                                 pct.so_luong_de_xuat, cd.ten_chuc_danh, dv.ten_don_vi`
        const result = await pool.query(query);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}

export const getByID =  async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const batchQuery = `SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.trang_thai,
                        pct.so_luong_de_xuat, cd.ten_chuc_danh, dv.ten_don_vi 
                        FROM dot_bo_nhiem dbn 
                        JOIN phieu_chu_truong pct ON dbn.phieu_chu_truong_id = pct.id
                        JOIN chuc_danh_quan_ly cd ON pct.chuc_danh_id = cd.id
                        JOIN don_vi dv ON pct.don_vi_id = dv.id
                        WHERE dbn.id = $1 `
        const detailQuery = `SELECT 
                        ctbn.id as chi_tiet_bn_id, vc.id as vien_chuc_id, vc.ma_vien_chuc, vc.ho_va_ten,
                        dv.ten_don_vi,
                        nk.ten_chuc_danh,
                        CASE
                            WHEN ctbn.id IS NOT NULL THEN 'Nguồn tại chỗ'
                            ELSE 'Nguồn nơi khác' 
                        END as nguon_vien_chuc,
                        ctbn.trang_thai
                        FROM chi_tiet_bo_nhiem ctbn LEFT JOIN vien_chuc vc on ctbn.vien_chuc_id = vc.id
                        LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
                        LEFT JOIN (SELECT nkcv.vien_chuc_id, cd.ten_chuc_danh
                                FROM nhiem_ky_chuc_vu nkcv JOIN chuc_danh_quan_ly cd on nkcv.chuc_danh_id = cd.id
                                WHERE nkcv.trang_thai = 1) nk ON vc.id = nk.vien_chuc_id
                        WHERE ctbn.dot_bo_nhiem_id = $1`

        const [batchInfo, candidates] = await Promise.all([
            pool.query(batchQuery, [id]),
            pool.query(detailQuery, [id])
        ]);
        if(batchInfo.rows.length === 0){
            return res.status(404).json({ success: false, message: "Không tìm thấy đợt bổ nhiệm" });
        }
        return res.status(200).json({ success: true, data: {
            batchInfo: batchInfo.rows[0],
            candidates: candidates.rows
        } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}

export const getPlanningSrc = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const query = `SELECT vc.id, vc.ma_vien_chuc, vc.ho_va_ten,
                        dv.ten_don_vi,
                        dqh.ten_quy_hoach, ctqh.id
                        FROM chi_tiet_quy_hoach ctqh LEFT JOIN vien_chuc vc ON ctqh.vien_chuc_id = vc.id
                        LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
                        LEFT JOIN dot_quy_hoach dqh ON ctqh.dot_quy_hoach_id = dqh.id
                        WHERE ctqh.trang_thai = 1
                        AND ctqh.chuc_danh_id = (SELECT pct.chuc_danh_id 
                        FROM dot_bo_nhiem dbn LEFT JOIN phieu_chu_truong pct ON dbn.phieu_chu_truong_id = pct.id WHERE dbn.id = $1)
                        AND vc.id NOT IN (SELECT vien_chuc_id FROM chi_tiet_bo_nhiem WHERE dot_bo_nhiem_id = $1 AND vien_chuc_id IS NOT NULL)`;
        
        const result = await pool.query(query, [id]);
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Lỗi getPlanningSrc:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Không thể lấy danh sách nguồn quy hoạch" 
        });
    }
}

export const addCandidate = async (req: Request, res: Response) => {
    try {
        const {vien_chuc_id, dot_bo_nhiem_id, ly_do_vao, chi_tiet_qh_id} = req.body;
        const query = `INSERT INTO chi_tiet_bo_nhiem (ly_do_vao, dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await pool.query(query, [ly_do_vao, dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id || null]);

        return res.status(201).json({ success: true, message: "Đã thêm ứng viên thành công", data: result.rows[0] });
    } catch (error: any) {
        console.error("Lỗi addCandidate:", error);
        
        if (error.code === '23505') {
            return res.status(400).json({ 
                success: false, 
                message: "Viên chức này đã tồn tại trong đợt bổ nhiệm!" 
            });
        }
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi máy chủ khi thêm ứng viên" 
        });
    }
}   

export const removeCandidate = async (req: Request, res: Response) => {
    try {
        const {dot_bo_nhiem_id, vien_chuc_id} = req.params; 
        const query  = `UPDATE chi_tiet_bo_nhiem 
                        SET trang_thai = 0
                        WHERE dot_bo_nhiem_id = $1 AND vien_chuc_id = $2 AND trang_thai = 1 RETURNING *`;
        const result = await pool.query(query,[dot_bo_nhiem_id, vien_chuc_id])

        if (result.rowCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy ứng viên đang hoạt động trong đợt này" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Đã xác nhận ứng viên rời khỏi đợt bổ nhiệm",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Lỗi removeCandidate:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
}

const validateInput = (data: VoteInput) => {
    if (!data.dot_bo_nhiem_id || !data.buoc_hoi_nghi)
        throw new Error("Thiếu thông tin bắt buộc");

    if (!data.ket_qua_ung_vien?.length)
        throw new Error("Danh sách ứng viên rỗng");

    if (data.so_nguoi_co_mat > data.so_nguoi_trieu_tap)
        throw new Error("Có mặt > triệu tập");

    if (data.so_phieu_phat_ra > data.so_nguoi_co_mat)
        throw new Error("Phát ra > có mặt");

    if (data.so_phieu_thu_ve > data.so_phieu_phat_ra)
        throw new Error("Thu về > phát ra");

    if (data.so_phieu_hop_le > data.so_phieu_thu_ve)
        throw new Error("Hợp lệ > thu về");

    // bước 2, 3, 4, 5: cần 2/3
    if ([2, 3, 4, 5].includes(data.buoc_hoi_nghi)) {
        const min = Math.ceil((2 / 3) * data.so_nguoi_trieu_tap);
        if (data.so_nguoi_co_mat < min) {
            throw new Error(`Cần ít nhất ${min} người tham dự`);
        }
    }
};

const handleStep2 = async (client: any, data: VoteInput) => {
    const results = [];

    for (const uv of data.ket_qua_ung_vien) {
        if (uv.so_phieu_dong_y + uv.so_phieu_khong_dong_y !== data.so_phieu_hop_le) {
            throw new Error(`Ứng viên ${uv.chi_tiet_bn_id} sai tổng phiếu`);
        }

        const calc = calculateVote(uv.so_phieu_dong_y, data);

        results.push({
            ...uv,
            ti_le: calc.ti_le,
            ket_qua: calc.dat ? 1 : 0
        });
    }

    // Lưu tất cả kết quả
    for (const r of results) {
        await client.query(
            `INSERT INTO ket_qua_bo_nhiem 
            (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [r.chi_tiet_bn_id, data.buoc_hoi_nghi, data.so_nguoi_trieu_tap, data.so_nguoi_co_mat, data.so_phieu_phat_ra, data.so_phieu_thu_ve, data.so_phieu_hop_le, r.so_phieu_dong_y, r.so_phieu_khong_dong_y, r.ket_qua]
        );
    }

    // Bước 2 chỉ ghi nhận kết quả đề xuất, chuyển sang bước 3
    return { nextState: 3 }; // Chuyển sang bước 3
};

const handleStep3 = async (client: any, data: VoteInput) => {
    const results = [];

    for (const uv of data.ket_qua_ung_vien) {
        if (uv.so_phieu_dong_y + uv.so_phieu_khong_dong_y !== data.so_phieu_hop_le) {
            throw new Error(`Ứng viên ${uv.chi_tiet_bn_id} sai tổng phiếu`);
        }

        const calc = calculateVote(uv.so_phieu_dong_y, data);

        results.push({
            ...uv,
            ti_le: calc.ti_le,
            ket_qua: calc.dat ? 1 : 0
        });
    }

    // Lưu tất cả kết quả
    for (const r of results) {
        await client.query(
            `INSERT INTO ket_qua_bo_nhiem 
            (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [r.chi_tiet_bn_id, data.buoc_hoi_nghi, data.so_nguoi_trieu_tap, data.so_nguoi_co_mat, data.so_phieu_phat_ra, data.so_phieu_thu_ve, data.so_phieu_hop_le, r.so_phieu_dong_y, r.so_phieu_khong_dong_y, r.ket_qua]
        );
    }

    // Kiểm tra điều kiện hợp lệ của hội nghị: ≥ 2/3 số người được triệu tập tham dự
    const requiredAttendees = Math.ceil((2 / 3) * data.so_nguoi_trieu_tap);
    if (data.so_nguoi_co_mat < requiredAttendees) {
        // Hội nghị không hợp lệ -> Dừng quy trình
        return { nextState: 0 }; // Chuyển sang trạng thái "Đã dừng"
    }

    // Kiểm tra nếu có ai đạt >50% so với tổng số người được triệu tập không
    const hasQualifiedCandidate = results.some(r => r.ket_qua === 1);
    
    if (!hasQualifiedCandidate) {
        // Không ai đạt >50% -> Dừng quy trình
        return { nextState: 0 }; // Chuyển sang trạng thái "Đã dừng"
    }

    return { nextState: 4 }; // Chuyển sang bước 4
};

const handleStep4 = async (client: any, data: VoteInput) => {
    const results = [];

    for (const uv of data.ket_qua_ung_vien) {
        if (uv.so_phieu_dong_y + uv.so_phieu_khong_dong_y !== data.so_phieu_hop_le) {
            throw new Error(`Ứng viên ${uv.chi_tiet_bn_id} sai tổng phiếu`);
        }

        const calc = calculateVote(uv.so_phieu_dong_y, data);

        results.push({
            ...uv,
            ti_le: calc.ti_le,
            ket_qua: calc.dat ? 1 : 0
        });
    }

    // Lưu tất cả kết quả
    for (const uv of data.ket_qua_ung_vien) {
        const calc = calculateVote(uv.so_phieu_dong_y, data);

        await client.query(
            `INSERT INTO ket_qua_bo_nhiem 
            (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
                uv.chi_tiet_bn_id,
                data.buoc_hoi_nghi,
                data.so_nguoi_trieu_tap,
                data.so_nguoi_co_mat,
                data.so_phieu_phat_ra,
                data.so_phieu_thu_ve,
                data.so_phieu_hop_le,
                uv.so_phieu_dong_y,
                uv.so_phieu_khong_dong_y,
                calc.dat ? 1 : 0
            ]
        );
    }

    // Bước 4 chỉ ghi nhận kết quả lấy ý kiến tín nhiệm, chuyển sang bước 5
    return { nextState: 5 }; // Chuyển sang bước 5
};

const handleStep5 = async (client: any, data: VoteInput) => {
    const results = [];

    for (const uv of data.ket_qua_ung_vien) {
        if (uv.so_phieu_dong_y + uv.so_phieu_khong_dong_y !== data.so_phieu_hop_le) {
            throw new Error(`Ứng viên ${uv.chi_tiet_bn_id} sai tổng phiếu`);
        }

        const calc = calculateVote(uv.so_phieu_dong_y, data);

        results.push({
            ...uv,
            ti_le: calc.ti_le,
            ket_qua: calc.dat ? 1 : 0
        });
    }

    // Lưu tất cả kết quả
    for (const uv of data.ket_qua_ung_vien) {
        const calc = calculateVote(uv.so_phieu_dong_y, data);

        await client.query(
            `INSERT INTO ket_qua_bo_nhiem 
            (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
                uv.chi_tiet_bn_id,
                data.buoc_hoi_nghi,
                data.so_nguoi_trieu_tap,
                data.so_nguoi_co_mat,
                data.so_phieu_phat_ra,
                data.so_phieu_thu_ve,
                data.so_phieu_hop_le,
                uv.so_phieu_dong_y,
                uv.so_phieu_khong_dong_y,
                calc.dat ? 1 : 0
            ]
        );
    }

    // Kiểm tra nếu có ai đạt >50% số phiếu đồng ý không
    const hasQualifiedCandidate = results.some(r => r.ket_qua === 1);
    
    if (!hasQualifiedCandidate) {
        // Không ai đạt >50% -> Dừng quy trình
        return { nextState: 0 }; // Chuyển sang trạng thái "Đã dừng"
    }

    // Update trạng thái viên chức dựa trên kết quả cuối cùng
    for (const r of results) {
        const newStatus = r.ket_qua === 1 ? 3 : 2; // 3: Đạt, 2: Không đạt
        await client.query(
            `UPDATE chi_tiet_bo_nhiem SET trang_thai = $1 WHERE id = $2`,
            [newStatus, r.chi_tiet_bn_id]
        );
    }

    return { nextState: 6 }; // Chuyển sang trạng thái "Hoàn thành"
};

export const addVoteResult = async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const data: VoteInput = req.body;

        validateInput(data);

        await client.query("BEGIN");

        const batch = await client.query(
            `SELECT trang_thai FROM dot_bo_nhiem WHERE id = $1 FOR UPDATE`,
            [data.dot_bo_nhiem_id]
        );

        if (batch.rowCount === 0)
            throw new Error("Đợt không tồn tại");

        if (batch.rows[0].trang_thai !== data.buoc_hoi_nghi)
            throw new Error("Sai bước hội nghị");

        let result;

        switch (data.buoc_hoi_nghi) {
            case 2:
                result = await handleStep2(client, data);
                break;
            case 3:
                result = await handleStep3(client, data);
                break;
            case 4:
                result = await handleStep4(client, data);
                break;
            case 5:
                result = await handleStep5(client, data);
                break;
            default:
                throw new Error("Bước không hợp lệ");
        }

        await client.query(
            `UPDATE dot_bo_nhiem SET trang_thai = $1 WHERE id = $2`,
            [result.nextState, data.dot_bo_nhiem_id]
        );

        await client.query("COMMIT");

        return res.json({
            success: true,
            nextState: result.nextState
        });

    } catch (err: any) {
        await client.query("ROLLBACK");

        return res.status(400).json({
            success: false,
            message: err.message
        });

    } finally {
        client.release();
    }
};
// Tạo hồ sơ bổ nhiệm
export const createDossier = async (req: Request, res:Response) => {
    const client = await pool.connect();
    try {
        const dot_bo_nhiem_id = req.params.id;
        const {so_to_trinh, ngay_to_trinh, ghi_chu, danh_sach_ho_so} = req.body;

        if(!danh_sach_ho_so || danh_sach_ho_so.length === 0)
            return res.status(400).json({ success: false, message: "Danh sách hồ sơ không được rỗng" });

        await client.query('BEGIN');

        // Tạo mã hồ sơ tự động
        const idResult = await client.query("SELECT MAX(id) FROM ho_so_bo_nhiem");
        const maxid = idResult.rows[0].id || 0;
        const ma_ho_so = "HS" + (maxid + 1).toString().padStart(3, "0");

        const query = `INSERT INTO ho_so_bo_nhiem (ma_ho_so, so_to_trinh, ngay_to_trinh, ngay_lap, ghi_chu, trang_thai, dot_bo_nhiem_id)
                        VALUES ($1, $2, $3, CURRENT_DATE, $4, 1, $5) RETURNING *`;
        const result = await client.query(query, [ma_ho_so, so_to_trinh, ngay_to_trinh, ghi_chu, dot_bo_nhiem_id]);

        const ho_so_id = result.rows[0].id;

        // Insert chi tiết hồ sơ
        const insertDetail = `INSERT INTO chi_tiet_ho_so (ghi_chu, trang_thai, ho_so_id, chi_tiet_bn_id)
                            VALUES ($1, 1, $2, $3)`;
        
        for (const hoSo of danh_sach_ho_so) {
            await client.query(insertDetail, [hoSo.ghi_chu, ho_so_id, hoSo.chi_tiet_bn_id]);
        }

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: "Đã lập hồ sơ bổ nhiệm thành công!",
            data: { 
                ho_so_id: ho_so_id, 
                ma_ho_so: ma_ho_so,
                so_luong_ho_so: danh_sach_ho_so.length
            }
        });

    } catch (error: any) {
        await client.query('ROLLBACK'); 
        console.error("Lỗi khi tạo hồ sơ:", error);
        
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi lập hồ sơ bổ nhiệm"
        });
    } finally {
        client.release();
    }
}

export const createDecision = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const {ho_so_bo_nhiem, ma_bo_nhiem, so_quyet_dinh, ngay_quyet_dinh, ngay_co_hieu_luc, thoi_han} = req.body;
        const dot_bo_nhiem_id = req.params.id;

        if(!ho_so_bo_nhiem || !ma_bo_nhiem || !so_quyet_dinh || !ngay_quyet_dinh || !ngay_co_hieu_luc) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin bắt buộc cho quyết định" 
            });
        }

        await client.query('BEGIN');

        // Tạo quyết định
        const query = `INSERT INTO quyet_dinh_bo_nhiem (ma_bo_nhiem, so_quyet_dinh, ngay_quyet_dinh, ngay_co_hieu_luc, thoi_han, trang_thai, ho_so_bo_nhiem_id, dot_bo_nhiem_id)
                        VALUES ($1, $2, $3, $4, $5, 1, $6, $7) RETURNING *`;
        
        const result = await client.query(query, [
            ma_bo_nhiem, so_quyet_dinh, ngay_quyet_dinh, ngay_co_hieu_luc, thoi_han, ho_so_bo_nhiem, dot_bo_nhiem_id
        ]);

        // Update batch status to completed (5)
        await client.query(`UPDATE dot_bo_nhiem SET trang_thai = 5 WHERE id = $1`, [dot_bo_nhiem_id]);

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: "Đã tạo quyết định bổ nhiệm thành công!",
            data: result.rows[0]
        });

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error("Lỗi khi tạo quyết định:", error);
        
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi tạo quyết định bổ nhiệm"
        });
    } finally {
        client.release();
    }
}

export const createBatch = async (req: Request, res: Response) => {
    const client = await pool.connect();
    
    try {
        const { ma_dot_bo_nhiem, ten_dot_bo_nhiem, phieu_chu_truong_id, ngay_bat_dau, ngay_ket_thuc } = req.body;

        if (!ma_dot_bo_nhiem || !ten_dot_bo_nhiem || !phieu_chu_truong_id) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin bắt buộc: mã đợt bổ nhiệm, tên đợt bổ nhiệm, phiếu chủ trưởng"
            });
        }

        await client.query('BEGIN');

        // Kiểm tra phiếu chủ trưởng có tồn tại và trạng thái = 1
        const petitionCheck = await client.query(
            'SELECT id FROM phieu_chu_truong WHERE id = $1 AND trang_thai = 1',
            [phieu_chu_truong_id]
        );

        if (petitionCheck.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "Phiếu chủ trưởng không tồn tại hoặc không ở trạng thái hợp lệ"
            });
        }

        // Kiểm tra phiếu chủ trưởng đã được sử dụng chưa
        const usedCheck = await client.query(
            'SELECT id FROM dot_bo_nhiem WHERE phieu_chu_truong_id = $1',
            [phieu_chu_truong_id]
        );

        if (usedCheck.rowCount && usedCheck.rowCount > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: "Phiếu chủ trưởng đã được sử dụng để tạo đợt bổ nhiệm khác"
            });
        }

        // Tạo đợt bổ nhiệm mới với trạng thái = 1 (Đang soạn thảo)
        const query = `
            INSERT INTO dot_bo_nhiem (ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, trang_thai, phieu_chu_truong_id)
            VALUES ($1, $2, $3, $4, 1, $5)
            RETURNING *
        `;
        
        const result = await client.query(query, [
            ma_dot_bo_nhiem,
            ten_dot_bo_nhiem,
            ngay_bat_dau || null,
            ngay_ket_thuc || null,
            phieu_chu_truong_id
        ]);

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: "Tạo đợt bổ nhiệm thành công!",
            data: result.rows[0]
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
        
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi tạo đợt bổ nhiệm"
        });
    } finally {
        client.release();
    }
};

export const startVotingProcess = async (req: Request, res: Response) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;

        // Kiểm tra đợt bổ nhiệm có tồn tại và ở trạng thái "Đang soạn thảo"
        const batchCheck = await client.query(
            'SELECT id, trang_thai, phieu_chu_truong_id FROM dot_bo_nhiem WHERE id = $1',
            [id]
        );

        if (batchCheck.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Đợt bổ nhiệm không tồn tại"
            });
        }

        const batch = batchCheck.rows[0];
        if (batch.trang_thai !== 1) {
            return res.status(400).json({
                success: false,
                message: "Chỉ có thể bắt đầu quy trình bỏ phiếu khi đợt bổ nhiệm ở trạng thái 'Đang soạn thảo'"
            });
        }

        // Kiểm tra số lượng ứng viên hợp lệ
        const candidateCount = await client.query(
            'SELECT COUNT(*) as count FROM chi_tiet_bo_nhiem WHERE dot_bo_nhiem_id = $1 AND trang_thai = 1',
            [id]
        );

        const validCandidates = parseInt(candidateCount.rows[0].count);
        if (validCandidates === 0) {
            return res.status(400).json({
                success: false,
                message: "Cần có ít nhất 1 ứng viên hợp lệ để bắt đầu quy trình bỏ phiếu"
            });
        }

        // Lấy số lượng đề xuất từ phiếu chủ trưởng
        const petitionQuery = await client.query(
            'SELECT so_luong_de_xuat FROM phieu_chu_truong WHERE id = $1',
            [batch.phieu_chu_truong_id]
        );

        const requiredCandidates = petitionQuery.rows[0]?.so_luong_de_xuat || 1;
        
        if (validCandidates < requiredCandidates) {
            return res.status(400).json({
                success: false,
                message: `Cần có ít nhất ${requiredCandidates} ứng viên hợp lệ (hiện có: ${validCandidates})`
            });
        }

        // Cập nhật trạng thái sang "Chờ hội nghị vòng 1"
        await client.query(
            'UPDATE dot_bo_nhiem SET trang_thai = 2 WHERE id = $1',
            [id]
        );

        return res.json({
            success: true,
            message: "Đã bắt đầu quy trình ghi nhận kết quả! Đợt bổ nhiệm chuyển sang trạng thái 'Vote (vòng 1)'",
            data: { 
                trang_thai_moi: 2,
                so_ung_vien_hop_le: validCandidates
            }
        });

    } catch (error: any) {
        console.error("Lỗi khi bắt đầu quy trình bỏ phiếu:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi bắt đầu quy trình bỏ phiếu"
        });
    } finally {
        client.release();
    }
};

export const updateBatchStatus = async (req: Request, res: Response) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;

        if (!trang_thai) {
            return res.status(400).json({
                success: false,
                message: "Thiếu trạng thái cần cập nhật"
            });
        }

        // Kiểm tra đợt bổ nhiệm có tồn tại
        const batchCheck = await client.query(
            'SELECT id, trang_thai FROM dot_bo_nhiem WHERE id = $1',
            [id]
        );

        if (batchCheck.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Đợt bổ nhiệm không tồn tại"
            });
        }

        // Cập nhật trạng thái (không cần validation luồng)
        await client.query(
            'UPDATE dot_bo_nhiem SET trang_thai = $1 WHERE id = $2',
            [trang_thai, id]
        );

        return res.json({
            success: true,
            message: "Cập nhật trạng thái đợt bổ nhiệm thành công!",
            data: { trang_thai }
        });

    } catch (error: any) {
        console.error("Lỗi khi cập nhật trạng thái đợt bổ nhiệm:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi máy chủ khi cập nhật trạng thái"
        });
    } finally {
        client.release();
    }
};

export default {getAll, getByID, removeCandidate, addCandidate, addVoteResult, createDecision, getPlanningSrc, createDossier, createBatch, updateBatchStatus, startVotingProcess}