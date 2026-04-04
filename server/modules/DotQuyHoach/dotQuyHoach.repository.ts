import pool from "../../config/db";
import { AddPlanningBatchDetailDTO, CreatePlanningBatchDTO } from "./dotQuyHoach.dto";

export const getNextBatchCode = async (client: any) => {
    const result = await client.query(
        `SELECT COALESCE(MAX(id), 0) AS max FROM dot_quy_hoach`
    )
    const nextId = Number(result.rows[0].max) + 1;
    return 'DQH' + nextId.toString().padStart(3, '0');
}
export const getPlanningById = async (id: number) => {
    const result = await pool.query(
        `SELECT * FROM dot_quy_hoach WHERE id = $1`, [id]
    );
    return result.rows[0] ?? null;
}
export const getAllPlanning = async () => {
    const result = await pool.query(
        `select d.*, count(c.vien_chuc_id) as so_luong
        from dot_quy_hoach d left join chi_tiet_quy_hoach c on d.id = c.dot_quy_hoach_id
        group by d.id`
    )
    return result.rows;
}
export const getDetail = async (id: number) => {
    const result = await pool.query(
        `SELECT 
            ct.id AS chi_tiet_id, ct.dot_quy_hoach_id, ct.trang_thai,
            dv.id AS don_vi_id, dv.ten_don_vi,
            cd.id AS chuc_danh_id, cd.ten_chuc_danh,
            vc.id AS vien_chuc_id, vc.ho_va_ten
        FROM chi_tiet_quy_hoach ct
        JOIN vien_chuc vc ON vc.id = ct.vien_chuc_id
        JOIN chuc_danh_quan_ly cd ON cd.id = ct.chuc_danh_id
        JOIN don_vi dv  ON dv.id = ct.don_vi_id
        WHERE ct.dot_quy_hoach_id = $1
        ORDER BY dv.id, cd.id, vc.id`,
        [id]
    )
    return result.rows;
}

export const insertPlanningBatch = async (client: any, payload: CreatePlanningBatchDTO) => {
    const maDotQuyHoach = await getNextBatchCode(client);
    const result = await client.query(
       `insert into dot_quy_hoach (ma_quy_hoach, ten_quy_hoach, loai_quy_hoach, nam_thuc_hien, nhiem_ky, so_qd_phe_duyet, ngay_qd_phe_duyet, trang_thai) 
        values ($1, $2, $3, $4, $5, $6, $7, $8) returning * `, 
        [maDotQuyHoach, payload.tenQuyHoach, payload.loaiQuyHoach, payload.namThucHien, payload.nhiemKy, payload.soQdPheDuyet, payload.ngayQdPheDuyet, 0]
    )
    return result.rows[0];
}
export const insertPlanningDetail = async (client: any, payload: AddPlanningBatchDetailDTO) => {
    for(const vc of payload.vienChucId) {
        await client.query(
            `
            insert into chi_tiet_quy_hoach (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id, don_vi_id, ngay_vao_qh, trang_thai)
            values ($1, $2, $3, $4, CURRENT_DATE, 1)
            `, [payload.dotQuyHoachId, vc, payload.chucDanhId, payload.donViId]
        )
    }
}

export const getCandidatesByChucDanhId = async (chucDanhId: number) => {
    const result = await pool.query (
        `SELECT vc.id, vc.ma_vien_chuc, vc.ho_va_ten, dv.ten_don_vi, ctqh.id AS chi_tiet_qh_id
        FROM chi_tiet_quy_hoach ctqh
        JOIN vien_chuc vc ON vc.id = ctqh.vien_chuc_id
        JOIN don_vi dv ON dv.id = ctqh.don_vi_id
        WHERE ctqh.chuc_danh_id = $1 AND ctqh.trang_thai = 1
        `, [chucDanhId]
    )
    return result.rows;
}

export const filterCandidates = async (donViId: number,  trinhDoChuyenMon: string, dotQuyHoachId: number) => {
    const result = await pool.query(
        `select id, ma_vien_chuc, ho_va_ten, trinh_do_chuyen_mon
        from vien_chuc
        where trinh_do_chuyen_mon = $1 and don_vi_id = $2 and id not in 
        (select vien_chuc_id from chi_tiet_quy_hoach where dot_quy_hoach_id = $3 and trang_thai = $4)
        `, [trinhDoChuyenMon, donViId, dotQuyHoachId, 1]
    )
    return result.rows;
}