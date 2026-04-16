export interface PhieuChuTruong {
    id: number;
    ma_phieu: string;
    so_to_trinh_chu_truong: string;
    tieu_de: string;
    ly_do_de_xuat: string;
    so_luong_de_xuat: number;
    nguon_nhan_su: number; // 1: Tại chỗ, 2: Nơi khác
    ngay_lap: string; 
    ngay_phe_duyet?: string | null; // Có thể null nếu chưa duyệt
    trang_thai: number; // 1: Chờ duyệt, 2 đã duyệt, 0: Từ chối
    dot_quy_hoach_id?: number | null;
    don_vi_id: number;
    chuc_danh_id: number;
    nguoi_lap: string;
    ly_do_tu_choi: string;
    ten_don_vi: string;
    ten_chuc_danh: string;
}