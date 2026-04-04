import { LoaiPhuongAn, TrangThaiPANS } from "./phuongAnNhanSu.type";

export interface CreatePhuongAnNhanSuDTO {
    soToTrinh: string;
    ngayTrinh: Date;
    ngayLap: Date;
    ghiChu?: string;
    chiTiet: CreatePhuongAnNhanSuDetailDTO[];
}
export interface CreatePhuongAnNhanSuDetailDTO {
    loaiPhuongAn: LoaiPhuongAn;
    chiTietBnId: number;
    ghiChu?: string;
}
export interface UpdatePhuongAnNhanSuDTO {
    soToTrinh?: string;
    ngayTrinh?: Date;
    ngayLap?: Date;
}
export interface ChiTietPhuongAnDTO {
    id: number;
    loaiPhuongAn: LoaiPhuongAn;
    chiTietBnId: number;
    ghiChu: string | null;
}
export interface PhuongAnNhanSuDTO {
    id: number;
    maPhuongAn: string;
    soToTrinh: string;
    ngayToTrinh: Date | null;
    ngayLap: Date | null;
    ghiChu: string | null;
    trangThai: TrangThaiPANS;
    yKienBGH: string | null;
    ngayPheDuyet: Date | null;
    chiTiet: ChiTietPhuongAnDTO[];
}