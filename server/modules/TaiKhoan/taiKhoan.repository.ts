import { PoolClient } from "pg";
import pool from "../../config/db";
import { mapToCamel } from "../../utils/mapper";

export const findByVienChucId = async (vienChucId: number) => {
    const result = await pool.query(
        `SELECT id, ten_dang_nhap, vai_tro, trang_thai, vien_chuc_id
         FROM tai_khoan
         WHERE vien_chuc_id = $1`,
        [vienChucId]
    );
    return mapToCamel<any>(result.rows[0] ?? null);
};

export const updateVaiTro = async (id: number, vaiTro: string) => {
    const result = await pool.query(
        `UPDATE tai_khoan
         SET vai_tro = $1
         WHERE id = $2
         RETURNING id, ten_dang_nhap, vai_tro, vien_chuc_id`,
        [vaiTro, id]
    );
    return mapToCamel<any>(result.rows[0]);
};

export const findAll = async () => {
    const result = await pool.query(
        `SELECT tk.id, tk.ten_dang_nhap, tk.vai_tro, tk.trang_thai, tk.vien_chuc_id, vc.ho_va_ten
         FROM tai_khoan tk
         LEFT JOIN vien_chuc vc ON vc.id = tk.vien_chuc_id
         ORDER BY tk.id`
    );
    return result.rows.map((r) => mapToCamel<any>(r));
};

export const findById = async (id: number) => {
    const result = await pool.query(
        `SELECT id, ten_dang_nhap, vai_tro, trang_thai, vien_chuc_id, mat_khau
         FROM tai_khoan
         WHERE id = $1`,
        [id]
    );
    return mapToCamel<any>(result.rows[0] ?? null);
};

/** Khoá (0) hoặc mở khoá (1) tài khoản */
export const updateTrangThai = async (id: number, trangThai: 0 | 1) => {
    const result = await pool.query(
        `UPDATE tai_khoan
         SET trang_thai = $1
         WHERE id = $2
         RETURNING id, ten_dang_nhap, vai_tro, trang_thai, vien_chuc_id`,
        [trangThai, id]
    );
    return mapToCamel<any>(result.rows[0]);
};

/** Cập nhật mật khẩu (đã hash sẵn từ service) */
export const updateMatKhau = async (id: number, matKhauHash: string) => {
    await pool.query(
        `UPDATE tai_khoan
         SET mat_khau = $1
         WHERE id = $2`,
        [matKhauHash, id]
    );
};

export const insertTaiKhoan = async (client: PoolClient, vienChucId: number, maVienChuc: string, matKhau: string) => {
    // const matKhauHash = await bcrypt.hash(matKhau, 10);
    const result = await client.query (
        `INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai, vien_chuc_id)
         VALUES ($1, $2,'VC', 1, $3)
         RETURNING id, ten_dang_nhap, vai_tro, trang_thai, vien_chuc_id`,
        [maVienChuc, matKhau, vienChucId]
    );
    return mapToCamel<any>(result.rows[0]);
};