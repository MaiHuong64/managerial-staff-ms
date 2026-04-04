import pool from "../../config/db";
import { CreateAppointmentBatchDTO, InputPCTDTO, InsertCandidateDTO } from "./dotBoNhiem.dto";


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
    return result.rows;
}
export const getAppointmentById = async (id: number) => {
    const result = await pool.query(
        `SELECT dbn.id, dbn.ma_dot_bo_nhiem, dbn.ten_dot_bo_nhiem, dbn.ngay_bat_dau, dbn.ngay_ket_thuc,
                ctdbn.id AS chi_tiet_dot_id,
                pct.id AS phieu_chu_truong_id, pct.so_luong_de_xuat,
                cd.ten_chuc_danh,
                dv.ten_don_vi,
                COUNT(ctbn.id)  AS so_ung_vien,
                ctdbn.buoc_hien_tai 
        FROM dot_bo_nhiem dbn
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.dot_bo_nhiem_id = dbn.id
        LEFT JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
        LEFT JOIN don_vi dv ON dv.id = pct.don_vi_id
        LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.chi_tiet_dot_bo_nhiem_id = ctdbn.id
        WHERE dbn.id = $1
        GROUP BY dbn.id, ctdbn.id, pct.id, cd.ten_chuc_danh, dv.ten_don_vi`, [id]);
    return result.rows ?? [];
}
export const insertAppointmentBatch = async (client: any, payload: CreateAppointmentBatchDTO) => {
    const result = await client.query (`
    insert into dot_bo_nhiem (ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, so_quyet_dinh) values ($1, $2, $3, $4, $5) returning *`,
    [payload.maDotBoNhiem, payload.tenDotBoNhiem, payload.ngayBatDau ?? null, payload.ngayKetThuc ?? null,  payload.soQuyetDinh ?? null ])
    return result.rows[0];
}
export const insertChiTietDotBoNhiem = async (client: any, dotBoNhiemId: number, payload: InputPCTDTO) => {
    return await client.query(
        `
        insert into chi_tiet_dot_bo_nhiem (dot_bo_nhiem_id, phieu_chu_truong_id) values ($1, $2) returning *
        `, [dotBoNhiemId, payload.phieuChuTruongId]
        
    )
}
export const insertCandidates = async (client: any, chiTietDotBoNhiemId: number, vienChucId: number) => {
    await client.query(
        `INSERT INTO chi_tiet_bo_nhiem (chi_tiet_dot_bo_nhiem_id, vien_chuc_id, buoc_hoi_nghi) VALUES ($1, $2, 2)`,
        [chiTietDotBoNhiemId, vienChucId]
    );
}