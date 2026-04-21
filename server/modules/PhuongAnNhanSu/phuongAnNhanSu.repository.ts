import pool from "../../config/db";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";
import { CreatePhuongAnNhanSuDetailDTO, CreatePhuongAnNhanSuDTO, PhuongAnNhanSuDTO } from "./phuongAnNhanSu.dto";

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
}
export const getPANSById = async (id: number) => {
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
        [id]
    );   
    return mapArrayToCamel(result.rows);
}
export const getNextBatchCode = async (client: any) => {
    const result = await client.query(
        `SELECT COALESCE(MAX(id), 0) as max FROM phuong_an_nhan_su`
    )
    const nextId = Number(result.rows[0].max) + 1
    return 'PA' + nextId.toString().padStart(3, '0');
}
export const insertPANS = async (client: any, maPhuongAn: string, payload: CreatePhuongAnNhanSuDTO) => {
    const resultPA = await client.query(
        `
         INSERT INTO phuong_an_nhan_su (ma_phuong_an, so_to_trinh, ngay_to_trinh, ngay_lap, ghi_chu)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `,
        [maPhuongAn, payload.soToTrinh, payload.ngayTrinh, payload.ngayLap || new Date(), payload.ghiChu || null]
    )
    return mapToCamel<PhuongAnNhanSuDTO>(resultPA.rows[0]);
}
export const insertPANSDetail = async (client: any, phuongAnId: number, payload: CreatePhuongAnNhanSuDetailDTO[]) => {
    for (const item of payload){
        await client.query(
            `
            INSERT INTO chi_tiet_phuong_an (phuong_an_id, chi_tiet_bn_id, loai_phuong_an, ghi_chu, trang_thai)
            VALUES ($1, $2, $3, $4, $5)
            `, [phuongAnId, item.chiTietBnId, item.loaiPhuongAn, item.ghiChu || null, 1]
        )
    }
}

export const getPAInfoById = async (id: number) => {
    const result =  await pool.query(
        `SELECT id, ma_phuong_an, so_to_trinh, ngay_to_trinh, ngay_lap, trang_thai, y_kien_bgh, ngay_phe_duyet, ghi_chu
         FROM phuong_an_nhan_su WHERE id = $1`,
        [id]
    );
    return mapToCamel(result.rows[0]);
}

export const getCandidates = async () => {
    const result = await pool.query(
        `SELECT ctbn.id AS chi_tiet_bn_id, vc.ho_va_ten, cd.ten_chuc_danh, dv.ten_don_vi
        FROM chi_tiet_bo_nhiem ctbn
        JOIN vien_chuc vc ON vc.id = ctbn.vien_chuc_id
        JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
        JOIN phieu_chu_truong pct ON pct.id = ctdbn.phieu_chu_truong_id
        JOIN chuc_danh_quan_ly cd ON cd.id = pct.chuc_danh_id
        JOIN don_vi dv ON dv.id = vc.don_vi_id
        WHERE ctbn.id NOT IN (SELECT chi_tiet_bn_id FROM chi_tiet_phuong_an)
        ORDER BY vc.ho_va_ten`
    );
    return mapArrayToCamel(result.rows); 
}

export const updateStatus = async (client: any, chiTietPAId: number, trangThai: number, yKienBGH?: string) => {
    await client.query(
        `
        UPDATE phuong_an_nhan_su
        SET trang_thai = $1, ngay_phe_duyet = $2, y_kien_bgh = $3
        WHERE id = $4
        `, [trangThai, new Date(), yKienBGH || null, chiTietPAId]
    )
}