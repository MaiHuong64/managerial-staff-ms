export const insertKetQuaQuyHoach = async (client: any, params: any[]) => {
    await client.query(
        `INSERT INTO ket_qua_quy_hoach
            (chi_tiet_qh_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
            so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
            so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, params
    )
}

export const upsertKetQuaBuoc2 = async (client: any, params: any[]) => {
    await client.query(
        `INSERT INTO ket_qua_quy_hoach
         (chi_tiet_qh_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
            so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
            so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
         VALUES ($1,$2,$3,$4,0,0,0,0,0,NULL)
         ON CONFLICT (chi_tiet_qh_id, buoc_hoi_nghi)
         DO UPDATE SET
            so_nguoi_trieu_tap = EXCLUDED.so_nguoi_trieu_tap,
            so_nguoi_co_mat = EXCLUDED.so_nguoi_co_mat`,
        params
    )
}

// Lấy bước hiện tại của đợt (MIN của các ứng viên đang active)
export const getBuocHienTaiByDot = async (client: any, dotQhId: number) => {
    const result = await client.query(
        `SELECT MIN(buoc_hien_tai) AS buoc_hien_tai
         FROM chi_tiet_quy_hoach
         WHERE dot_quy_hoach_id = $1 AND buoc_hien_tai BETWEEN 1 AND 5 AND ct.buoc_hien_tai != 6`,
        [dotQhId]
    );
    return result.rows[0];
}

// Lấy danh sách ứng viên đang ở bước hiện tại
export const getUngVienByDotAndBuoc = async (client: any, dotQhId: number, buoc: number) => {
    const result = await client.query(
        `SELECT id, vien_chuc_id, chuc_danh_id, don_vi_id, buoc_hien_tai
         FROM chi_tiet_quy_hoach
         WHERE dot_quy_hoach_id = $1 AND buoc_hien_tai = $2`,
        [dotQhId, buoc]
    );
    return result.rows;
}

// Update bước hiện tại cho 1 ứng viên (per ứng viên, không phải per đợt)
export const updateBuocHienTaiById = async (client: any, buoc: number, chiTietQhId: number) => {
    await client.query(
        `UPDATE chi_tiet_quy_hoach SET buoc_hien_tai = $1 WHERE id = $2`,
        [buoc, chiTietQhId]
    )
}
