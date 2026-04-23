import pool from "../../config/db";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";
import { HoSoBoNhiem } from "../HoSoBoNhiem/hoSoBoNhiem.type";
import { CreateQDBoNhiemDTO } from "./quyetDinhBoNhiem.dto";
import { NhiemKy, QuyetDinhBoNhiem } from "./quyetDinhBoNhiem.type";

export const generateQDBNCode = async (client: any) => {
    const result = await client.query(
        `SELECT CONCAT('QD', LPAD((COALESCE(MAX(id), 0) + 1)::text, 3, '0')) AS ma_bo_nhiem
         FROM quyet_dinh_bo_nhiem`
    );
    return result.rows[0].ma_bo_nhiem
}

export const insertQuyetDinh = async (client: any, maBN: string, payload: CreateQDBoNhiemDTO, hoSoBNId: number, nguoiPheDuyet: string):Promise<QuyetDinhBoNhiem> => {
    const result = await client.query (
        `INSERT INTO qd_bo_nhiem (ma_bo_nhiem, so_quyet_dinh, ngay_quyet_dinh, ngay_co_hieu_luc, thoi_han, loai_bo_nhiem, nguoi_phe_duyet, ho_so_bn_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [maBN, payload.soQuyetDinh, payload.ngayQuyetDinh, payload.ngayCoHieuLuc, payload.thoiHan, payload.loaiBoNhiem, nguoiPheDuyet, hoSoBNId]
    )
    return mapToCamel(result.rows[0]);
}
export const updateHoSoStatus = async (client: any, hoSoId: number) => {
    await client.query(
        `UPDATE ho_so_bo_nhiem SET trang_thai = 3 WHERE id = $1`,
        [hoSoId]
    );
}
export const getInforFromHS = async (client: any, hoSoId: number):Promise<NhiemKy> => {
    const result = await client.query (
        `SELECT vien_chuc_id, chuc_danh_id FROM ho_so_bo_nhiem WHERE id = $1`, [hoSoId]
    )
    return mapToCamel(result.rows[0]);
}
export const handleNhiemKy = async (client: any, ngayKetThucCu: Date, lyDo: string, vienChucId: number) => {
     await client.query(
        `UPDATE nhiem_ky_chuc_vu 
         SET trang_thai = 0, ngay_ket_thuc = $1, ly_do_ket_thuc = $2 
         WHERE vien_chuc_id = $3 AND trang_thai = 1`,
        [ngayKetThucCu, lyDo, vienChucId]
    );
}
export const insertNhiemKy = async (client: any, vienChucId: number, chucDanhId: number, ngayHieuLuc: Date, qdBNId: number) => {
      await client.query(
        `INSERT INTO nhiem_ky_chuc_vu (vien_chuc_id, chuc_danh_id, ngay_bat_dau, trang_thai, qd_bo_nhiem_id)
         VALUES ($1, $2, $3, 1, $4)`,
        [vienChucId, chucDanhId, ngayHieuLuc, qdBNId]
    );
}
export const getDetail = async (id: number) => {
    const result = await pool.query(
    `SELECT qd.id, qd.ma_bo_nhiem, qd.so_quyet_dinh, qd.ngay_quyet_dinh, qd.ngay_co_hieu_luc, qd.thoi_han, qd.loai_bo_nhiem,
    vc.id AS vien_chuc_id, vc.ho_ten, vc.ma_vien_chuc,
    cd.id AS chuc_danh_id, cd.ten_chuc_danh,
    dv.ten_don_vi,
    hs.id AS ho_so_id,
    nk.ngay_bat_dau, nk.ngay_ket_thuc, nk.trang_thai AS trang_thai_nhiem_ky

    FROM qd_bo_nhiem qd
    JOIN ho_so_bo_nhiem hs ON hs.id = qd.ho_so_bn_id
    JOIN vien_chuc vc ON vc.id = hs.vien_chuc_id
    JOIN chuc_danh cd ON cd.id = hs.chuc_danh_id
    JOIN don_vi dv ON dv.id = vc.don_vi_id
    LEFT JOIN nhiem_ky_chuc_vu nk ON nk.qd_bo_nhiem_id = qd.id
    WHERE qd.id = $1`, [id]
    )
    return mapArrayToCamel(result.rows);
}