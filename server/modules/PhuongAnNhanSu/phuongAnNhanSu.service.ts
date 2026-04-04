import pool from "../../config/db";
import { CreatePhuongAnNhanSuDTO } from "./phuongAnNhanSu.dto";
import { getAllPANS, getPANSById, insertPANS, insertPANSDetail, updateStatus, getNextBatchCode} from "./phuongAnNhanSu.repository";

export const getAll = async () => {
    return getAllPANS();
}
export const getById = async (id: number) => {
    const result = await getPANSById(id);
    const rows = result.rows;
    if (!rows.length) throw new Error("Không tìm thấy phương án nhân sự");
    return rows;
}

export const createPANS = async (payload: CreatePhuongAnNhanSuDTO) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const maPhuongAn = await getNextBatchCode(client);
        const phuongAn =  await insertPANS(client, maPhuongAn, payload);
        await insertPANSDetail(client, phuongAn.id, payload.chiTiet);

        await client.query('COMMIT');
        return phuongAn;
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally { 
        client.release();
    }
} 
export const updateStatusPANS = async (chiTietPAId: number, trangThai: number, yKienBGH?: string) => {
    const client = await pool.connect();    
    try {
        await client.query('BEGIN');
        await updateStatus(client, chiTietPAId, trangThai, yKienBGH);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally { 
        client.release();
    }
} 