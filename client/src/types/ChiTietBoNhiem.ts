export interface ChucDanh{
    chi_tiet_dot_id: number;
    phieu_chu_truong_id: number;
    ten_chuc_danh: string;
    ten_don_vi: string;
    so_luong_de_xuat: number;
    so_ung_vien: number;
    buoc_hien_tai: number;
}
export interface DotBoNhiem{
    id: number;
    ma_dot_bo_nhiem: string;
    ten_dot_bo_nhiem: string;
    trang_thai: number;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
    chuc_danh_list: ChucDanh[];
}
export interface UngVien{
    chi_tiet_bn_id: number;
    vien_chuc_id: number;
    ma_vien_chuc: string;
    ho_va_ten: string;
    ten_don_vi: string;
    ten_chuc_danh: string;
    nguon_vien_chuc: string;
    trang_thai: number;
}