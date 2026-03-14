import type { VienChuc } from "./VienChuc";;
import type { NhiemKyChucVu } from "./NhiemKyChucVu";

export interface XepLoai {
    nam_danh_gia: number;
    danh_gia: string;
    nhan_xet: string;
}

export interface NhiemKy extends NhiemKyChucVu{
    ten_chuc_danh: string; 
    so_quyet_dinh: string;
}

export interface profile extends VienChuc{
    ten_don_vi: string;
    ten_chuc_danh: string | null;
    
    so_quyet_dinh: string;
    ngay_bat_dau: string;
    ngay_ket_thuc: string | null;

    lich_su_chuc_vu: NhiemKy[];
    xep_loai_vc: XepLoai[];
    xep_loai_dv: XepLoai[];
}