// import { Router  } from "express";
import {Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";

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
            const ma_vien_chuc = "VC" + (id.rows[0].max + 1).toString().padStart(3, '0');
            const {ho_va_ten, gioi_tinh, ngay_sinh, dan_toc,
                so_cccd, so_dien_thoai, email, dia_chi,
                trinh_do_chuyen_mon, chuyen_nganh, ngach,
                nam_tot_nghiep, trinh_do_ly_luan_CT,
                trinh_do_ngoai_ngu, trinh_do_tin_hoc,
                ngay_ket_nap, ngay_chinh_thuc, don_vi_id} = req.body;
                console.log(req.body);
            const result = await pool.query(`INSERT INTO vien_chuc (
                ma_vien_chuc, ho_va_ten, gioi_tinh, ngay_sinh, dan_toc,
                so_cccd, so_dien_thoai, email, dia_chi,
                trinh_do_chuyen_mon, chuyen_nganh, ngach, nam_tot_nghiep,
                trinh_do_ly_luan_CT, trinh_do_ngoai_ngu, trinh_do_tin_hoc,
                ngay_ket_nap, ngay_chinh_thuc, don_vi_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING id, ma_vien_chuc, ho_va_ten`,
                [ma_vien_chuc, ho_va_ten, gioi_tinh, ngay_sinh, dan_toc, so_cccd, so_dien_thoai, email, dia_chi,
                trinh_do_chuyen_mon, chuyen_nganh, ngach, nam_tot_nghiep, trinh_do_ly_luan_CT, trinh_do_ngoai_ngu, trinh_do_tin_hoc,
                ngay_ket_nap, ngay_chinh_thuc, don_vi_id]);
            
            const newStaff = result.rows[0];
            console.log(newStaff)

            if(result.rows.length > 0){
                
                const hashedPassword = await bcrypt.hash('123456', 10);
                const newAccount = await pool.query (`INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai, vien_chuc_id) VALUES ($1, $2, $3, $4, $5)`,
                                                    [ma_vien_chuc, hashedPassword, 'VC', 1, newStaff.id ])
            }
            return res.status(201).json({
                success: true,
                message: "Tạo viên chức thành công",
                data: newStaff
            });
        }
        catch(error: any){
            console.error("Error fetching staff by ID:", error);
            res.status(500).json({
                sucess: false,
                message: error.message,
                detail:error
            })
        }
    },
    updateStaff: async (req: Request, res: Response) => {
        try{
            const id = (req as any).user.id;
            // console.log("uid: ", id)
            const fields = req.body;

            // console.log("fields: ",fields);

            if(Object.keys(fields).length === 0){
                return res.status(400).json({ error: 'No fields provided for update' });
            }

            const result =  Object.keys(fields).map((key, i) => `${key} = $${i + 1}`);
            // console.log("result: ",result);
            result.join (', ');
            // console.log("after join: ",result.join (', '));
            const values = Object.values(fields);

            const query = await pool.query(`UPDATE vien_chuc
                                            SET ${result}
                                            WHERE id = $${values.length+1} RETURNING id, ma_vien_chuc, ho_va_ten`, [...values, id]);
            if(query.rows.length === 0){
                return res.status(404).json({success: false, message: "Không tìm thấy viên chức"});
            }
            return res.status(200).json ({success: true, message: "Cập nhật thành công", data: query.rows[0]})
           }
        catch(error){
            console.error("Error updating staff:", error);
            res.status(500).send("Internal server error");
        }
    },
    deleteStaff: async (req: Request, res: Response) => {
        try{
            // get id from URL
            const id = req.params.id;
            const query = `UPDATE vien_chuc set trang_thai = NOW() WHERE id = $1`;
            const result = await pool.query(query, [id]);
            return res.status(200).json ({success: true, message: "Cập nhật thành công"})
        }
        catch(error){
            console.error("Error fetching staff by ID:", error);
            res.status(500).send("Internal server error");
        }
    },
    getProfileStaff: async (req: Request, res:Response) =>{
        try {
            const uid = (req as any).user.id;

            console.log("uid: ", uid);

            const queryProfile = ` SELECT vc.*, dv.ten_don_vi, cd.ten_chuc_danh, nk.ngay_bat_dau, nk.ngay_ket_thuc, qd.so_quyet_dinh, tk.vai_tro

                                FROM vien_chuc vc LEFT JOIN don_vi dv on vc.don_vi_id = dv.id	
                                LEFT JOIN nhiem_ky_chuc_vu nk on vc.id = nk.vien_chuc_id AND nk.trang_thai = 1
                                LEFT JOIN chuc_danh_quan_ly cd on cd.id = nk.chuc_danh_id
                                LEFT JOIN qd_bo_nhiem qd on qd.id = nk.qd_bo_nhiem_id
                                LEFT JOIN tai_khoan tk ON tk.vien_chuc_id = vc.id
                            WHERE vc.id = $1`
            
            const querylichSuChucvu = `
                                SELECT vc.*, dv.ten_don_vi, cd.ten_chuc_danh, nk.ngay_bat_dau, nk.ngay_ket_thuc, qd.so_quyet_dinh 
                                FROM vien_chuc vc LEFT JOIN don_vi dv on vc.don_vi_id = dv.id	
                                    LEFT JOIN nhiem_ky_chuc_vu nk on vc.id = nk.vien_chuc_id
                                    LEFT JOIN chuc_danh_quan_ly cd on cd.id = nk.chuc_danh_id
                                    LEFT JOIN qd_bo_nhiem qd on qd.id = nk.qd_bo_nhiem_id
                                WHERE vc.id = $1
                                ORDER BY nk.ngay_bat_dau DESC`;
            const queryXepLoaiVC = `
                                SELECT nam_danh_gia, danh_gia, nhan_xet
                                FROM xep_loai_vc
                                WHERE vien_chuc_id = $1
                                ORDER BY nam_danh_gia DESC`;

            const queryXepLoaiDV = `
                                SELECT nam_danh_gia, danh_gia, nhan_xet
                                FROM xep_loai_dang_vien
                                WHERE vien_chuc_id = $1
                                ORDER BY nam_danh_gia DESC
                                LIMIT 3`;
            
            // const profile = await pool.query(queryProfile, [uid]);    
            // const history = await pool.query(lichSuBoNhiem, [uid]);
            // const staff = await pool.query(queryXepLoaiVC, [uid]);
            // const partyEvaluation = await pool.query(queryXepLoaiDV, [uid]);
            const [profile, history, staffEval, partyEval] = await Promise.all([
                pool.query(queryProfile, [uid]),
                pool.query(querylichSuChucvu    , [uid]),
                pool.query(queryXepLoaiVC, [uid]),
                pool.query(queryXepLoaiDV, [uid])
            ]);

            if(profile.rows.length === 0){
                return res.status(404).json({success: false, message: "Can't find this staff"});
            }
            return res.status(200).json({ success: true,  data: { ...profile.rows[0], lich_su_chuc_vu: history.rows, xep_loai_vc: staffEval.rows, xep_loai_dang_vien: partyEval.rows } });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }
}

export default staffController;