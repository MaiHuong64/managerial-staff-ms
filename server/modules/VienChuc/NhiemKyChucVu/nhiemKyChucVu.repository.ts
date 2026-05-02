import pool from "../../../config/db"
import { mapArrayToCamel } from "../../../utils/mapper"
import { nhiemKyChucVuDTO } from "./nhiemKyChucVu.dto";

export const getHistoryByStaffId = async (vienChucId: number) => {
    const result = await pool.query(
        `SELECT nk.id, nk.ngay_bat_dau, nk.ngay_ket_thuc, nk.ly_do_ket_thuc, nk.trang_thai,
                qd.so_quyet_dinh, qd.ngay_quyet_dinh, qd.nguoi_phe_duyet, qd.chuc_vu, qd.loai_bo_nhiem, qd.thoi_han,
                cd.ten_chuc_danh
        FROM nhiem_ky_chuc_vu nk
        JOIN chuc_danh_quan_ly cd ON nk.chuc_danh_id = cd.id
        JOIN qd_bo_nhiem qd ON nk.qd_bo_nhiem_id = qd.id
        WHERE nk.vien_chuc_id = $1
        ORDER BY nk.ngay_bat_dau DESC;
        `, [vienChucId]
    )
    return mapArrayToCamel<nhiemKyChucVuDTO>(result.rows);
}
export const getCurrentTermByStaffId = async (vienChucId: number) => {
const result = await pool.query(
        `SELECT nk.id, nk.ngay_bat_dau, nk.ngay_ket_thuc, nk.ly_do_ket_thuc, nk.trang_thai,
                qd.so_quyet_dinh, qd.ngay_quyet_dinh, qd.nguoi_phe_duyet, qd.chuc_vu, qd.loai_bo_nhiem, qd.thoi_han,
                cd.ten_chuc_danh
        FROM nhiem_ky_chuc_vu nk
        JOIN chuc_danh_quan_ly cd ON nk.chuc_danh_id = cd.id
        JOIN qd_bo_nhiem qd ON nk.qd_bo_nhiem_id = qd.id
        WHERE nk.vien_chuc_id = $1 AND nk.trang_thai = 1
        ORDER BY nk.ngay_bat_dau DESC;
        `, [vienChucId]
    )
    return mapArrayToCamel<nhiemKyChucVuDTO>(result.rows);
}
