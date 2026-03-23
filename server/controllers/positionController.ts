import { Request, Response } from "express";
import pool from "../config/db";

export const getAllPosition = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT id, ten_chuc_danh FROM chuc_danh_quan_ly`)
        return res.json({success: true, data: result.rows});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
}
export default getAllPosition