import { Request, Response } from "express";
import pool from "../config/db";

export const departmentController = {
    getAllDepartment: async(req: Request, res: Response) => {
        try {
            const { search, loai_don_vi } = req.query;

            // Base query — thêm điều kiện WHERE động nếu có query params
            let query =`SELECT id, ma_don_vi, ten_don_vi, loai_don_vi
                        FROM don_vi
                        WHERE 1=1`;
            const params = [];
            let index = 1;

            // Tìm theo tên — ILIKE = case-insensitive
            if (search) {
                query += ` AND (ten_don_vi ILIKE $${index} OR ma_don_vi ILIKE $${index})`;
                params.push(`%${search}%`);
                index++;
            }

            // Loc theo loai don vi
            if(loai_don_vi){
                query += ` AND loai_don_vi = $${index}`;
                index++;
            }
            query += ` ORDER BY ma_don_vi ASC`;

            const result = await pool.query(query, params);
            
            return res.status(200).json({
                success: true,
                total: result.rowCount,
                data: result.rows
            })
        } catch (error) { 
            console.error("getAllDepartments:", error);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }
    },

    getDepartmentById: async (req: Request, res: Response) => {
        try {
            const {id} = req.params;
            
            const result = await pool.query(`SELECT id, ma_don_vi, ten_don_vi, loai_don_vi
                                            FROM don_vi
                                            WHERE id = $1`, [id])
            if(result.rowCount === 0){
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy đơn vị với id = ${id}`
                })
            }
            return res.status(200).json({success: true, data: result.rows[0]})

        } catch (error) {
            console.error("getDepartmentById:", error);
            return res.status(500).json({ success: false, message: "Lỗi server" })
        }
    },

    createDepartment: async (req: Request, res: Response) => {
    
    },

    updateDepartment: async (req: Request, res: Response) => {

    },

    deleteDepartment: async (req: Request, res: Response) => {
  
    }
}
export default departmentController;