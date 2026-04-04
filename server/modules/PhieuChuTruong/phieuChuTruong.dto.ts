export interface CreatePhieuChuTruongDTO {
    soToTrinhChuTruong: string;
    tieuDe: string;
    lyDoDeXuat: string;
    soLuongDeXuat: number;
    nguonNhanSu: 1 | 2;    // 1: tại chỗ, 2: nơi khác
    dotQuyHoachId?: number; 
    chucDanhId: number;
}