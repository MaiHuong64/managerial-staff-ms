import pool from "../../config/db";
import { CreatePhuongAnNhanSuDTO } from "./phuongAnNhanSu.dto";
import { TrangThaiPANS } from "./phuongAnNhanSu.type";
import * as PhuongAnNSRepo from "./phuongAnNhanSu.repository";

export const getAll = async () => {
    return PhuongAnNSRepo.getAllPANS();
}
export const getById = async (id: number) => {
    const [paResult, chiTietResult] = await Promise.all([
        PhuongAnNSRepo.getPAInfoById(id),
        PhuongAnNSRepo.getPANSById(id)
    ]);
    if (!paResult) throw new Error("Không tìm thấy phương án nhân sự");
    return {
        ...paResult,
        chiTiet: chiTietResult
    };
}

export const getCandidatesList = async () => {
     return PhuongAnNSRepo.getCandidates();
}

export const createPANS = async (payload: CreatePhuongAnNhanSuDTO) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const maPhuongAn = await PhuongAnNSRepo.getNextBatchCode(client);
        const phuongAn =  await PhuongAnNSRepo.insertPANS(client, maPhuongAn, payload);
        await PhuongAnNSRepo.insertPANSDetail(client, phuongAn.id, payload.chiTiet);

        await client.query('COMMIT');
        return phuongAn;
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release();
    }
}
export const submitPANS = async (id: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await PhuongAnNSRepo.updateStatus(client, id, TrangThaiPANS.choPheDuyet);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
export const updateStatusPANS = async (chiTietPAId: number, trangThai: number, yKienBGH?: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await PhuongAnNSRepo.updateStatus(client, chiTietPAId, trangThai, yKienBGH);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release();
    }
}