import pool from "../../config/db";
import { CreateDotBoNhiemDTO, UngVienQuyHoach } from "./dotBoNhiem.dto";
import * as DotBoNhiemRepo from "./dotBoNhiem.repository"

export const fetchAllAppointmentBatch = async () => {
    const data = await DotBoNhiemRepo.getThongTinDotBoNhiem();
    return data;
}
export const findAppointmentBatchById = async (id: number) => {
    const dotBoNhiem = await DotBoNhiemRepo.getThongTinDotBoNhiemById(id);
    if(!dotBoNhiem){
        throw new Error(`Không tìm thấy đợt bổ nhiệm với id: ${id}`);
    }
    const chucDanhList  = await DotBoNhiemRepo.getThongTinChucDanh(dotBoNhiem.id);
    return {...dotBoNhiem, chucDanhList};
}
export const createAppointmentBatch = async (payload: CreateDotBoNhiemDTO) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const dotBoNhiem = await DotBoNhiemRepo.insertDotBoNhiem(client, payload);
        for (const pctId of payload.phieuChuTruong) {
            const chiTiet = await DotBoNhiemRepo.insertChiTietDotBoNhiem(client, dotBoNhiem.id, pctId);
            const ungVien = await DotBoNhiemRepo.getUngVienTuQuyHoach(pctId);
            // console.log(`phieuChuTruongId: ${pctId}`);s
            //  console.log(`ungVien found: ${ungVien.length}`, ungVien);
    
            for (const uv of ungVien as UngVienQuyHoach[]) {
                await DotBoNhiemRepo.insertUngVien(client, chiTiet.id, uv.id, uv.vienChucId);
            }
        }
        await client.query("COMMIT");
        return dotBoNhiem
    } catch (error) {
        console.error("Error creating appointment batch:", error);
        await client.query('ROLLBACK');
        throw error;   
    }finally{
        client.release();
    }
}
export const fetchCandidates = async (chiTietDotId: number) => {
    return await DotBoNhiemRepo.getUngVienByDotId(chiTietDotId);
}