import { PoolClient } from "pg";
import pool from "../../config/db";
import { CreateStaffDTO, UpdateStaffDTO } from "./vienChuc.dto";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";

export const findAll = async () => {
    const result = await pool.query(`
        SELECT
            vc.id, vc.ma_vien_chuc, vc.ho_va_ten, vc.ngay_sinh, vc.ngach, vc.trinh_do_chuyen_mon,
            dv.ten_don_vi,
            nk.ten_chuc_vu AS chuc_vu_hien_tai
        FROM vien_chuc vc
        JOIN don_vi dv ON vc.don_vi_id = dv.id
        LEFT JOIN (
            SELECT
                nkcv.vien_chuc_id,
                cd.ten_chuc_danh AS ten_chuc_vu
            FROM nhiem_ky_chuc_vu nkcv
            JOIN chuc_danh_quan_ly cd ON nkcv.chuc_danh_id = cd.id
            WHERE nkcv.trang_thai = 1
        ) nk ON nk.vien_chuc_id = vc.id
    `);
    return mapArrayToCamel(result.rows);
};

export const findById = async (id: number) => {
    const result = await pool.query(
        `SELECT * FROM vien_chuc WHERE id = $1`,
        [id]
    );
    return mapToCamel(result.rows[0] ?? null);
};

export const findProfileData = async (uid: number) => {
    const tkResult = await pool.query(
        `SELECT vien_chuc_id FROM tai_khoan WHERE id = $1`,
        [uid]
    );
    const vcId = tkResult.rows[0]?.vien_chuc_id;
    if (!vcId) return null;
    const [profile, history, staffEval, partyEval] = await Promise.all([
        pool.query(`
            SELECT vc.*, dv.ten_don_vi, cd.ten_chuc_danh,
                   nk.ngay_bat_dau, nk.ngay_ket_thuc,
                   qd.so_quyet_dinh, tk.vai_tro
            FROM vien_chuc vc
            LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
            LEFT JOIN nhiem_ky_chuc_vu nk ON vc.id = nk.vien_chuc_id AND nk.trang_thai = 1
            LEFT JOIN chuc_danh_quan_ly cd ON cd.id = nk.chuc_danh_id
            LEFT JOIN qd_bo_nhiem qd ON qd.id = nk.qd_bo_nhiem_id
            LEFT JOIN tai_khoan tk ON tk.ten_dang_nhap = vc.ma_vien_chuc
            WHERE vc.id = $1
        `, [vcId]),

        pool.query(`
            SELECT vc.*, dv.ten_don_vi, cd.ten_chuc_danh,
                   nk.ngay_bat_dau, nk.ngay_ket_thuc, qd.so_quyet_dinh
            FROM vien_chuc vc
            LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
            LEFT JOIN nhiem_ky_chuc_vu nk ON vc.id = nk.vien_chuc_id
            LEFT JOIN chuc_danh_quan_ly cd ON cd.id = nk.chuc_danh_id
            LEFT JOIN qd_bo_nhiem qd ON qd.id = nk.qd_bo_nhiem_id
            WHERE vc.id = $1
            ORDER BY nk.ngay_bat_dau DESC
        `, [vcId]),

        pool.query(`
            SELECT nam_danh_gia, danh_gia, nhan_xet
            FROM xep_loai_vc
            WHERE vien_chuc_id = $1
            ORDER BY nam_danh_gia DESC
        `, [vcId]),

        pool.query(`
            SELECT nam_danh_gia, danh_gia, nhan_xet
            FROM xep_loai_dang_vien
            WHERE vien_chuc_id = $1
            ORDER BY nam_danh_gia DESC
            LIMIT 3
        `, [vcId]),
    ]);

    return {
        profile: mapToCamel(profile.rows[0] ?? null),
        lichSuChucVu: mapArrayToCamel(history.rows),
        xepLoaiVc: mapArrayToCamel(staffEval.rows),
        xepLoaiDangVien: mapArrayToCamel(partyEval.rows),
    };
};

export const getNextStaffCode = async (client: PoolClient): Promise<string> => {
    const result = await client.query(
        `SELECT COALESCE(MAX(id), 0) AS max FROM vien_chuc`
    );
    const nextId = Number(result.rows[0].max) + 1;
    return nextId.toString().padStart(4, "0");
};

export const insertVienChuc = async (
    client: PoolClient,
    ma_vien_chuc: string,
    data: CreateStaffDTO
) => {
    const result = await client.query(
        `INSERT INTO vien_chuc (
            ma_vien_chuc, ho_va_ten, gioi_tinh, ngay_sinh, dan_toc,
            so_cccd, so_dien_thoai, email, dia_chi,
            trinh_do_chuyen_mon, chuyen_nganh, ngach, nam_tot_nghiep,
            trinh_do_ly_luan_CT, trinh_do_ngoai_ngu, trinh_do_tin_hoc,
            ngay_ket_nap, ngay_chinh_thuc, don_vi_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        RETURNING id, ma_vien_chuc, ho_va_ten`,
        [
            ma_vien_chuc, data.hoVaTen, data.gioiTinh, data.ngaySinh,
            data.danToc, data.soCccd, data.soDienThoai, data.email,
            data.diaChi, data.trinhDoChuyenMon, data.chuyenNganh,
            data.ngach, data.namTotNghiep, data.trinhDoLyLuanCT,
            data.trinhDoNgoaiNgu, data.trinhDoTinHoc,
            data.ngayKetNap, data.ngayChinhThuc, data.donViId,
        ]
    );
    return result.rows[0];
};

export const insertTaiKhoan = async (
    client: PoolClient,
    ma_vien_chuc: string,
    mat_khau: string,
    vien_chuc_id: number
) => {
    await client.query(
        `INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai, vien_chuc_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [ma_vien_chuc, mat_khau, "VC", 1, vien_chuc_id]
    );
};

export const updateById = async (id: number, fields: UpdateStaffDTO) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    const result = await pool.query(
        `UPDATE vien_chuc SET ${setClauses} WHERE id = $${values.length + 1}
         RETURNING id, ma_vien_chuc, ho_va_ten`,
        [...values, id]
    );
    return result.rows[0] ?? null;
};

export const softDeleteById = async (id: number) => {
    await pool.query(
        `UPDATE vien_chuc SET trang_thai = 0 WHERE id = $1`,
        [id]
    );
};
export const getVienChucByDonVi = async (donViId: number) => {
    const res = await pool.query(
        `SELECT * FROM vien_chuc WHERE don_vi_id = $1`, [donViId]
    )
    return res.rows;
}