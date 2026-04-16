import type { ChucDanh } from "./ChucDanh";
import type { VienChuc } from "./VienChuc";

export interface PhieuDeXuatNhanSu {
    id: number;
    maPhieuDeXuat: string;
    tieuDe: string;
    noiDung: string | null;
    soLuongDeXuat: number | null;
    ngayLap: string;
    ngayPheDuyet: string | null;
    trangThai: number;
    ghiChu: string | null;
    donViId: number;
    chucDanhId: number;
    nguoiLap: string;

    tenDonVi: string;
    tenChucDanh: string;
    soNguoiDeXuat: number;
}

export interface ChiTietPhieuDeXuat {
    id: number; 
    vienChucId: number;
    hoVaTen: string;
    duDieuKien: number; 
    lyDoKhongDu: string | null;
    ghiChu: string | null;
}

export interface ChucDanhWithVienChuc {
    chucDanh: ChucDanh;
    vienChucList: VienChuc[];
}
export interface PhieuDeXuatNhanSuChiTiet extends Omit<PhieuDeXuatNhanSu, 'soNguoiDeXXuat'> {
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
