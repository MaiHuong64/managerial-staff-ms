import dayjs from "dayjs";
import pool from "../../config/db";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";
// Lưu ý: Đảm bảo CreateQDBoNhiemDTO đã có trường chucVu
import { CreateQDBoNhiemDTO } from "./quyetDinhBoNhiem.dto";
import { NhiemKy, QuyetDinhBoNhiem } from "./quyetDinhBoNhiem.type";

export const generateQDBNCode = async (client: any) => {
    const result = await client.query(
        `SELECT CONCAT('QD', LPAD((COALESCE(MAX(id), 0) + 1)::text, 3, '0')) AS ma_bo_nhiem
         FROM qd_bo_nhiem`
    );
    return result.rows[0].ma_bo_nhiem;
}

export const insertQuyetDinh = async (client: any, maBN: string, payload: CreateQDBoNhiemDTO, hoSoBNId: number): Promise<QuyetDinhBoNhiem> => {
    const result = await client.query(
        `INSERT INTO qd_bo_nhiem (ma_bo_nhiem, so_quyet_dinh, ngay_quyet_dinh, ngay_co_hieu_luc, thoi_han, loai_bo_nhiem, nguoi_phe_duyet, chuc_vu, ho_so_bn_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [maBN, payload.soQuyetDinh, payload.ngayQuyetDinh, payload.ngayCoHieuLuc, payload.thoiHanGiuChucVu, payload.loaiBoNhiem, payload.nguoiPheDuyet, payload.chucVu, hoSoBNId]
    );
    return mapToCamel(result.rows[0]);
}

export const updateHoSoStatus = async (client: any, hoSoId: number) => {
    await client.query(
        `UPDATE ho_so_bo_nhiem SET trang_thai = 3 WHERE id = $1`,
        [hoSoId]
    );
}

export const getInforFromHS = async (client: any, hoSoId: number): Promise<NhiemKy> => {
    const result = await client.query(
        `SELECT
            vc.id AS vien_chuc_id, vc.gioi_tinh, vc.ngay_sinh,
            cd.id AS chuc_danh_id,
            (cd.thoi_han_giu_chuc_vu * 12) AS thoi_han
        FROM ho_so_bo_nhiem hsbn
        LEFT JOIN chi_tiet_phuong_an ctpa ON hsbn.chi_tiet_pa_id = ctpa.id
        LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.id = ctpa.chi_tiet_bn_id
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
        LEFT JOIN phieu_chu_truong pct_from_pa ON pct_from_pa.id = ctdbn.phieu_chu_truong_id
        LEFT JOIN phieu_chu_truong pct_direct ON pct_direct.id = hsbn.phieu_chu_truong_id
        JOIN vien_chuc vc ON vc.id = COALESCE(ctbn.vien_chuc_id, pct_direct.vien_chuc_id)
        JOIN chuc_danh_quan_ly cd ON cd.id = COALESCE(pct_from_pa.chuc_danh_id, pct_direct.chuc_danh_id)
        WHERE hsbn.id = $1`,
        [hoSoId]
    );
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

export const insertNhiemKy = async (client: any, vienChucId: number, chucDanhId: number, ngayHieuLuc: Date, thoiHan: number, ngaySinh: Date, gioiTinh: number, qdBNId: number) => {
    const tuoiNghiHuu = gioiTinh === 1 ? 60 : 55; // Giả sử nam nghỉ hưu ở 60 tuổi, nữ ở 55 tuổi
    const ngayNghiHuu = dayjs(ngaySinh).add(tuoiNghiHuu, 'year');
    const ngayKetThucNhiemKy = dayjs(ngayHieuLuc).add(thoiHan, 'month');
    const ngayKetThuc = ngayKetThucNhiemKy.isBefore(ngayNghiHuu) ? ngayKetThucNhiemKy.toDate() : ngayNghiHuu.toDate();
    console.log('ngaySinh:', ngaySinh);
    console.log('gioiTinh:', gioiTinh);
    console.log('thoiHan:', thoiHan);
    await client.query(
        `INSERT INTO nhiem_ky_chuc_vu (vien_chuc_id, chuc_danh_id, ngay_bat_dau, ngay_ket_thuc, trang_thai, qd_bo_nhiem_id)
         VALUES ($1, $2, $3, $4, 1, $5)`,
        [vienChucId, chucDanhId, ngayHieuLuc, ngayKetThuc, qdBNId]
    );
}

export const getDetail = async (id: number) => {
    const result = await pool.query(
        `SELECT
            qd.id, qd.ma_bo_nhiem, qd.so_quyet_dinh, qd.ngay_quyet_dinh,
            qd.ngay_co_hieu_luc, qd.thoi_han, qd.loai_bo_nhiem,
            qd.chuc_vu, qd.nguoi_phe_duyet,
            vc.id AS vien_chuc_id, vc.ho_va_ten, vc.ma_vien_chuc,
            cd.id AS chuc_danh_id, cd.ten_chuc_danh,
            dv.ten_don_vi,
            hs.id AS ho_so_id,
            nk.ngay_bat_dau, nk.ngay_ket_thuc, nk.trang_thai AS trang_thai_nhiem_ky
        FROM qd_bo_nhiem qd
        JOIN ho_so_bo_nhiem hs ON hs.id = qd.ho_so_bn_id
        LEFT JOIN chi_tiet_phuong_an ctpa ON hs.chi_tiet_pa_id = ctpa.id
        LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.id = ctpa.chi_tiet_bn_id
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
        LEFT JOIN phieu_chu_truong pct_from_pa ON pct_from_pa.id = ctdbn.phieu_chu_truong_id
        LEFT JOIN phieu_chu_truong pct_direct ON pct_direct.id = hs.phieu_chu_truong_id
        JOIN vien_chuc vc ON vc.id = COALESCE(ctbn.vien_chuc_id, pct_direct.vien_chuc_id)
        JOIN chuc_danh_quan_ly cd ON cd.id = COALESCE(pct_from_pa.chuc_danh_id, pct_direct.chuc_danh_id)
        JOIN don_vi dv ON dv.id = vc.don_vi_id
        LEFT JOIN nhiem_ky_chuc_vu nk ON nk.qd_bo_nhiem_id = qd.id
        WHERE qd.id = $1`, [id]
    );
    return mapArrayToCamel(result.rows);
}

export const getHoSoInfoForQD = async (hoSoId: number) => {
    const result = await pool.query(
        `SELECT
            vc.id AS vien_chuc_id, vc.ho_va_ten, vc.ma_vien_chuc,
            cd.id AS chuc_danh_id, cd.ten_chuc_danh, cd.thoi_han_giu_chuc_vu,
            dv.ten_don_vi,
            ctpa.loai_phuong_an
        FROM ho_so_bo_nhiem hsbn
        LEFT JOIN chi_tiet_phuong_an ctpa ON hsbn.chi_tiet_pa_id = ctpa.id
        LEFT JOIN chi_tiet_bo_nhiem ctbn ON ctbn.id = ctpa.chi_tiet_bn_id
        LEFT JOIN chi_tiet_dot_bo_nhiem ctdbn ON ctdbn.id = ctbn.chi_tiet_dot_bo_nhiem_id
        LEFT JOIN phieu_chu_truong pct_from_pa ON pct_from_pa.id = ctdbn.phieu_chu_truong_id
        LEFT JOIN phieu_chu_truong pct_direct ON pct_direct.id = hsbn.phieu_chu_truong_id
        JOIN vien_chuc vc ON vc.id = COALESCE(ctbn.vien_chuc_id, pct_direct.vien_chuc_id)
        JOIN chuc_danh_quan_ly cd ON cd.id = COALESCE(pct_from_pa.chuc_danh_id, pct_direct.chuc_danh_id)
        JOIN don_vi dv ON dv.id = vc.don_vi_id
        WHERE hsbn.id = $1`,
        [hoSoId]
    );
    return mapToCamel(result.rows[0]);
}