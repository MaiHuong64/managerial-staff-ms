import { toCamel } from "snake-camel";
import pool from "../../config/db";
import * as DotQuyHoachDTO from "./dotQuyHoach.dto";
import { mapToCamel } from "../../utils/mapper";
import { PoolClient } from "pg";

export const getNextMaDQH = async (client: PoolClient) => {
    const result = await client.query(
        `SELECT COALESCE(MAX(id), 0) AS max FROM dot_quy_hoach`
    )
    const nextId = Number(result.rows[0].max) + 1;
    return 'DQH' + nextId.toString().padStart(3, '0');
}

export const getDotQuyHoachById = async (id: number) => {
    const result = await pool.query(
        `SELECT * FROM dot_quy_hoach WHERE id = $1`, [id]
    );
    return mapToCamel<DotQuyHoachDTO.DotQuyHoachDTO>(result.rows[0]);
}

export const getAllDotQuyHoach = async () => {
    const result = await pool.query(
        `select d.*, count(c.vien_chuc_id) as so_luong
        from dot_quy_hoach d left join chi_tiet_quy_hoach c on d.id = c.dot_quy_hoach_id
        group by d.id`
    )
    return result.rows.map(toCamel);
}
export const getChiTietDotQuyHoach = async (id: number) => {
    const result = await pool.query(
        `SELECT
            ct.id AS chi_tiet_id, ct.dot_quy_hoach_id, ct.trang_thai, ct.buoc_hien_tai,
            dv.id AS don_vi_id, dv.ten_don_vi,
            cd.id AS chuc_danh_id, cd.ten_chuc_danh,
            vc.id AS vien_chuc_id, vc.ho_va_ten, vc.ma_vien_chuc
        FROM chi_tiet_quy_hoach ct
        JOIN vien_chuc vc ON vc.id = ct.vien_chuc_id
        JOIN chuc_danh_quan_ly cd ON cd.id = ct.chuc_danh_id
        JOIN don_vi dv  ON dv.id = ct.don_vi_id
        WHERE ct.dot_quy_hoach_id = $1
        ORDER BY dv.id, cd.id, vc.id`,
        [id]
    )
    return result.rows.map(toCamel);
}

export const insertDotQuyHoach = async (client: PoolClient, payload: DotQuyHoachDTO.CreateDotQuyHoachDTO) => {
    const maDotQuyHoach = await getNextMaDQH(client);
    const result = await client.query(
       `INSERT INTO dot_quy_hoach
        (ma_quy_hoach, ten_quy_hoach, loai_quy_hoach, nam_thuc_hien, nhiem_ky,
         so_qd_phe_duyet, ngay_qd_phe_duyet, trang_thai, dot_goc_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [maDotQuyHoach, payload.tenQuyHoach, payload.loaiQuyHoach, payload.namThucHien,
         payload.nhiemKy, payload.soQdPheDuyet, payload.ngayQdPheDuyet, 0, payload.dotGocId ?? null]
    )
    return mapToCamel<DotQuyHoachDTO.DotQuyHoachDTO>(result.rows[0]);
}


export const getLoaiQuyHoach = async (client: PoolClient, dotQuyHoachId: number) => {
    const dotQH = await client.query(
        `SELECT loai_quy_hoach FROM dot_quy_hoach WHERE id = $1`,
        [dotQuyHoachId]
    );
    return dotQH.rows[0]?.loai_quy_hoach;

}

export const getVienChucByChucDanhId = async (chucDanhId: number) => {
    const result = await pool.query (
        `SELECT vc.id, vc.ma_vien_chuc, vc.ho_va_ten, dv.ten_don_vi, ctqh.id AS chi_tiet_qh_id
        FROM chi_tiet_quy_hoach ctqh
        JOIN vien_chuc vc ON vc.id = ctqh.vien_chuc_id
        JOIN don_vi dv ON dv.id = ctqh.don_vi_id
        WHERE ctqh.chuc_danh_id = $1 AND ctqh.trang_thai = 1
        `, [chucDanhId]
    )
    return result.rows.map(toCamel);
}

export const filterVienChuc = async (donViId: number, dotQuyHoachId: number) => {
    const result = await pool.query(
        `SELECT * 
        FROM vien_chuc
        WHERE don_vi_id = $1 AND id NOT IN ( SELECT vien_chuc_id
									FROM chi_tiet_quy_hoach 
									WHERE dot_quy_hoach_id = $2 AND trang_thai = 1)`
        ,[donViId, dotQuyHoachId])
    return result.rows.map(toCamel);
}

export const updatePheDuyetDotQuyHoach = async (dotQuyHoachId: number, soQdPheDuyet: string, ngayQdPheDuyet: Date) => {
    const result = await pool.query(
        `UPDATE dot_quy_hoach
         SET so_qd_phe_duyet = $1, ngay_qd_phe_duyet = $2, trang_thai = 2
         WHERE id = $3
         RETURNING *`,
        [soQdPheDuyet, ngayQdPheDuyet, dotQuyHoachId]
    );
    return mapToCamel<DotQuyHoachDTO.DotQuyHoachDTO>(result.rows[0]);
}
// ====================QT169=============================
export const insertUngVien_QT169 = async (client: PoolClient, dotQuyHoachId: number, vienChucId: number, chucDanhId: number, donViId: number, buocBatDau: number) => {
        await client.query(
            `INSERT INTO chi_tiet_quy_hoach (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id, don_vi_id, ngay_vao_qh, buoc_hien_tai, trang_thai)
             VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 1)`,
            [dotQuyHoachId, vienChucId, chucDanhId, donViId, buocBatDau]
        );
}
// ====================QT170=============================

export const getDotQuyHoachGoc = async () => {
    const result = await pool.query(
        `select d.* 
        from dot_quy_hoach d left join chi_tiet_quy_hoach c on d.id = c.dot_quy_hoach_id
        where d.loai_quy_hoach = 1
        group by d.id`
    )
    return result.rows.map(toCamel);
}
// Quy trình 170: Lấy danh sách được phê duyệt từ đợt 169 để thêm vào đợt 170
export const copyChiTietFromDotGoc = async (client: PoolClient, dotRaSoatId: number, dotGocId: number) => {
    await client.query(
        `INSERT INTO chi_tiet_quy_hoach
             (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id, don_vi_id,
              ngay_vao_qh, loai_nguon, buoc_hien_tai, trang_thai)
         SELECT $1, vien_chuc_id, chuc_danh_id, don_vi_id, ngay_vao_qh, 2, 1, 1
         FROM chi_tiet_quy_hoach
         WHERE dot_quy_hoach_id = $2 AND trang_thai = 1 AND buoc_hien_tai = 6
         ON CONFLICT (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id) DO NOTHING`,
        [dotRaSoatId, dotGocId]
    );
}
// Quy trình 170: Thêm ứng viên vào đợt quy hoạch
export const insertUngVien_QT170 = async (client: PoolClient, payload: DotQuyHoachDTO.CreateUngVienDTO)=> {
    const result = await client.query(
        `INSERT INTO chi_tiet_quy_hoach
        (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id, don_vi_id,
        ngay_vao_qh, loai_nguon, buoc_hien_tai, trang_thai) VALUES ($1, $2, $3, $4, $5, 1, 2, 1)
        ON CONFLICT  (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id) DO NOTHING
        RETURNING id`, [payload.dotQuyHoachId, payload.vienChucId, payload.chucDanhId, payload.donViId, payload.ngayVaoQH]
    )
    return mapToCamel<DotQuyHoachDTO.CreateUngVienDTO>(result.rows[0]);
}
