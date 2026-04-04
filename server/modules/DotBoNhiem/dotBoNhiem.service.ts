import pool from "../../config/db";
import { CreateAppointmentBatchDTO } from "./dotBoNhiem.dto";
import {getAllAppointment, getAppointmentById , getNextBatchCode, insertAppointmentBatch, insertCandidates, insertChiTietDotBoNhiem} from "./dotBoNhiem.repository"

export const fetchAllAppointmentBatch = async () => {
    const data = await getAllAppointment();
    return data;
}
export const findAppointmentBatchById = async (id: number) => {
    const rows = await getAppointmentById(id);
    if(!rows.length) throw new Error("Không tìm thấy đợt bổ nhiệm");
    const {id: dotBoNhiemId, ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, so_quyet_dinh} = rows[0];
    const chucDanhList = rows.filter(r => r.chi_tiet_dot_id)
    .map(r => ({
        chiTietDotId: r.chi_tiet_dot_id,
        phieuChuTruongId: r.phieu_chu_truong_id,
        tenChucDanh: r.ten_chuc_danh,
        soLuongDeXuat: r.so_luong_de_xuat,
        tenDonVi: r.ten_don_vi,
        soUngVien: r.so_ung_vien,
        buoc_hien_tai: r.buoc_hien_tai
    }))
    return { dotBoNhiemId, ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, so_quyet_dinh, chucDanhList };
}
export const createAppointmentBatch = async (payload: CreateAppointmentBatchDTO) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const maDotBoNhiem = await getNextBatchCode(client);

        const batch = await insertAppointmentBatch(client, { ...payload, maDotBoNhiem });
        if(!payload.phieuChuTruongList.length) throw new Error("Danh sách phiếu chủ trưởng không được để trống");
        for(const pct of payload.phieuChuTruongList){
            const ct = await insertChiTietDotBoNhiem(client, batch.id, pct);
           
            for(const vienChucId of pct.vienChucId){
                await insertCandidates(client, ct.rows[0].id, vienChucId);
            }
        }
        await client.query("COMMIT");
        return batch;
    } catch (error) {
        console.error("Error creating appointment batch:", error);
        await client.query('ROLLBACK');
        throw error;   
    }finally{
        client.release();
    }
}

