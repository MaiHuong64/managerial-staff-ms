export interface CreatePhieuDeXuatDTO {
    tieuDe: string;
    noiDung: string;
    soLuongDeXuat: number;
    chucDanhId: number;
    ngayLap: Date;
    nguoiLap: string;
    trangThai: string;
}
export interface AddNhanSuDTO{
    vienChucId: number;
    ghiChu?: string;
}
export interface UpdateTrangThaiPhieu {
    trangThai: number,
    ghiChu?: string
}
export interface UpdateDuDieuKienDTO {
    duDieuKien: number, 
    lyDo?: string
}