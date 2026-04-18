export interface PhieuChuTruong {
    id: number;
    maPhieu: string;
    soToTrinhChuTruong: string;
    tieuDe: string;
    lyDoDeXuat: string;
    soLuongDeXuat: number;
    nguonNhanSu: 1 | 2; // 1: Tại chỗ, 2: Nơi khác
    ngayLap: string; 
    ngayPheDuyet?: string | null; 
    trangThai: 0 | 1 | 2; // 0: Từ chối, 1: Chờ duyệt, 2: Đã duyệt
    dotQuyHoachId?: number | null;
    donViId: number;
    chucDanhId: number;
    nguoiLap: string;
    lyDoTuChoi?: string | null;
    tenDonVi: string;
    tenChucDanh: string;
}