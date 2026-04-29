import pool from "../../config/db";
import { createXepLoaiDV, createXepLoaiVC, deleteXepLoaiDV, deleteXepLoaiVC, getAllXepLoaiDV, getChiTietXepLoaiDV, getChiTietXepLoaiVC, getDanhSachXepLoaiVC } from "./xepLoai.repository"
import { CreateXepLoaiDTO, UpdateXepLoaiDTO } from "./xepLoai.type";

export const getDanhSachXLVC = async () =>{ 
    return await getDanhSachXepLoaiVC();
}
export const getXepLoaiByVienChucId = async (vienChucId:  number) => {
    return await getChiTietXepLoaiVC(vienChucId);
}
export const createXLVC = async (payload: CreateXepLoaiDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await createXepLoaiVC(client, payload);
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
        await deleteXepLoaiVC(client, id);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const getDanhSachXepLoaiDV = async () =>{ 
    return await getAllXepLoaiDV();
}
export const getXepLoaiByDVId = async (vienChucId:  number) => {
    return await getChiTietXepLoaiDV(vienChucId);
}
export const createXLDV = async (payload: CreateXepLoaiDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await createXepLoaiDV(client, payload);
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
        await deleteXepLoaiDV(client, id);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};