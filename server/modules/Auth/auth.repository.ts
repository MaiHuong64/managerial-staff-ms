import pool from "../../config/db";
import { mapToCamel } from "../../utils/mapper";

export const AuthRepository = {
    findByUsername: async (username: string) => {
        const query = `
            SELECT t.id, t.ten_dang_nhap, t.mat_khau, t.vai_tro,
                t.vien_chuc_id,
                v.don_vi_id, v.ho_va_ten
            FROM tai_khoan t
            LEFT JOIN vien_chuc v ON v.id = t.vien_chuc_id
            WHERE t.ten_dang_nhap = $1`;
        const result = await pool.query(query, [username]);
        console.log(result.rows[0])
        return mapToCamel<any>(result.rows[0]);
    },

    checkExistUser: async (username: string) => {
        const result = await pool.query(
            "SELECT id FROM tai_khoan WHERE ten_dang_nhap = $1",
            [username]
        );
        return result.rows.length > 0;
    },

    createUser: async (username: string, hashedPassword: string, role: string, vienChucId: number) => {
        const result = await pool.query(
            `INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai, vien_chuc_id)
             VALUES ($1, $2, $3, 1, $4)
             RETURNING id, ten_dang_nhap, vai_tro`,
            [username, hashedPassword, role, vienChucId]
        );
        return mapToCamel<any>(result.rows[0]);
    }
};