import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db";

const authController = {
    registerUser: async (req: Request, res: Response) => {
        try{
            const {ma_vien_chuc, mat_khau, vai_tro} = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(mat_khau, salt);
            
            const existingUser = await pool.query("SELECT * FROM tai_khoan WHERE ma_vien_chuc = $1", [ma_vien_chuc]);
            if(existingUser.rows.length > 0){
                return res.status(400).json({ success: false, message: "User already exists" })
            }
            const newUser = await pool.query(
                `INSERT INTO tai_khoan (ma_vien_chuc, mat_khau, vai_tro) 
                VALUES ($1, $2, $3) 
                RETURNING id, ma_vien_chuc, vai_tro, ngay_tao`,
                [ma_vien_chuc, hashedPassword, vai_tro]
            );
            return res.status(201).json(newUser.rows[0]);

        }
        catch(error){
            console.error("Error registering user:", error);
            res.status(500).send("Internal server error");
        }
    },
    loginUser: async (req: Request, res: Response) => {
        try{
            const {ma_vien_chuc, mat_khau} = req.body;
            const user = await pool.query("SELECT * FROM tai_khoan WHERE ma_vien_chuc = $1", [ma_vien_chuc]);
            if(user.rows.length === 0){
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }
            const validPass = await bcrypt.compare(mat_khau, user.rows[0].mat_khau);
            if(!validPass){
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }
            return res.json({ success: true, message: "Login successful", user: {
                id: user.rows[0].id,
                ma_vien_chuc: user.rows[0].ma_vien_chuc,
                vai_tro: user.rows[0].vai_tro,
            } });

        }
        catch(error){
            console.error("Error logging in user:", error);
            res.status(500).send("Internal server error");
        }
    },
    logoutUser: (req: Request, res: Response) => {
        
        res.json({ success: true, message: "User logged out successfully" });
    }
};

export default authController;