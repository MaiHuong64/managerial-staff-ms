import pool from "../../config/db";
import { mapArrayToCamel } from "../../utils/mapper";
import { ChucDanhDTO } from "./chucDanh.dto";

export const findAll = async (): Promise<ChucDanhDTO[]> => {
    const result = await pool.query(`SELECT id, ten_chuc_danh FROM chuc_danh_quan_ly`);
    return mapArrayToCamel<ChucDanhDTO>(result.rows);
};
