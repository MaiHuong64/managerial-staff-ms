import pool from "../../config/db";
import * as ChucDanhRepository from "./chucDanh.repository";

export const getAllChucDanh = async () => {
    return ChucDanhRepository.getAllChucDanh();
};
export const createChucDanh = async (payload: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const newChucDanh = await ChucDanhRepository.insertChucDanh(client, payload);
        await client.query('COMMIT');
        return newChucDanh;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
export const updateChucDanh = async (id: number, payload: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const updatedChucDanh = await ChucDanhRepository.updateChucDanh(client, id, payload);
        await client.query('COMMIT');
        return updatedChucDanh;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export const deleteChucDanh = async (id: number) => {
    return await ChucDanhRepository.deleteChucDanh(id);
}
