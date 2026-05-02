import pool from "../../config/db";
import { createDonViRepository, deleteDonViRepository, getAllDonViRepository, getDonViByIdRepository, updateDonViRepository } from "./donVi.repository";

export const getAllDonViService = async () => {
    return getAllDonViRepository();
};

export const getDonViByIdService = async (id: number) => {
    const donVi = await getDonViByIdRepository(id);
    if (!donVi) throw new Error(`Không tìm thấy đơn vị với id = ${id}`);
    return donVi;
};
export const createDonViService = async (payload: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const newDonVi = await createDonViRepository(client, payload);
        await client.query('COMMIT');
        return newDonVi;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}
export const updateDonViService = async (id: number, payload: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const updatedDonVi = await updateDonViRepository(client, id, payload);
        await client.query('COMMIT');
        return updatedDonVi;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

export const deleteDonViService = async (id: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const updatedDonVi = await deleteDonViRepository(client, id);
        await client.query('COMMIT');
        return updatedDonVi;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}
