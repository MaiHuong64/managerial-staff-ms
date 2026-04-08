export interface CreatePhieuDeXuatDTO {
    tieuDe: string;
    noiDung: string;
    soLuongDeXuat: number;
    chucDanhId: number;
    ngayLap: Date;
    nguoiLap: string;
    trangThai: string;
    vienChucList: AddNhanSuDTO[];
}
export interface AddNhanSuDTO{
    vienChucId: number;
    ghiChu?: string;
}
export interface UpdateTrangThaiPhieu {
    trangThai: number,
    ghiChu?: string,
    dotQuyHoachId?: number   // chỉ dùng khi approve (trangThai = 1)
}
export interface UpdateDuDieuKienDTO {
    duDieuKien: number, 
    lyDo?: string
}