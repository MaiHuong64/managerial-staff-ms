import pool from "../../config/db";
import { ChucDanhDTO } from "./chucDanh.dto";

export const findAll = async (): Promise<ChucDanhDTO[]> => {
    const result = await pool.query(`SELECT id, ten_chuc_danh FROM chuc_danh_quan_ly`);
    return result.rows;
};
