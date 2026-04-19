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

export const getAllPlanning = async () => {
    const result = await pool.query(
        `SELECT ptc.*, dv.ten_don_vi, cd.ten_chuc_danh
        FROM phieu_chu_truong ptc 
        LEFT JOIN don_vi dv ON ptc.don_vi_id = dv.id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = ptc.chuc_danh_id
        LEFT JOIN dot_quy_hoach dqt ON dqt.id = ptc.dot_quy_hoach_id`
    )
    return result.rows.map(toCamel);
}
export const getById = async (id: number) => {
    const result = await pool.query(
        `SELECT ptc.*, dv.ten_don_vi, cd.ten_chuc_danh
         FROM phieu_chu_truong ptc
         LEFT JOIN don_vi dv ON ptc.don_vi_id = dv.id
         LEFT JOIN chuc_danh_quan_ly cd ON cd.id = ptc.chuc_danh_id
         WHERE ptc.id = $1`,
        [id]
    );
    return result.rows[0] ?? null;
}
export const getDetailForPosition = async (id: number) => {
    const result = await pool.query(
        `SELECT ptc.*, dv.ten_don_vi, cd.ten_chuc_danh
        FROM phieu_chu_truong ptc   
        LEFT JOIN don_vi dv ON ptc.don_vi_id = dv.id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = ptc.chuc_danh_id
        LEFT JOIN dot_quy_hoach dqt ON dqt.id = ptc.dot_quy_hoach_id
        WHERE ptc.don_vi_id = $1
        ORDER BY ptc.id DESC`
    )
    return result.rows;
}
export const insertPhieuChuTruong = async (client: any, payload: CreatePhieuChuTruongDTO, user: any, maPhieu: string) => {
    const {hoVaTen, donViId} = user
    const result = await client.query(
        `INSERT INTO phieu_chu_truong
         (ma_phieu, so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat,
          so_luong_de_xuat, nguon_nhan_su, dot_quy_hoach_id,
          chuc_danh_id, don_vi_id, nguoi_lap, trang_thai)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1) RETURNING *`,
        [maPhieu, payload.soToTrinhChuTruong, payload.tieuDe,
         payload.lyDoDeXuat, payload.soLuongDeXuat, payload.nguonNhanSu,
         payload.dotQuyHoachId ?? null, payload.chucDanhId,
         donViId, hoVaTen]
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

