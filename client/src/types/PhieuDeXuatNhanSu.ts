import type { ChucDanh } from "./ChucDanh";
import type { VienChuc } from "./VienChuc";

export interface PhieuDeXuat {
    id: number;
    ma_phieu_de_xuat: string;
    tieu_de: string;
    noi_dung: string | null;
    so_luong_de_xuat: number | null;
    ngay_lap: string;
    ngay_phe_duyet: string | null;
    trang_thai: number; // 0: chờ duyệt, 1: đã duyệt, 2: từ chối
    ghi_chu: string | null;
    don_vi_id: number;
    chuc_danh_id: number;
    nguoi_lap: string;

    ten_don_vi: string;
    ten_chuc_danh: string;
    so_nguoi_de_xuat: number;
}

export interface ChiTietPhieuDeXuat {
    id: number; 
    vien_chuc_id: number;
    ho_va_ten: string;
    du_dieu_kien: number; // 0: chưa xét, 1: đủ, 2: không đủ
    ly_do_khong_du: string | null;
    ghi_chu: string | null;
}
export interface ChucDanhWithVienChuc{
    chucDanh: ChucDanh,
    vienChucList: VienChuc[]
}
export interface PhieuDeXuatDetail extends Omit<PhieuDeXuat, 'so_nguoi_de_xuat'> {
    nhanSu: ChiTietPhieuDeXuat[];
}

export const TRANG_THAI_PHIEU_DE_XUAT: Record<number, { label: string; color: string }> = {
    [-1]: { label: 'Nháp', color: 'default' },
    0: { label: 'Chờ duyệt', color: 'orange' },
    1: { label: 'Đã duyệt', color: 'green' },
    2: { label: 'Từ chối', color: 'red' },
};

export const DU_DIEU_KIEN: Record<number, { label: string; color: string }> = {
    0: { label: 'Chưa xét', color: 'default' },
    1: { label: 'Đủ điều kiện', color: 'green' },
    2: { label: 'Không đủ', color: 'red' },
};
