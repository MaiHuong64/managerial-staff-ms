import pool from "../../config/db";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";
import { DinhDangFile, HoSoBoNhiem, UploadFileDTO } from "./hoSoBoNhiem.type";

export const getNextCode = async (client: any) => {
    const result = await client.query(
        `SELECT COALESCE(MAX(id), 0) AS max FROM ho_so_bo_nhiem`
    );
    const nextId = Number(result.rows[0].max) + 1;
    return 'HS' + nextId.toString().padStart(3, '0');
};
export const getHoSoBoNhiemById = async (client: any, id: number) => {
    const result = await client.query( 
        `SELECT hsbn.id, hsbn.ma_ho_so, hsbn.ngay_lap, hsbn.trang_thai, hsbn.ghi_chu,
        hsbn.chi_tiet_pa_id,
        vc.ho_va_ten, vc.ma_vien_chuc, cd.ten_chuc_danh, dv.ten_don_vi
        FROM ho_so_bo_nhiem hsbn
        JOIN chi_tiet_phuong_an ctpa ON hsbn.chi_tiet_pa_id = ctpa.id
        LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.id = ctpa.chi_tiet_bn_id
        LEFT JOIN vien_chuc vc ON vc.id = ctbn.vien_chuc_id
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
        LEFT JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
        LEFT JOIN don_vi dv ON dv.id = vc.don_vi_id
        WHERE hsbn.id = $1`,
        [id]
    );
    return mapToCamel<HoSoBoNhiem>(result.rows[0])
}
export const getChiTietHoSo = async (hoSoId: number) => {
    const result = await pool.query(
        `SELECT id, ten_tai_lieu, loai_tai_lieu, file_dinh_kem, ngay_cap_nhat
         FROM chi_tiet_ho_so WHERE ho_so_bn_id = $1 ORDER BY id`,
        [hoSoId]
    );
    return result.rows;
}
export const insertHoSoBoNhiem = async (client: any, maHoSo: string, chiTietPA: number, ghiChu: string | null) => {
    const result = await client.query(
        `INSERT INTO ho_so_bo_nhiem (ma_ho_so, ngay_lap, chi_tiet_pa_id, ghi_chu) VALUES ($1, $2, $3, $4) RETURNING *`,
        [maHoSo, new Date(), chiTietPA, ghiChu]
    );
    return mapToCamel(result.rows[0]);
}

export const getAllHoSo = async () => {
    const result =  await pool.query(`
        SELECT hsbn.id, hsbn.ma_ho_so, hsbn.ngay_lap, hsbn.trang_thai, hsbn.ghi_chu,
        hsbn.chi_tiet_pa_id,
        vc.ho_va_ten, vc.ma_vien_chuc, cd.ten_chuc_danh, dv.ten_don_vi,
        COUNT(cths.id)::int AS so_tai_lieu
        FROM ho_so_bo_nhiem hsbn JOIN chi_tiet_phuong_an ctpa ON hsbn.chi_tiet_pa_id = ctpa.id
        LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.id = ctpa.chi_tiet_bn_id
        LEFT JOIN vien_chuc vc ON vc.id = ctbn.vien_chuc_id
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
        LEFT JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
        LEFT JOIN don_vi dv ON dv.id = vc.don_vi_id
        LEFT JOIN chi_tiet_ho_so cths ON cths.ho_so_bn_id = hsbn.id
        GROUP BY hsbn.id, vc.ho_va_ten, vc.ma_vien_chuc, cd.ten_chuc_danh, dv.ten_don_vi
        ORDER BY hsbn.id DESC
    `)
    return mapArrayToCamel(result.rows);  
}
export const getHoSoByPhuongAnId = async (id: number) => {
    const result = await pool.query(`
         SELECT hsbn.id, hsbn.ma_ho_so, hsbn.ngay_lap, hsbn.trang_thai, hsbn.ghi_chu,
        hsbn.chi_tiet_pa_id,
        vc.ho_va_ten, vc.ma_vien_chuc, cd.ten_chuc_danh, dv.ten_don_vi,
        COUNT(cths.id)::int AS so_tai_lieu
        FROM ho_so_bo_nhiem hsbn JOIN chi_tiet_phuong_an ctpa ON hsbn.chi_tiet_pa_id = ctpa.id
        LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.id = ctpa.chi_tiet_bn_id
        LEFT JOIN vien_chuc vc ON vc.id = ctbn.vien_chuc_id
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
        LEFT JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
        LEFT JOIN don_vi dv ON dv.id = vc.don_vi_id
        LEFT JOIN chi_tiet_ho_so cths ON cths.ho_so_bn_id = hsbn.id
        WHERE ctpa.phuong_an_id = $1
        GROUP BY hsbn.id, vc.ho_va_ten, vc.ma_vien_chuc, cd.ten_chuc_danh, dv.ten_don_vi
        ORDER BY hsbn.id DESC
        `, [id]);
    return mapArrayToCamel(result.rows);
}

export const insertChiTieHS = async (client: any, hoSoId: string, payload: UploadFileDTO) => {
    const result = await client.query (`
        INSERT INTO chi_tiet_ho_so (ho_so_bn_id, ten_tai_lieu, loai_tai_lieu, file_dinh_kem, ngay_cap_nhat) VALUES($1, $2, $3, $4, $5) RETURNING *
    `, [hoSoId, payload.tenTaiLieu, payload.loaiTaiLieu, payload.fileDinhKem, new Date()])
    return mapToCamel(result.rows[0]);
}
export const checkHoSoExistsByChiTietPAId = async (client: any,id: number) => {
    const result = await client.query(`
        SELECT chi_tiet_pa_id FROM ho_so_bo_nhiem WHERE chi_tiet_pa_id = $1
    `, [id]);
    return result.rowCount > 0
}
export const deleteChiTietHoSo = async (client: any, taiLieuId: number) => {
    const resutl = await client.query(`
        DELETE FROM chi_tiet_ho_so WHERE id = $1 RETURNING file_dinh_kem`, [taiLieuId])
        return mapToCamel<DinhDangFile>(resutl.rows[0])
}
export const updateTrangThaiHoSo = async (client: any, id: number, trangThai: number) => {
    await client.query(`
        UPDATE ho_so_bo_nhiem
        SET trang_thai = $1
        WHERE id = $2
    `, [trangThai, id]);
}