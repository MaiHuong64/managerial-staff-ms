export interface PhieuChuTruong {
    id: number;
    ma_phieu: string;
    so_to_trinh_chu_truong: string;
    ma_chuc_danh: string;
    ma_don_vi: string;
    ma_nguoi_lap: string;
    tieu_de: string;
    ly_do_de_xuat: string;
    so_luong_de_xuat: number;
    nguon_nhan_su: number; // 1: tại chỗ, 2: nơi khác
    ngay_lap: Date;
    ngay_phe_duyet: Date;
    trang_thai: number;
}