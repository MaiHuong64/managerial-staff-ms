export const insertKetQuaBoNhiem = async (client: any, params: any[]) => {
    await client.query(
        `INSERT INTO ket_qua_bo_nhiem
            (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
            so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
            so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, params
    )
}

export const upsertKetQuaBuoc2 = async (client: any, params: any[]) => {
    await client.query( 
        `INSERT INTO ket_qua_bo_nhiem
         (chi_tiet_bn_id, buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
          so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
          so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua)
         VALUES ($1,$2,$3,$4,0,0,0,0,0,NULL)
         ON CONFLICT (chi_tiet_bn_id, buoc_hoi_nghi)
         DO UPDATE SET
            so_nguoi_trieu_tap = EXCLUDED.so_nguoi_trieu_tap,
            so_nguoi_co_mat = EXCLUDED.so_nguoi_co_mat`,
        params
    )
}

export const getChiTietDotBoNhiem = async (client: any, id: number) => {
    const result = await client.query (
       `SELECT ctdbn.dot_bo_nhiem_id
        FROM chi_tiet_dot_bo_nhiem ctdbn
        WHERE ctdbn.id = $1`,[id]
    );
    return result.rows[0];
}

export const getBuocHienTai = async (client: any, chiTietDotBoNhiemId: number) => {
    const result = await client.query(
        `SELECT MIN(ctbn.buoc_hoi_nghi) 
                FILTER (WHERE ctbn.buoc_hoi_nghi NOT IN (0, 6)) AS min_step
         FROM chi_tiet_bo_nhiem ctbn
         WHERE ctbn.chi_tiet_dot_bo_nhiem_id = $1`,
        [chiTietDotBoNhiemId]
    );
    return result.rows[0].min_step;
}
export const checkDotBoNhiemHoanThanh = async (client: any, dotBoNhiemId: number) => {
      const result = await client.query(
        `SELECT
            COUNT(*) FILTER (WHERE buoc_hoi_nghi BETWEEN 2 AND 5) AS dang_xu_ly,
            COUNT(*) FILTER (WHERE buoc_hoi_nghi = 0) AS so_dung
         FROM chi_tiet_bo_nhiem ctbn JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctbn.chi_tiet_dot_bo_nhiem_id = ctdbn.id
         WHERE ctdbn.dot_bo_nhiem_id = $1`,
        [dotBoNhiemId]
    );
    return result.rows[0];

}
export const updateBuocHienTaiChiTietBoNhiem = async (client: any, buoc: number, chiTietBnId: number) => {
    await client.query(
        `UPDATE chi_tiet_bo_nhiem SET buoc_hoi_nghi = $1 WHERE id = $2`,
        [buoc, chiTietBnId]
    )
}

export const updateTrangThaiDotBoNhiem = async (client: any, dotBoNhiemId: number, trangThai: number) => {
    await client.query(
        `UPDATE dot_bo_nhiem SET trang_thai = $1 WHERE id = $2`,
        [trangThai, dotBoNhiemId]
    );
}
export const updateTrangThaiChiTietDotBoNhiem = async (client: any, chiTietDotId: number, trangThai: number) => {
    await client.query(
        `UPDATE chi_tiet_dot_bo_nhiem SET trang_thai = $1 WHERE id = $2`,
        [trangThai, chiTietDotId]
    );
}
export const updateBuocHienTaiChiTietDotBoNhiem = async (client: any, buoc: number, chiTIetDottId: number) => {
    await client.query (
        `UPDATE chi_tiet_dot_bo_nhiem
         SET buoc_hien_tai = $1
         WHERE id = $2`,
        [buoc, chiTIetDottId]
    )
}
export const updateTrangThaiUngVien = async (client: any, chiTietBnId: number, trangThai: number) => {
    await client.query(
        `UPDATE chi_tiet_bo_nhiem SET trang_thai = $1 WHERE id = $2`,
        [trangThai, chiTietBnId]
    );
}
export const getUngVienHoa = async (client: any, danhSachUngVien: number[]) => {
    const result = await client.query(
        `SELECT ctbn.id as chi_tiet_bn_id, vc.ho_va_ten
        FROM chi_tiet_bo_nhiem ctbn
        JOIN vien_chuc vc ON ctbn.vien_chuc_id = vc.id
        WHERE ctbn.id = ANY($1)`, danhSachUngVien)
    return result.rows
}