export interface ChucDanh{
    id: number;
    ma: string;
    ten: string;
    hang: string;
    trang_thai: 'hoat_dong' | 'vo_hieu';
    nguoi_dang_giu?: string;
    tong_nhiem_ky: number;
}