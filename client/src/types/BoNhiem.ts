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
    ten_chuc_danh: string;
    nguon_vien_chuc: string;
    trang_thai: number;
}

export interface ChiTietBoNhiemReq{
    batchInfo: DotBoNhiem;
    candidates: ChiTietBoNhiem[];
}
export interface KetQuaUngVien {
    chi_tiet_bn_id: number;
    so_phieu_dong_y: number;
    so_phieu_khong_dong_y: number;
    ket_qua: number;  
}
export interface CandidateVoteInput {
    chi_tiet_bn_id: number;
    so_phieu_dong_y: number | null;
    so_phieu_khong_dong_y: number | null;
}

export interface VoteResultRequest {
    buoc_hoi_nghi: number;   // 3 | 4 | 5
    so_nguoi_trieu_tap: number;
    so_nguoi_co_mat: number;
    so_phieu_phat_ra: number;
    so_phieu_thu_ve: number;
    so_phieu_hop_le: number;
    ket_qua_ung_vien: KetQuaUngVien[];
}
export interface KetQuaBoNhiem {
    id: number;
    buoc_hoi_nghi: number;
    so_nguoi_trieu_tap: number;
    so_nguoi_co_mat: number;
    so_phieu_phat_ra: number;
    so_phieu_thu_ve: number;
    so_phieu_hop_le: number;
    so_phieu_dong_y: number;
    so_phieu_khong_dong_y: number;
    ket_qua: number;
    chi_tiet_bn_id: number;
}