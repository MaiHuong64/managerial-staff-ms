export interface ChiTietQuyHoach {
    id: number;
    ten_quy_hoach: string;
    ma_quy_hoach: string;
    loai_quy_hoach: number;
    nam_thuc_hien: number;

    so_qd_phe_duyet: string;
    ngay_qd_phe_duyet: string;

    vien_chuc_id: number
    ho_va_ten: string;
    ten_don_vi: string;
    ten_chuc_danh: string

    ngay_vao_qh: string;
    ngay_ra_qh: string;

    so_qd_ra_khoi_quy_hoach: string;
    ngay_qd_ra_khoi_quy_hoach: string;
    ly_do_ra_khoi_quy_hoach: string;
    trang_thai: number
}