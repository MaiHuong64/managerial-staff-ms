import pool from "../../config/db";
import { CreatePhieuChuTruongDTO } from "./phieuChuTruong.dto";
import { getAllPlanning, getById as getByIdRepo, approvePhieuChuTruong, insertPhieuChuTruong, nextBatchCode, rejectPhieuChuTruong } from "./phieuChuTruong.repository";

export const getAll = async () => {
    return getAllPlanning();
}
export const getPCTById = async (id: number) => {
    const data = await getByIdRepo(id);
    if (!data) throw new Error("Không tìm thấy phiếu chủ trương");
    return data;
}

export const createPhieuChuTruong = async (payload: CreatePhieuChuTruongDTO, user: any) => {
    const client = await pool.connect();
    try { 
        await client.query("BEGIN");
        const maPhieu = await nextBatchCode(client);
        const phieuChuTruong = await insertPhieuChuTruong(client, payload, user, maPhieu);
        await client.query("COMMIT");
        return phieuChuTruong;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
export const approvePCT = async (id: number, user: any) =>{
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if(user.vaiTro !== "BGH")
            throw new Error("Không có quyền duyệt phiếu");
        const result = await approvePhieuChuTruong(client, id, user.hoVaTen);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
export const rejectPCT = async (id: number, user: any, lyDoTuChoi: string) =>{
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if(user.vai_tro !== "BGH")
            throw new Error("Không có quyền duyệt phiếu");
        const result = await rejectPhieuChuTruong(client, id, user.hoVaTen, lyDoTuChoi);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
