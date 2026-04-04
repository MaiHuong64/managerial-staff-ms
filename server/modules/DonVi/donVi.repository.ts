import pool from "../../config/db";
import { DonViDTO } from "./donVi.dto";

export const findAll = async (): Promise<DonViDTO[]> => {
    const result = await pool.query(`SELECT * FROM don_vi`);
    return result.rows;
};

export const findById = async (id: number): Promise<DonViDTO | null> => {
    const result = await pool.query(`SELECT * FROM don_vi WHERE id = $1`, [id]);
    return result.rows[0] ?? null;
};
