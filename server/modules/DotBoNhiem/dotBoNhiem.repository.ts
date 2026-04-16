import { toCamel } from "snake-camel";
import pool from "../../config/db";
import { AppointmentBatch, AppointmentDetail, CreateAppointmentBatchDTO, UngVienQuyHoach } from "./dotBoNhiem.dto";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";

export const getNextBatchCode = async (client: any) =>{
    const result = await client.query(
        `SELECT COALESCE(MAX(id), 0) as max FROM dot_bo_nhiem`
    );
    const nextId = Number(result.rows[0].max) + 1;
    return 'DBN' + nextId.toString().padStart(3, '0');
}

export const getAllAppointment = async () => {
    const result = await pool.query(`
        SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem,
               dbn.ngay_bat_dau, dbn.ngay_ket_thuc, dbn.so_quyet_dinh,
               COUNT(ctdbn.id) AS so_phieu,
               MIN(ctdbn.buoc_hien_tai) AS buoc_hien_tai
        FROM dot_bo_nhiem dbn
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.dot_bo_nhiem_id = dbn.id
        GROUP BY dbn.id
    `);
    return mapArrayToCamel(result.rows);
}

export const getAppointmentById = async (dotBoNhiemId: number) => {
    const result = await pool.query(
        `SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.ngay_bat_dau, dbn.ngay_ket_thuc,
                ctdbn.id AS chi_tiet_dot_id,
                pct.id AS phieu_chu_truong_id, pct.so_luong_de_xuat,
                cd.ten_chuc_danh,
                dv.ten_don_vi,
                COUNT(ctbn.id) AS so_ung_vien,
                ctdbn.buoc_hien_tai
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

export const insertAppointmentBatch = async (client: any, payload: CreateAppointmentBatchDTO) => {
    const maDotBoNhiem = await getNextBatchCode(client);
    const result = await client.query(
        `INSERT INTO dot_bo_nhiem
        (ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, ngay_phe_duyet, so_quyet_dinh)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [maDotBoNhiem, payload.tenDotBoNhiem, payload.ngayBatDau, payload.ngayKetThuc, payload.ngayPheDuyet, payload.soQuyetDinh]
    )
    return mapToCamel<AppointmentBatch>(result.rows[0]);;
}

export const insertAppointmentDetail = async (client: any, dotBoNhiemId: number,  phieuChuTruongId: number): Promise<AppointmentDetail> => {
    const result = await client.query (
        `INSERT INTO chi_tiet_dot_bo_nhiem (dot_bo_nhiem_id, phieu_chu_truong_id)
        VALUES ($1, $2) RETURNING *
        `, [dotBoNhiemId, phieuChuTruongId]
    )
    return mapToCamel<AppointmentDetail>(result.rows[0]);
}
export const getCandidatesFromQH = async (phieuChuTruongId: number): Promise<UngVienQuyHoach[]> => {
    const result = await pool.query(
        `SElECT ctqh.id, pct.vien_chuc_id
        FROM chi_tiet_quy_hoach ctqh JOIN phieu_chu_truong pct ON ctqh.phieu_chu_truong_id = pct.id
        AND pct.don_vi_id = ctqh.don_vi_id
        WHERE ctqh.phieu_chu_truong_id = $1 AND ctqh.trang_thai = 1
        `, [phieuChuTruongId]
    )
    return mapArrayToCamel<UngVienQuyHoach>(result.rows);
}
export const insertCandidateFromQH = async (client: any, chiTietDoBoNhiemId: number,  chiTietQHId: number, vienChucId: number) => {
    await client.query (
        `INSERT INTO chi_tiet_bo_nhiem (chi_tiet_dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id, buoc_hoi_nghi)
         VALUES ($1, $2, $3, 2)
        `, [chiTietDoBoNhiemId, vienChucId, chiTietQHId]
    )
}