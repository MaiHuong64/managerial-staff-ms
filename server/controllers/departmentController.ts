import { Request, Response } from "express";
import pool from "../config/db";

export const departmentController = {
    getAllDepartment: async(req: Request, res: Response) => {
        try {
            const result = await pool.query(`SELECT * FROM don_vi `);
            console.log(result.rows[0]);
            return res.json({sucess: true, data: result.rows});
        } catch (error) { 
            console.error("getAllDepartments:", error);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }
    },

    getDepartmentById: async (req: Request, res: Response) => {
        try {
            const {id} = req.params;
            
            const result = await pool.query(`SELECT * FROM don_vi WHERE id = $1`, [id])
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

}
export default departmentController;