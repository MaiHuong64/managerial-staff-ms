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

export const getThongTinDotBoNhiem = async () => {
    const result = await pool.query(`
        SELECT dbn.id, dbn.ten_dot_bo_nhiem, dbn.ngay_bat_dau, dbn.ngay_ket_thuc, dbn.trang_thai, count(ct.phieu_chu_truong_id) as chuc_danh
        FROM dot_bo_nhiem dbn inner join chi_tiet_dot_bo_nhiem ct on dbn.id = ct.dot_bo_nhiem_id
        GROUP BY dbn.id, dbn.ten_dot_bo_nhiem, dbn.ngay_bat_dau, dbn.ngay_ket_thuc, dbn.trang_thai
        ORDER BY dbn.ngay_bat_dau

    `)
    return mapArrayToCamel(result.rows);
}
export const getThongTinDotBoNhiemById = async (dotBoNhiemId: number) => {
    const result = await pool.query
    (
        `SELECT * FROM dot_bo_nhiem
        WHERE id = $1`, [dotBoNhiemId]
    )
    return mapToCamel<DotBoNhiemDTO.DotBoNhiem>(result.rows[0]);
}
export const getThongTinChucDanh = async (dotBoNhiemId: number) => {
    const result = await pool.query(
        `
        select  ct.id AS chi_tiet_dot_id, ct.phieu_chu_truong_id, ct.buoc_hien_tai, COUNT(ctbn.id) AS so_ung_vien, 
                cd.ten_chuc_danh, 
                pct.so_luong_de_xuat, 
                dv.ten_don_vi
        from chi_tiet_dot_bo_nhiem ct
            left join phieu_chu_truong pct on ct.phieu_chu_truong_id = pct.id
            left join chuc_danh_quan_ly cd on pct.chuc_danh_id = cd.id
            left join don_vi dv on dv.id = pct.don_vi_id
            left join chi_tiet_bo_nhiem ctbn on ctbn.chi_tiet_dot_bo_nhiem_id = ct.id  
        where ct.dot_bo_nhiem_id = $1
        group by ct.id, ct.phieu_chu_truong_id, cd.ten_chuc_danh, pct.so_luong_de_xuat, dv.ten_don_vi, ct.buoc_hien_tai
        `, [dotBoNhiemId]
    )
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
