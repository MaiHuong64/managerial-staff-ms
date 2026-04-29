import { PoolClient } from "pg";
import pool from "../../config/db"
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper"
import { CreateXepLoaiDTO } from "./xepLoai.type";

export const getChiTietXepLoaiVC = async (vienChucId: number) => {
    const result = await pool.query(
        `SELECT xl.*,
        vc.ma_vien_chuc, vc.ho_va_ten,
        dv.ten_don_vi
        FROM xep_loai_vc xl
        JOIN vien_chuc vc ON xl.vien_chuc_id = vc.id
        JOIN don_vi dv ON vc.don_vi_id = dv.id
        WHERE vc.id = $1
        `, [vienChucId]
    )
    return mapArrayToCamel<any>(result.rows);
}
export const getDanhSachXepLoaiVC = async () => {
    const result = await pool.query(
        `SELECT xl.*, vc.ma_vien_chuc, vc.ho_va_ten, dv.ten_don_vi
        FROM xep_loai_vc xl
        JOIN vien_chuc vc ON xl.vien_chuc_id = vc.id
        JOIN don_vi dv ON vc.don_vi_id = dv.id
        ORDER BY xl.nam_danh_gia DESC, vc.ho_va_ten
        `);
    return mapArrayToCamel<any>(result.rows);
};
export const createXepLoaiVC = async (client: PoolClient, payload: CreateXepLoaiDTO) => {
    const result = await client.query(`INSERT INTO xep_loai_vc (vien_chuc_id, nam_danh_gia, danh_gia, nhan_xet)
        VALUES ($1, $2, $3, $4)
        RETURNING *`, [payload.vienChucId, payload.namDanhGia, payload.danhGia, payload.nhanXet])
    return mapToCamel(result.rows[0])
}
export const deleteXepLoaiVC = async (client: PoolClient, id: number) => {
    await client.query(`DELETE FROM xep_loai_vc WHERE id = $1`, [id]);
};

export const getChiTietXepLoaiDV = async (vienChucId: number) => {
    const result = await pool.query(
        `SELECT xl.*, vc.ma_vien_chuc, vc.ho_va_ten,
        dv.ten_don_vi
        FROM xep_loai_dang_vien  xl
        JOIN vien_chuc vc ON xl.vien_chuc_id = vc.id
        JOIN don_vi dv ON vc.don_vi_id = dv.id
        WHERE vc.id = $1
        `, [vienChucId]
    )
    return mapArrayToCamel<any>(result.rows);
}
export const getAllXepLoaiDV = async () => {
    const result = await pool.query(
        `SELECT xl.*, vc.ma_vien_chuc, vc.ho_va_ten, dv.ten_don_vi
        FROM xep_loai_dang_vien  xl
        JOIN vien_chuc vc ON xl.vien_chuc_id = vc.id
        JOIN don_vi dv ON vc.don_vi_id = dv.id
        ORDER BY xl.nam_danh_gia DESC, vc.ho_va_ten
        `);
    return mapArrayToCamel<any>(result.rows);
};
export const createXepLoaiDV = async (client: PoolClient, payload: CreateXepLoaiDTO) => {
    const result = await client.query(`INSERT INTO xep_loai_dang_vien  (vien_chuc_id, nam_danh_gia, danh_gia, nhan_xet)
        VALUES ($1, $2, $3, $4)
        RETURNING *`, [payload.vienChucId, payload.namDanhGia, payload.danhGia, payload.nhanXet])
    return mapToCamel(result.rows[0])
}
export const deleteXepLoaiDV = async (client: PoolClient, id: number) => {
    await client.query(`DELETE FROM xep_loai_dang_vien  WHERE id = $1`, [id]);
};