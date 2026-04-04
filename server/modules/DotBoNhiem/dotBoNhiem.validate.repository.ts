import { TrangThaiUngVien } from "./dotBoNhiem.type"

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
    const result =  await client.query (
       `SELECT ctdbn.dot_bo_nhiem_id, ctbn.buoc_hoi_nghi
        FROM chi_tiet_dot_bo_nhiem ctdbn
        JOIN chi_tiet_bo_nhiem ctbn ON ctbn.chi_tiet_dot_bo_nhiem_id = ctdbn.id
        WHERE ctdbn.id = $1
        LIMIT 1`,
        [id]
    );
    return result.rows[0];
}
export const updateBuocHienTai = async (client: any, buoc: number, id: number) => {
    await client.query(
        `UPDATE chi_tiet_bo_nhiem SET buoc_hoi_nghi = $1 WHERE chi_tiet_dot_bo_nhiem_id = $2`,
        [buoc, id]
    )
}

export const getBuocHienTai = async (client: any, dotBoNhiemId: number) => {
    const result = await client.query(
        `SELECT MIN(ctbn.buoc_hoi_nghi) FILTER (WHERE ctbn.buoc_hoi_nghi NOT IN (0, 6)) AS min_step
         FROM chi_tiet_bo_nhiem ctbn
         JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctbn.chi_tiet_dot_bo_nhiem_id = ctdbn.id
         WHERE ctdbn.dot_bo_nhiem_id = $1`,
        [dotBoNhiemId]
    );
    return result.rows[0].min_step;
}
export const checkAllDone = async (client: any, dotBoNhiemId: number) => {
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
export const startProcess = async(client: any, chiTietDotBoNhiemId: number) => {
    await client.query(
        `UPDATE chi_tiet_bo_nhiem SET buoc_hoi_nghi = 2 WHERE chi_tiet_dot_bo_nhiem_id = $1`,
        [chiTietDotBoNhiemId]
    );
}