// import pool from "../config/db"

// export const addPersonnelPla = async (req: Request, res: Response) => {
//     const {buoc_hoi_nghi_id, dot_bo_nhiem_id} = req.body;
//     try {
//         const query = `SELECT  vc.*, cd.ten_chuc_danh, kq.buoc_hoi_nghi,
//                     FROM ket_qua_bo_nhiem kq
//                     LEFT JOIN chi_tiet_bo_nhiem ctbn ON kq.chi_tiet_bn_id = ctbn.id
//                     LEFT JOIN vien_chuc vc ON ctbn.vien_chuc_id = vc.id
//                     LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctbn.chi_tiet_dot_bo_nhiem_id = ctdbn.id
//                     LEFT JOIN phieu_chu_truong pct ON ctdbn.phieu_chu_truong_id = pct.id
//                     LEFT JOIN chuc_danh_quan_ly cd ON pct.chuc_danh_id = cd.id
//                     WHERE ctbn.id = $1 and dot_bo_nhiem = $2
//                     ORDER BY kq.buoc_hoi_nghi DESC
//                     LIMIT 1;`
//         const result = await pool.query(query, [buoc_hoi_nghi_id, dot_bo_nhiem_id]);
//     } catch (error) {
        
//     }
// } 