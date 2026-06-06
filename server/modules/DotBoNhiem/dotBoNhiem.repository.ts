import pool from "../../config/db";
import * as DotBoNhiemDTO from "./dotBoNhiem.dto";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";

export const getNextBatchCode = async (client: any) =>{
    const result = await client.query(
        `SELECT COALESCE(MAX(id), 0) as max FROM dot_bo_nhiem`
    );
    const nextId = Number(result.rows[0].max) + 1;
    return 'DBN' + nextId.toString().padStart(3, '0');
}

export const getAllDotBoNhiem = async () => {
    const result = await pool.query(`
        SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem,
               dbn.ngay_bat_dau, dbn.ngay_ket_thuc, dbn.so_quyet_dinh,
               dbn.trang_thai,
               COUNT(ctdbn.id) AS so_phieu,
               MIN(ctbn.buoc_hoi_nghi) FILTER (
                   WHERE ctbn.buoc_hoi_nghi BETWEEN 2 AND 5
               ) AS buoc_hien_tai
        FROM dot_bo_nhiem dbn
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.dot_bo_nhiem_id = dbn.id
        LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.chi_tiet_dot_bo_nhiem_id = ctdbn.id
        GROUP BY dbn.id
    `);
    return mapArrayToCamel(result.rows);
}

export const getDotBoNhiemById = async (dotBoNhiemId: number) => {
    const result = await pool.query(
        `SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.ngay_bat_dau, dbn.ngay_ket_thuc, dbn.trang_thai,
                ctdbn.id AS chi_tiet_dot_id,
                pct.id AS phieu_chu_truong_id, pct.so_luong_de_xuat,
                cd.ten_chuc_danh,
                dv.ten_don_vi,
                COUNT(ctbn.id) AS so_ung_vien,
                MIN(ctbn.buoc_hoi_nghi) FILTER (WHERE ctbn.buoc_hoi_nghi BETWEEN 2 AND 5) AS buoc_hien_tai
        FROM dot_bo_nhiem dbn
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.dot_bo_nhiem_id = dbn.id
        LEFT JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
        LEFT JOIN don_vi dv ON dv.id = pct.don_vi_id
        LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.chi_tiet_dot_bo_nhiem_id = ctdbn.id
        WHERE dbn.id = $1
        GROUP BY dbn.id, ctdbn.id, pct.id, cd.ten_chuc_danh, dv.ten_don_vi`, [dotBoNhiemId]);
    return mapArrayToCamel(result.rows) ?? [];
}

export const insertDotBoNhiem = async (client: any, payload: DotBoNhiemDTO.CreateDotBoNhiemDTO) => {
    const maDotBoNhiem = await getNextBatchCode(client);
    const result = await client.query(
        `INSERT INTO dot_bo_nhiem
        (ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, ngay_phe_duyet, so_quyet_dinh)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [maDotBoNhiem, payload.tenDotBoNhiem, payload.ngayBatDau, payload.ngayKetThuc, payload.ngayPheDuyet, payload.soQuyetDinh]
    )
    return mapToCamel<DotBoNhiemDTO.DotBoNhiem>(result.rows[0]);;
}

export const insertChiTietDotBoNhiem = async (client: any, dotBoNhiemId: number,  phieuChuTruongId: number): Promise<DotBoNhiemDTO.ChiTietDotBoNhiem> => {
    const result = await client.query (
        `INSERT INTO chi_tiet_dot_bo_nhiem (dot_bo_nhiem_id, phieu_chu_truong_id)
        VALUES ($1, $2) RETURNING *
        `, [dotBoNhiemId, phieuChuTruongId]
    )
    return mapToCamel<DotBoNhiemDTO.ChiTietDotBoNhiem>(result.rows[0]);
}
export const getUngVienTuQuyHoach = async (phieuChuTruongId: number): Promise<DotBoNhiemDTO.UngVienQuyHoach[]> => {
    const result = await pool.query(
        `SELECT ctqh.id, ctqh.vien_chuc_id
        FROM chi_tiet_quy_hoach ctqh
        JOIN phieu_chu_truong pct ON pct.don_vi_id = ctqh.don_vi_id AND pct.chuc_danh_id = ctqh.chuc_danh_id
        JOIN dot_quy_hoach dqh ON dqh.id = ctqh.dot_quy_hoach_id
        WHERE pct.id = $1 AND ctqh.buoc_hien_tai = 6 AND ctqh.trang_thai = 1 AND dqh.trang_thai = 2
        `, [phieuChuTruongId]
    )
    return mapArrayToCamel<DotBoNhiemDTO.UngVienQuyHoach>(result.rows);
}
export const insertUngVien = async (client: any, chiTietDoBoNhiemId: number,  chiTietQHId: number, vienChucId: number) => {
    await client.query (
        `INSERT INTO chi_tiet_bo_nhiem (chi_tiet_dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id, buoc_hoi_nghi)
         VALUES ($1, $2, $3, 2)
        `, [chiTietDoBoNhiemId, vienChucId, chiTietQHId]
    )
}
export const getUngVienByDotId  = async (chiTietDotBn: number) => 
{
    const result = await pool.query (
        `SELECT ctbn.id AS chi_tiet_bn_id, ctbn.ly_do_vao, ctbn.buoc_hoi_nghi, ctbn.trang_thai,
        vc.id AS vien_chuc_id, vc.ho_va_ten, vc.ma_vien_chuc,
        dv.ten_don_vi, cd.ten_chuc_danh
        FROM chi_tiet_bo_nhiem ctbn
        JOIN vien_chuc vc ON vc.id = ctbn.vien_chuc_id
        LEFT JOIN don_vi dv ON dv.id = vc.don_vi_id
        LEFT JOIN chi_tiet_quy_hoach ctqh ON ctqh.id = ctbn.chi_tiet_qh_id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = ctqh.chuc_danh_id
        WHERE ctbn.chi_tiet_dot_bo_nhiem_id = $1
        ORDER BY ctbn.id
        `, [chiTietDotBn]
    )
        return mapArrayToCamel(result.rows);
}
