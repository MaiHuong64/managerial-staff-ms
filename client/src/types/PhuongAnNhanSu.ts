export interface PhuongAnNhanSu {
    id: number;
    ma_phuong_an: string;
    so_to_trinh: string;
    ngay_to_trinh: string;
    ngay_lap: string;
    trang_thai: number;
    so_nhan_su?: number ;
    ghi_chu?: string;
}