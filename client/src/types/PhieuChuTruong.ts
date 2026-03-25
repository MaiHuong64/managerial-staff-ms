export interface PhieuChuTruong {
    id: number;
    ma_phieu: string;
    so_to_trinh_chu_truong: string;
    tieu_de: string;
    ly_do_de_xuat: string;
    so_luong_de_xuat: number;
    nguon_nhan_su: number; // 1: Tại chỗ, 2: Nơi khác, 3: Cả hai
    ngay_lap: string; 
    ngay_phe_duyet?: string | null; // Có thể null nếu chưa duyệt
    trang_thai: number; // 0: Chờ duyệt, 1: Đã duyệt, 2: Bị trả về
    dot_quy_hoach_id?: number | null;
    don_vi_id: number;
    chuc_danh_id: number;
    nguoi_lap: string;

    ten_don_vi: string;
    ten_chuc_danh: string;
}