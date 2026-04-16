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
    dotQuyHoachId?: number
}
export interface UpdateDuDieuKienDTO {
    duDieuKien: number, 
    lyDo?: string
}

export interface PhieuDeXuatNhanSu {
    id: number;
    maPhieuDeXuat: string;
    tieuDe: string;
    noiDung: string | null;
    soLuongDeXuat: number;
    chucDanhId: number;
    donViId: number;
    nguoiLap: string;
    ngayLap: string; 
    ngayPheDuyet: string | null;
    trangThai: number;
    ghiChu: string | null;
}

export interface DanhSachPhieuDeXuatNhanSu extends PhieuDeXuatNhanSu{
    tenDonVi: string;
    tenChucDanh: string;
    soLuongDeXuat: number
}

export interface ChiTietPhieuDeXuatNhanSu extends PhieuDeXuatNhanSu{
    tenDonVi: string;
    tenChucDanh: string;
    chiTietId: number | null;
    hoVaTen: string | null;
    vienChucId: number | null;
    duDieuKien: number | null;
    lyDoKhongDu: string | null;
    ghiChu: string | null;
}