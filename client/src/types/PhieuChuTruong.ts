export interface PhieuChuTruong {
    id: number;
    so_van_ban: string;
    ngay_lap: string;
    ly_do: string;
    so_luong_de_xuat: number;
    nguon_nhan_su: "tai_cho" | "noi_khac";
    du_kien_phan_cong:   string;
    trang_thai: 1 | 2 | 3;   // 1=chờ duyệt, 2=đã duyệt, 3=từ chối
    ghi_chu_duyet?: string;
    ten_chuc_danh: string;
    ten_don_vi: string;
}