export interface ChiTietQuyHoach {
    chi_tiet_id: number;
    id: number;
    ten_quy_hoach: string;
    ma_quy_hoach: string;
    loai_quy_hoach: number;
    nam_thuc_hien: number;

    so_qd_phe_duyet: string;
    ngay_qd_phe_duyet: string;

    vien_chuc_id: number;
    ho_va_ten: string;
    ma_vien_chuc: string;
    ten_don_vi: string;
    ten_chuc_danh: string;

    ngay_vao_qh: string;
    ngay_ra_qh: string;

    buoc_hien_tai: number;

    so_qd_ra_khoi_quy_hoach: string;
    ngay_qd_ra_khoi_quy_hoach: string;
    ly_do_ra_khoi_quy_hoach: string;
    trang_thai: number;
}
export interface QHCandidate {
    chi_tiet_qh_id: number;
    ma_vien_chuc: string;
    ho_va_ten: string;
    ten_chuc_danh: string;
    ten_don_vi: string;
    buoc_hien_tai: number;
}
export interface CandidateVoteInput {
    chiTietQHId: number;
    soPhieuDongY: number;
    soPhieuKhongDongY: number;
}
export interface VoteQHPayload {
    dotQHId: number;
    buocHoiNghi: number;
    soNguoiTrieuTap: number;
    soNguoiCoMat: number;
    soPhieuPhatRa: number;
    soPhieuThuVe: number;
    soPhieuHopLe: number;
    ketQuaUngVien: CandidateVoteInput[];
}
