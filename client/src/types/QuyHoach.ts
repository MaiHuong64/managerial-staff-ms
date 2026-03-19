export interface DotQuyHoach{
    id: number;
    ma_quy_hoach: string;
    ten_quy_hoach: string;
    loai_quy_hoach: number; 
    nam_thuc_hien: number;
    nhiem_ky: string;
    so_qd_phe_duyet: string | null;
    ngay_qd_phe_duyet: string | null;
    trang_thai: number;
    count: string | number;
}