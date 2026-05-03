import pool from "../../config/db";
import { deleteChucDanh, findAll, insertChucDanh, updateChucDanh } from "./chucDanh.repository";

export const getAllChucDanh = async () => {
    return findAll();
};
export const createDonViService = async (payload: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const newChucDanh = await insertChucDanh(client, payload);
        await client.query('COMMIT');
        return newChucDanh;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
export const updateDonViService = async (id: number, payload: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const updatedChucDanh = await updateChucDanh(client, id, payload);
        await client.query('COMMIT');
        return updatedChucDanh;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export const deleteChucDanhService = async (id: number) => {
    return await deleteChucDanh(id);
}
