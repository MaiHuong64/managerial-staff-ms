import { Request, Response } from "express";
import pool from "../config/db";

export const getProfile = async(req: Request, res: Response) =>{
    try {
        const userID = (req as any).user.id;

        console.log("user: ", userID);

        const query = ` SELECT tk.ten_dang_nhap, tk.vai_tro, tk.vien_chuc_id, vc.ho_va_ten, vc.avatar, vc.don_vi_id, dv.ten_don_vi
                        FROM tai_khoan tk LEFT JOIN vien_chuc vc on tk.vien_chuc_id = vc.id
                        LEFT JOIN don_vi dv ON vc.don_vi_id = dv.id
                        WHERE tk.id = $1`;
        const result = await pool.query(query, [userID]);
        if(result.rows.length === 0)
            return res.status(404).json({message: "Cant find this user"});
            res.json({user: result.rows[0]});
        } catch (error) {
            console.error(error);
            res.status(500).json({ message:error });
        }
}