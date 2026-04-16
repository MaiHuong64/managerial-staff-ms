import type { VienChuc } from "./VienChuc";;
import type { NhiemKyChucVu } from "./NhiemKyChucVu";

export interface XepLoai {
    namDanhGia: number;
    danhGia: string;
    nhanXet: string;
}

export interface NhiemKy extends NhiemKyChucVu{
    tenChucDanh: string; 
    soQuyetDinh: string;
}

export interface profile extends VienChuc{
    tenDonVi: string;
    tenChucDanh: string | null;
    
    soQuyetDinh: string;
    ngayBatDau: string;
    ngayKetThuc: string | null;

    lichSuChucVu: NhiemKy[];
    xepLoaiVC: XepLoai[];
    xepLoaiDV: XepLoai[];
}