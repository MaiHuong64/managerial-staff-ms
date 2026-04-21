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

// Lấy bước hiện tại của đợt (MIN của các ứng viên đang hoạt động)
export const getBuocHienTaiByDot = async (client: any, dotQhId: number) => {
    const result = await client.query(
        `SELECT MIN(buoc_hien_tai) AS buoc_hien_tai, d.loai_quy_hoach 
         FROM chi_tiet_quy_hoach ct JOIN dot_quy_hoach d ON ct.dot_quy_hoach_id = d.id
         WHERE ct.dot_quy_hoach_id = $1 AND ct.buoc_hien_tai BETWEEN 1 AND 5 AND ct.buoc_hien_tai != 6
         GROUP BY  d.loai_quy_hoach `,
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
//Kiểm tra tất cả các ứng viên đã vote xong chưa
export const checkBatchDone = async (client: any, dotQuyHoachId: number ) => {
    const result = await client.query (
        `SELECT COUNT(*) AS con_active
         FROM chi_tiet_quy_hoach
         WHERE dot_quy_hoach_id = $1 AND buoc_hien_tai > 0 AND buoc_hien_tai != 6`,
        [dotQuyHoachId]
    )
    console.log(result.rows);
    
    const count = await client.query( 
        `SELECT COUNT(*) AS con_active FROM chi_tiet_quy_hoach
         WHERE dot_quy_hoach_id = $1 AND buoc_hien_tai > 0 AND buoc_hien_tai != 6`,
        [dotQuyHoachId]
    );
    return Number(count.rows[0].con_active) === 0;
}
export const updateStatusBatch = async (client: any, dotQuyHoachId: number) => {
    await client.query(
        `UPDATE dot_quy_hoach SET trang_thai = 1 WHERE id = $1`, [dotQuyHoachId]
    )
}

export const updateStatusCandidate = async (client: any, chiTietQhId: number, trangThai: number) => {
    await client.query(
        `UPDATE chi_tiet_quy_hoach SET trang_thai = $1 WHERE id = $2`,[trangThai, chiTietQhId]
    )
}