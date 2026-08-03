import { toCamel } from "snake-camel";
import pool from "../../config/db";
import { CreatePhieuChuTruongDTO } from "./phieuChuTruong.dto";

export const nextBatchCode = async (client: any) => {
    const result = await client.query(
         `SELECT COALESCE(MAX(id), 0) as max FROM phieu_chu_truong`
    )
    const nextId = Number(result.rows[0].max) + 1;
    return "PCT" + nextId.toString().padStart(3, '0');
}
 

export const getAllPhieuChuTruong = async () => {
    const result = await pool.query(
        `SELECT pct.id, pct.tieu_de, pct.trang_thai, dv.ten_don_vi, cd.ten_chuc_danh, vc.ho_va_ten, vc.ma_vien_chuc, cd.id AS chuc_danh_id
        FROM phieu_chu_truong pct
        LEFT JOIN don_vi dv ON pct.don_vi_id = dv.id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
        LEFT JOIN vien_chuc vc ON vc.id = pct.vien_chuc_id`
    )
    return result.rows.map(toCamel);
}


export const getPhieuChuTruongById = async (id: number) => {
    const result = await pool.query(
        `SELECT ptc.*, dv.ten_don_vi, cd.ten_chuc_danh, vc.ho_va_ten, vc.ma_vien_chuc
         FROM phieu_chu_truong ptc
         LEFT JOIN don_vi dv ON ptc.don_vi_id = dv.id
         LEFT JOIN chuc_danh_quan_ly cd ON cd.id = ptc.chuc_danh_id
         LEFT JOIN vien_chuc vc ON vc.id = ptc.vien_chuc_id
         WHERE ptc.id = $1`,
        [id]
    );
    return result.rows[0] ?? null;
}

export const getPhieuChuTruongByDonViId = async (donViId: number) => {
    const result = await pool.query(
        `SELECT pct.tieu_de, dv.ten_don_vi, cd.id as chuc_danh_id, cd.ten_chuc_danh, vc.ho_va_ten, vc.ma_vien_chuc
        FROM phieu_chu_truong pct
        LEFT JOIN don_vi dv ON pct.don_vi_id = dv.id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
        LEFT JOIN vien_chuc vc ON vc.id = pct.vien_chuc_id
        WHERE dv.id = $1`, [donViId]
    )
    return result.rows;
}
export const getPhieuChuTruongFollowingAppointment = async() => {
    const reulst = await pool.query(
        `SELECT pct.id, pct.tieu_de, dv.ten_don_vi, cd.id as chuc_danh_id, cd.ten_chuc_danh, vc.ho_va_ten, vc.ma_vien_chuc
        FROM phieu_chu_truong pct
        LEFT JOIN don_vi dv ON pct.don_vi_id = dv.id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
        LEFT JOIN vien_chuc vc ON vc.id = pct.vien_chuc_id
        WHERE pct.trang_thai = 2 AND NOT EXISTS (
            SELECT 1
            FROM chi_tiet_dot_bo_nhiem ct
            WHERE ct.phieu_chu_truong_id = pct.id
        )`
    )
    return reulst.rows;
}
export const insertPhieuChuTruong = async (client: any, payload: CreatePhieuChuTruongDTO, user: any, maPhieu: string) => {
    const {hoVaTen, donViId} = user
    const result = await client.query(
        `INSERT INTO phieu_chu_truong
         (ma_phieu, so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat,
          so_luong_de_xuat, nguon_nhan_su, dot_quy_hoach_id,
          chuc_danh_id, don_vi_id, nguoi_lap, vien_chuc_id, trang_thai)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,1) RETURNING *`,
        [maPhieu, payload.soToTrinhChuTruong, payload.tieuDe,
         payload.lyDoDeXuat, payload.soLuongDeXuat, payload.nguonNhanSu,
         payload.dotQuyHoachId ?? null, payload.chucDanhId,
         donViId, hoVaTen, payload.vienChucId ?? null]
    )
    return result.rows[0];
} 
export const approvePhieuChuTruong = async (client: any, id: number, nguoiDuyet: string) => {
    const result = await client.query(
        `UPDATE phieu_chu_truong SET trang_thai = 2, nguoi_duyet = $2, ngay_duyet = NOW() WHERE id = $1 RETURNING *`,
        [id, nguoiDuyet]
    )
    return result.rows[0];
}
export const rejectPhieuChuTruong = async (client: any, id: number, nguoiDuyet: string, lyDoTuChoi: string) => {
    const result = await client.query(
        `UPDATE phieu_chu_truong SET trang_thai = 0, nguoi_duyet = $2, ngay_duyet = NOW(), ly_do_tu_choi = $3 WHERE id = $1 RETURNING *`,
        [id, nguoiDuyet, lyDoTuChoi]
    )
    return result.rows[0];
}
export const submitPhieuChuTruong = async (client: any, id: number) => {
    const result = await client.query(
        `UPDATE phieu_chu_truong SET trang_thai = 1 WHERE id = $1 RETURNING *`,
        [id]
    )
    return result.rows[0];
}
export const getVienChucForPANS = async (client: any) => {
    const result = await client.query(
        `SELECT ctbn.id AS chi_tiet_bn_id,
                vc.ho_va_ten, vc.ma_vien_chuc,
                cd.ten_chuc_danh,
                dv.ten_don_vi
        FROM chi_tiet_bo_nhiem ctbn
        JOIN vien_chuc vc ON vc.id = ctbn.vien_chuc_id
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
        LEFT JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
        LEFT JOIN don_vi dv ON dv.id = vc.don_vi_id
        WHERE ctbn.trang_thai = 3
        AND ctbn.id NOT IN ( SELECT ctpa.chi_tiet_bn_id 
               FROM chi_tiet_phuong_an ctpa
               WHERE ctpa.chi_tiet_bn_id IS NOT NULL
           )
         ORDER BY dv.ten_don_vi, vc.ho_va_ten`
    );
    return result.rows;
}
