import pool from "../../config/db";
import * as DotQuyHoachDTO from "./dotQuyHoach.dto";
import * as DotQuyHoachRepository from "./dotQuyHoach.repository";

export const fetchAllDotQuyHoach = async () => {
    const data = await DotQuyHoachRepository.getAllDotQuyHoach();
    return data;
}

export const fetchDotQuyHoachGoc = async () => {
    const data = await DotQuyHoachRepository.getDotQuyHoachGoc();
    return data;
}

export const findDotQuyHoachById = async (id: number) => {
    const dotQuyHoach = await DotQuyHoachRepository.getDotQuyHoachById(id);
    if (!dotQuyHoach)
        throw new Error(`Không tìm thấy đợt quy hoạch với id: ${id}`);
    const staff = await DotQuyHoachRepository.getChiTietDotQuyHoach(id);
    return { dotQuyHoach, staff };
}
export const createDotQuyHoach = async(payload: DotQuyHoachDTO.CreateDotQuyHoachDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const dotQuyHoach = await DotQuyHoachRepository.insertDotQuyHoach(client, payload);

        if (payload.loaiQuyHoach === 2 && payload.dotGocId) {
            await DotQuyHoachRepository.copyChiTietFromDotGoc(client, dotQuyHoach.id, payload.dotGocId);
        }

        await client.query("COMMIT")
        return dotQuyHoach;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally{
        client.release();
    }
}   

export const addUngVien_QT169 = async(payload: DotQuyHoachDTO.ChiTietDotQuyHoachDTO) => {
    const client = await pool.connect();
    const dotQHId = await DotQuyHoachRepository.getDotQuyHoachById(payload.dotQuyHoachId);
    if(!dotQHId) throw new Error(`Không tìm thấy đợt quy hoạch với id: ${payload.dotQuyHoachId}`);

    try {
        await client.query("BEGIN");
        for (const vienChucId of payload.vienChucId)
            await DotQuyHoachRepository.insertUngVien_QT169(client, payload.dotQuyHoachId, vienChucId, payload.chucDanhId, payload.donViId, 2);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
export const fetchVienChucByChucDanh  = async (chucDanhId: number) => {
    return await DotQuyHoachRepository.getVienChucByChucDanhId(chucDanhId);
}
export const filterVienChucQuyHoach = async (donViId: number, dotQuyHoachId: number) => {
    const result = await DotQuyHoachRepository.filterVienChuc(donViId, dotQuyHoachId);
    return result;
}

export const approveDotQuyHoach = async (dotQuyHoachId: number, payload: DotQuyHoachDTO.ApproveDotQuyHoachDTO) => {
    const planning = await DotQuyHoachRepository.getDotQuyHoachById(dotQuyHoachId);
    if (!planning) {
        throw new Error(`Không tìm thấy đợt quy hoạch với id: ${dotQuyHoachId}`);
    }
    
    if (planning.trangThai !== 1) {
        throw new Error("Chỉ có thể phê duyệt đợt quy hoạch đã hoàn thành");
    }

    const result = await DotQuyHoachRepository.updatePheDuyetDotQuyHoach(dotQuyHoachId, payload.soQdPheDuyet, payload.ngayQdPheDuyet);
    return result;
}

export const addUngVien_QT170 = async (payload: DotQuyHoachDTO.CreateUngVienDTO) => {
    const client = await pool.connect();
    try {
       await client.query("BEGIN");
       const result =  await DotQuyHoachRepository.insertUngVien_QT170(client, payload);
       await client.query("COMMIT");
       return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}