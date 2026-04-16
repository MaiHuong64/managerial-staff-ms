import pool from "../../config/db";
import { CreateAppointmentBatchDTO, UngVienQuyHoach } from "./dotBoNhiem.dto";
import {getAllAppointment, getAppointmentById , getCandidatesFromQH, insertAppointmentBatch, insertAppointmentDetail, insertCandidateFromQH} from "./dotBoNhiem.repository"

export const fetchAllAppointmentBatch = async () => {
    const data = await getAllAppointment();
    return data;
}
export const findAppointmentBatchById = async (id: number) => {
    const rows = await getAppointmentById(id);
    if(!rows.length) throw new Error("Không tìm thấy đợt bổ nhiệm");
    
    const firstRow: any = rows[0];
    const chucDanhList = rows
        .filter((r: any) => r.chiTietDotId)
        .map((r: any) => ({
            chiTietDotId: r.chiTietDotId,
            phieuChuTruongId: r.phieuChuTruongId,
            tenChucDanh: r.tenChucDanh,
            soLuongDeXuat: r.soLuongDeXuat,
            tenDonVi: r.tenDonVi,
            soUngVien: r.soUngVien,
            buocHienTai: r.buocHienTai
        }));
    return { 
        id: firstRow.id, 
        maDotBoNhiem: firstRow.maDotBoNhiem, 
        tenDotBoNhiem: firstRow.tenDotBoNhiem, 
        ngayBatDau: firstRow.ngayBatDau, 
        ngayKetThuc: firstRow.ngayKetThuc, 
        soQuyetDinh: firstRow.soQuyetDinh, 
        trangThai: firstRow.trangThai, 
        chucDanhList
    };
}
export const createAppointmentBatch = async (payload: CreateAppointmentBatchDTO) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const dotBoNhiem = await insertAppointmentBatch(client, payload);
        for (const pctId of payload.phieuChuTruong) {
            const chiTiet = await insertAppointmentDetail(client, dotBoNhiem.id, pctId);
            const ungVien = await getCandidatesFromQH(pctId);
            for (const uv of ungVien as UngVienQuyHoach[]) {
                await insertCandidateFromQH(client, chiTiet.id, uv.id, uv.vienChucId);
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
