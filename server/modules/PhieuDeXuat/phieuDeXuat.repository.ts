import pool from "../../config/db";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";
import { AddNhanSuDTO, ChiTietPhieuDeXuatNhanSu, CreatePhieuDeXuatDTO, DanhSachPhieuDeXuatNhanSu, PhieuDeXuatNhanSu, UpdateDuDieuKienDTO } from "./phieuDeXuat.dto";

export const generatePhieuDeXuatCode = async (client: any) => {
    const result = await client.query(
        `SELECT CONCAT('PDX', LPAD((COALESCE(MAX(id), 0) + 1)::text, 3, '0')) AS ma_phieu_de_xuat
         FROM phieu_de_xuat_nhan_su_quy_hoach`
    );
    return result.rows[0].ma_phieu_de_xuat;
};

export const getAllPhieuDeXuat = async (): Promise<DanhSachPhieuDeXuatNhanSu[]> => {
    const result = await pool.query(
        `SELECT p.*, dv.ten_don_vi, cd.ten_chuc_danh, COUNT(ct.id) as so_nguoi_de_xuat
        FROM phieu_de_xuat_nhan_su_quy_hoach p
        LEFT JOIN chuc_danh_quan_ly cd ON cd.id = p.chuc_danh_id 
        LEFT JOIN don_vi dv ON dv.id = p.don_vi_id
        LEFT JOIN chi_tiet_phieu_de_xuat ct ON ct.phieu_de_xuat_id = p.id
        GROUP BY p.id, dv.ten_don_vi, cd.ten_chuc_danh
        ORDER BY p.ngay_lap DESC`
    );
    return mapArrayToCamel<DanhSachPhieuDeXuatNhanSu>(result.rows);
}
export const getPhieuDeXuatById = async (id: number): Promise<ChiTietPhieuDeXuatNhanSu[]> => {
    const result = await pool.query(
        `SELECT 
            p.*,
            dv.ten_don_vi,
            cd.ten_chuc_danh,
            ct.id AS chi_tiet_id,
            vc.ho_va_ten, vc.id AS vien_chuc_id,
            ct.du_dieu_kien, ct.ly_do_khong_du, ct.ghi_chu AS ghi_chu_ct
        FROM phieu_de_xuat_nhan_su_quy_hoach p
        JOIN don_vi dv ON dv.id = p.don_vi_id
        JOIN chuc_danh_quan_ly cd ON cd.id = p.chuc_danh_id
        LEFT JOIN chi_tiet_phieu_de_xuat ct ON ct.phieu_de_xuat_id = p.id
        LEFT JOIN vien_chuc vc ON vc.id = ct.vien_chuc_id
        WHERE p.id = $1
        `, [id]
    )
    return mapArrayToCamel(result.rows);
}

export const insertPhieuDeXuat = async (client: any, payload: CreatePhieuDeXuatDTO , user: any, maPhieu: string): Promise<PhieuDeXuatNhanSu> => {
    const { hoVaTen, donViId } = user
    const result = await client.query (
        `
        INSERT INTO phieu_de_xuat_nhan_su_quy_hoach
        (ma_phieu_de_xuat, tieu_de, noi_dung, so_luong_de_xuat,
        chuc_danh_id, don_vi_id, nguoi_lap, ngay_lap, trang_thai) VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `,[maPhieu, payload.tieuDe, payload.noiDung, payload.soLuongDeXuat, payload.chucDanhId, donViId, hoVaTen, payload.ngayLap ?? new Date(), -1]
    )
    return mapToCamel<PhieuDeXuatNhanSu>(result.rows[0]);
};
export const insertChiTietPhieu = async (client: any, phieuDeXuatId: number, payload: AddNhanSuDTO) => {
    const result = await client.query(
        `
        INSERT INTO chi_tiet_phieu_de_xuat (phieu_de_xuat_id, vien_chuc_id, ghi_chu, du_dieu_kien) VALUES
        ($1, $2, $3, $4)`, [phieuDeXuatId, payload.vienChucId, payload.ghiChu, 0]
    )
    return mapToCamel(result.rows[0]);
}


