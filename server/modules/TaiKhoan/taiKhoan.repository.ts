import pool from "../../config/db";
import { mapToCamel } from "../../utils/mapper";

export const TaiKhoanRepository = {
    findByVienChucId: async (vienChucId: number) => {
        const result = await pool.query(
            `SELECT id, ten_dang_nhap, vai_tro, trang_thai, vien_chuc_id
             FROM tai_khoan
             WHERE vien_chuc_id = $1`,
            [vienChucId]
        );
        return mapToCamel<any>(result.rows[0] ?? null);
    },

    updateVaiTro: async (id: number, vaiTro: string) => {
        const result = await pool.query(
            `UPDATE tai_khoan
             SET vai_tro = $1
             WHERE id = $2
             RETURNING id, ten_dang_nhap, vai_tro, vien_chuc_id`,
            [vaiTro, id]
        );
        return mapToCamel<any>(result.rows[0]);
    },
    findAll: async () => {
        const result = await pool.query(
            `SELECT tk.id, tk.ten_dang_nhap, tk.vai_tro, tk.trang_thai, tk.vien_chuc_id, vc.ho_va_ten
             FROM tai_khoan tk
             LEFT JOIN vien_chuc vc ON vc.id = tk.vien_chuc_id
             ORDER BY tk.id`
        );
        return result.rows.map((r) => mapToCamel<any>(r));
    },

    findById: async (id: number) => {
        const result = await pool.query(
            `SELECT id, ten_dang_nhap, vai_tro, trang_thai, vien_chuc_id, mat_khau
             FROM tai_khoan
             WHERE id = $1`,
            [id]
        );
        return mapToCamel<any>(result.rows[0] ?? null);
    },
 
    /** Khoá (0) hoặc mở khoá (1) tài khoản */
    updateTrangThai: async (id: number, trangThai: 0 | 1) => {
        const result = await pool.query(
            `UPDATE tai_khoan
             SET trang_thai = $1
             WHERE id = $2
             RETURNING id, ten_dang_nhap, vai_tro, trang_thai, vien_chuc_id`,
            [trangThai, id]
        );
        return mapToCamel<any>(result.rows[0]);
    },
 
    /** Cập nhật mật khẩu (đã hash sẵn từ service) */
    updateMatKhau: async (id: number, matKhauHash: string) => {
        await pool.query(
            `UPDATE tai_khoan
             SET mat_khau = $1
             WHERE id = $2`,
            [matKhauHash, id]
        );
    },
};
