import pool from "../../config/db";

export const AuthRepository = {
    findByUsername: async (username: string) => {
        const query = `
            SELECT v.id, t.ten_dang_nhap, t.mat_khau, t.vai_tro,
                   v.don_vi_id, v.ho_va_ten
            FROM tai_khoan t
            JOIN vien_chuc v ON v.ma_vien_chuc = t.ten_dang_nhap
            WHERE t.ten_dang_nhap = $1
        `;
        const result = await pool.query(query, [username]);
        return result.rows[0];
    },

    checkExistUser: async (username: string) => {
        const result = await pool.query(
            "SELECT id FROM tai_khoan WHERE ten_dang_nhap = $1",
            [username]
        );
        return result.rows.length > 0;
    },

    createUser: async (username: string, hashedPassword: string, role: string) => {
        const result = await pool.query(
            `INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai)
             VALUES ($1, $2, $3, 1)
             RETURNING id, ten_dang_nhap, vai_tro`,
            [username, hashedPassword, role]
        );
        return result.rows[0];
    }
};