export const submitPhieuDeXuat = async (client: any, id: number) => {
    const result = await client.query(
        `UPDATE phieu_de_xuat_nhan_su_quy_hoach
         SET trang_thai = 0
         WHERE id = $1 AND trang_thai = -1
         RETURNING *`,
        [id]
    );
    return mapToCamel(result.rows[0]);
}
export const insertVaoChiTietQuyHoach = async (client: any, phieuId: number, dotQuyHoachId: number) => {
    await client.query(
        `INSERT INTO chi_tiet_quy_hoach
             (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id, don_vi_id,
              chi_tiet_de_xuat_id, loai_nguon, buoc_hien_tai, trang_thai, ngay_vao_qh)
        SELECT $1, ct.vien_chuc_id, p.chuc_danh_id, p.don_vi_id, ct.id, 1, 2, 1, CURRENT_DATE
        FROM chi_tiet_phieu_de_xuat ct
        JOIN phieu_de_xuat_nhan_su_quy_hoach p ON p.id = ct.phieu_de_xuat_id
        WHERE ct.phieu_de_xuat_id = $2 AND ct.du_dieu_kien = 1
        ON CONFLICT (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id) DO NOTHING`,
        [dotQuyHoachId, phieuId]
    );
}

export const updateTrangThaiPhieu= async (client: any, trangThai: number, phieuId: number, ghiChu?: string) => {
    const result = await client.query(
        `UPDATE phieu_de_xuat_nhan_su_quy_hoach
        SET trang_thai = $1, ngay_phe_duyet = CURRENT_DATE, ghi_chu = $2
        WHERE id = $3 RETURNING *
        `,[trangThai, ghiChu, phieuId]
    )
    return mapToCamel(result.rows[0]);
}

export const updateDuDieuKien = async (client: any, chiTietPhieuId: number, payload: UpdateDuDieuKienDTO) => {
    const result = await client.query (
        `
        UPDATE chi_tiet_phieu_de_xuat
        SET du_dieu_kien = $1,
             ly_do_khong_du = $2
        WHERE id = $3
        RETURNING *`,[payload.duDieuKien, payload.lyDo, chiTietPhieuId]
    )
    return mapToCamel(result.rows[0]);
}
export const updateTrangThaiPhieuDuDieuKien = async (client: any, phieuId: number) => {
    const result = await client.query(
        `UPDATE phieu_de_xuat_nhan_su_quy_hoach
         SET trang_thai = 3
         WHERE id = $1 RETURNING *`,
        [phieuId]
    );
    return mapToCamel(result.rows[0]);
}
export const getPhieuIdByChiTietId = async (client: any, chiTietId: number) => {
    const result = await client.query(
        `SELECT phieu_de_xuat_id FROM chi_tiet_phieu_de_xuat WHERE id = $1`,
        [chiTietId]
    );
    return mapToCamel(result.rows[0].phieu_de_xuat_id);
}

export const checkAllCandidatesReviewed = async (client: any, phieuId: number): Promise<boolean> => {
    const result = await client.query(
        `SELECT COUNT(*) as total,
                COUNT(CASE WHEN du_dieu_kien > 0 THEN 1 END) as reviewed
         FROM chi_tiet_phieu_de_xuat
         WHERE phieu_de_xuat_id = $1`,
        [phieuId]
    );
    const { total, reviewed } = result.rows[0];
    return Number(total) === Number(reviewed) && Number(total) > 0;
}

export const countEligibleCandidates = async (client: any, phieuId: number): Promise<number> => {
    const result = await client.query(
        `SELECT COUNT(*) as count
         FROM chi_tiet_phieu_de_xuat
         WHERE phieu_de_xuat_id = $1 AND du_dieu_kien = 1`,
        [phieuId]
    );
    return Number(result.rows[0].count);
}