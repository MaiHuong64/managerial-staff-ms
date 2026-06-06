import pool from "../../config/db";
import * as XepLoaiRepo from "./xepLoai.repository"
import * as XepLoaiDTO from "./xepLoai.type";

export const getDanhSachXLVC = async () =>{ 
    return await XepLoaiRepo.getDanhSachXLVC();
}
export const getXepLoaiByVienChucId = async (vienChucId:  number) => {
    return await XepLoaiRepo.getChiTietXLVC(vienChucId);
}
export const createXLVC = async (payload: XepLoaiDTO.CreateXepLoaiDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await XepLoaiRepo.createXLVC(client, payload);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        console.log(error);
        throw error;
    } finally {
          client.release();
    }
}

export const deleteXLVC = async (id: number) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await XepLoaiRepo.deleteXLVC(client, id);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const getDanhSachXLDV = async () =>{ 
    return await XepLoaiRepo.getDanhSachXLDV();
}
export const getXepLoaiByDVId = async (vienChucId:  number) => {
    return await XepLoaiRepo.getChiTietXLDV(vienChucId);
}
export const createXLDV = async (payload: XepLoaiDTO.CreateXepLoaiDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await XepLoaiRepo.createXLDV(client, payload);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        console.log(error);
        throw error;
    } finally {
          client.release();
    }
}

export const deleteXLDV = async (id: number) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await XepLoaiRepo.deleteXLDV(client, id);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};