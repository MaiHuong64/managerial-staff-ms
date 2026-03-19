export interface DotBoNhiem{
    id: number;
    ma_dot_bo_nhiem: string;
    ten_dot_bo_nhiem: string;
    trang_thai: number;
    so_luong_de_xuat: number;
    ten_chuc_danh: string;
    ten_don_vi: string;
}
export interface ChiTietBoNhiem{
    chi_tiet_bn_id: number;
    vien_chuc_id: number;
    ma_vien_chuc: string;
    ho_va_ten: string;
    ten_don_vi: string;
    chuc_vu_hien_tai: string;
    nguon_ung_vien: string
    trang_thai: number;
}

export interface ChiTietBoNhiemReq{
    batchInfo: DotBoNhiem;
    candidates: ChiTietBoNhiem[];
}