import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from'jsonwebtoken';
import pool from "../config/db";
import dotenv from "dotenv";

dotenv.config();

const authController = {
    registerUser: async (req: Request, res: Response) => {
        try{
            const {ten_dang_nhap, mat_khau, vai_tro, vien_chuc_id} = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(mat_khau, salt);

            const existingUser = await pool.query("SELECT id, ten_dang_nhap, mat_khau, vai_tro FROM tai_khoan WHERE ten_dang_nhap = $1", [ten_dang_nhap]);
            if(existingUser.rows.length > 0){
                return res.status(400).json({ success: false, message: "User already exists" })
            }
            const newUser = await pool.query(
                `INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai, vien_chuc_id) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING id, ten_dang_nhap, vai_tro, vien_chuc_id`,
                [ten_dang_nhap, hashedPassword, vai_tro, 1, vien_chuc_id]
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
            const {ten_dang_nhap, mat_khau} = req.body;

            const query = ` SELECT t.id, t.ten_dang_nhap, t.mat_khau, t.vai_tro, v.don_vi_id, v.ho_va_ten
                            FROM tai_khoan t
                            JOIN vien_chuc v ON v.id = t.vien_chuc_id
                            WHERE t.ten_dang_nhap = $1`;
            // console.log(req.body)
            const user = await pool.query(query, [ten_dang_nhap]);
            if(user.rows.length === 0){
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }
            const validPass = await bcrypt.compare(mat_khau, user.rows[0].mat_khau);
            if(!validPass){
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }
            const token = jwt.sign({ id: user.rows[0].id, ten_dang_nhap: user.rows[0].ten_dang_nhap, vai_tro: user.rows[0].vai_tro , don_vi_id: user.rows[0].don_vi_id}, process.env.JWT_SECRET as string, { expiresIn: "1h"});
            return res.json({ success: true, message: "Login successful", data: {
                id: user.rows[0].id,
                ten_dang_nhap: user.rows[0].ten_dang_nhap,
                vai_tro: user.rows[0].vai_tro,
                don_vi_id: user.rows[0].don_vi_id,
                token: token
            }});

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