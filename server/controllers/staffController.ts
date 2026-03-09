import { Router  } from "express";
import { json, Request, Response } from "express";
import { VienChuc } from "../models/VienChuc"
import pool from "../config/db";

// const router = Router();
const staffController = {
    getAllStaff: async (req: Request, res: Response) => {
        try{
            const vienchucList = await pool.query("SELECT * FROM vien_chuc");
            res.status(200).json(vienchucList);
        }
        catch(error){
            console.error("Error fetching staff:", error);
            res.status(500).send("Internal server error");
        }   
    },
    getStaffById: async (req: Request, res: Response) => {
        try{
            const q = {id: req.params.id};
            const vienchuc = await pool.query("SELECT * FROM vien_chuc WHERE id = $1", [q.id]);
            if(vienchuc.rows.length === 0)
                return res.status(404).send("Staff not found");
            res.status(200).json(vienchuc.rows[0]);
        }
        catch(error){
            console.error("Error fetching staff by ID:", error);
            res.status(500).send("Internal server error");
        }
    },
    createStaff: async (req: Request, res: Response) => {
        try{
            const id = await pool.query("SELECT MAX(id) FROM vien_chuc");
            const mavienchuc = "VC" + (id.rows[0].max + 1).toString().padStart(3, '0');
            const {ten_vien_chuc, ngay_sinh, gioi_tinh, dia_chi, sdt, email} = req.body;
            await pool.query("INSERT INTO vien_chuc ( ho_va_ten, gioi_tinh, ngay_sinh, dan_toc, trinh_do_chuyen_mon, ngay_ket_nap, ngay_chinh_thuc, chuyen_nganh, ngach, nam_tot_nghiep, trinh_do_ly_luan_CT, trinh_do_ngoai_ngu, trinh_do_tin_hoc) VALUES ($1, $2, $3, $4, $5, $6, $7)", [ten_vien_chuc, gioi_tinh, ngay_sinh, dia_chi, sdt, email]);
            res.status(201).send("Staff created successfully");
        }
        catch(error){
            console.error("Error fetching staff by ID:", error);
            res.status(500).send("Internal server error");
        }
    },
    updateStaff: async (req: Request, res: Response) => {
        try{

        }
        catch(error){
            console.error("Error fetching staff by ID:", error);
            res.status(500).send("Internal server error");
        }
    },
    deleteStaff: async (req: Request, res: Response) => {
        try{

        }
        catch(error){
            console.error("Error fetching staff by ID:", error);
            res.status(500).send("Internal server error");
        }
    }
}

export default staffController;