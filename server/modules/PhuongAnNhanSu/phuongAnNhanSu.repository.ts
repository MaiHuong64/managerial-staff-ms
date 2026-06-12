import { PoolClient } from "pg";
import pool from "../../config/db";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";
import * as PhuongAnNSDTO from "./phuongAnNhanSu.dto";

export const getAllPANS = async () => {
    const result = await pool.query(
        `SELECT pa.id, pa.ma_phuong_an, pa.so_to_trinh, pa.ngay_to_trinh,
                pa.ngay_lap, pa.trang_thai, pa.y_kien_bgh,
                COUNT(ctpa.id) AS so_ung_vien
         FROM phuong_an_nhan_su pa
         LEFT JOIN chi_tiet_phuong_an ctpa ON ctpa.phuong_an_id = pa.id
         GROUP BY pa.id
         ORDER BY pa.id DESC`
    );
    return mapArrayToCamel(result.rows);
};

export const getChiTietPANSByPANSId = async (pansId: number) => {
    const result = await pool.query(
        `SELECT
            ctpa.id AS chi_tiet_pa_id, ctpa.loai_phuong_an, ctpa.ghi_chu, ctpa.chi_tiet_bn_id,
            vc.ho_va_ten, vc.ma_vien_chuc,  
            cd.ten_chuc_danh,
            dv.ten_don_vi
         FROM chi_tiet_phuong_an ctpa
         LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.id = ctpa.chi_tiet_bn_id
         LEFT JOIN vien_chuc vc ON vc.id = ctbn.vien_chuc_id
         LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
         LEFT JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
         LEFT JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
         LEFT JOIN don_vi dv ON dv.id = vc.don_vi_id
         WHERE ctpa.phuong_an_id = $1
         ORDER BY ctpa.id`,
        [pansId]
    );   
    return mapArrayToCamel(result.rows);
};

export const getNextMaPANS = async (client: PoolClient): Promise<string> => {
    const result = await client.query(
        `SELECT COALESCE(MAX(id), 0) AS max FROM phuong_an_nhan_su`
    );
    const nextId = Number(result.rows[0].max) + 1;
    return 'PA' + nextId.toString().padStart(3, '0');
};

export const insertPANS = async (client: PoolClient, maPhuongAn: string, payload: PhuongAnNSDTO.CreatePhuongAnNhanSuDTO): Promise<PhuongAnNSDTO.PhuongAnNhanSuDTO> => {
    const resultPA = await client.query(
        `INSERT INTO phuong_an_nhan_su (ma_phuong_an, so_to_trinh, ngay_to_trinh, ngay_lap, ghi_chu)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [maPhuongAn, payload.soToTrinh, payload.ngayTrinh, payload.ngayLap || new Date(), payload.ghiChu || null]
    );
    return mapToCamel<PhuongAnNSDTO.PhuongAnNhanSuDTO>(resultPA.rows[0]);
};

export const insertChiTietPANS = async (client: PoolClient, pansId: number, payload: PhuongAnNSDTO.CreatePhuongAnNhanSuDetailDTO[]): Promise<void> => {
    for (const item of payload) {
        await client.query(
            `INSERT INTO chi_tiet_phuong_an (phuong_an_id, chi_tiet_bn_id, loai_phuong_an, ghi_chu, trang_thai)
             VALUES ($1, $2, $3, $4, 1)`, 
            [pansId, item.chiTietBnId, item.loaiPhuongAn, item.ghiChu || null]
        );
    }
};

export const getPANSById = async (id: number) => {
    const result = await pool.query(
        `SELECT id, ma_phuong_an, so_to_trinh, ngay_to_trinh, ngay_lap, trang_thai, y_kien_bgh, ngay_phe_duyet, ghi_chu
         FROM phuong_an_nhan_su WHERE id = $1`,
        [id]
    );
    return mapToCamel(result.rows[0]);
};

export const getVienChucChoPANS = async () => {
    const result = await pool.query(
        `SELECT ctbn.id AS chi_tiet_bn_id, vc.ho_va_ten, cd.ten_chuc_danh, dv.ten_don_vi
         FROM chi_tiet_bo_nhiem ctbn
         JOIN vien_chuc vc ON vc.id = ctbn.vien_chuc_id
         JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
         JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
         JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
         JOIN don_vi dv ON dv.id = vc.don_vi_id
         WHERE ctbn.id NOT IN (SELECT chi_tiet_bn_id FROM chi_tiet_phuong_an) AND ctbn.trang_thai = 3 
         ORDER BY vc.ho_va_ten`
    );
    return mapArrayToCamel(result.rows); 
};

export const updateTrangThaiPANS = async (client: PoolClient, pansId: number, trangThai: number, yKienBGH?: string, ngayPheDuyet?: Date): Promise<void> => {
    await client.query(
        `UPDATE phuong_an_nhan_su
         SET trang_thai = $1, ngay_phe_duyet = $2, y_kien_bgh = $3
         WHERE id = $4`, 
        [trangThai, ngayPheDuyet, yKienBGH || null, pansId]
    );
};