import pool from "../../config/db";

// BGH Dashboard - Thống kê phương án chờ duyệt
export const getBGHPendingApprovals = async () => {
    const result = await pool.query(
        `SELECT
            pa.id,
            pa.ma_phuong_an,
            pa.so_to_trinh,
            pa.ngay_lap as ngay_tao,
            pa.trang_thai,
            COUNT(ctpa.id) as so_luong_ung_vien
        FROM phuong_an_nhan_su pa
        LEFT JOIN chi_tiet_phuong_an ctpa ON ctpa.phuong_an_id = pa.id
        WHERE pa.trang_thai = 1
        GROUP BY pa.id, pa.ma_phuong_an, pa.so_to_trinh, pa.ngay_lap, pa.trang_thai
        ORDER BY pa.ngay_lap DESC
        LIMIT 10`
    );
    return result.rows;
};

// BGH Dashboard - Thống kê tổng quan
export const getBGHStatistics = async () => {
    const result = await pool.query(
        `SELECT
            (SELECT COUNT(*) FROM phuong_an_nhan_su WHERE trang_thai = 1) as cho_duyet,
            (SELECT COUNT(*) FROM phuong_an_nhan_su WHERE trang_thai = 2 AND DATE(ngay_phe_duyet) = CURRENT_DATE) as da_duyet_hom_nay,
            (SELECT COUNT(*) FROM phuong_an_nhan_su WHERE trang_thai = 1 AND ngay_lap < CURRENT_DATE - INTERVAL '7 days') as can_xem_xet,
            (SELECT COALESCE(ROUND(
                (COUNT(CASE WHEN trang_thai = 2 THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100, 0
            ), 0) FROM phuong_an_nhan_su) as ty_le_duyet`
    );
    return result.rows[0];
};

// PTCCT Dashboard - Thống kê hệ thống
export const getPTCCTSystemStats = async () => {
    const result = await pool.query(
        `SELECT
            (SELECT COUNT(*) FROM vien_chuc WHERE trang_thai = 1) as tong_vien_chuc,
            (SELECT COUNT(*) FROM don_vi) as tong_don_vi,
            (SELECT COUNT(*) FROM chuc_danh_quan_ly) as tong_chuc_danh,
            (SELECT COUNT(*) FROM dot_quy_hoach WHERE trang_thai = 1) as dot_quy_hoach_dang_hoat_dong,
            (SELECT COUNT(*) FROM dot_bo_nhiem WHERE trang_thai = 1) as dot_bo_nhiem_dang_hoat_dong`
    );
    return result.rows[0];
};

// PTCCT Dashboard - Hoạt động gần đây
export const getPTCCTRecentActivities = async () => {
    const result = await pool.query(
        `SELECT
            'phuong_an' as loai,
            pa.ma_phuong_an as ten,
            pa.so_to_trinh,
            pa.ngay_lap as thoi_gian,
            CASE
                WHEN pa.trang_thai = 1 THEN 'Chờ duyệt'
                WHEN pa.trang_thai = 2 THEN 'Đã duyệt'
                ELSE 'Khác'
            END as trang_thai
        FROM phuong_an_nhan_su pa
        ORDER BY pa.ngay_lap DESC
        LIMIT 10`
    );
    return result.rows;
};
