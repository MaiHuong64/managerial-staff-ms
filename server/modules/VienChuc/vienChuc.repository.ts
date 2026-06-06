import { PoolClient } from "pg";
import pool from "../../config/db";
import { CreateStaffDTO, UpdateStaffDTO } from "./vienChuc.dto";
import { mapArrayToCamel, mapToCamel, mapToSnake } from "../../utils/mapper";

export const findAll = async () => {
    const result = await pool.query(`
        SELECT
            vc.id, vc.ma_vien_chuc, vc.ho_va_ten, vc.ngay_sinh, vc.ngach, vc.trinh_do_chuyen_mon,
            dv.ten_don_vi,
            nk.ten_chuc_vu AS chuc_vu_hien_tai
        FROM vien_chuc vc
        JOIN don_vi dv ON vc.don_vi_id = dv.id
        LEFT JOIN (
            SELECT DISTINCT ON (nkcv.vien_chuc_id)
                nkcv.vien_chuc_id,
                cd.ten_chuc_danh AS ten_chuc_vu
            FROM nhiem_ky_chuc_vu nkcv
            JOIN chuc_danh_quan_ly cd ON nkcv.chuc_danh_id = cd.id
            WHERE nkcv.trang_thai = 1
            ORDER BY nkcv.vien_chuc_id, nkcv.id DESC -- lấy record mới nhất
        ) nk ON nk.vien_chuc_id = vc.id
        WHERE vc.trang_thai = 1
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
            WHERE vc.id = $1 AND vc.trang_thai = 1`, [vcId]),

        pool.query(`
            SELECT vc.*, dv.ten_don_vi, cd.ten_chuc_danh,
                   nk.ngay_bat_dau, nk.ngay_ket_thuc, qd.so_quyet_dinh
            FROM vien_chuc vc
            LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
            LEFT JOIN nhiem_ky_chuc_vu nk ON vc.id = nk.vien_chuc_id
            LEFT JOIN chuc_danh_quan_ly cd ON cd.id = nk.chuc_danh_id
            LEFT JOIN qd_bo_nhiem qd ON qd.id = nk.qd_bo_nhiem_id
            WHERE vc.id = $1 AND vc.trang_thai = 1
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

export const insertVienChuc = async ( client: PoolClient, maVienChuc: string, data: CreateStaffDTO): Promise<{ id: number; maVienChuc: string; hoVaTen: string }> => {
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
            maVienChuc, data.hoVaTen, data.gioiTinh, data.ngaySinh,
            data.danToc, data.soCccd, data.soDienThoai, data.email,
            data.diaChi, data.trinhDoChuyenMon, data.chuyenNganh,
            data.ngach, data.namTotNghiep, data.trinhDoLyLuanCt,
            data.trinhDoNgoaiNgu, data.trinhDoTinHoc,
            data.ngayKetNap, data.ngayChinhThuc, data.donViId,
        ]
    );
    return mapToCamel(result.rows[0]);
};

export const updateById = async (id: number, payload: UpdateStaffDTO) => {
    const result = await pool.query(
        `UPDATE vien_chuc SET
            ho_va_ten = $1, gioi_tinh = $2,ngay_sinh = $3, dan_toc = $4, so_dien_thoai = $5,
            email = $6, dia_chi = $7, trinh_do_chuyen_mon = $8, chuyen_nganh = $9, ngach = $10,
            nam_tot_nghiep = $11, trinh_do_ly_luan_ct = $12, trinh_do_ngoai_ngu = $13, trinh_do_tin_hoc = $14, ngay_ket_nap = $15,ngay_chinh_thuc = $16, don_vi_id = $17
        WHERE id = $18
        RETURNING id, ma_vien_chuc, ho_va_ten`,
        [payload.hoVaTen, payload.gioiTinh, payload.ngaySinh,
            payload.danToc, payload.soDienThoai, payload.email,
            payload.diaChi, payload.trinhDoChuyenMon, payload.chuyenNganh,
            payload.ngach, payload.namTotNghiep, payload.trinhDoLyLuanCt,
            payload.trinhDoNgoaiNgu, payload.trinhDoTinHoc,
            payload.ngayKetNap, payload.ngayChinhThuc, payload.donViId,
            id]
    );
    return mapToCamel(result.rows[0] ?? null);
};

export const softDeleteById = async (id: number) => {
    await pool.query(
        `UPDATE vien_chuc SET trang_thai = 0 WHERE id = $1`,
        [id]
    );
};
export const getVienChucByDonVi = async (donViId: number) => {
    const res = await pool.query(
        `SELECT
            vc.id, vc.ma_vien_chuc, vc.ho_va_ten, vc.ngay_sinh, vc.ngach, vc.trinh_do_chuyen_mon,
            dv.ten_don_vi,
            nk.ten_chuc_vu AS chuc_vu_hien_tai
        FROM vien_chuc vc
        JOIN don_vi dv ON vc.don_vi_id = dv.id
        LEFT JOIN (
            SELECT nkcv.vien_chuc_id, cd.ten_chuc_danh AS ten_chuc_vu
            FROM nhiem_ky_chuc_vu nkcv
            JOIN chuc_danh_quan_ly cd ON nkcv.chuc_danh_id = cd.id
            WHERE nkcv.trang_thai = 1
        ) nk ON nk.vien_chuc_id = vc.id
        WHERE vc.don_vi_id = $1 AND vc.trang_thai = 1`, [donViId]
    )
    return mapArrayToCamel(res.rows);
}


export const findHoSoVienChuc = async (vienChucId: number) => {
    const [profile, history, staffEval, partyEval] = await Promise.all([
        pool.query(`
            SELECT vc.*, dv.ten_don_vi, cd.ten_chuc_danh,
                   nk.ngay_bat_dau, nk.ngay_ket_thuc,
                   qd.so_quyet_dinh
            FROM vien_chuc vc
            LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
            LEFT JOIN nhiem_ky_chuc_vu nk ON vc.id = nk.vien_chuc_id AND nk.trang_thai = 1
            LEFT JOIN chuc_danh_quan_ly cd ON cd.id = nk.chuc_danh_id
            LEFT JOIN qd_bo_nhiem qd ON qd.id = nk.qd_bo_nhiem_id
            LEFT JOIN tai_khoan tk ON tk.ten_dang_nhap = vc.ma_vien_chuc
            WHERE vc.id = $1 AND vc.trang_thai = 1
        `, [vienChucId]),

        pool.query(`
            SELECT vc.*, dv.ten_don_vi, cd.ten_chuc_danh,
                   nk.ngay_bat_dau, nk.ngay_ket_thuc, qd.so_quyet_dinh
            FROM vien_chuc vc
            LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
            LEFT JOIN nhiem_ky_chuc_vu nk ON vc.id = nk.vien_chuc_id
            LEFT JOIN chuc_danh_quan_ly cd ON cd.id = nk.chuc_danh_id
            LEFT JOIN qd_bo_nhiem qd ON qd.id = nk.qd_bo_nhiem_id
            WHERE vc.id = $1 AND vc.trang_thai = 1
            ORDER BY nk.ngay_bat_dau DESC
        `, [vienChucId]),

        pool.query(`
            SELECT nam_danh_gia, danh_gia, nhan_xet
            FROM xep_loai_vc
            WHERE vien_chuc_id = $1
            ORDER BY nam_danh_gia DESC
        `, [vienChucId]),

        pool.query(`
            SELECT nam_danh_gia, danh_gia, nhan_xet
            FROM xep_loai_dang_vien
            WHERE vien_chuc_id = $1
            ORDER BY nam_danh_gia DESC
        `, [vienChucId]),
    ]);

    return {
        profile: mapToCamel(profile.rows[0] ?? null),
        lichSuChucVu: mapArrayToCamel(history.rows),
        xepLoaiVc: mapArrayToCamel(staffEval.rows),
        xepLoaiDangVien: mapArrayToCamel(partyEval.rows),
    };
};