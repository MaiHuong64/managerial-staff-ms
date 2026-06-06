import { PoolClient } from "pg";
import pool from "../../config/db";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";
import { CreateDonViDTO, DonViDTO } from "./donVi.dto";

export const getAllDonVi = async (): Promise<DonViDTO[]> => {
    const result = await pool.query(
    `  SELECT dv.*,
        (
            SELECT vc.ho_va_ten
            FROM nhiem_ky_chuc_vu nk
            JOIN vien_chuc vc ON nk.vien_chuc_id = vc.id
            JOIN chuc_danh_quan_ly cd ON nk.chuc_danh_id = cd.id
            WHERE nk.trang_thai = 1 
                AND cd.ten_chuc_danh ILIKE 'Trưởng%'
                AND vc.don_vi_id = dv.id
            LIMIT 1
        ) AS ten_truong_don_vi,
        (
            SELECT STRING_AGG(vc.ho_va_ten, ', ')
            FROM nhiem_ky_chuc_vu nk
            JOIN vien_chuc vc ON nk.vien_chuc_id = vc.id
            JOIN chuc_danh_quan_ly cd ON nk.chuc_danh_id = cd.id
            WHERE nk.trang_thai = 1 
                AND cd.ten_chuc_danh ILIKE 'Phó%'
                AND vc.don_vi_id = dv.id
        ) AS ten_pho_don_vi
        FROM don_vi dv
        WHERE dv.trang_thai = 1
        ORDER BY dv.id DESC`
        );
    return mapArrayToCamel<DonViDTO>(result.rows);
};

export const getDonViById = async (id: number): Promise<DonViDTO | null> => {
    const result = await pool.query(
    ` SELECT dv.*,
        (
            SELECT vc.ho_va_ten
            FROM nhiem_ky_chuc_vu nk
            JOIN vien_chuc vc ON nk.vien_chuc_id = vc.id
            JOIN chuc_danh_quan_ly cd ON nk.chuc_danh_id = cd.id
            WHERE nk.trang_thai = 1 
                AND cd.ten_chuc_danh ILIKE 'Trưởng%'
                AND vc.don_vi_id = dv.id
            LIMIT 1
        ) AS ten_truong_don_vi,
        (
            SELECT STRING_AGG(vc.ho_va_ten, ', ')
            FROM nhiem_ky_chuc_vu nk
            JOIN vien_chuc vc ON nk.vien_chuc_id = vc.id
            JOIN chuc_danh_quan_ly cd ON nk.chuc_danh_id = cd.id
            WHERE nk.trang_thai = 1 
                AND cd.ten_chuc_danh ILIKE 'Phó%'
                AND vc.don_vi_id = dv.id
        ) AS ten_pho_don_vi
        FROM don_vi dv
        WHERE dv.id = $1 AND dv.trang_thai = 1`, [id]);
    return mapToCamel<DonViDTO>(result.rows[0]) ?? null;
};
export const createCode = async (client: PoolClient) => {
    const result = await client.query(
        `SELECT COALESCE(MAX(id), 0) as max FROM don_vi`
    );
    const nextId = Number(result.rows[0].max) + 1;
    return 'DV' + nextId.toString().padStart(3, '0');
};
export const createDonVi = async (client: PoolClient, payload: CreateDonViDTO) => {
    const maDonVi = await createCode(client);
    const result = await client.query(
        `INSERT INTO don_vi (ma_don_vi, ten_don_vi, loai_don_vi, don_vi_cha_id, so_dien_thoai, email, dia_chi)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [maDonVi, payload.tenDonVi, payload.loaiDonVi, payload.donViCha, payload.soDienThoai, payload.email, payload.diaChi]
    );
    return mapToCamel<DonViDTO>(result.rows[0]);
}
export const updateDonVi = async (client: PoolClient, id: number, payload: CreateDonViDTO) => {
    const result = await client.query(
        `UPDATE don_vi SET ten_don_vi = $1, loai_don_vi = $2, don_vi_cha_id = $3, so_dien_thoai = $4, email = $5, dia_chi = $6
        WHERE id = $7 RETURNING *`,
        [payload.tenDonVi, payload.loaiDonVi, payload.donViCha, payload.soDienThoai, payload.email, payload.diaChi, id]
    );
    return mapToCamel<DonViDTO>(result.rows[0]);
}
export const deleteDonVi = async (client: PoolClient, id: number) => {
    await client.query(`UPDATE don_vi SET trang_thai = 0 WHERE id = $1`, [id]);
}