import { PoolClient } from "pg";

export const findStaff = async(client: PoolClient, maVienChuc: string) => {
    return client.query("SELECT id, ma_vien_chuc FROM vien_chuc WHERE ma_vien_chuc = $1 AND trang_thai = 1", [maVienChuc])
}
export const insertImportVC = async (client: PoolClient, vienChucId: number, namDanhGia: number, danhGia: string, nhanXet: string) => {
    return client.query(
        `INSERT INTO xep_loai_vc (vien_chuc_id, nam_danh_gia, danh_gia, nhan_xet)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (vien_chuc_id, nam_danh_gia)
        DO UPDATE SET danh_gia = $3, nhan_xet = $4`, [vienChucId, namDanhGia, danhGia, nhanXet]);
}
export const insertImportDV = async (client: PoolClient, vienChucId: number, namDanhGia: number, danhGia: string, nhanXet: string) => {
    return client.query(
        `INSERT INTO xep_loai_dv (vien_chuc_id, nam_danh_gia, danh_gia, nhan_xet)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (vien_chuc_id, nam_danh_gia)
        DO UPDATE SET danh_gia = $3, nhan_xet = $4`, [vienChucId, namDanhGia, danhGia, nhanXet]);
}
