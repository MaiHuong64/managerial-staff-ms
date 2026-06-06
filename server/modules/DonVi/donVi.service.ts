import pool from "../../config/db";
import * as DonViRepo from "./donVi.repository";

export const getAllDonVi = async () => {
    return DonViRepo.getAllDonVi();
};

export const getDonViById = async (id: number) => {
    const donVi = await DonViRepo.getDonViById(id);
    if (!donVi) throw new Error(`Không tìm thấy đơn vị với id = ${id}`);
    return donVi;
};
export const createDonVi = async (payload: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const newDonVi = await DonViRepo.createDonVi(client, payload);
        await client.query('COMMIT');
        return newDonVi;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
export const updateDonVi = async (id: number, payload: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const updatedDonVi = await DonViRepo.updateDonVi(client, id, payload);
        await client.query('COMMIT');
        return updatedDonVi;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export const deleteDonVi = async (id: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const updatedDonVi = await DonViRepo.deleteDonVi(client, id);
        await client.query('COMMIT');
        return updatedDonVi;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
