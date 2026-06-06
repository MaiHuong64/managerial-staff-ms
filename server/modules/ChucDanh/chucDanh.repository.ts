import { PoolClient } from "pg";
import pool from "../../config/db";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";
import * as ChucDanhDTO from "./chucDanh.dto";

export const getAllChucDanh = async (): Promise<ChucDanhDTO.ChucDanhDTO[]> => {
    const result = await pool.query(
        `SELECT * FROM chuc_danh_quan_ly WHERE trang_thai = 1
         ORDER BY id`
    );
    return mapArrayToCamel<ChucDanhDTO.ChucDanhDTO>(result.rows);
};

export const getChucDanhById = async (id: number): Promise<ChucDanhDTO.ChucDanhDTO | null> => {
    const result = await pool.query(
        `SELECT id, ma_chuc_danh, ten_chuc_danh, thoi_han_giu_chuc_vu, he_so_phu_cap 
         FROM chuc_danh_quan_ly WHERE id = $1 AND trang_thai = 1`,
        [id]
    );
    return mapToCamel(result.rows[0] ?? null);
};

export const getNextMaCD = async (): Promise<string> => {
    const result = await pool.query(
        `SELECT COALESCE(MAX(id), 0) AS max FROM chuc_danh_quan_ly`
    );
    const nextId = Number(result.rows[0].max) + 1;
    return `CD${nextId.toString().padStart(3, '0')}`;
};

export const insertChucDanh = async (client: PoolClient, payload: ChucDanhDTO.CreateChucDanhDTO): Promise<ChucDanhDTO.ChucDanhDTO> => {
    const maChucDanh = await getNextMaCD();
    const result = await client.query(
        `INSERT INTO chuc_danh_quan_ly (ma_chuc_danh, ten_chuc_danh, thoi_han_giu_chuc_vu, he_so_phu_cap, trang_thai)
         VALUES ($1, $2, $3, $4, 1)
         RETURNING id, ma_chuc_danh, ten_chuc_danh, thoi_han_giu_chuc_vu, he_so_phu_cap`,
        [maChucDanh, payload.tenChucDanh, payload.thoiHanGiuChucVu, payload.heSoPhuCap]
    );
    return mapToCamel(result.rows[0]);
};

export const updateChucDanh = async (client: PoolClient, id: number, payload: ChucDanhDTO.UpdateChucDanhDTO): Promise<ChucDanhDTO.ChucDanhDTO | null> => {
    const result = await client.query(
        `UPDATE chuc_danh_quan_ly SET
            ten_chuc_danh = $1,
            thoi_han_giu_chuc_vu = $2,
            he_so_phu_cap = $3
         WHERE id = $4
         RETURNING id, ma_chuc_danh, ten_chuc_danh, thoi_han_giu_chuc_vu, he_so_phu_cap`,
        [payload.tenChucDanh, payload.thoiHanGiuChucVu, payload.heSoPhuCap, id]
    );
    return mapToCamel(result.rows[0] ?? null);
};

export const deleteChucDanh = async (id: number)=> {
    await pool.query(
        `UPDATE chuc_danh_quan_ly 
        SET trang_thai = 0 
        WHERE id = $1`, [id]);
};