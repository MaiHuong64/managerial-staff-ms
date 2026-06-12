import pool from "../../config/db";
import { CreatePhuongAnNhanSuDTO } from "./phuongAnNhanSu.dto";
import { TrangThaiPANS } from "./phuongAnNhanSu.type";
import * as PhuongAnNSRepo from "./phuongAnNhanSu.repository";

export const getAllPANS = async () => {
    return PhuongAnNSRepo.getAllPANS();
}
export const getPANSById = async (pansId: number) => {
    const pa = await PhuongAnNSRepo.getPANSById(pansId);
    if (!pa) throw new Error("Không tìm thấy phương án nhân sự");
    const chiTietPA = await PhuongAnNSRepo.getChiTietPANSByPANSId(pansId);
    return { pa, chiTiet: chiTietPA };
}

export const getVienChucChoPANS = async () => {
     return PhuongAnNSRepo.getVienChucChoPANS();
}

export const createPANS = async (payload: CreatePhuongAnNhanSuDTO) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const maPhuongAn = await PhuongAnNSRepo.getNextMaPANS(client);
        const phuongAn =  await PhuongAnNSRepo.insertPANS(client, maPhuongAn, payload);
        await PhuongAnNSRepo.insertChiTietPANS(client, phuongAn.id, payload.chiTiet);

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
        await PhuongAnNSRepo.updateTrangThaiPANS(client, id, TrangThaiPANS.choPheDuyet);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
export const approvePANS = async (id: number, yKienBGH: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const pa = await PhuongAnNSRepo.getPANSById(id);
        if (!pa) throw new Error("Không tìm thấy phương án nhân sự");

        await PhuongAnNSRepo.updateTrangThaiPANS(client, id, TrangThaiPANS.daPheDuyet, yKienBGH);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
export const rejectPANS = async (id: number, yKienBGH: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const pa = await PhuongAnNSRepo.getPANSById(id);
        if (!pa) throw new Error("Không tìm thấy phương án nhân sự");

        await PhuongAnNSRepo.updateTrangThaiPANS(client, id, TrangThaiPANS.tuChoi, yKienBGH);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}